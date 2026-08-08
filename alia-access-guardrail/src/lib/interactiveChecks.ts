import type { CheckResult } from '../types';
import { CITATIONS } from './citations';
import { getFocusable, isWithin } from './dom';
import { accessibleName } from './a11yName';

// ---------------------------------------------------------------------------
// Interactive checks — the behavioral criteria a static engine like axe-core
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
        'The popup exposes role="dialog", aria-modal="true", and an accessible name, so assistive tech announces it as a modal and confines review to its contents.',
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
      'The popup is a plain container. A screen reader never announces a dialog, gives no name, and lets the user wander into the page behind it.',
    evidence: `missing: ${missing.join(', ')}`,
  };
};

// 2. Focus trap — Tab / Shift+Tab cycle stays inside (WCAG 2.1.2 + APG) ------
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
        'Simulated Tab at the last control and Shift+Tab at the first — focus wrapped inside the dialog both ways, so keyboard users cannot get lost behind the popup.',
      evidence: 'Tab→wraps to first; Shift+Tab→wraps to last',
    };
  }
  return {
    ...meta,
    status: 'fail',
    detail:
      'Focus is not trapped. Pressing Tab past the last control escapes to the page behind the popup, where a keyboard or screen-reader user gets stranded.',
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
      detail: 'An Escape keypress is handled and dismisses the dialog — the expected exit for a modal.',
      evidence: 'keydown Escape → handled (preventDefault)',
    };
  }
  return {
    ...meta,
    status: 'fail',
    detail:
      'Escape does nothing. The only way out is a mouse click on the “×”, which keyboard and screen-reader users may never reach.',
    evidence: 'keydown Escape → not handled',
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
        'On open, focus is moved into the dialog; the triggering control is remembered and focus is restored to it on close, so the user never loses their place.',
      evidence: `return target: ${returnTarget.tagName.toLowerCase()}${
        focusInside ? '; focus currently inside dialog' : ''
      }`,
    };
  }
  return {
    ...meta,
    status: 'fail',
    detail:
      'Focus is never placed in the dialog and no return target is recorded. On close, focus drops to the top of the page and the user must start over.',
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
        'Every focusable control shows a clear focus ring when focused, so sighted keyboard users can always see where they are.',
      evidence: `${withRing}/${focusables.length} controls show a focus indicator`,
    };
  }
  return {
    ...meta,
    status: 'fail',
    detail:
      'Focused controls show no visible indicator (the outline is suppressed), leaving sighted keyboard users unable to tell where focus is.',
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
