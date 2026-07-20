function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Per-toggle defaults — most start off, but the CV picker and the generic-
// site record button are opt-out rather than opt-in.
const TOGGLE_DEFAULTS = {
  hideApplied: false,
  hideViewed: false,
  hideRemote: false,
  hideHybrid: false,
  hideOnsite: false,
  hideUninterestedCompanies: false,
  cvPickerEnabled: true,
  showRecordButton: true,
};
const TOGGLE_IDS = Object.keys(TOGGLE_DEFAULTS);

async function refresh() {
  const defaults = { dailyCounts: {}, pendingRecords: [], ...TOGGLE_DEFAULTS };
  const { dailyCounts, pendingRecords, ...toggles } = await chrome.storage.local.get(defaults);

  for (const id of TOGGLE_IDS) {
    document.getElementById(id).checked = toggles[id];
  }

  const today = dailyCounts[todayKey()] || { applied: 0, viewed: 0 };
  document.getElementById('appliedToday').textContent = today.applied || 0;
  document.getElementById('viewedToday').textContent = today.viewed || 0;

  document.getElementById('pendingHint').hidden = pendingRecords.length === 0;
  document.getElementById('pendingCount').textContent = pendingRecords.length;
}

for (const id of TOGGLE_IDS) {
  document.getElementById(id).addEventListener('change', (e) => {
    chrome.storage.local.set({ [id]: e.target.checked });
  });
}

document.getElementById('openFile').addEventListener('click', () => {
  document.getElementById('openFileError').hidden = true;
  chrome.runtime.sendMessage({ type: 'OPEN_FILE' }, (res) => {
    if (chrome.runtime.lastError || !res?.ok) {
      document.getElementById('openFileError').hidden = false;
    }
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') refresh();
});

refresh();
