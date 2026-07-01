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

// Set to true to print what the filter is finding to the browser console
// (prefixed with [LRF]). Handy for debugging on LinkedIn UI variants.
const DEBUG = true;

if (DEBUG) console.log("[LRF] content script loaded on", location.href);

// Inject the page-context interceptor (inject.js) into the page's MAIN world
// the standard, widely-compatible way: a <script> tag pointing at our
// web-accessible resource. This runs before LinkedIn's own fetch calls and can
// patch them, which an isolated content script cannot do.
function injectPageScript() {
  try {
    const s = document.createElement("script");
    s.src = chrome.runtime.getURL("inject.js");
    s.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    if (DEBUG) console.log("[LRF] interceptor script tag injected");
  } catch (e) {
    if (DEBUG) console.log("[LRF] failed to inject interceptor:", e);
  }
}
injectPageScript();

// Selectors that have historically matched a single job card / list item.
// We try several because LinkedIn renames classes often; matching any one of
// these is enough to grab the card container. Includes the newer "beta"
// search card structures.
const CARD_SELECTORS = [
  "li[data-occludable-job-id]",
  "div[data-job-id]",
  "li.scaffold-layout__list-item",
  ".job-card-container",
  ".jobs-search-results__list-item",
  ".job-card-job-posting-card-wrapper",
  "[data-view-name='job-card']",
  "li.jobs-search-results__list-item",
  "div.job-card-list",
  "li[data-occludable-entity-urn]"
];

const PROCESSED_ATTR = "data-lrf-processed";
const MARK_ATTR = "data-lrf-reposted";

// Matches the standalone word "Reposted" (case-insensitive). LinkedIn renders
// it as e.g. "Reposted 3 days ago".
const REPOST_RE = /\breposted\b/i;

// Job IDs the page-context interceptor (inject.js) flagged as reposted by
// reading LinkedIn's own API responses. This is the primary, reliable signal.
const repostedIds = new Set();

// Gather every scrap of text a card carries: visible text plus the hidden
// labels LinkedIn tucks into aria-label / title / alt attributes (the
// "Reposted" status sometimes lives only there). Used as a fallback when the
// API signal isn't available.
function getCardText(card) {
  let text = card.textContent || "";
  card.querySelectorAll("[aria-label], [title], img[alt]").forEach((el) => {
    text += " " + (el.getAttribute("aria-label") || "");
    text += " " + (el.getAttribute("title") || "");
    text += " " + (el.getAttribute("alt") || "");
  });
  return text;
}

// Pull the numeric job id off a card so we can match it against the API set.
function cardJobId(card) {
  let id =
    card.getAttribute("data-job-id") ||
    card.getAttribute("data-occludable-job-id");
  if (id) return String(id);

  const inner = card.querySelector("[data-job-id], [data-occludable-job-id]");
  if (inner) {
    id =
      inner.getAttribute("data-job-id") ||
      inner.getAttribute("data-occludable-job-id");
    if (id) return String(id);
  }

  const link = card.querySelector('a[href*="/jobs/view/"]');
  if (link) {
    const m = /\/jobs\/view\/(\d+)/.exec(link.getAttribute("href") || "");
    if (m) return m[1];
  }
  return null;
}

function isReposted(card) {
  // Primary signal: LinkedIn's API said this job id is reposted.
  const id = cardJobId(card);
  if (id && repostedIds.has(id)) return true;
  // Fallback: the card's own text/labels mention "Reposted".
  return REPOST_RE.test(getCardText(card));
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

  const reposted = document.querySelectorAll(`[${MARK_ATTR}]`).length;
  updateBadge(cards.size, reposted);

  if (DEBUG) {
    const anywhere = REPOST_RE.test(document.body.textContent || "");
    console.log(
      `[LRF] cards detected: ${cards.size} | reposted matched: ${reposted} | ` +
        `API reposted IDs: ${repostedIds.size} | "Reposted" text on page: ${anywhere} | ` +
        `mode: ${settings.mode} | enabled: ${settings.enabled}`
    );
  }
}

// On-page status badge: visible proof the extension is running, no DevTools
// needed. Shows on job pages; click to dismiss for the rest of the session.
let badgeDismissed = false;
function updateBadge(cardCount, repostedCount) {
  if (badgeDismissed) return;

  // Only surface the badge where it's meaningful: job pages or pages that
  // actually have job cards.
  if (!/\/jobs/i.test(location.pathname) && cardCount === 0) {
    const stale = document.getElementById("lrf-badge");
    if (stale) stale.remove();
    return;
  }

  let badge = document.getElementById("lrf-badge");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "lrf-badge";
    badge.title = "LinkedIn Reposted Job Filter — click to dismiss";
    badge.addEventListener("click", () => {
      badgeDismissed = true;
      badge.remove();
    });
    document.body.appendChild(badge);
  }

  if (!settings.enabled) {
    badge.textContent = "Repost Filter: OFF";
    badge.className = "lrf-badge-off";
  } else if (cardCount === 0) {
    badge.textContent = "Repost Filter: on — no job cards seen on this page";
    badge.className = "lrf-badge-idle";
  } else {
    badge.textContent =
      `Repost Filter: ${repostedCount} reposted / ${cardCount} jobs (${settings.mode})`;
    badge.className = repostedCount > 0 ? "lrf-badge-active" : "lrf-badge-idle";
  }
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

// Listen for reposted job IDs discovered by the page-context interceptor.
function listenForApiSignal() {
  window.addEventListener("message", (e) => {
    if (e.source !== window) return;
    const d = e.data;
    if (!d || d.source !== "LRF_INJECT" || d.type !== "reposted") return;
    if (!Array.isArray(d.ids)) return;

    let added = false;
    d.ids.forEach((id) => {
      const s = String(id);
      if (!repostedIds.has(s)) {
        repostedIds.add(s);
        added = true;
      }
    });
    if (added) scheduleScan();
  });

  // Ask the interceptor to replay anything it already captured before we loaded.
  window.postMessage({ source: "LRF_CONTENT", type: "request" }, "*");
}

function init() {
  listenForApiSignal();

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
