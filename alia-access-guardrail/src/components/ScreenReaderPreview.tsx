import type { SRLine } from '../lib/screenReader';

const KIND_STYLE: Record<SRLine['kind'], string> = {
  boundary: 'text-white font-semibold',
  text: 'text-[#c7cbe0]',
  control: 'text-[#a7f3d0]',
  warn: 'text-[#fca5a5]',
};

const KIND_PREFIX: Record<SRLine['kind'], string> = {
  boundary: '◆',
  text: '“',
  control: '▸',
  warn: '⚠',
};

/**
 * Renders the generated screen-reader transcript as a "speech" panel. Purely
 * visual (a sighted-audience aid), the real accessible names come from the
 * live DOM via buildScreenReaderScript.
 */
export default function ScreenReaderPreview({ lines }: { lines: SRLine[] }) {
  return (
    <section
      className="overflow-hidden rounded-alia border border-alia-border shadow-alia-card"
      aria-labelledby="sr-heading"
    >
      <header className="flex items-center gap-2 bg-[#12141a] px-4 py-2.5">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="text-[#a7f3d0]">
          <path
            d="M4 9v6h4l5 4V5L8 9H4z"
            fill="currentColor"
          />
          <path
            d="M16 8a5 5 0 010 8M18.5 5.5a9 9 0 010 13"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        <h2 id="sr-heading" className="text-xs font-semibold uppercase tracking-wide text-white">
          What a screen reader announces
        </h2>
      </header>
      <ol className="space-y-1.5 bg-[#1b1d26] px-4 py-3.5 font-mono text-[12.5px] leading-relaxed">
        {lines.map((line, i) => (
          <li key={i} className={`flex gap-2 ${KIND_STYLE[line.kind]}`}>
            <span aria-hidden="true" className="select-none opacity-70">
              {KIND_PREFIX[line.kind]}
            </span>
            <span>
              {line.text}
              {line.kind === 'text' ? '”' : ''}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
