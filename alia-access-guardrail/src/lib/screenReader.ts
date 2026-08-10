import { getFocusable } from './dom';
import { accessibleName } from './a11yName';

export type SRLineKind = 'boundary' | 'control' | 'text' | 'warn';

export interface SRLine {
  kind: SRLineKind;
  text: string;
}

// ---------------------------------------------------------------------------
// A faithful-enough screen-reader transcript, generated from the LIVE popup DOM
// (roles, accessible names, states), not a hand-written script. It models what
// a user would hear as the popup opens and they Tab through it, so a sighted
// audience can see an invisible failure mode made concrete.
// ---------------------------------------------------------------------------

function announceControl(el: HTMLElement): SRLine {
  const name = accessibleName(el);

  if (el.tagName === 'INPUT') {
    const input = el as HTMLInputElement;
    const type = input.type;

    if (type === 'radio') {
      const group = Array.from(
        el.ownerDocument.querySelectorAll<HTMLInputElement>(
          `input[type="radio"][name="${CSS.escape(input.name)}"]`,
        ),
      );
      const idx = group.indexOf(input) + 1;
      const state = input.checked ? 'selected' : 'not selected';
      return {
        kind: 'control',
        text: `${name || '(unnamed)'}, radio button, ${state}, ${idx} of ${group.length}.`,
      };
    }

    // Text-like inputs (email/text/etc.).
    const required = input.required || input.getAttribute('aria-required') === 'true';
    if (!name) {
      return {
        kind: 'warn',
        text: `Edit text, blank.${required ? ' Required.' : ''} No label is associated, so the field is announced with no name.`,
      };
    }
    return {
      kind: 'control',
      text: `${name}, edit text${required ? ', required' : ''}.`,
    };
  }

  if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') {
    return { kind: 'control', text: `${name || '(unnamed)'}, button.` };
  }

  if (el.tagName === 'A') {
    return { kind: 'control', text: `${name || '(unnamed)'}, link.` };
  }

  return { kind: 'control', text: `${name || '(unnamed)'}.` };
}

export function buildScreenReaderScript(node: HTMLElement): SRLine[] {
  const lines: SRLine[] = [];
  const isDialog = node.getAttribute('role') === 'dialog';

  if (isDialog) {
    const name = accessibleName(node);
    lines.push({ kind: 'boundary', text: `Dialog. ${name || '(no name)'}.` });
    const describedby = node.getAttribute('aria-describedby');
    if (describedby) {
      const desc = describedby
        .split(/\s+/)
        .map((id) => node.ownerDocument.getElementById(id)?.textContent?.trim() ?? '')
        .filter(Boolean)
        .join(' ');
      if (desc) lines.push({ kind: 'text', text: desc });
    }
  } else {
    lines.push({
      kind: 'warn',
      text: 'No dialog boundary announced. Assistive technology treats this as ordinary page text and continues reading the storefront behind it.',
    });
  }

  const focusables = getFocusable(node);
  if (focusables.length === 0) {
    lines.push({ kind: 'warn', text: 'No keyboard-reachable controls found inside the popup.' });
  }
  for (const el of focusables) {
    lines.push(announceControl(el));
  }

  // Call out controls that only look interactive (broken quiz uses plain divs).
  const fauxCount = node.querySelectorAll('.fx-fauxradio').length;
  if (!isDialog && fauxCount > 0) {
    lines.push({
      kind: 'warn',
      text: `${fauxCount} options are rendered as plain text with no control semantics and cannot be selected by keyboard or screen reader.`,
    });
  }

  return lines;
}
