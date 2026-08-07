import axe, { type Result, type RunOptions } from 'axe-core';
import type { CheckResult, Citation } from '../types';
import { CITATIONS } from './citations';

// The axe-core rules we surface. Each maps to a scorecard row with a citation
// and a plain-language title. Everything here is a real static WCAG rule run by
// Deque's engine against the live popup DOM — nothing is simulated.
interface RuleMeta {
  title: string;
  citation: Citation;
  /** Plain-language "what this checks" line, shown when the check passes. */
  passDetail: string;
}

const RULE_META: Record<string, RuleMeta> = {
  'color-contrast': {
    title: 'Color contrast',
    citation: CITATIONS.contrastMinimum,
    passDetail:
      'All text meets the 4.5:1 (normal) / 3:1 (large) contrast ratio against its background.',
  },
  label: {
    title: 'Form fields have labels',
    citation: CITATIONS.infoRelationships,
    passDetail: 'Every input is programmatically associated with a visible <label>.',
  },
  'image-alt': {
    title: 'Images have text alternatives',
    citation: CITATIONS.nonTextContent,
    passDetail: 'Meaningful images expose alt text; decorative images are hidden correctly.',
  },
  'button-name': {
    title: 'Controls have accessible names',
    citation: CITATIONS.nameRoleValue,
    passDetail: 'Every button exposes a discernible name to assistive technology.',
  },
};

const TRACKED_RULES = Object.keys(RULE_META);

/**
 * Run axe-core against the popup node for our tracked rule set and translate
 * the results into scorecard rows.
 *
 * axe classifies each rule as violation / pass / incomplete / inapplicable.
 * We map: violation → fail, incomplete → warn, pass → pass. Inapplicable rules
 * (e.g. image-alt on a popup with no image) are omitted so the card only shows
 * checks that actually apply to the current fixture.
 */
export async function runAxeChecks(node: HTMLElement): Promise<CheckResult[]> {
  const options: RunOptions = {
    runOnly: { type: 'rule', values: TRACKED_RULES },
    // Keep the run scoped and quiet; we only need the four rules above.
    resultTypes: ['violations', 'passes', 'incomplete'],
  };

  const results = await axe.run(node, options);
  const rows: CheckResult[] = [];

  const summarizeNodes = (nodes: Result['nodes']): string => {
    const first = nodes[0];
    if (!first) return '';
    const target = Array.isArray(first.target) ? first.target.join(' ') : String(first.target);
    const extra = nodes.length > 1 ? ` (+${nodes.length - 1} more)` : '';
    return `${target}${extra}`;
  };

  for (const ruleId of TRACKED_RULES) {
    const meta = RULE_META[ruleId];

    const violation = results.violations.find((r) => r.id === ruleId);
    if (violation) {
      const worst = violation.nodes[0];
      const detailMsg =
        worst?.failureSummary?.split('\n').filter(Boolean).slice(-1)[0]?.trim() ??
        violation.help;
      rows.push({
        id: `axe:${ruleId}`,
        title: meta.title,
        citation: meta.citation,
        status: 'fail',
        source: 'axe-core',
        detail: detailMsg,
        evidence: `${violation.nodes.length} element(s): ${summarizeNodes(violation.nodes)}`,
      });
      continue;
    }

    const incomplete = results.incomplete.find((r) => r.id === ruleId);
    if (incomplete) {
      rows.push({
        id: `axe:${ruleId}`,
        title: meta.title,
        citation: meta.citation,
        status: 'warn',
        source: 'axe-core',
        detail: `Needs a human check — axe could not fully determine this automatically. ${incomplete.help}`,
        evidence: summarizeNodes(incomplete.nodes),
      });
      continue;
    }

    const pass = results.passes.find((r) => r.id === ruleId);
    if (pass) {
      rows.push({
        id: `axe:${ruleId}`,
        title: meta.title,
        citation: meta.citation,
        status: 'pass',
        source: 'axe-core',
        detail: meta.passDetail,
        evidence: `${pass.nodes.length} element(s) checked`,
      });
    }
    // else: inapplicable — omit this rule for this fixture.
  }

  return rows;
}
