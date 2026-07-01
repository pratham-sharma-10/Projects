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
  "li[data-occludable-entity-urn]",
  // Selector-free catch: whatever LinkedIn calls its cards, each one is a
  // list item containing a link to the job. Survives class renames.
  "li:has(a[href*='currentJobId='])",
  "li:has(a[href*='/jobs/view/'])"
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

  // Beta search UI: card links carry ?currentJobId=<id> instead.
  const betaLink = card.querySelector("a[href*='currentJobId=']");
  if (betaLink) {
    const m = /currentJobId=(\d+)/.exec(betaLink.getAttribute("href") || "");
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

// ---------------------------------------------------------------------------
// Detail-pane detection. The list cards usually say only "Posted", but the
// detail pane you open by clicking a job spells out "Reposted N hours ago".
// Whenever that pane is on screen we read it, flag the job, blur its list
// card, and remember the job id so it stays filtered in future searches.
// ---------------------------------------------------------------------------

const DETAIL_SELECTORS = [
  ".job-details-jobs-unified-top-card__container--two-pane",
  ".jobs-unified-top-card",
  ".job-details-jobs-unified-top-card",
  ".jobs-details__main-content",
  ".jobs-search__job-details",
  "[class*='job-details']"
];

// The job currently open in the detail pane, from the URL LinkedIn keeps in
// sync (?currentJobId=… on search pages, /jobs/view/<id> on full pages).
function currentJobId() {
  let m = /[?&]currentJobId=(\d+)/.exec(location.search);
  if (m) return m[1];
  m = /\/jobs\/view\/(\d+)/.exec(location.pathname);
  if (m) return m[1];
  return null;
}

function findDetailPane() {
  for (const sel of DETAIL_SELECTORS) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

function ensureDetailBanner(pane, reposted, jobId) {
  let banner = document.querySelector(".lrf-detail-banner");
  if (!reposted) {
    if (banner) banner.remove();
    return;
  }
  // Re-create when the open job changed so the banner never goes stale.
  if (banner && banner.getAttribute("data-lrf-job") !== String(jobId)) {
    banner.remove();
    banner = null;
  }
  if (!banner) {
    banner = document.createElement("div");
    banner.className = "lrf-detail-banner";
    banner.setAttribute("data-lrf-job", String(jobId));
    banner.textContent = "⚠ Reposted job — flagged by Repost Filter";
    pane.prepend(banner);
  }
}

// Selector-free fallback: find an element whose text says "Reposted" that is
// NOT inside a job-list card (so it must be the detail pane), regardless of
// what LinkedIn calls its classes this week.
function repostedElementOutsideCards() {
  if (!REPOST_RE.test(document.body.textContent || "")) return null;
  const cardSel = CARD_SELECTORS.join(",");
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!REPOST_RE.test(node.nodeValue || "")) continue;
    const el = node.parentElement;
    if (!el) continue;
    if (el.closest(cardSel)) continue; // it's a list card, not the pane
    if (el.closest("#lrf-badge, .lrf-detail-banner")) continue; // our own UI
    return el;
  }
  return null;
}

function scanDetailPane() {
  const jobId = currentJobId();
  const pane = findDetailPane();
  let reposted = false;
  let anchor = null; // where to show the banner

  if (pane) {
    // Only read the pane's leading text (the top card with title/company/
    // "Reposted N ago"), not the whole job description, to avoid false hits.
    reposted = REPOST_RE.test((pane.textContent || "").slice(0, 2500));
    anchor = pane;
  }

  if (!reposted) {
    // Class names change with LinkedIn redesigns — fall back to finding the
    // "Reposted" text itself anywhere outside the job list.
    const el = repostedElementOutsideCards();
    if (el) {
      reposted = true;
      anchor = el.parentElement || el;
    }
  }

  if (anchor || !reposted) {
    ensureDetailBanner(anchor, reposted, jobId || "unknown");
  }

  if (reposted && jobId && !repostedIds.has(jobId)) {
    repostedIds.add(jobId);
    if (DEBUG) console.log(`[LRF] detail pane says job ${jobId} is reposted — remembering it`);
    persistIds();
  }
}

// ---------------------------------------------------------------------------
// Auto-scan: user-triggered. Scrolls the list to load every card, then opens
// each job briefly (like a human clicking through) so the detail pane reveals
// "Reposted" and the job gets flagged + blurred. Human-paced on purpose:
// one page per run, ~2s per job, cancellable by clicking the badge.
// ---------------------------------------------------------------------------

let scanState = null; // null | { i, n } while a scan runs

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function findListScroller() {
  const first = collectCards().values().next().value;
  for (let el = first; el && el !== document.body; el = el.parentElement) {
    if (el.scrollHeight > el.clientHeight + 100) return el;
  }
  return document.scrollingElement || document.documentElement;
}

async function autoScrollList() {
  const scroller = findListScroller();
  for (let i = 0; i < 25 && scanState; i++) {
    const before = scroller.scrollTop;
    scroller.scrollTop = scroller.scrollHeight;
    await sleep(700);
    if (Math.abs(scroller.scrollTop - before) < 4) break; // bottom reached
  }
  scroller.scrollTop = 0;
  await sleep(400);
}

function openCard(card) {
  card.scrollIntoView({ block: "center" });
  const link = card.querySelector(
    "a[href*='currentJobId='], a[href*='/jobs/view/']"
  );
  (link || card).click();
}

