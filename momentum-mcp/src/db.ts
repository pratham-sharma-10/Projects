import { DatabaseSync } from 'node:sqlite';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';

export function openDatabase(databasePath: string): DatabaseSync {
  mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(databasePath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA busy_timeout = 5000;');
  migrate(db);
  return db;
}

export function migrate(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL COLLATE NOCASE UNIQUE,
      summary TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      last_touched_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY,
      display_name TEXT NOT NULL COLLATE NOCASE UNIQUE,
      relationship TEXT,
      notes TEXT,
      last_interaction_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS context_items (
      id INTEGER PRIMARY KEY,
      kind TEXT NOT NULL CHECK(kind IN ('note','interaction','update')),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      source TEXT,
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      person_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS open_loops (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL CHECK(status IN ('open','waiting','resolved')) DEFAULT 'open',
      owner TEXT NOT NULL CHECK(owner IN ('me','external','shared')) DEFAULT 'me',
      priority TEXT NOT NULL CHECK(priority IN ('low','medium','high')) DEFAULT 'medium',
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      person_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
      due_at TEXT,
      expected_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS decisions (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      decision TEXT NOT NULL,
      rationale TEXT,
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_context_created ON context_items(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_context_project ON context_items(project_id);
    CREATE INDEX IF NOT EXISTS idx_context_person ON context_items(person_id);
    CREATE INDEX IF NOT EXISTS idx_loops_status ON open_loops(status);
    CREATE INDEX IF NOT EXISTS idx_loops_due ON open_loops(due_at);
    CREATE INDEX IF NOT EXISTS idx_loops_expected ON open_loops(expected_at);
    CREATE INDEX IF NOT EXISTS idx_decisions_project ON decisions(project_id);
  `);
}
