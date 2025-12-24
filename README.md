# Tab Quota - Chrome Extension

A Chrome extension for managing tab quotas, built with Manifest V3.

## Features

- ✅ Enable/disable tab management
- ✅ Set maximum tab count (10-30)
- ✅ Real-time remaining quota display (badge indicator)
- ✅ Auto-close tabs exceeding quota
- ✅ Suggested close list (excludes active tabs, prioritizes non-pinned tabs, sorted by last accessed time)
- ✅ Switch to specific tab
- ✅ Close first 3 suggested tabs with one click
- ✅ Theme support (Light, Dark, Auto - follows system preference)
- ✅ Tab favicons display in suggested list

## Installation

1. Download or clone this project
2. Open Chrome browser and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the project folder
6. Done! The extension icon will appear in the toolbar

## Usage

1. Click the extension icon in the toolbar
2. Use the toggle switch to enable tab management
3. Select the maximum tab limit
4. Use the theme buttons in the header to switch between Light (☀️), Dark (🌙), or Auto (🔄) mode
5. The system will automatically monitor and manage tab count
6. When the tab limit is reached, new tabs will be automatically closed with a notification
7. View the suggested close list to switch to or close specific tabs
8. Use "Close First 3 Tabs" to quickly free up quota

## Technical Specifications

- Chrome Extension Manifest V3
- Uses chrome.storage.sync for settings storage
- Uses chrome.tabs API for tab monitoring
- Uses chrome.notifications API for notifications
- Uses chrome.action.setBadgeText to display remaining quota

## File Structure

```
chrome-ext-tabquota/
├── manifest.json       # Extension configuration
├── popup.html         # Popup UI
├── popup.js           # Popup logic
├── background.js      # Background service worker
├── icons/             # Icon files
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## License

MIT