#!/usr/bin/env node
import { getConfig } from './config.ts';
import { openDatabase } from './db.ts';
import { MomentumRepository } from './repository.ts';
import type { OpenLoop, Priority } from './types.ts';

function usage(): void {
  console.log(`Momentum CLI\n\nUsage:\n  momentum brief\n  momentum add \"Task or follow-up\" [--project NAME] [--person NAME] [--priority low|medium|high] [--due DATE] [--waiting]\n  momentum waiting\n  momentum list\n  momentum search \"query\"\n  momentum resolve ID\n  momentum note \"title\" \"body\" [--project NAME] [--person NAME]\n  momentum context --project NAME\n  momentum context --person NAME\n  momentum decision \"title\" \"decision\" [--why RATIONALE] [--project NAME]\n  momentum stats\n\nExamples:\n  momentum add \"Follow up with recruiter Friday\" --project \"Job Search\" --priority high\n  momentum add \"Wait for interview feedback\" --person \"Alex\" --waiting\n  momentum search \"Amazon\"\n  momentum resolve 3\n`);
}

function argValue(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag);
  if (i < 0) return undefined;
  return args[i + 1];
}

function formatDate(value: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

function printLoop(loop: OpenLoop): void {
  const parts = [`#${loop.id}`, `[${loop.priority}]`, loop.title];
  if (loop.status === 'waiting') parts.push('(waiting)');
  console.log(parts.join(' '));
  const meta: string[] = [];
  if (loop.project_name) meta.push(`project: ${loop.project_name}`);
  if (loop.person_name) meta.push(`person: ${loop.person_name}`);
  if (loop.due_at) meta.push(`due: ${formatDate(loop.due_at)}`);
  if (loop.expected_at) meta.push(`expected: ${formatDate(loop.expected_at)}`);
  if (meta.length) console.log(`   ${meta.join(' · ')}`);
  if (loop.description) console.log(`   ${loop.description}`);
}

const [command, ...args] = process.argv.slice(2);
if (!command || command === 'help' || command === '--help' || command === '-h') {
  usage();
  process.exit(0);
}

const config = getConfig();
const db = openDatabase(config.databasePath);
const repo = new MomentumRepository(db);

try {
  switch (command) {
    case 'brief': {
      const brief = repo.dailyBrief();
      console.log(`Momentum brief — ${new Date(brief.generated_at).toLocaleString()}`);
      console.log(`Open loops: ${brief.stats.open_loops} · Waiting: ${brief.stats.waiting} · Overdue: ${brief.stats.overdue}`);
      console.log('\nPriorities');
      if (!brief.priorities.length) console.log('  Nothing open.');
      else brief.priorities.forEach(printLoop);
      if (brief.waiting_on.length) {
        console.log('\nWaiting on');
        brief.waiting_on.forEach(printLoop);
      }
      if (brief.stale_projects.length) {
        console.log('\nStale projects');
        for (const p of brief.stale_projects) console.log(`- ${p.name} (last touched ${formatDate(p.last_touched_at)})`);
      }
      if (brief.people_to_reconnect.length) {
        console.log('\nPeople to reconnect with');
        for (const p of brief.people_to_reconnect) console.log(`- ${p.display_name} (last interaction ${formatDate(p.last_interaction_at)})`);
      }
      break;
    }
    case 'add': {
      const title = args[0];
      if (!title || title.startsWith('--')) throw new Error('Usage: momentum add "title" [options]');
      const rawPriority = argValue(args, '--priority') ?? 'medium';
      if (!['low', 'medium', 'high'].includes(rawPriority)) throw new Error('Priority must be low, medium, or high.');
      const waiting = args.includes('--waiting');
      const loop = repo.createOpenLoop({
        title,
        description: argValue(args, '--description'),
        priority: rawPriority as Priority,
        project: argValue(args, '--project'),
        person: argValue(args, '--person'),
        owner: waiting ? 'external' : 'me',
        status: waiting ? 'waiting' : 'open',
        dueAt: argValue(args, '--due'),
        expectedAt: argValue(args, '--expected')
      });
      console.log('Added:');
      printLoop(loop);
      break;
    }
    case 'waiting': {
      const loops = repo.getWaitingOn();
      if (!loops.length) console.log('Nothing is currently waiting on someone else.');
      else loops.forEach(printLoop);
      break;
    }
    case 'list': {
      const loops = repo.getOpenLoops();
      if (!loops.length) console.log('No open loops.');
      else loops.forEach(printLoop);
      break;
    }
    case 'search': {
      const query = args[0];
      if (!query) throw new Error('Usage: momentum search "query"');
      const result = repo.searchContext(query);
      console.log(`Search results for "${query}"`);
      console.log(`\nOpen loops (${result.loops.length})`);
      result.loops.forEach(printLoop);
      console.log(`\nContext (${result.contexts.length})`);
      for (const c of result.contexts) console.log(`#${c.id} [${c.kind}] ${c.title}\n   ${c.body}`);
      console.log(`\nDecisions (${result.decisions.length})`);
      for (const d of result.decisions) console.log(`#${d.id} ${d.title}: ${d.decision}${d.rationale ? `\n   Why: ${d.rationale}` : ''}`);
      break;
    }
    case 'resolve': {
      const id = Number(args[0]);
      if (!Number.isInteger(id) || id <= 0) throw new Error('Usage: momentum resolve ID');
      const loop = repo.resolveOpenLoop(id);
      console.log(`Resolved #${loop.id}: ${loop.title}`);
      break;
    }
    case 'note': {
      const [title, body] = args;
      if (!title || !body) throw new Error('Usage: momentum note "title" "body" [options]');
      const item = repo.captureContext({
        kind: 'note',
        title,
        body,
        project: argValue(args, '--project'),
        person: argValue(args, '--person')
      });
      console.log(`Saved note #${item.id}: ${item.title}`);
      break;
    }
    case 'context': {
      const project = argValue(args, '--project');
      const person = argValue(args, '--person');
      const result = repo.getContextFor({ project, person });
      if (result.project) console.log(`Project: ${result.project.name}`);
      if (result.person) console.log(`Person: ${result.person.display_name}`);
      console.log(`\nOpen loops (${result.loops.length})`);
      result.loops.forEach(printLoop);
      console.log(`\nContext (${result.contexts.length})`);
      for (const c of result.contexts) console.log(`#${c.id} [${c.kind}] ${c.title}\n   ${c.body}`);
      if (result.decisions.length) {
        console.log(`\nDecisions (${result.decisions.length})`);
        for (const d of result.decisions) console.log(`#${d.id} ${d.title}: ${d.decision}${d.rationale ? `\n   Why: ${d.rationale}` : ''}`);
      }
      break;
    }
    case 'decision': {
      const [title, decision] = args;
      if (!title || !decision) throw new Error('Usage: momentum decision "title" "decision" [--why RATIONALE] [--project NAME]');
      const item = repo.recordDecision({
        title,
        decision,
        rationale: argValue(args, '--why'),
        project: argValue(args, '--project')
      });
      console.log(`Saved decision #${item.id}: ${item.title}`);
      break;
    }
    case 'stats': {
      console.log(repo.stats());
      console.log(`Database: ${config.databasePath}`);
      break;
    }
    default:
      usage();
      process.exitCode = 1;
  }
} catch (error) {
  console.error(`Momentum error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  db.close();
}
