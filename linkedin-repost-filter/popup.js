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
