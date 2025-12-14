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
  const remaining = Math.max(0, maxTabs - currentTabs);
  
  document.getElementById('currentTabs').textContent = currentTabs;
  document.getElementById('remainingQuota').textContent = remaining;
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
      // Sort by lastAccessed (oldest first)
      return (a.lastAccessed || 0) - (b.lastAccessed || 0);
    });
  
  return suggested;
}

// Update suggested list UI
async function updateSuggestedList() {
  const suggestedTabs = await getSuggestedTabs();
  const listElement = document.getElementById('suggestedList');
  
  if (suggestedTabs.length === 0) {
    listElement.innerHTML = '<div class="empty-message">無建議關閉的分頁</div>';
    document.getElementById('closeFirstThree').disabled = true;
    return;
  }
  
  listElement.innerHTML = '';
  document.getElementById('closeFirstThree').disabled = false;
  
  suggestedTabs.forEach((tab, index) => {
    const tabItem = document.createElement('div');
    tabItem.className = 'tab-item';
    
    const tabTitle = document.createElement('div');
    tabTitle.className = 'tab-title';
    tabTitle.textContent = tab.title || 'Untitled';
    tabTitle.title = tab.title || 'Untitled';
    
    const tabActions = document.createElement('div');
    tabActions.className = 'tab-actions';
    
    const switchBtn = document.createElement('button');
    switchBtn.className = 'btn btn-switch';
    switchBtn.textContent = '切換';
    switchBtn.addEventListener('click', async () => {
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
      window.close();
    });
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-close';
    closeBtn.textContent = '關閉';
    closeBtn.addEventListener('click', async () => {
      await chrome.tabs.remove(tab.id);
      await updateSuggestedList();
      await updateStatus();
    });
    
    tabActions.appendChild(switchBtn);
    tabActions.appendChild(closeBtn);
    
    tabItem.appendChild(tabTitle);
    tabItem.appendChild(tabActions);
    
    listElement.appendChild(tabItem);
  });
}

// Close first three suggested tabs
async function closeFirstThree() {
  const suggestedTabs = await getSuggestedTabs();
  const tabsToClose = suggestedTabs.slice(0, 3);
  
  if (tabsToClose.length > 0) {
    const tabIds = tabsToClose.map(tab => tab.id);
    await chrome.tabs.remove(tabIds);
    await updateSuggestedList();
    await updateStatus();
  }
}

// Event listeners
document.getElementById('enableToggle').addEventListener('change', saveSettings);
document.getElementById('maxTabsSelect').addEventListener('change', saveSettings);
document.getElementById('closeFirstThree').addEventListener('click', closeFirstThree);

// Listen for tab changes to update status
chrome.tabs.onCreated.addListener(() => {
  updateStatus();
  updateSuggestedList();
});

chrome.tabs.onRemoved.addListener(() => {
  updateStatus();
  updateSuggestedList();
});

chrome.tabs.onUpdated.addListener(() => {
  updateStatus();
  updateSuggestedList();
});

// Initialize on load
loadSettings();
