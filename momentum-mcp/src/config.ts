import { homedir } from 'node:os';
import { existsSync, mkdirSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';

export interface MomentumConfig {
  homeDir: string;
  databasePath: string;
  debug: boolean;
}

function isInside(parent: string, child: string): boolean {
  const rel = relative(resolve(parent), resolve(child));
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

function nearestGitRoot(start: string): string | null {
  let current = resolve(start);
  while (true) {
    if (existsSync(join(current, '.git'))) return current;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

export function getConfig(env: NodeJS.ProcessEnv = process.env, cwd = process.cwd()): MomentumConfig {
  const homeDir = resolve(env.MOMENTUM_HOME || join(homedir(), '.momentum-mcp'));
  const databasePath = join(homeDir, 'momentum.db');
  const gitRoot = nearestGitRoot(cwd);
  const allowRepoDb = env.MOMENTUM_ALLOW_REPO_DB === '1';

  if (!allowRepoDb && gitRoot && isInside(gitRoot, databasePath)) {
    throw new Error(
      `Refusing to store private Momentum data inside the Git repository (${gitRoot}). ` +
      'Choose MOMENTUM_HOME outside the repository.'
    );
  }

  mkdirSync(homeDir, { recursive: true, mode: 0o700 });

  // Resolve when possible so symlinked paths cannot silently bypass the repository guard.
  if (!allowRepoDb && gitRoot && existsSync(homeDir)) {
    const realHome = realpathSync(homeDir);
    const realGit = realpathSync(gitRoot);
    if (isInside(realGit, realHome)) {
      throw new Error('MOMENTUM_HOME resolves inside the Git repository. Choose a private external directory.');
    }
  }

  return {
    homeDir,
    databasePath,
    debug: env.MOMENTUM_DEBUG === '1'
  };
}
