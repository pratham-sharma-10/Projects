import type { CheckResult } from '../types';
import StatusPip from './StatusPip';

const STATUS_BORDER: Record<CheckResult['status'], string> = {
  pass: 'border-l-alia-pass',
  warn: 'border-l-alia-warn',
  fail: 'border-l-alia-fail',
};

/** One audit finding: status, title, plain-language detail, citation + source. */
export default function CheckRow({ check }: { check: CheckResult }) {
  return (
    <li
      className={`rounded-alia-sm border border-alia-border border-l-[3px] bg-alia-surface px-3.5 py-3 ${
        STATUS_BORDER[check.status]
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-alia-ink">{check.title}</p>
          <p className="mt-0.5 text-[13px] leading-snug text-alia-ink-soft">{check.detail}</p>
        </div>
        <StatusPip status={check.status} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <a
          href={check.citation.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-md bg-alia-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-alia-ink-soft transition hover:text-alia-accent hover:underline"
        >
          {check.citation.label}
          <svg width="10" height="10" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M6 3h7v7M13 3L4 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        <span
          className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
            check.source === 'axe-core'
              ? 'bg-[#eef1fb] text-[#3b46b3]'
              : 'bg-[#eef7f1] text-[#0a6b45]'
          }`}
          title={
            check.source === 'axe-core'
              ? 'Static WCAG rule, run by Deque axe-core'
              : 'Behavioral probe run live against the popup DOM'
          }
        >
          {check.source === 'axe-core' ? 'axe-core' : 'live probe'}
        </span>
        {check.evidence && (
          <code className="truncate rounded bg-alia-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-alia-ink-muted">
            {check.evidence}
          </code>
        )}
      </div>
    </li>
  );
}
