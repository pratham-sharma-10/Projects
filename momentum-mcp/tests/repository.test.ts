import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from '../src/db.ts';
import { MomentumRepository } from '../src/repository.ts';

function makeRepo() {
  const db = new DatabaseSync(':memory:');
  migrate(db);
  return new MomentumRepository(db);
}

test('creates an open loop and resolves it without losing history', () => {
  const repo = makeRepo();
  const loop = repo.createOpenLoop({ title: 'Send prototype', project: 'Launch', priority: 'high' });
  assert.equal(loop.status, 'open');
  assert.equal(loop.project_name, 'Launch');
  const resolved = repo.resolveOpenLoop(loop.id);
  assert.equal(resolved.status, 'resolved');
  assert.ok(resolved.resolved_at);
});

test('external owner defaults to waiting', () => {
  const repo = makeRepo();
  const loop = repo.createOpenLoop({ title: 'Receive review', owner: 'external', person: 'Demo Person' });
  assert.equal(loop.status, 'waiting');
  assert.equal(repo.getWaitingOn().length, 1);
});

test('context reconstruction combines notes, loops, and decisions', () => {
  const repo = makeRepo();
  repo.captureContext({ kind: 'update', title: 'Checkpoint', body: 'Draft finished.', project: 'Website' });
  repo.createOpenLoop({ title: 'Record demo', project: 'Website' });
  repo.recordDecision({ title: 'Hosting', decision: 'Use static hosting', project: 'Website' });
  const context = repo.getContextFor({ project: 'Website' });
  assert.equal(context.contexts.length, 1);
  assert.equal(context.loops.length, 1);
  assert.equal(context.decisions.length, 1);
});

test('search finds related objects', () => {
  const repo = makeRepo();
  repo.captureContext({ kind: 'note', title: 'Launch plan', body: 'Prepare beta cohort', project: 'Atlas' });
  repo.createOpenLoop({ title: 'Recruit beta users', project: 'Atlas' });
  const result = repo.searchContext('beta');
  assert.equal(result.contexts.length, 1);
  assert.equal(result.loops.length, 1);
});

test('daily brief surfaces unresolved work', () => {
  const repo = makeRepo();
  repo.createOpenLoop({ title: 'Important task', priority: 'high' });
  repo.createOpenLoop({ title: 'Waiting item', owner: 'external' });
  const brief = repo.dailyBrief();
  assert.equal(brief.stats.open_loops, 2);
  assert.equal(brief.stats.waiting, 1);
  assert.equal(brief.priorities[0]?.title, 'Important task');
});
