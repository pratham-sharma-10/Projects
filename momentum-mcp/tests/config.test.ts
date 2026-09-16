import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getConfig } from '../src/config.ts';

test('rejects private storage inside a git repository', () => {
  const root = mkdtempSync(join(tmpdir(), 'momentum-config-'));
  mkdirSync(join(root, '.git'));
  const privateDir = join(root, 'private-data');
  assert.throws(() => getConfig({ MOMENTUM_HOME: privateDir }, root), /Refusing to store private Momentum data/);
});

test('allows storage outside the repository', () => {
  const root = mkdtempSync(join(tmpdir(), 'momentum-repo-'));
  mkdirSync(join(root, '.git'));
  writeFileSync(join(root, 'README.md'), 'demo');
  const outside = mkdtempSync(join(tmpdir(), 'momentum-private-'));
  const config = getConfig({ MOMENTUM_HOME: outside }, root);
  assert.equal(config.homeDir, outside);
});
