import type { DatabaseSync } from 'node:sqlite';
import type {
  ContextItem,
  ContextKind,
  DailyBrief,
  Decision,
  LoopOwner,
  LoopStatus,
  OpenLoop,
  Person,
  Priority,
  Project
} from './types.ts';

const nowIso = () => new Date().toISOString();

function rows<T>(value: Iterable<unknown>): T[] {
  return Array.from(value) as T[];
}

function normalizeDate(input?: string | null): string | null {
  if (!input) return null;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid date: ${input}`);
  return parsed.toISOString();
}

export class MomentumRepository {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  ensureProject(name?: string | null, summary?: string | null): number | null {
    if (!name?.trim()) return null;
    const clean = name.trim();
    const existing = this.db.prepare('SELECT id FROM projects WHERE name = ?').get(clean) as { id: number } | undefined;
    const now = nowIso();
    if (existing) {
      this.db.prepare(`UPDATE projects SET summary = COALESCE(?, summary), last_touched_at = ?, updated_at = ? WHERE id = ?`)
        .run(summary ?? null, now, now, existing.id);
      return existing.id;
    }
    const result = this.db.prepare(
      'INSERT INTO projects(name, summary, last_touched_at, created_at, updated_at) VALUES(?,?,?,?,?)'
    ).run(clean, summary ?? null, now, now, now);
    return Number(result.lastInsertRowid);
  }

  ensurePerson(name?: string | null, relationship?: string | null): number | null {
    if (!name?.trim()) return null;
    const clean = name.trim();
    const existing = this.db.prepare('SELECT id FROM people WHERE display_name = ?').get(clean) as { id: number } | undefined;
    const now = nowIso();
    if (existing) {
      this.db.prepare('UPDATE people SET relationship = COALESCE(?, relationship), updated_at = ? WHERE id = ?')
        .run(relationship ?? null, now, existing.id);
      return existing.id;
    }
    const result = this.db.prepare(
      'INSERT INTO people(display_name, relationship, created_at, updated_at) VALUES(?,?,?,?)'
    ).run(clean, relationship ?? null, now, now);
    return Number(result.lastInsertRowid);
  }

  captureContext(input: {
    kind: ContextKind;
    title: string;
    body: string;
    project?: string | null;
    person?: string | null;
    relationship?: string | null;
    source?: string | null;
  }): ContextItem {
    const projectId = this.ensureProject(input.project);
    const personId = this.ensurePerson(input.person, input.relationship);
    const createdAt = nowIso();
    const result = this.db.prepare(`
      INSERT INTO context_items(kind, title, body, source, project_id, person_id, created_at)
      VALUES(?,?,?,?,?,?,?)
    `).run(input.kind, input.title.trim(), input.body.trim(), input.source ?? null, projectId, personId, createdAt);

    if (input.kind === 'interaction' && personId) {
      this.db.prepare('UPDATE people SET last_interaction_at = ?, updated_at = ? WHERE id = ?')
        .run(createdAt, createdAt, personId);
    }
    if (projectId) this.touchProject(projectId, createdAt);
    return this.getContextItem(Number(result.lastInsertRowid))!;
  }

  createOpenLoop(input: {
    title: string;
    description?: string | null;
    status?: LoopStatus;
    owner?: LoopOwner;
    priority?: Priority;
    project?: string | null;
    person?: string | null;
    relationship?: string | null;
    dueAt?: string | null;
    expectedAt?: string | null;
  }): OpenLoop {
    const projectId = this.ensureProject(input.project);
    const personId = this.ensurePerson(input.person, input.relationship);
    const now = nowIso();
    const status = input.status ?? (input.owner === 'external' ? 'waiting' : 'open');
    const owner = input.owner ?? 'me';
    const priority = input.priority ?? 'medium';
    const result = this.db.prepare(`
      INSERT INTO open_loops(title, description, status, owner, priority, project_id, person_id, due_at, expected_at, created_at, updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      input.title.trim(),
      input.description?.trim() || null,
      status,
      owner,
      priority,
      projectId,
      personId,
      normalizeDate(input.dueAt),
      normalizeDate(input.expectedAt),
      now,
      now
    );
    if (projectId) this.touchProject(projectId, now);
    return this.getOpenLoop(Number(result.lastInsertRowid))!;
  }

  resolveOpenLoop(id: number): OpenLoop {
    const existing = this.getOpenLoop(id);
    if (!existing) throw new Error(`Open loop ${id} not found`);
    const now = nowIso();
    this.db.prepare(`UPDATE open_loops SET status='resolved', resolved_at=?, updated_at=? WHERE id=?`).run(now, now, id);
    if (existing.project_id) this.touchProject(existing.project_id, now);
    return this.getOpenLoop(id)!;
  }

  getOpenLoops(filters: { status?: LoopStatus; project?: string; person?: string; limit?: number } = {}): OpenLoop[] {
    const clauses: string[] = [];
    const params: (string | number)[] = [];
    if (filters.status) { clauses.push('l.status = ?'); params.push(filters.status); }
    else clauses.push("l.status != 'resolved'");
    if (filters.project) { clauses.push('p.name = ?'); params.push(filters.project); }
    if (filters.person) { clauses.push('pe.display_name = ?'); params.push(filters.person); }
    params.push(Math.min(Math.max(filters.limit ?? 50, 1), 200));
    const sql = `
      SELECT l.*, p.name AS project_name, pe.display_name AS person_name
      FROM open_loops l
      LEFT JOIN projects p ON p.id = l.project_id
      LEFT JOIN people pe ON pe.id = l.person_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY
        CASE l.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
        COALESCE(l.due_at, l.expected_at, '9999-12-31T00:00:00.000Z') ASC,
        l.created_at ASC
      LIMIT ?`;
    return rows<OpenLoop>(this.db.prepare(sql).all(...params));
  }

  getWaitingOn(limit = 50): OpenLoop[] {
    return rows<OpenLoop>(this.db.prepare(`
      SELECT l.*, p.name AS project_name, pe.display_name AS person_name
      FROM open_loops l
      LEFT JOIN projects p ON p.id = l.project_id
      LEFT JOIN people pe ON pe.id = l.person_id
      WHERE l.status = 'waiting' OR (l.owner = 'external' AND l.status != 'resolved')
      ORDER BY COALESCE(l.expected_at, l.due_at, '9999-12-31T00:00:00.000Z') ASC
      LIMIT ?
    `).all(Math.min(Math.max(limit, 1), 200)));
  }

  recordDecision(input: { title: string; decision: string; rationale?: string | null; project?: string | null }): Decision {
    const projectId = this.ensureProject(input.project);
    const createdAt = nowIso();
    const result = this.db.prepare(
      'INSERT INTO decisions(title, decision, rationale, project_id, created_at) VALUES(?,?,?,?,?)'
    ).run(input.title.trim(), input.decision.trim(), input.rationale?.trim() || null, projectId, createdAt);
    if (projectId) this.touchProject(projectId, createdAt);
    return this.getDecision(Number(result.lastInsertRowid))!;
  }

  getRecentDecisions(input: { project?: string; limit?: number } = {}): Decision[] {
    const limit = Math.min(Math.max(input.limit ?? 20, 1), 100);
    if (input.project) {
      return rows<Decision>(this.db.prepare(`
        SELECT d.*, p.name AS project_name FROM decisions d
        LEFT JOIN projects p ON p.id=d.project_id
        WHERE p.name = ? ORDER BY d.created_at DESC LIMIT ?
      `).all(input.project, limit));
    }
    return rows<Decision>(this.db.prepare(`
      SELECT d.*, p.name AS project_name FROM decisions d
      LEFT JOIN projects p ON p.id=d.project_id
      ORDER BY d.created_at DESC LIMIT ?
    `).all(limit));
  }

  searchContext(query: string, limit = 20): { contexts: ContextItem[]; loops: OpenLoop[]; decisions: Decision[] } {
    const q = `%${query.trim()}%`;
    const capped = Math.min(Math.max(limit, 1), 100);
    const contexts = rows<ContextItem>(this.db.prepare(`
      SELECT c.*, p.name AS project_name, pe.display_name AS person_name
      FROM context_items c
      LEFT JOIN projects p ON p.id=c.project_id
      LEFT JOIN people pe ON pe.id=c.person_id
      WHERE c.title LIKE ? OR c.body LIKE ? OR p.name LIKE ? OR pe.display_name LIKE ?
      ORDER BY c.created_at DESC LIMIT ?
    `).all(q, q, q, q, capped));
    const loops = rows<OpenLoop>(this.db.prepare(`
      SELECT l.*, p.name AS project_name, pe.display_name AS person_name
      FROM open_loops l
      LEFT JOIN projects p ON p.id=l.project_id
      LEFT JOIN people pe ON pe.id=l.person_id
      WHERE l.title LIKE ? OR COALESCE(l.description,'') LIKE ? OR p.name LIKE ? OR pe.display_name LIKE ?
      ORDER BY l.updated_at DESC LIMIT ?
    `).all(q, q, q, q, capped));
    const decisions = rows<Decision>(this.db.prepare(`
      SELECT d.*, p.name AS project_name
      FROM decisions d LEFT JOIN projects p ON p.id=d.project_id
      WHERE d.title LIKE ? OR d.decision LIKE ? OR COALESCE(d.rationale,'') LIKE ? OR p.name LIKE ?
      ORDER BY d.created_at DESC LIMIT ?
    `).all(q, q, q, q, capped));
    return { contexts, loops, decisions };
  }

  getContextFor(input: { project?: string; person?: string; limit?: number }): {
    project?: Project;
    person?: Person;
    contexts: ContextItem[];
    loops: OpenLoop[];
    decisions: Decision[];
  } {
    if (!input.project && !input.person) throw new Error('Provide a project or person.');
    const limit = Math.min(Math.max(input.limit ?? 25, 1), 100);
    const project = input.project ? this.getProjectByName(input.project) : undefined;
    const person = input.person ? this.getPersonByName(input.person) : undefined;
    const clauses: string[] = [];
    const params: (string | number)[] = [];
    if (input.project) { clauses.push('p.name = ?'); params.push(input.project); }
    if (input.person) { clauses.push('pe.display_name = ?'); params.push(input.person); }
    params.push(limit);
    const contexts = rows<ContextItem>(this.db.prepare(`
      SELECT c.*, p.name AS project_name, pe.display_name AS person_name
      FROM context_items c
      LEFT JOIN projects p ON p.id=c.project_id
      LEFT JOIN people pe ON pe.id=c.person_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY c.created_at DESC LIMIT ?
    `).all(...params));
    const loops = this.getOpenLoops({ project: input.project, person: input.person, limit });
    const decisions = input.project ? this.getRecentDecisions({ project: input.project, limit }) : [];
    return { ...(project ? { project } : {}), ...(person ? { person } : {}), contexts, loops, decisions };
  }

  dailyBrief(options: { staleProjectDays?: number; reconnectDays?: number; priorityLimit?: number } = {}): DailyBrief {
    const now = new Date();
    const nowValue = now.toISOString();
    const staleBefore = new Date(now.getTime() - (options.staleProjectDays ?? 7) * 86400000).toISOString();
    const reconnectBefore = new Date(now.getTime() - (options.reconnectDays ?? 14) * 86400000).toISOString();
    const priorityLimit = Math.min(Math.max(options.priorityLimit ?? 5, 1), 20);

    const priorities = this.getOpenLoops({ limit: priorityLimit });
    const overdue = rows<OpenLoop>(this.db.prepare(`
      SELECT l.*, p.name AS project_name, pe.display_name AS person_name
      FROM open_loops l
      LEFT JOIN projects p ON p.id=l.project_id
      LEFT JOIN people pe ON pe.id=l.person_id
      WHERE l.status != 'resolved' AND l.due_at IS NOT NULL AND l.due_at < ?
      ORDER BY l.due_at ASC
    `).all(nowValue));
    const waitingOn = this.getWaitingOn(20);
    const staleProjects = rows<Project>(this.db.prepare(`
      SELECT * FROM projects WHERE status='active' AND last_touched_at < ? ORDER BY last_touched_at ASC LIMIT 20
    `).all(staleBefore));
    const peopleToReconnect = rows<Person>(this.db.prepare(`
      SELECT * FROM people
      WHERE last_interaction_at IS NOT NULL AND last_interaction_at < ?
      ORDER BY last_interaction_at ASC LIMIT 20
    `).all(reconnectBefore));
    const openCount = (this.db.prepare("SELECT COUNT(*) AS n FROM open_loops WHERE status != 'resolved'").get() as { n: number }).n;
    const waitingCount = (this.db.prepare("SELECT COUNT(*) AS n FROM open_loops WHERE status = 'waiting'").get() as { n: number }).n;

    return {
      generated_at: nowValue,
      priorities,
      overdue,
      waiting_on: waitingOn,
      stale_projects: staleProjects,
      people_to_reconnect: peopleToReconnect,
      stats: { open_loops: openCount, waiting: waitingCount, overdue: overdue.length }
    };
  }

  stats(): Record<string, number> {
    const getCount = (sql: string) => (this.db.prepare(sql).get() as { n: number }).n;
    return {
      projects: getCount('SELECT COUNT(*) AS n FROM projects'),
      people: getCount('SELECT COUNT(*) AS n FROM people'),
      context_items: getCount('SELECT COUNT(*) AS n FROM context_items'),
      open_loops: getCount("SELECT COUNT(*) AS n FROM open_loops WHERE status != 'resolved'"),
      decisions: getCount('SELECT COUNT(*) AS n FROM decisions')
    };
  }

  private getContextItem(id: number): ContextItem | undefined {
    return this.db.prepare(`
      SELECT c.*, p.name AS project_name, pe.display_name AS person_name
      FROM context_items c LEFT JOIN projects p ON p.id=c.project_id LEFT JOIN people pe ON pe.id=c.person_id
      WHERE c.id=?
    `).get(id) as ContextItem | undefined;
  }

  private getOpenLoop(id: number): OpenLoop | undefined {
    return this.db.prepare(`
      SELECT l.*, p.name AS project_name, pe.display_name AS person_name
      FROM open_loops l LEFT JOIN projects p ON p.id=l.project_id LEFT JOIN people pe ON pe.id=l.person_id
      WHERE l.id=?
    `).get(id) as OpenLoop | undefined;
  }

  private getDecision(id: number): Decision | undefined {
    return this.db.prepare(`SELECT d.*, p.name AS project_name FROM decisions d LEFT JOIN projects p ON p.id=d.project_id WHERE d.id=?`)
      .get(id) as Decision | undefined;
  }

  private getProjectByName(name: string): Project | undefined {
    return this.db.prepare('SELECT * FROM projects WHERE name=?').get(name) as Project | undefined;
  }

  private getPersonByName(name: string): Person | undefined {
    return this.db.prepare('SELECT * FROM people WHERE display_name=?').get(name) as Person | undefined;
  }

  private touchProject(id: number, at = nowIso()): void {
    this.db.prepare('UPDATE projects SET last_touched_at=?, updated_at=? WHERE id=?').run(at, at, id);
  }
}
