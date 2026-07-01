const DEFAULTS = { enabled: true, mode: "blur" };

const enabledEl = document.getElementById("enabled");
const modesSection = document.getElementById("modesSection");
const modeInputs = () => document.querySelectorAll('input[name="mode"]');

function reflectEnabled(enabled) {
  modesSection.classList.toggle("disabled", !enabled);
}

// Load current settings.
chrome.storage.sync.get(DEFAULTS, (s) => {
  enabledEl.checked = s.enabled;
  modeInputs().forEach((input) => {
    input.checked = input.value === s.mode;
  });
  reflectEnabled(s.enabled);
});

enabledEl.addEventListener("change", () => {
  chrome.storage.sync.set({ enabled: enabledEl.checked });
  reflectEnabled(enabledEl.checked);
});

modeInputs().forEach((input) => {
  input.addEventListener("change", () => {
    if (input.checked) chrome.storage.sync.set({ mode: input.value });
  });
});

// Ask the active LinkedIn tab how many reposted jobs it found.
const countNum = document.getElementById("countNum");
const countText = document.getElementById("countText");

function showCount(n) {
  countNum.textContent = n;
  countText.textContent = n === 1 ? "reposted job found on this page" : "reposted jobs found on this page";
}

function showUnavailable() {
  countNum.textContent = "–";
  countText.textContent = "open LinkedIn job search to see results";
}

// Show the running version so stale installs are immediately obvious.
document.getElementById("versionLine").textContent =
  `v${chrome.runtime.getManifest().version} — works on LinkedIn job search. Refresh the page if it was already open.`;

// Kick off an auto-scan of the current page; progress shows in the on-page badge.
document.getElementById("scanBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) return;
    chrome.tabs.sendMessage(tab.id, { type: "startScan" }, () => {
      if (chrome.runtime.lastError) return; // not a LinkedIn tab / needs refresh
      window.close(); // get out of the way; the badge shows progress
    });
  });
});

// One-click diagnostics: ask the page's content script for a full report and
// put it on the clipboard.
document.getElementById("diagBtn").addEventListener("click", () => {
  const status = document.getElementById("diagStatus");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const fallback =
      `=== LRF diagnostics (popup only) ===\n` +
      `popup version: ${chrome.runtime.getManifest().version}\n` +
      `tab url: ${tab && tab.url}\n` +
      `content script: NOT RESPONDING (page needs a refresh, or not a LinkedIn tab)\n` +
      `=== end ===`;
    if (!tab || !tab.id) {
      navigator.clipboard.writeText(fallback);
      status.textContent = "Copied (no tab info). Paste it in the chat.";
      return;
    }
    chrome.tabs.sendMessage(tab.id, { type: "getDiagnostics" }, (res) => {
      const text = chrome.runtime.lastError || !res ? fallback : res.report;
      navigator.clipboard.writeText(text).then(() => {
        status.textContent = "Copied! Paste it in the chat.";
      });
    });
  });
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (!tab || !tab.url || !/https:\/\/www\.linkedin\.com\//.test(tab.url)) {
    showUnavailable();
    return;
  }
  chrome.tabs.sendMessage(tab.id, { type: "getRepostCount" }, (res) => {
    if (chrome.runtime.lastError || !res) {
      // Content script not loaded yet (tab opened before install / needs refresh).
      showUnavailable();
      return;
    }
    showCount(res.count);
  });
});
