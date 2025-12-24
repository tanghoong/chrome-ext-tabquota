// Theme Management
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Get system theme preference
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
}

// Apply theme to document
function applyTheme(theme) {
  let effectiveTheme = theme;
  if (theme === THEMES.AUTO) {
    effectiveTheme = getSystemTheme();
  }
  
  document.documentElement.setAttribute('data-theme', effectiveTheme);
  
  // Update button active states
  document.getElementById('themeLight').classList.toggle('active', theme === THEMES.LIGHT);
  document.getElementById('themeDark').classList.toggle('active', theme === THEMES.DARK);
  document.getElementById('themeAuto').classList.toggle('active', theme === THEMES.AUTO);
  
  // Update aria-checked for accessibility
  document.getElementById('themeLight').setAttribute('aria-checked', theme === THEMES.LIGHT);
  document.getElementById('themeDark').setAttribute('aria-checked', theme === THEMES.DARK);
  document.getElementById('themeAuto').setAttribute('aria-checked', theme === THEMES.AUTO);
}

// Save theme preference
async function saveTheme(theme) {
  await chrome.storage.sync.set({ theme });
  applyTheme(theme);
}

// Load and apply saved theme
async function loadTheme() {
  const result = await chrome.storage.sync.get({ theme: THEMES.AUTO });
  applyTheme(result.theme);
  
  // Listen for system theme changes when in auto mode
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    chrome.storage.sync.get({ theme: THEMES.AUTO }).then(result => {
      if (result.theme === THEMES.AUTO) {
        applyTheme(THEMES.AUTO);
      }
    });
  });
}

// Sanitize text for safe display (prevents XSS when used with textContent)
function sanitizeText(text) {
  if (typeof text !== 'string') {
    return '';
  }
  // Truncate very long strings to prevent DoS
  return text.slice(0, 500);
}

// Show toast notification (non-blocking alternative to alert)
let toastTimeout;
function showToast(message, type = 'error', duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  // Clear any existing timeout
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  
  // Set message and type
  toast.textContent = message;
  toast.className = `toast ${type}`;
  
  // Show toast
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  // Hide after duration
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

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
  const maxTabsValue = document.getElementById('maxTabsSelect').value;
  
  // Validate maxTabs is a valid number in expected range
  const maxTabs = parseInt(maxTabsValue, 10);
  if (isNaN(maxTabs) || maxTabs < 10 || maxTabs > 30) {
    console.error('Invalid maxTabs value');
    return;
  }
  
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
  
  document.getElementById('currentTabs').textContent = String(currentTabs);
  const remainingQuotaElem = document.getElementById('remainingQuota');
  if (remaining < 0) {
    remainingQuotaElem.textContent = `Over quota by ${-remaining}`;
    remainingQuotaElem.classList.add('over-quota');
  } else {
    remainingQuotaElem.textContent = String(remaining);
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

// Create favicon element for a tab
function createFaviconElement(tab) {
  if (tab.favIconUrl && tab.favIconUrl.startsWith('http')) {
    const favicon = document.createElement('img');
    favicon.className = 'tab-favicon';
    favicon.src = tab.favIconUrl;
    favicon.alt = '';
    favicon.loading = 'lazy';
    // Handle broken images
    favicon.onerror = function() {
      const placeholder = createFaviconPlaceholder();
      this.parentNode.replaceChild(placeholder, this);
    };
    return favicon;
  }
  return createFaviconPlaceholder();
}

// Create favicon placeholder for tabs without favicons
function createFaviconPlaceholder() {
  const placeholder = document.createElement('div');
  placeholder.className = 'tab-favicon-placeholder';
  placeholder.textContent = '📄';
  placeholder.setAttribute('aria-hidden', 'true');
  return placeholder;
}

// Update suggested list UI
async function updateSuggestedList() {
  const suggestedTabs = await getSuggestedTabs();
  const listElement = document.getElementById('suggestedList');
  
  if (suggestedTabs.length === 0) {
    // Clear and create empty message safely
    listElement.textContent = '';
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'empty-message';
    emptyMsg.textContent = 'No tabs suggested for closing';
    listElement.appendChild(emptyMsg);
    
    document.getElementById('closeFirstThree').disabled = true;
    document.getElementById('closeFirstThree').textContent = 'Close Tabs';
    return;
  }
  
  // Clear existing content safely
  listElement.textContent = '';
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
  
  suggestedTabs.forEach((tab) => {
    const tabItem = document.createElement('div');
    tabItem.className = 'tab-item';
    tabItem.setAttribute('role', 'listitem');
    
    const tabInfo = document.createElement('div');
    tabInfo.className = 'tab-info';
    
    // Add favicon
    const favicon = createFaviconElement(tab);
    tabInfo.appendChild(favicon);
    
    const tabTitle = document.createElement('div');
    tabTitle.className = 'tab-title';
    const titleText = sanitizeText(tab.title) || 'Untitled';
    tabTitle.textContent = titleText;
    tabTitle.title = titleText;
    tabInfo.appendChild(tabTitle);
    
    const tabActions = document.createElement('div');
    tabActions.className = 'tab-actions';
    
    const switchBtn = document.createElement('button');
    switchBtn.className = 'btn btn-switch';
    switchBtn.textContent = 'Switch';
    switchBtn.setAttribute('aria-label', `Switch to tab: ${titleText}`);
    switchBtn.addEventListener('click', async () => {
      try {
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
        window.close();
      } catch (error) {
        console.error('Failed to switch to tab:', error);
        showToast('Failed to switch to the tab. It may have been closed.', 'error');
      }
    });
    
    const closeBtnItem = document.createElement('button');
    closeBtnItem.className = 'btn btn-close';
    closeBtnItem.textContent = 'Close';
    closeBtnItem.setAttribute('aria-label', `Close tab: ${titleText}`);
    closeBtnItem.addEventListener('click', async () => {
      try {
        await chrome.tabs.remove(tab.id);
        await updateSuggestedList();
        await updateStatus();
      } catch (error) {
        console.error('Failed to close tab:', error);
        showToast('Failed to close the tab. It may have already been closed.', 'error');
        await updateSuggestedList();
        await updateStatus();
      }
    });
    
    tabActions.appendChild(switchBtn);
    tabActions.appendChild(closeBtnItem);
    
    tabItem.appendChild(tabInfo);
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
      closeBtn.textContent = 'Closed!';
      closeBtn.disabled = true;
      
      await updateSuggestedList();
      await updateStatus();
    } catch (error) {
      console.error('Failed to close tabs:', error);
      showToast('Failed to close some tabs. They may have already been closed.', 'error');
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

// Theme button event listeners
document.getElementById('themeLight').addEventListener('click', () => saveTheme(THEMES.LIGHT));
document.getElementById('themeDark').addEventListener('click', () => saveTheme(THEMES.DARK));
document.getElementById('themeAuto').addEventListener('click', () => saveTheme(THEMES.AUTO));

// Settings event listeners
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
loadTheme();
loadSettings();
