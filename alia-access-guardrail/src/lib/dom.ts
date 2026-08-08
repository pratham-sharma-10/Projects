// Small DOM helpers shared by the popup and the audit engine.

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** All keyboard-focusable elements inside `root`, in DOM (tab) order,
 *  filtered to those actually visible (offsetParent present or fixed). */
export function getFocusable(root: HTMLElement): HTMLElement[] {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return nodes.filter((el) => {
    if (el.hasAttribute('disabled')) return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;
    // offsetParent is null for display:none; fixed elements report null too but
    // our fixtures aren't fixed, so this is a safe visibility proxy here.
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') return false;
    return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
  });
}

/** True if `el` is inside `container` (inclusive). */
export function isWithin(container: HTMLElement, el: Node | null): boolean {
  return !!el && (container === el || container.contains(el));
}
