import type { CheckStatus } from '../types';

const CONFIG: Record<CheckStatus, { label: string; className: string; glyph: string }> = {
  pass: { label: 'Pass', className: 'text-alia-pass bg-alia-pass-bg', glyph: 'M4 8.5l2.5 2.5L12 5' },
  warn: { label: 'Warn', className: 'text-alia-warn bg-alia-warn-bg', glyph: 'M8 4.5v4M8 11.2v.1' },
  fail: { label: 'Fail', className: 'text-alia-fail bg-alia-fail-bg', glyph: 'M5 5l6 6M11 5l-6 6' },
};

/** Small colored status chip with an icon + visible text label. */
export default function StatusPip({ status }: { status: CheckStatus }) {
  const c = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${c.className}`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
        <path
          d={c.glyph}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {c.label}
    </span>
  );
}
