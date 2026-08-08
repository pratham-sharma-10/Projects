import type { Citation } from '../types';

// Canonical WCAG 2.2 Understanding docs + W3C ARIA APG. Every audit row cites
// one of these so results read as a standards-based audit, not an opinion.
export const CITATIONS = {
  nonTextContent: {
    label: 'WCAG 1.1.1',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html',
  },
  infoRelationships: {
    label: 'WCAG 1.3.1',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html',
  },
  contrastMinimum: {
    label: 'WCAG 1.4.3',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
  },
  noKeyboardTrap: {
    label: 'WCAG 2.1.2',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html',
  },
  focusVisible: {
    label: 'WCAG 2.4.7',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html',
  },
  nameRoleValue: {
    label: 'WCAG 4.1.2',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html',
  },
  apgDialog: {
    label: 'APG Dialog (Modal) Pattern',
    url: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
  },
} satisfies Record<string, Citation>;
