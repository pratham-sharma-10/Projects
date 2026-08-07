import type { AuditReport, FixtureId, Mode } from '../types';
import { runAxeChecks } from './axeRunner';
import { runInteractiveChecks } from './interactiveChecks';
import { computeScore } from './score';

/**
 * Full audit of the live popup node: interactive behavioral probes first
 * (dialog semantics, focus trap, escape, focus return, focus visibility), then
 * axe-core's static WCAG rules (contrast, labels, alt text, control names).
 *
 * Interactive checks run synchronously and mutate focus transiently; axe runs
 * async. We run interactive checks first, then axe, so axe measures a settled
 * DOM.
 */
export async function runAudit(
  node: HTMLElement,
  mode: Mode,
  fixtureId: FixtureId,
): Promise<AuditReport> {
  const interactive = runInteractiveChecks(node);
  const axeRows = await runAxeChecks(node);

  const checks = [...interactive, ...axeRows];
  const { score, passCount, warnCount, failCount } = computeScore(checks);

  return {
    mode,
    fixtureId,
    checks,
    score,
    passCount,
    warnCount,
    failCount,
    ranAt: Date.now(),
  };
}
