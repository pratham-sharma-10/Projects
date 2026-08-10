import { useRef } from 'react';
import type { FixtureContent, Mode } from '../types';
import AliaPopup from './AliaPopup';

interface Props {
  fixture: FixtureContent;
  mode: Mode;
  isOpen: boolean;
  walkthrough: boolean;
  onOpen: () => void;
  onClose: () => void;
  registerNode: (el: HTMLDivElement | null) => void;
}

/**
 * A simulated Shopify product page with the Alia popup rendered on top. The
 * storefront chrome is intentionally muted so the popup, the thing under
 * audit, is the visual focus. The "Get the offer" launcher is the popup's
 * trigger; closing the remediated popup returns focus here (APG).
 */
export default function StorefrontPreview({
  fixture,
  mode,
  isOpen,
  walkthrough,
  onOpen,
  onClose,
  registerNode,
}: Props) {
  const launcherRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative h-full min-h-[560px] overflow-hidden rounded-alia bg-white">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-alia-border bg-alia-surface-2 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <div className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-xs text-alia-ink-muted">
          northshore-supply.myshopify.com/products/everyday-tote
        </div>
      </div>

      {/* Simulated storefront (decorative, hidden from the a11y tree so it
          doesn't muddy the audit of the popup itself). */}
      <div className="pointer-events-none select-none px-6 py-5" aria-hidden="true">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold tracking-tight text-alia-ink">NORTHSHORE</div>
          <div className="flex gap-5 text-sm text-alia-ink-soft">
            <span>Shop</span>
            <span>About</span>
            <span>Cart · 1</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="aspect-square rounded-alia bg-gradient-to-br from-[#e9ebf5] to-[#dfe3ee]" />
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-alia-ink-muted">
              Everyday Collection
            </div>
            <div className="mt-1 text-2xl font-bold text-alia-ink">The Everyday Tote</div>
            <div className="mt-2 text-lg text-alia-ink-soft">$128.00</div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-alia-surface-2" />
              <div className="h-3 w-5/6 rounded bg-alia-surface-2" />
              <div className="h-3 w-2/3 rounded bg-alia-surface-2" />
            </div>
            <div className="mt-5 h-11 w-full rounded-alia-sm bg-alia-ink" />
            <div className="mt-2 h-11 w-full rounded-alia-sm border border-alia-border-strong" />
          </div>
        </div>
      </div>

      {/* Popup launcher (the trigger). Kept mounted so it is a stable target
          for focus-return; made inert while the modal is open. */}
      <button
        ref={launcherRef}
        type="button"
        onClick={onOpen}
        aria-hidden={isOpen}
        tabIndex={isOpen ? -1 : 0}
        className={`absolute bottom-4 right-4 z-10 rounded-full bg-alia-accent px-4 py-2.5 text-sm font-semibold text-alia-accent-fg shadow-alia-pop transition hover:bg-alia-accent-hover ${
          isOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        Get the offer
      </button>

      {isOpen && (
        <AliaPopup
          key={`${mode}-${fixture.id}`}
          fixture={fixture}
          mode={mode}
          onClose={onClose}
          returnFocusTo={launcherRef.current}
          registerNode={registerNode}
          walkthrough={walkthrough}
        />
      )}
    </div>
  );
}
