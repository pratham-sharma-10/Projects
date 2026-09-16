import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDatabase } from '../src/db.ts';
import { MomentumRepository } from '../src/repository.ts';

const demoHome = join(tmpdir(), 'momentum-mcp-demo');
const repo = new MomentumRepository(openDatabase(join(demoHome, 'momentum.db')));
console.log(JSON.stringify(repo.dailyBrief({ staleProjectDays: 1, reconnectDays: 1 }), null, 2));
