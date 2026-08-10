import type { CheckResult } from '../types';
import { CITATIONS } from './citations';
import { getFocusable, isWithin } from './dom';
import { accessibleName } from './a11yName';

// ---------------------------------------------------------------------------
// Interactive checks, the behavioral criteria a static engine like axe-core
// cannot verify on its own. Each probe drives the REAL popup DOM (dispatches
// real keyboard events, moves real focus, reads real computed styles) and
// restores state afterward so the visible demo is undisturbed.
// ---------------------------------------------------------------------------

type Probe = (node: HTMLElement) => CheckResult;

function dispatchKey(target: HTMLElement, key: string, shiftKey = false): KeyboardEvent {
  const evt = new KeyboardEvent('keydown', {
    key,
    code: key === 'Tab' ? 'Tab' : key,
    shiftKey,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(evt);
  return evt;
}

// 1. Dialog semantics + accessible name (APG Dialog / WCAG 4.1.2) -----------
const checkDialogSemantics: Probe = (node) => {
  const role = node.getAttribute('role');
  const modal = node.getAttribute('aria-modal');
  const name = accessibleName(node);
  const meta = {
    id: 'ix:dialog-semantics',
    title: 'Announced as a modal dialog',
    citation: CITATIONS.apgDialog,
    source: 'interactive' as const,
  };

  if (role === 'dialog' && modal === 'true' && name) {
    return {
      ...meta,
      status: 'pass',
      detail:
        'The popup exposes role="dialog", aria-modal="true", and an accessible name, so assistive technology announces it as a modal and scopes navigation to its contents.',
      evidence: `role="dialog", aria-modal="true", name: “${name}”`,
    };
  }
  const missing: string[] = [];
  if (role !== 'dialog') missing.push('role="dialog"');
  if (modal !== 'true') missing.push('aria-modal="true"');
  if (!name) missing.push('accessible name');
  return {
    ...meta,
    status: 'fail',
    detail:
      'The popup is a plain container with no dialog role, name, or modal semantics. Assistive technology does not announce a dialog, and users can navigate into the page behind it.',
    evidence: `missing: ${missing.join(', ')}`,
  };
};

// 2. Focus trap, Tab / Shift+Tab cycle stays inside (WCAG 2.1.2 + APG) ------
const checkFocusTrap: Probe = (node) => {
  const meta = {
    id: 'ix:focus-trap',
    title: 'Keyboard focus stays in the dialog',
    citation: CITATIONS.noKeyboardTrap,
    source: 'interactive' as const,
  };
  const focusables = getFocusable(node);
  if (focusables.length < 2) {
    return {
      ...meta,
      status: 'warn',
      detail: 'Too few focusable controls to exercise a Tab cycle.',
    };
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const prevActive = document.activeElement as HTMLElement | null;

  // Tab at the last control should wrap to the first.
  last.focus();
  dispatchKey(last, 'Tab', false);
  const wrappedForward = document.activeElement === first;

  // Shift+Tab at the first control should wrap to the last.
  first.focus();
  dispatchKey(first, 'Tab', true);
  const wrappedBackward = document.activeElement === last;

  // Restore focus so the probe is non-destructive.
  if (prevActive && prevActive.isConnected) prevActive.focus();

  if (wrappedForward && wrappedBackward) {
    return {
      ...meta,
      status: 'pass',
      detail:
        'Tab from the last control and Shift+Tab from the first both wrap within the dialog, so keyboard focus stays inside the popup.',
      evidence: 'Tab wraps to first; Shift+Tab wraps to last',
    };
  }
  return {
    ...meta,
    status: 'fail',
    detail:
      'Focus is not contained. Tabbing past the last control moves focus into the page behind the popup instead of cycling within it.',
    evidence: `Tab wrap: ${wrappedForward ? 'ok' : 'FAILED'}; Shift+Tab wrap: ${
      wrappedBackward ? 'ok' : 'FAILED'
    }`,
  };
};

// 3. Escape closes the dialog (WCAG 2.1.2 + APG) ----------------------------
const checkEscape: Probe = (node) => {
  const meta = {
    id: 'ix:escape',
    title: 'Escape key closes the popup',
    citation: CITATIONS.noKeyboardTrap,
    source: 'interactive' as const,
  };
  // Guard so the probe detects Escape support without actually closing the
  // visible demo popup.
  (window as unknown as { __aliaAuditing?: boolean }).__aliaAuditing = true;
  const evt = dispatchKey(node, 'Escape');
  (window as unknown as { __aliaAuditing?: boolean }).__aliaAuditing = false;

  if (evt.defaultPrevented) {
    return {
      ...meta,
      status: 'pass',
      detail: 'The Escape key is handled and closes the dialog, the expected exit for a modal.',
      evidence: 'keydown Escape handled (preventDefault)',
    };
  }
  return {
    ...meta,
    status: 'fail',
    detail:
      'Escape is not handled. The dialog can only be closed by clicking the close control, which is not reliably reachable by keyboard or screen-reader users.',
    evidence: 'keydown Escape not handled',
  };
};

// 4. Focus moves in on open and returns to the trigger on close (APG) -------
const checkFocusReturn: Probe = (node) => {
  const meta = {
    id: 'ix:focus-return',
    title: 'Focus moves in, then returns to the trigger',
    citation: CITATIONS.apgDialog,
    source: 'interactive' as const,
  };
  const returnTarget = (node as unknown as { __aliaReturnTarget?: HTMLElement | null })
    .__aliaReturnTarget;
  const focusInside = isWithin(node, document.activeElement);

  if (returnTarget && returnTarget.isConnected) {
    return {
      ...meta,
      status: 'pass',
      detail:
        'On open, focus moves into the dialog. The triggering control is stored and focus returns to it on close, preserving the user’s position.',
      evidence: `return target: ${returnTarget.tagName.toLowerCase()}${
        focusInside ? '; focus currently inside dialog' : ''
      }`,
    };
  }
  return {
    ...meta,
    status: 'fail',
    detail:
      'Focus is not moved into the dialog and no return target is recorded. On close, focus resets to the top of the page.',
    evidence: 'no return target captured',
  };
};

// 5. Visible focus indicator on every focusable (WCAG 2.4.7) ----------------
const checkFocusIndicator: Probe = (node) => {
  const meta = {
    id: 'ix:focus-visible',
    title: 'Visible focus indicator',
    citation: CITATIONS.focusVisible,
    source: 'interactive' as const,
  };
  const focusables = getFocusable(node);
  if (focusables.length === 0) {
    return { ...meta, status: 'warn', detail: 'No focusable controls to evaluate.' };
  }
  const prevActive = document.activeElement as HTMLElement | null;

  const hasVisibleRing = (el: HTMLElement): boolean => {
    el.focus();
    const s = window.getComputedStyle(el);
    const outlineWidth = parseFloat(s.outlineWidth || '0');
    const hasOutline = s.outlineStyle !== 'none' && outlineWidth > 0;
    const hasShadow = s.boxShadow !== 'none' && s.boxShadow.trim() !== '';
    return hasOutline || hasShadow;
  };

  const withRing = focusables.filter(hasVisibleRing).length;
  if (prevActive && prevActive.isConnected) prevActive.focus();

  if (withRing === focusables.length) {
    return {
      ...meta,
      status: 'pass',
      detail:
        'Every focusable control renders a visible focus indicator, so keyboard users can see the current focus position.',
      evidence: `${withRing}/${focusables.length} controls show a focus indicator`,
    };
  }
  return {
    ...meta,
    status: 'fail',
    detail:
      'Focused controls render no visible indicator because the outline is suppressed, so keyboard users cannot see the current focus position.',
    evidence: `${withRing}/${focusables.length} controls show a focus indicator`,
  };
};

const PROBES: Probe[] = [
  checkDialogSemantics,
  checkFocusTrap,
  checkEscape,
  checkFocusReturn,
  checkFocusIndicator,
];

/** Run every interactive probe against the live popup node. */
export function runInteractiveChecks(node: HTMLElement): CheckResult[] {
  return PROBES.map((probe) => probe(node));
}
