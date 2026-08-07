import { useCallback, useEffect, useState } from 'react';
import type { AuditReport, FixtureId, Mode } from './types';
import { FIXTURES } from './fixtures/popups';
import { runAudit } from './lib/audit';
import { buildScreenReaderScript, type SRLine } from './lib/screenReader';

import Header from './components/Header';
import BusinessCase from './components/BusinessCase';
import Controls from './components/Controls';
import StorefrontPreview from './components/StorefrontPreview';
import Scorecard from './components/Scorecard';
import ScreenReaderPreview from './components/ScreenReaderPreview';
import KeyboardWalkthrough from './components/KeyboardWalkthrough';
import AccessibilityStatement from './components/AccessibilityStatement';

export default function App() {
  const [fixtureId, setFixtureId] = useState<FixtureId>('welcome');
  const [mode, setMode] = useState<Mode>('broken');
  const [isOpen, setIsOpen] = useState(true);
  const [walkthrough, setWalkthrough] = useState(false);

  const [dialogNode, setDialogNode] = useState<HTMLElement | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [srLines, setSrLines] = useState<SRLine[]>([]);

  const fixture = FIXTURES[fixtureId];

  // Register the live popup node from the child; guard against redundant sets.
  const registerNode = useCallback((el: HTMLDivElement | null) => {
    setDialogNode((prev) => (prev === el ? prev : el));
  }, []);

  // Re-audit whenever the popup node, build, or fixture changes. We wait for the
  // popup's entrance animation (180ms fade/slide) to finish before running:
  // axe-core's color-contrast check needs fully-opaque, settled elements to
  // resolve backgrounds reliably, otherwise results flicker mid-animation.
  useEffect(() => {
    if (!dialogNode) return;
    let cancelled = false;
    let raf = 0;
    const timer = window.setTimeout(() => {
      raf = requestAnimationFrame(() => {
        runAudit(dialogNode, mode, fixtureId).then((rep) => {
          if (cancelled) return;
          setReport(rep);
          setSrLines(buildScreenReaderScript(dialogNode));
        });
      });
    }, 260);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [dialogNode, mode, fixtureId]);

  const handleModeChange = (next: Mode) => {
    setIsOpen(true); // ensure the popup is visible so the score reflects it
    setMode(next);
  };

  const handleFixtureChange = (id: FixtureId) => {
    setIsOpen(true);
    setFixtureId(id);
  };

  return (
    <div className="mx-auto max-w-[1240px] px-5 pb-16 sm:px-6">
      <Header />

      <div className="mt-6 space-y-4">
        <BusinessCase />
        <Controls
          fixtureId={fixtureId}
          mode={mode}
          walkthrough={walkthrough}
          onFixtureChange={handleFixtureChange}
          onModeChange={handleModeChange}
          onWalkthroughToggle={() => setWalkthrough((w) => !w)}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: storefront + walkthrough (sticky on wide screens) */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-alia-ink-muted">
              Storefront preview · {fixture.name}
            </p>
            <StorefrontPreview
              fixture={fixture}
              mode={mode}
              isOpen={isOpen}
              walkthrough={walkthrough}
              onOpen={() => setIsOpen(true)}
              onClose={() => setIsOpen(false)}
              registerNode={registerNode}
            />
            {!isOpen && (
              <p className="mt-2 text-[12px] text-alia-ink-muted">
                Popup closed — focus{' '}
                {mode === 'remediated' ? 'returned to the “Get the offer” trigger.' : 'was dropped (no return target).'}{' '}
                Reopen it to re-run the audit.
              </p>
            )}
            <div className="mt-4">
              <KeyboardWalkthrough active={walkthrough} dialogNode={dialogNode} isOpen={isOpen} />
            </div>
          </div>
        </div>

        {/* Right: scorecard + SR preview + statement */}
        <div className="space-y-5 lg:col-span-7">
          {report ? (
            <Scorecard report={report} />
          ) : (
            <div className="rounded-alia border border-alia-border bg-alia-surface p-6 text-sm text-alia-ink-muted shadow-alia-card">
              Running audit…
            </div>
          )}

          {srLines.length > 0 && <ScreenReaderPreview lines={srLines} />}

          {report && <AccessibilityStatement report={report} fixture={fixture} />}
        </div>
      </div>

      <footer className="mt-12 border-t border-alia-border pt-5 text-[12px] leading-relaxed text-alia-ink-muted">
        <p>
          Alia Access Guardrail — prototype. Checks run entirely client-side against the live popup
          DOM: <strong className="font-semibold text-alia-ink-soft">axe-core</strong> for static WCAG
          rules and custom live probes for keyboard behavior. No backend, no customer data. Brand
          colors are centralized in <code className="rounded bg-alia-surface-2 px-1">src/index.css</code>{' '}
          for exact Alia matching.
        </p>
      </footer>
    </div>
  );
}
