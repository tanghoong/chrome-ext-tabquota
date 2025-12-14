// Load settings and update UI
async function loadSettings() {
  const result = await chrome.storage.sync.get({
    enabled: false,
    maxTabs: 20
  });
  
  document.getElementById('enableToggle').checked = result.enabled;
  document.getElementById('maxTabsSelect').value = result.maxTabs;
  
  updateStatus();
  updateSuggestedList();
}

// Save settings to chrome.storage
async function saveSettings() {
  const enabled = document.getElementById('enableToggle').checked;
  const maxTabs = parseInt(document.getElementById('maxTabsSelect').value);
  
  await chrome.storage.sync.set({ enabled, maxTabs });
  
  // Notify background to update
  chrome.runtime.sendMessage({ action: 'settingsChanged' });
  
  updateStatus();
}

// Update status display
async function updateStatus() {
  const tabs = await chrome.tabs.query({});
  const currentTabs = tabs.length;
  
  const result = await chrome.storage.sync.get({ maxTabs: 20 });
  const maxTabs = result.maxTabs;
  const remaining = maxTabs - currentTabs;
  
  document.getElementById('currentTabs').textContent = currentTabs;
  const remainingQuotaElem = document.getElementById('remainingQuota');
  if (remaining < 0) {
    remainingQuotaElem.textContent = `Over quota by ${-remaining}`;
    remainingQuotaElem.classList.add('over-quota');
  } else {
    remainingQuotaElem.textContent = remaining;
    remainingQuotaElem.classList.remove('over-quota');
  }
}

// Get suggested tabs to close
async function getSuggestedTabs() {
  const tabs = await chrome.tabs.query({});
  
  // Filter out active tabs and sort by lastAccessed
  const suggested = tabs
    .filter(tab => !tab.active)
    .sort((a, b) => {
      // Prioritize non-pinned tabs
      if (a.pinned !== b.pinned) {
        return a.pinned ? 1 : -1;
      }
      // Sort by lastAccessed (oldest first), fallback to tab.id if undefined
      if (typeof a.lastAccessed === "number" && typeof b.lastAccessed === "number") {
        return a.lastAccessed - b.lastAccessed;
      } else if (typeof a.lastAccessed === "number") {
        return -1;
      } else if (typeof b.lastAccessed === "number") {
        return 1;
      } else {
        return a.id - b.id;
      }
    });
  
  return suggested;
}

// Update suggested list UI
async function updateSuggestedList() {
  const suggestedTabs = await getSuggestedTabs();
  const listElement = document.getElementById('suggestedList');
  
  if (suggestedTabs.length === 0) {
    listElement.innerHTML = '<div class="empty-message">No tabs suggested for closing</div>';
    document.getElementById('closeFirstThree').disabled = true;
    document.getElementById('closeFirstThree').textContent = 'Close Tabs';
    return;
  }
  
  listElement.innerHTML = '';
  listElement.setAttribute('role', 'list');
  
  // Update button based on number of tabs
  const closeBtn = document.getElementById('closeFirstThree');
  closeBtn.disabled = false;
  const numToClose = Math.min(3, suggestedTabs.length);
  if (numToClose === 1) {
    closeBtn.textContent = 'Close 1 Tab';
  } else {
    closeBtn.textContent = `Close First ${numToClose} Tabs`;
  }
  
  suggestedTabs.forEach((tab, index) => {
    const tabItem = document.createElement('div');
    tabItem.className = 'tab-item';
    tabItem.setAttribute('role', 'listitem');
    
    const tabTitle = document.createElement('div');
    tabTitle.className = 'tab-title';
    tabTitle.textContent = tab.title || 'Untitled';
    tabTitle.title = tab.title || 'Untitled';
    
    const tabActions = document.createElement('div');
    tabActions.className = 'tab-actions';
    
    const switchBtn = document.createElement('button');
    switchBtn.className = 'btn btn-switch';
    switchBtn.textContent = 'Switch';
    switchBtn.setAttribute('aria-label', `Switch to tab: ${tab.title || 'Untitled'}`);
    switchBtn.addEventListener('click', async () => {
      try {
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
        window.close();
      } catch (error) {
        console.error('Failed to switch to tab:', error);
        alert('Failed to switch to the tab. It may have been closed.');
      }
    });
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-close';
    closeBtn.textContent = 'Close';
    closeBtn.setAttribute('aria-label', `Close tab: ${tab.title || 'Untitled'}`);
    closeBtn.addEventListener('click', async () => {
      try {
        await chrome.tabs.remove(tab.id);
        await updateSuggestedList();
        await updateStatus();
      } catch (error) {
        console.error('Failed to close tab:', error);
        alert('Failed to close the tab. It may have already been closed.');
      }
    });
    
    tabActions.appendChild(switchBtn);
    tabActions.appendChild(closeBtn);
    
    tabItem.appendChild(tabTitle);
    tabItem.appendChild(tabActions);
    
    listElement.appendChild(tabItem);
  });
}

// Close up to three suggested tabs
async function closeUpToThreeTabs() {
  const suggestedTabs = await getSuggestedTabs();
  const tabsToClose = suggestedTabs.slice(0, 3);
  const closeBtn = document.getElementById('closeFirstThree');
  
  if (tabsToClose.length > 0) {
    const tabIds = tabsToClose.map(tab => tab.id);
    
    try {
      await chrome.tabs.remove(tabIds);
      
      // Provide visual feedback
      const originalText = closeBtn.textContent;
      closeBtn.textContent = 'Closed!';
      closeBtn.disabled = true;
      
      await updateSuggestedList();
      await updateStatus();
      
      setTimeout(() => {
        // Button text will be updated by updateSuggestedList
      }, 1000);
    } catch (error) {
      console.error('Failed to close tabs:', error);
      alert('Failed to close some tabs. They may have already been closed.');
      await updateSuggestedList();
      await updateStatus();
    }
  }
}

// Debounce function to avoid excessive updates
let updateTimeout;
function scheduleUpdate() {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  updateTimeout = setTimeout(() => {
    updateStatus();
    updateSuggestedList();
  }, 100);
}

// Event listeners
document.getElementById('enableToggle').addEventListener('change', saveSettings);
document.getElementById('maxTabsSelect').addEventListener('change', saveSettings);
document.getElementById('closeFirstThree').addEventListener('click', closeUpToThreeTabs);

// Listen for tab changes to update status (with debouncing)
chrome.tabs.onCreated.addListener(scheduleUpdate);
chrome.tabs.onRemoved.addListener(scheduleUpdate);
chrome.tabs.onUpdated.addListener(scheduleUpdate);

// Remove tab listeners when popup is closed
window.addEventListener('unload', () => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
    updateTimeout = null;
  }
  chrome.tabs.onCreated.removeListener(scheduleUpdate);
  chrome.tabs.onRemoved.removeListener(scheduleUpdate);
  chrome.tabs.onUpdated.removeListener(scheduleUpdate);
});
// Initialize on load
loadSettings();
