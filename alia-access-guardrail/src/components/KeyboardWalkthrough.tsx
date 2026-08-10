import { useEffect, useState } from 'react';
import { accessibleName } from '../lib/a11yName';
import { isWithin } from '../lib/dom';

interface Props {
  active: boolean;
  dialogNode: HTMLElement | null;
  isOpen: boolean;
}

interface FocusState {
  name: string;
  role: string;
  inside: boolean;
}

function describe(el: Element): { name: string; role: string } {
  const tag = el.tagName;
  let role = el.getAttribute('role') ?? '';
  if (!role) {
    if (tag === 'BUTTON') role = 'button';
    else if (tag === 'A') role = 'link';
    else if (tag === 'INPUT') role = (el as HTMLInputElement).type === 'radio' ? 'radio' : 'edit text';
    else role = tag.toLowerCase();
  }
  return { name: accessibleName(el) || '(no accessible name)', role };
}

/**
 * Live keyboard-walkthrough HUD. While active it tracks the real focused
 * element and shows, for a non-technical viewer, whether focus is safely
 * inside the dialog or has escaped to the page behind it.
 */
export default function KeyboardWalkthrough({ active, dialogNode, isOpen }: Props) {
  const [focus, setFocus] = useState<FocusState | null>(null);
  const [escaped, setEscaped] = useState(false);

  useEffect(() => {
    if (!active || !isOpen || !dialogNode) {
      setFocus(null);
      setEscaped(false);
      return;
    }

    const read = () => {
      const el = document.activeElement;
      if (!el || el === document.body) {
        setFocus(null);
        setEscaped(true);
        return;
      }
      const inside = isWithin(dialogNode, el);
      const { name, role } = describe(el);
      setFocus({ name, role, inside });
      setEscaped(!inside);
    };

    const onFocusIn = () => read();
    const onFocusOut = () => window.setTimeout(read, 0);

    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    read();

    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, [active, isOpen, dialogNode]);

  if (!active) return null;

  return (
    <div
      className="rounded-alia border border-alia-border bg-alia-surface p-4 shadow-alia-card alia-fade-up"
      role="region"
      aria-label="Keyboard walkthrough status"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-alia-ink-muted">
          Keyboard walkthrough
        </h2>
        <div className="flex gap-1.5 text-[11px] font-semibold text-alia-ink-soft" aria-hidden="true">
          <kbd className="rounded border border-alia-border-strong bg-alia-surface-2 px-1.5 py-0.5">Tab</kbd>
          <kbd className="rounded border border-alia-border-strong bg-alia-surface-2 px-1.5 py-0.5">
            Shift+Tab
          </kbd>
          <kbd className="rounded border border-alia-border-strong bg-alia-surface-2 px-1.5 py-0.5">Esc</kbd>
        </div>
      </div>

      <p className="mt-2 text-[13px] text-alia-ink-soft">
        Click into the popup, then use the keys above. Watch where the focus ring goes.
      </p>

      <div
        className={`mt-3 rounded-alia-sm border px-3 py-2.5 ${
          escaped
            ? 'border-alia-fail bg-alia-fail-bg'
            : focus
              ? 'border-alia-pass bg-alia-pass-bg'
              : 'border-alia-border bg-alia-surface-2'
        }`}
        aria-live="polite"
      >
        {escaped ? (
          <p className="text-[13px] font-semibold text-alia-fail">
            Focus escaped the dialog. Focus is now on the page behind the popup.
          </p>
        ) : focus ? (
          <p className="text-[13px] text-alia-ink">
            <span className="font-semibold text-alia-pass">Focus contained.</span>{' '}
            <span className="text-alia-ink-soft">Current control:</span>{' '}
            <span className="font-semibold">{focus.name}</span>{' '}
            <span className="text-alia-ink-muted">({focus.role})</span>
          </p>
        ) : (
          <p className="text-[13px] text-alia-ink-muted">
            Waiting for focus. Click a control inside the popup to begin.
          </p>
        )}
      </div>
    </div>
  );
}
