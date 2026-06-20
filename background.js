// DorkNio Extension — Background Service Worker (Manifest V3)
// Opens the full app in a new tab when the extension icon is clicked.

chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL('index.html');

  // Check if a DorkNio tab is already open — if so, focus it
  const existing = await chrome.tabs.query({ url });
  if (existing.length > 0) {
    const tab = existing[0];
    await chrome.tabs.update(tab.id, { active: true });
    if (tab.windowId) {
      await chrome.windows.update(tab.windowId, { focused: true });
    }
  } else {
    // Open a new maximized tab
    await chrome.tabs.create({ url, active: true });
  }
});
