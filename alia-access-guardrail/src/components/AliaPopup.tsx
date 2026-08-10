import { useEffect, useId, useRef } from 'react';
import type { FixtureContent, Mode } from '../types';
import { getFocusable } from '../lib/dom';

interface Props {
  fixture: FixtureContent;
  mode: Mode;
  /** Called when the popup should close (× / Escape / decline). */
  onClose: () => void;
  /** The element focus should return to on close (the launcher). */
  returnFocusTo: HTMLElement | null;
  /** Registers the dialog DOM node with the audit engine. */
  registerNode: (el: HTMLDivElement | null) => void;
  /** Whether keyboard-walkthrough mode is active (adds the dashed focus ring). */
  walkthrough: boolean;
}

/**
 * The audited artifact: a realistic Alia-style modal popup.
 *
 * The SAME copy renders in both builds, only the accessibility scaffolding
 * differs, and the difference is real (not cosmetic):
 *
 *   remediated  → role="dialog" + aria-modal, labelled/described, a real focus
 *                 trap + Escape handler + focus return, <label>ed input,
 *                 <fieldset>/<legend> radio group, alt text, focus rings.
 *   broken      → a bare <div> with no dialog semantics, no keyboard handlers,
 *                 placeholder-only input, unlabeled div "buttons", an <img>
 *                 with no alt, sub-threshold contrast, focus outline removed.
 *
 * Every one of those differences is something the audit engine measures for
 * real via axe-core or live DOM probes.
 */
export default function AliaPopup({
  fixture,
  mode,
  onClose,
  returnFocusTo,
  registerNode,
  walkthrough,
}: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const headingId = useId();
  const bodyId = useId();
  const emailId = useId();
  const groupId = useId();
  const remediated = mode === 'remediated';

  // --- Focus management (remediated build only) --------------------------
  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;

    if (remediated) {
      // Capture where focus was, so we can return it on close (APG requirement).
      const target = returnFocusTo ?? (document.activeElement as HTMLElement | null);
      // Expose the captured target as live state the audit can verify, this is
      // the real element captured at open time, not a hard-coded flag.
      (node as unknown as { __aliaReturnTarget?: HTMLElement | null }).__aliaReturnTarget =
        target && target.isConnected ? target : null;

      // Move focus INTO the dialog (first focusable, else the dialog itself).
      const focusables = getFocusable(node);
      (focusables[0] ?? node).focus();

      return () => {
        // Return focus to the trigger on close (only if it's still around).
        if (target && target.isConnected) {
          target.focus();
        }
      };
    }

    // Broken build: deliberately leaves focus wherever it was, no move in,
    // no return target, no trap. This is the failure the audit reports.
    (node as unknown as { __aliaReturnTarget?: HTMLElement | null }).__aliaReturnTarget = null;
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remediated, fixture.id, returnFocusTo]);

  // --- Keyboard handling (remediated build only) -------------------------
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!remediated) return;
    const node = dialogRef.current;
    if (!node) return;

    if (e.key === 'Escape') {
      // Mark the event handled so the audit can detect Escape support even when
      // it suppresses the actual close during a non-destructive probe.
      e.preventDefault();
      const auditing = (window as unknown as { __aliaAuditing?: boolean }).__aliaAuditing;
      if (!auditing) onClose();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = getFocusable(node);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      // Wrap at the boundaries → focus is trapped inside the dialog (2.1.2).
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  const setRef = (el: HTMLDivElement | null) => {
    dialogRef.current = el;
    registerNode(el);
  };

  // ---------------------------------------------------------------------------
  // BROKEN BUILD
  // ---------------------------------------------------------------------------
  if (!remediated) {
    return (
      <div className="fx-scrim" aria-hidden={false}>
        <div
          ref={setRef}
          className={`fx-dialog fx-broken ${walkthrough ? 'walkthrough-active' : ''}`}
          data-alia-dialog="broken"
        >
          {/* Close control is a non-focusable div with no accessible name. */}
          <div className="fx-close" onClick={onClose} aria-hidden="true">
            ×
          </div>

          {fixture.image && (
            // No alt attribute → fails WCAG 1.1.1 (axe: image-alt).
            <img className="fx-hero" src={fixture.image.src} />
          )}

          {/* Heading is a styled div, no heading semantics for a screen reader. */}
          <div className="fx-heading">{fixture.heading}</div>
          <p className="fx-muted fx-body">{fixture.body}</p>

          {fixture.quiz && (
            <div className="fx-quiz">
              <div className="fx-quiz-q">{fixture.quiz.question}</div>
              <div className="fx-quiz-opts">
                {fixture.quiz.options.map((opt) => (
                  // Clickable divs, no radio semantics, not keyboard reachable.
                  <div key={opt.id} className="fx-quiz-opt" onClick={() => {}}>
                    <span className="fx-fauxradio" />
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="fx-field">
            {/* Looks labeled, but the text is a plain <div> with no
                programmatic association, and no placeholder, so the input has
                no accessible name at all (axe: label; SR announces "blank"). */}
            <div className="fx-label">{fixture.emailLabel}</div>
            <input className="fx-input" type="email" />
          </div>

          <button className="fx-cta" type="button">
            {fixture.ctaLabel}
          </button>
          {/* Decline is a div, not a real, focusable control. */}
          <div className="fx-decline" onClick={onClose}>
            {fixture.declineLabel}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // REMEDIATED BUILD
  // ---------------------------------------------------------------------------
  return (
    <div className="fx-scrim">
      <div
        ref={setRef}
        className={`fx-dialog fx-remediated ${walkthrough ? 'walkthrough-active' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={bodyId}
        data-alia-dialog="remediated"
        onKeyDown={handleKeyDown}
      >
        <button className="fx-close" type="button" aria-label="Close dialog" onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>

        {fixture.image && (
          <img className="fx-hero" src={fixture.image.src} alt={fixture.image.alt} />
        )}

        <h2 id={headingId} className="fx-heading">
          {fixture.heading}
        </h2>
        <p id={bodyId} className="fx-muted fx-body">
          {fixture.body}
        </p>

        {fixture.quiz && (
          <fieldset className="fx-quiz" aria-describedby={groupId}>
            <legend className="fx-quiz-q">{fixture.quiz.question}</legend>
            <div className="fx-quiz-opts">
              {fixture.quiz.options.map((opt, i) => {
                const id = `${groupId}-${opt.id}`;
                return (
                  <label key={opt.id} className="fx-quiz-opt" htmlFor={id}>
                    <input
                      id={id}
                      type="radio"
                      name={`${groupId}-choice`}
                      value={opt.id}
                      defaultChecked={i === 0}
                    />
                    {opt.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="fx-field">
          <label className="fx-label" htmlFor={emailId}>
            {fixture.emailLabel}
          </label>
          <input
            id={emailId}
            className="fx-input"
            type="email"
            required
            aria-required="true"
            autoComplete="email"
            placeholder={fixture.emailPlaceholder}
          />
        </div>

        <button className="fx-cta" type="button">
          {fixture.ctaLabel}
        </button>
        <button className="fx-decline" type="button" onClick={onClose}>
          {fixture.declineLabel}
        </button>
      </div>
    </div>
  );
}
