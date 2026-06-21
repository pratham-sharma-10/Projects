/**
 * LinkedIn Reposted Job Filter — content script
 *
 * Scans the LinkedIn jobs search results, finds job cards that LinkedIn marks
 * as "Reposted", and either hides, blurs, or greys them out depending on the
 * user's chosen mode. LinkedIn loads results dynamically (infinite scroll +
 * SPA navigation) so a MutationObserver keeps the filter applied as new cards
 * stream in.
 */

const DEFAULTS = {
  enabled: true,
  mode: "blur" // "hide" | "blur" | "dim"
};

let settings = { ...DEFAULTS };

// Selectors that have historically matched a single job card / list item.
// We try several because LinkedIn renames classes often; matching any one of
// these is enough to grab the card container.
const CARD_SELECTORS = [
  "li[data-occludable-job-id]",
  "div[data-job-id]",
  "li.scaffold-layout__list-item",
  ".job-card-container",
  ".jobs-search-results__list-item"
];

const PROCESSED_ATTR = "data-lrf-processed";
const MARK_ATTR = "data-lrf-reposted";

// Matches the standalone word "Reposted" (case-insensitive). LinkedIn renders
// it as e.g. "Reposted 3 days ago".
const REPOST_RE = /\breposted\b/i;

function isReposted(card) {
  // Prefer the footer / metadata area when present to reduce false positives,
  // but fall back to the whole card text.
  const text = card.innerText || card.textContent || "";
  return REPOST_RE.test(text);
}

function applyToCard(card) {
  if (!isReposted(card)) {
    // Card text may have changed (e.g. re-render) — clear any prior marking.
    if (card.hasAttribute(MARK_ATTR)) {
      card.removeAttribute(MARK_ATTR);
      card.classList.remove("lrf-hide", "lrf-blur", "lrf-dim");
    }
    return;
  }

  card.setAttribute(MARK_ATTR, "true");
  card.classList.remove("lrf-hide", "lrf-blur", "lrf-dim");

  if (!settings.enabled) return;

  switch (settings.mode) {
    case "hide":
      card.classList.add("lrf-hide");
      break;
    case "dim":
      card.classList.add("lrf-dim");
      break;
    case "blur":
    default:
      card.classList.add("lrf-blur");
      break;
  }
}

function collectCards() {
  const found = new Set();
  for (const sel of CARD_SELECTORS) {
    document.querySelectorAll(sel).forEach((el) => found.add(el));
  }
  return found;
}

function scan() {
  const cards = collectCards();
  cards.forEach((card) => {
    card.setAttribute(PROCESSED_ATTR, "true");
    applyToCard(card);
  });
}

// Re-apply styling to already-marked cards when settings change, without a
// full rescan.
function refreshMarked() {
  document.querySelectorAll(`[${MARK_ATTR}]`).forEach((card) => {
    card.classList.remove("lrf-hide", "lrf-blur", "lrf-dim");
    if (!settings.enabled) return;
    if (settings.mode === "hide") card.classList.add("lrf-hide");
    else if (settings.mode === "dim") card.classList.add("lrf-dim");
    else card.classList.add("lrf-blur");
  });
}

// Debounce scans so rapid DOM mutations during scroll don't thrash.
let scanTimer = null;
function scheduleScan() {
  if (scanTimer) return;
  scanTimer = setTimeout(() => {
    scanTimer = null;
    scan();
  }, 200);
}

function startObserver() {
  const observer = new MutationObserver(() => scheduleScan());
  observer.observe(document.body, { childList: true, subtree: true });
}

function init() {
  chrome.storage.sync.get(DEFAULTS, (stored) => {
    settings = { ...DEFAULTS, ...stored };
    scan();
    startObserver();
  });

  // React to popup changes live.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (changes.enabled) settings.enabled = changes.enabled.newValue;
    if (changes.mode) settings.mode = changes.mode.newValue;
    refreshMarked();
    scheduleScan();
  });

  // Answer the popup's request for how many reposted jobs are on the page.
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg && msg.type === "getRepostCount") {
      // Make sure the count reflects what's currently rendered.
      scan();
      sendResponse({ count: document.querySelectorAll(`[${MARK_ATTR}]`).length });
    }
    return true;
  });
}

if (document.body) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
