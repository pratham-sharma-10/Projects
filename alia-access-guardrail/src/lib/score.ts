import type { CheckResult } from '../types';

export interface ScoreBreakdown {
  score: number; // 0–100
  passCount: number;
  warnCount: number;
  failCount: number;
  total: number;
}

/**
 * Roll the checks into a single 0–100 score. Each check contributes equally:
 * pass = 1, warn = 0.5, fail = 0. Transparent and easy to defend to a founder
 * ("it's just the fraction of checks that pass, warns counting half").
 */
export function computeScore(checks: CheckResult[]): ScoreBreakdown {
  const total = checks.length;
  let earned = 0;
  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  for (const c of checks) {
    if (c.status === 'pass') {
      earned += 1;
      passCount += 1;
    } else if (c.status === 'warn') {
      earned += 0.5;
      warnCount += 1;
    } else {
      failCount += 1;
    }
  }

  const score = total === 0 ? 0 : Math.round((earned / total) * 100);
  return { score, passCount, warnCount, failCount, total };
}

export function scoreBand(score: number): 'pass' | 'warn' | 'fail' {
  if (score >= 90) return 'pass';
  if (score >= 60) return 'warn';
  return 'fail';
}

export function scoreLabel(score: number): string {
  if (score >= 90) return 'Ready to ship';
  if (score >= 60) return 'Needs work';
  return 'Not accessible';
}
