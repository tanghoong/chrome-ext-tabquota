# Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Chrome Browser                      │
│                                                      │
│  ┌──────────────┐                                   │
│  │   Popup UI   │                                   │
│  │  (popup.html)│◄──────────┐                       │
│  │  (popup.js)  │            │                       │
│  └──────┬───────┘            │                       │
│         │                    │                       │
│         │ chrome.storage     │ Events & Updates     │
│         │                    │                       │
│  ┌──────▼───────────────────┴─────────┐            │
│  │   Background Service Worker         │            │
│  │      (background.js)                │            │
│  │                                     │            │
│  │  • Tab Event Monitoring             │            │
│  │  • Quota Enforcement                │            │
│  │  • Badge Management                 │            │
│  │  • Notification System              │            │
│  └──────┬──────────────────────────────┘            │
│         │                                            │
│         │ chrome.tabs API                            │
│         │                                            │
│  ┌──────▼──────────────────────────────┐            │
│  │       Browser Tabs                  │            │
│  │  (All windows, including pinned)    │            │
│  └─────────────────────────────────────┘            │
└─────────────────────────────────────────────────────┘
```

## Component Description

### 1. Popup UI (popup.html + popup.js)

**Features:**
- Provides user interface
- Settings management (enable/disable, max tabs)
- Displays current status (tab count, remaining quota)
- Suggested close list
- Tab operations (switch, close)

**Key Functions:**
```javascript
loadSettings()          // Load saved settings
saveSettings()          // Save settings to chrome.storage
updateStatus()          // Update status display
getSuggestedTabs()      // Get suggested tabs to close
updateSuggestedList()   // Update suggested list UI
closeFirstThree()       // Close first three suggested tabs
```

**Data Flow:**
1. User changes settings → Save to chrome.storage
2. Notify background.js of settings change
3. Listen to tab events → Update UI (with debouncing)

### 2. Background Service Worker (background.js)

**Features:**
- Monitor all tab events
- Calculate total tab count (including pinned)
- Update badge display
- Enforce quota limits
- Send notifications

**Key Functions:**
```javascript
getSettings()      // Get settings
getTabCount()      // Count all tabs
updateBadge()      // Update badge text and color
enforceQuota()     // Enforce quota limits
```

**Event Listeners:**
- \`chrome.tabs.onCreated\` → When new tab is created
- \`chrome.tabs.onRemoved\` → When tab is closed
- \`chrome.tabs.onUpdated\` → When tab is updated
- \`chrome.storage.onChanged\` → When settings change
- \`chrome.runtime.onMessage\` → Receive messages

### 3. Storage Schema

```javascript
{
  enabled: boolean,      // Whether management is enabled
  maxTabs: number       // Maximum tab count (10-30)
}
```

Default values:
```javascript
{
  enabled: false,
  maxTabs: 20
}
```

## Core Logic

### Badge Color Logic

```javascript
if (enabled) {
  if (remaining <= 0)  → Red (#f44336)
  if (remaining <= 5)  → Orange (#FF9800)
  if (remaining > 5)   → Green (#4CAF50)
} else {
  → Gray (#9E9E9E)
}
```

### Quota Enforcement Flow

```
1. User opens new tab
2. chrome.tabs.onCreated event triggers
3. Update badge
4. Check if enabled && tab count >= max
5. If yes:
   a. Close new tab
   b. Show notification
6. If no:
   Allow opening
```

### Suggested Close List Sorting

```javascript
tabs
  .filter(tab => !tab.active)           // Exclude active tabs
  .sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? 1 : -1;         // Non-pinned first
    }
    return (a.lastAccessed || 0) - (b.lastAccessed || 0);  // Oldest first
  })
```

**Sorting Priority:**
1. Non-active tabs
2. Non-pinned tabs first
3. Earlier last accessed time first

## API Usage

### Chrome Extension APIs

**chrome.tabs**
```javascript
chrome.tabs.query({})              // Get all tabs
chrome.tabs.get(tabId)             // Get specific tab
chrome.tabs.remove(tabId)          // Close tab
chrome.tabs.update(tabId, props)   // Update tab
chrome.windows.update(windowId, props) // Update window
```

**chrome.storage**
```javascript
chrome.storage.sync.get(keys)      // Read settings
chrome.storage.sync.set(items)     // Save settings
```

**chrome.action**
```javascript
chrome.action.setBadgeText({text}) // Set badge text
chrome.action.setBadgeBackgroundColor({color}) // Set badge color
```

**chrome.notifications**
```javascript
chrome.notifications.create({...}) // Display notification
```

**chrome.runtime**
```javascript
chrome.runtime.sendMessage({...})  // Send message
chrome.runtime.onMessage.addListener(...) // Listen to messages
```

## Performance Optimization

### 1. Debouncing
- Popup UI updates use 100ms debounce
- Avoids frequent API calls

### 2. Event Handling
- Use async/await to avoid blocking
- Error handling ensures stability

### 3. Data Synchronization
- Use chrome.storage.sync for cross-device sync
- Minimize stored data size

## Security Considerations

### Minimal Permissions
- Only request necessary permissions: tabs, storage, notifications
- Do not request broad permissions like \`<all_urls>\`

### Data Protection
- Settings data stored in chrome.storage.sync
- No data sent to external servers
- No access to tab content

### Error Handling
- Try-catch wraps all API calls
- Gracefully handle missing tabs
- Console log errors without affecting operation

## Limitations & Known Issues

### Limitations
1. Cannot block system tabs (like chrome:// pages)
2. Cannot block certain special tabs (like extension pages)
3. Brief delay possible when rapidly opening multiple tabs

### Solutions
- 100ms delay ensures tab is fully created before checking
- Check tab existence before closing
- Clear error handling

## Future Improvements

1. **Whitelist Feature**: Allow specific domains to be unrestricted
2. **Scheduling**: Different quotas for different times of day
3. **Statistics**: Track tab usage patterns
4. **Export/Import Settings**: Easy backup
5. **Internationalization**: Multi-language support
6. **Dark Mode**: Auto-detect system theme
