import type { AuditReport } from '../types';
import { scoreBand, scoreLabel } from '../lib/score';
import CheckRow from './CheckRow';

const BAND_COLOR: Record<'pass' | 'warn' | 'fail', string> = {
  pass: 'var(--alia-pass)',
  warn: 'var(--alia-warn)',
  fail: 'var(--alia-fail)',
};

function ScoreRing({ score }: { score: number }) {
  const band = scoreBand(score);
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  return (
    <div className="relative h-[132px] w-[132px] shrink-0">
      <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
        <circle cx="66" cy="66" r={r} fill="none" stroke="var(--alia-border)" strokeWidth="12" />
        <circle
          cx="66"
          cy="66"
          r={r}
          fill="none"
          stroke={BAND_COLOR[band]}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 66 66)"
          style={{ transition: 'stroke-dashoffset 550ms cubic-bezier(0.16,1,0.3,1), stroke 300ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums text-alia-ink">{score}</span>
        <span className="text-[11px] font-medium text-alia-ink-muted">out of 100</span>
      </div>
    </div>
  );
}

export default function Scorecard({ report }: { report: AuditReport }) {
  const band = scoreBand(report.score);
  const bandText =
    band === 'pass' ? 'text-alia-pass' : band === 'warn' ? 'text-alia-warn' : 'text-alia-fail';

  return (
    <section className="alia-fade-up" aria-labelledby="scorecard-heading">
      <div className="flex items-center gap-5 rounded-alia border border-alia-border bg-alia-surface p-5 shadow-alia-card">
        <ScoreRing score={report.score} />
        <div className="min-w-0">
          <h2 id="scorecard-heading" className="text-xs font-semibold uppercase tracking-wide text-alia-ink-muted">
            Accessibility score
          </h2>
          <p className={`mt-0.5 text-xl font-bold ${bandText}`}>{scoreLabel(report.score)}</p>
          {/* Screen-reader summary of the whole card. */}
          <p className="sr-only">
            Score {report.score} out of 100. {report.passCount} checks pass, {report.warnCount} warn,
            {' '}
            {report.failCount} fail.
          </p>
          <div className="mt-2 flex flex-wrap gap-2" aria-hidden="true">
            <span className="rounded-full bg-alia-pass-bg px-2.5 py-1 text-xs font-semibold text-alia-pass">
              {report.passCount} pass
            </span>
            <span className="rounded-full bg-alia-warn-bg px-2.5 py-1 text-xs font-semibold text-alia-warn">
              {report.warnCount} warn
            </span>
            <span className="rounded-full bg-alia-fail-bg px-2.5 py-1 text-xs font-semibold text-alia-fail">
              {report.failCount} fail
            </span>
          </div>
        </div>
      </div>

      <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-alia-ink-muted">
        {report.checks.length} checks · WCAG 2.2 AA &amp; APG
      </h3>
      <ul className="space-y-2">
        {report.checks.map((check) => (
          <CheckRow key={check.id} check={check} />
        ))}
      </ul>
    </section>
  );
}
