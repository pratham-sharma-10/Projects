import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'coverage']);
const forbiddenExtensions = /\.(db|sqlite|sqlite3|pem|p12|pfx|key)$/i;
const forbiddenNames = new Set(['.env', 'id_rsa', 'id_ed25519']);
const secretPatterns: Array<[string, RegExp]> = [
  ['OpenAI-style API key', /\bsk-[A-Za-z0-9_-]{20,}\b/g],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/g],
  ['Private key material', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g]
];

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const name of readdirSync(dir)) {
    if (ignoredDirs.has(name)) continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

const findings: string[] = [];
for (const file of walk(root)) {
  const rel = relative(root, file);
  const base = rel.split(/[\\/]/).pop()!;
  if (forbiddenExtensions.test(base) || forbiddenNames.has(base)) {
    findings.push(`${rel}: private/sensitive file type should not be committed`);
    continue;
  }
  if (/\.(png|jpg|jpeg|gif|webp|ico|zip|gz|pdf)$/i.test(file)) continue;
  const content = readFileSync(file, 'utf8');
  for (const [label, pattern] of secretPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) findings.push(`${rel}: possible ${label}`);
  }
}

if (findings.length) {
  console.error('Privacy check FAILED:\n' + findings.map((x) => `- ${x}`).join('\n'));
  process.exit(1);
}
console.log('Privacy check passed: no private database files or common secret patterns detected.');
