/**
 * One-glance business-case caption so the demo explains its own stakes. The
 * two facts: ecommerce is the #1 target of digital ADA suits, and Alia's direct
 * competitors already publish popup accessibility docs while Alia's help center
 * has none.
 */
export default function BusinessCase() {
  return (
    <aside
      className="rounded-alia border border-alia-border bg-alia-surface p-4 shadow-alia-card"
      aria-label="Why this matters"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex gap-3">
          <div className="mt-0.5 shrink-0 rounded-alia-sm bg-alia-fail-bg px-2 py-1 text-sm font-bold text-alia-fail tabular-nums">
            77%
          </div>
          <p className="text-[12.5px] leading-snug text-alia-ink-soft">
            of 2024 U.S. digital-accessibility lawsuits targeted ecommerce sites, the single largest
            category (UsableNet Year-End report). The EU’s European Accessibility Act took effect
            June&nbsp;28,&nbsp;2025.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="mt-0.5 shrink-0 rounded-alia-sm bg-alia-warn-bg px-2 py-1 text-sm font-bold text-alia-warn tabular-nums">
            3/3
          </div>
          <p className="text-[12.5px] leading-snug text-alia-ink-soft">
            Wisepops, Justuno, and Klaviyo all publish popup accessibility documentation. Alia’s
            popup is a shared surface on every merchant’s storefront. This module closes that gap and
            makes it a point of trust.
          </p>
        </div>
      </div>
    </aside>
  );
}
