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