async function autoScan() {
  if (scanState) return;
  scanState = { i: 0, n: 0 };
  if (DEBUG) console.log("[LRF] auto-scan started");
  try {
    await autoScrollList();

    // Jobs already checked and found clean this session — never re-click them
    // if the scan is re-run or the page reloads mid-scan.
    let scannedClean;
    try {
      scannedClean = new Set(JSON.parse(sessionStorage.getItem("lrfScannedClean") || "[]"));
    } catch (e) {
      scannedClean = new Set();
    }

    // Build the queue: one entry per unique job id, skipping known reposts
    // and jobs already verified clean.
    const seen = new Set();
    const queue = [];
    collectCards().forEach((card) => {
      const id = cardJobId(card);
      if (!id || seen.has(id)) return;
      seen.add(id);
      if (repostedIds.has(id) || scannedClean.has(id)) return;
      queue.push({ card, id });
    });

    const max = Math.min(queue.length, 40); // one page per run, capped
    scanState.n = max;

    for (let i = 0; i < max; i++) {
      if (!scanState) return; // cancelled via badge click
      scanState.i = i + 1;
      updateBadge(seen.size, document.querySelectorAll(`[${MARK_ATTR}]`).length);
      openCard(queue[i].card);
      // Human-ish pacing; also gives LinkedIn time to render the pane.
      await sleep(1500 + Math.random() * 900);
      scanDetailPane();
      scan();
      if (!repostedIds.has(queue[i].id)) {
        scannedClean.add(queue[i].id);
        try {
          sessionStorage.setItem("lrfScannedClean", JSON.stringify(Array.from(scannedClean)));
        } catch (e) {
          /* storage full/blocked — worst case we re-check next run */
        }
      }
    }
    if (DEBUG) console.log(`[LRF] auto-scan finished: ${repostedIds.size} known reposts`);
  } finally {
    scanState = null;
    scheduleScan();
  }
}

function cancelScan() {
  if (!scanState) return;
  scanState = null;
  if (DEBUG) console.log("[LRF] auto-scan cancelled");
}

// Remember flagged job ids across pages/sessions so a repost spotted once
// stays filtered everywhere.
let persistTimer = null;
function persistIds() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    // Cap what we store; oldest ids fall off first.
    chrome.storage.local.set({ knownRepostedIds: Array.from(repostedIds).slice(-3000) });
  }, 500);
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
  scanDetailPane();

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
    badge.title = "LinkedIn Reposted Job Filter — click to dismiss (or to stop a scan)";
    badge.addEventListener("click", () => {
      if (scanState) {
        cancelScan();
        return;
      }
      badgeDismissed = true;
      badge.remove();
    });
    document.body.appendChild(badge);
  }

  if (scanState) {
    badge.textContent = scanState.n
      ? `Scanning job ${scanState.i}/${scanState.n}… (click to stop)`
      : "Scanning: loading all jobs… (click to stop)";
    badge.className = "lrf-badge-scan";
    return;
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

  // Restore job ids flagged as reposted in earlier sessions.
  chrome.storage.local.get({ knownRepostedIds: [] }, (stored) => {
    (stored.knownRepostedIds || []).forEach((id) => repostedIds.add(String(id)));
    if (DEBUG && repostedIds.size) {
      console.log(`[LRF] restored ${repostedIds.size} remembered reposted job ids`);
    }
    scheduleScan();
  });

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
    if (msg && msg.type === "getDiagnostics") {
      scan();
      sendResponse({ report: buildDiagnostics() });
    }
    if (msg && msg.type === "startScan") {
      autoScan();
      sendResponse({ started: true });
    }
    return true;
  });

  // Keyboard shortcut: Alt+Shift+S starts a scan of the current page.
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.shiftKey && e.code === "KeyS") autoScan();
  });
}

// One-click diagnostic report so problems can be debugged from a paste
// instead of a screenshot safari.
function buildDiagnostics() {
  const lines = [];
  lines.push("=== LinkedIn Reposted Job Filter — diagnostics ===");
  lines.push(`version: ${chrome.runtime.getManifest().version}`);
  lines.push(`url: ${location.href}`);
  lines.push(`settings: enabled=${settings.enabled} mode=${settings.mode}`);
  lines.push(`remembered/API reposted ids: ${repostedIds.size}`);

  lines.push("--- card selector hits ---");
  let sampleCard = null;
  for (const sel of CARD_SELECTORS) {
    const n = document.querySelectorAll(sel).length;
    lines.push(`${sel}: ${n}`);
    if (n && !sampleCard) sampleCard = document.querySelector(sel);
  }
  const marked = document.querySelectorAll(`[${MARK_ATTR}]`).length;
  lines.push(`marked as reposted: ${marked}`);
  lines.push(`"Reposted" text anywhere on page: ${REPOST_RE.test(document.body.textContent || "")}`);

  lines.push("--- detail pane ---");
  let paneSel = null;
  for (const sel of DETAIL_SELECTORS) {
    if (document.querySelector(sel)) { paneSel = sel; break; }
  }
  lines.push(`matched selector: ${paneSel || "NONE"}`);
  if (paneSel) {
    const t = (document.querySelector(paneSel).textContent || "").replace(/\s+/g, " ").slice(0, 300);
    lines.push(`pane text (300ch): ${t}`);
  }
  lines.push(`currentJobId: ${currentJobId() || "none"}`);
  lines.push(`banner present: ${!!document.querySelector(".lrf-detail-banner")}`);
  lines.push(`badge present: ${!!document.getElementById("lrf-badge")}`);

  lines.push("--- sample card HTML (1200ch) ---");
  lines.push(sampleCard ? sampleCard.outerHTML.replace(/\s+/g, " ").slice(0, 1200) : "NO CARDS FOUND");
  lines.push("=== end ===");
  return lines.join("\n");
}

if (document.body) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
