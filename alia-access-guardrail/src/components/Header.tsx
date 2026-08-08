/** Product header — frames the tool as a companion assurance layer for Alia's
 *  existing popup editor, not a redesign of it. */
export default function Header() {
  return (
    <header className="pt-8">
      <div className="flex items-center gap-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-alia-sm bg-alia-accent text-sm font-bold text-alia-accent-fg">
          A
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-alia-ink">Alia</span>
        <span aria-hidden="true" className="text-alia-border-strong">
          /
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-alia-ink-soft">
          Access Guardrail
        </span>
        <span className="ml-1 rounded-full bg-alia-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-alia-ink-muted">
          Companion layer
        </span>
      </div>

      <h1 className="mt-4 max-w-2xl text-[26px] font-bold leading-tight tracking-tight text-alia-ink sm:text-[30px]">
        Is this popup accessible to every shopper?
      </h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-alia-ink-soft">
        Your popup already reaches every visitor. This assurance module proves it’s usable by every
        visitor too — a live WCAG&nbsp;2.2 &amp; ADA audit that runs alongside the editor you already
        have.
      </p>
    </header>
  );
}
