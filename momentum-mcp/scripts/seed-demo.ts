import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import demo from '../examples/demo-seed.json' with { type: 'json' };
import { openDatabase } from '../src/db.ts';
import { MomentumRepository } from '../src/repository.ts';

const demoHome = join(tmpdir(), 'momentum-mcp-demo');
rmSync(demoHome, { recursive: true, force: true });
const repo = new MomentumRepository(openDatabase(join(demoHome, 'momentum.db')));

for (const item of demo.context) repo.captureContext(item as Parameters<MomentumRepository['captureContext']>[0]);
for (const item of demo.open_loops) repo.createOpenLoop(item as Parameters<MomentumRepository['createOpenLoop']>[0]);
for (const item of demo.decisions) repo.recordDecision(item as Parameters<MomentumRepository['recordDecision']>[0]);

console.log(`Seeded fictional demo data at ${demoHome}`);
console.log(JSON.stringify(repo.stats(), null, 2));
