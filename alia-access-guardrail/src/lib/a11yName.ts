// A pragmatic accessible-name computation — a small, honest subset of the
// W3C "Accessible Name and Description Computation". Enough to model how a
// screen reader would name the controls in our fixtures (aria-labelledby →
// aria-label → associated <label> → text/alt), not a full implementation.

export function accessibleName(el: Element): string {
  // 1. aria-labelledby (space-separated id refs).
  const labelledby = el.getAttribute('aria-labelledby');
  if (labelledby) {
    const text = labelledby
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ');
    if (text) return text;
  }

  // 2. aria-label.
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

  // 3. Associated <label> (for=id, or wrapping label).
  if (el.id) {
    const forLabel = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (forLabel?.textContent?.trim()) return forLabel.textContent.trim();
  }
  const wrapping = el.closest('label');
  if (wrapping) {
    // Text of the label minus the control's own value.
    const clone = wrapping.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('input, select, textarea').forEach((n) => n.remove());
    const t = clone.textContent?.trim();
    if (t) return t;
  }

  // 4. <img> alt.
  if (el.tagName === 'IMG') {
    const alt = el.getAttribute('alt');
    return alt ? alt.trim() : '';
  }

  // 5. Fallback: visible text content (for buttons/links).
  const own = (el as HTMLElement).textContent?.trim();
  return own ?? '';
}
