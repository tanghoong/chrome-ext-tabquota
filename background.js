// Default settings
const DEFAULT_SETTINGS = {
  enabled: false,
  maxTabs: 20
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  // Set default settings
  const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  await chrome.storage.sync.set(result);
  
  // Update badge
  updateBadge();
});

// Get current settings
async function getSettings() {
  const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return result;
}

// Count all tabs (including pinned)
async function getTabCount() {
  const tabs = await chrome.tabs.query({});
  return tabs.length;
}

// Update badge text
async function updateBadge() {
  const settings = await getSettings();
  const tabCount = await getTabCount();
  const remaining = Math.max(0, settings.maxTabs - tabCount);
  
  // Set badge text
  await chrome.action.setBadgeText({ text: remaining.toString() });
  
  // Set badge color based on status
  if (settings.enabled) {
    if (remaining <= 0) {
      await chrome.action.setBadgeBackgroundColor({ color: '#f44336' }); // Red
    } else if (remaining <= 5) {
      await chrome.action.setBadgeBackgroundColor({ color: '#FF9800' }); // Orange
    } else {
      await chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' }); // Green
    }
  } else {
    await chrome.action.setBadgeBackgroundColor({ color: '#9E9E9E' }); // Gray when disabled
  }
}

// Check and enforce quota
async function enforceQuota(tabId) {
  const settings = await getSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  const tabCount = await getTabCount();
  
  if (tabCount >= settings.maxTabs) {
    // Remove the newly created tab
    try {
      // Check if tab still exists before removing
      const tab = await chrome.tabs.get(tabId);
      if (tab) {
        await chrome.tabs.remove(tabId);
        
        // Show notification
        await chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'Tab Quota Limit Reached',
          message: `Maximum tab limit (${settings.maxTabs}) reached. New tab has been closed.`,
          priority: 2
        });
      }
    } catch (error) {
      // Tab may have been closed already, which is fine
      console.error('Error removing tab:', error);
    }
  }
}

// Listen for tab created
chrome.tabs.onCreated.addListener(async (tab) => {
  // First update badge
  await updateBadge();
  
  // Then check if we need to enforce quota
  // We need to wait a bit to ensure the tab is fully created
  setTimeout(async () => {
    await enforceQuota(tab.id);
  }, 100);
});

// Listen for tab removed
chrome.tabs.onRemoved.addListener(async () => {
  await updateBadge();
});

// Listen for tab updated
chrome.tabs.onUpdated.addListener(async () => {
  await updateBadge();
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'settingsChanged') {
    await updateBadge();
  }
});

// Listen for storage changes
chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === 'sync') {
    await updateBadge();
  }
});

// Initial badge update
updateBadge();
