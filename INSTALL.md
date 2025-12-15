# Installation Guide

## Method 1: Install from Source (Development Mode)

1. **Download the project**
   ```bash
   git clone https://github.com/tanghoong/chrome-ext-tabquota.git
   cd chrome-ext-tabquota
   ```

2. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions/` in Chrome browser
   - Or click "Settings" > "More Tools" > "Extensions"

3. **Enable Developer mode**
   - Toggle "Developer mode" switch in the top right corner

4. **Load the extension**
   - Click "Load unpacked" button
   - Select the `chrome-ext-tabquota` folder
   - Confirm successful loading

5. **Verify installation**
   - Extension icon should appear in the browser toolbar
   - Icon displays as a blue circle with # symbol in the center

## Initial Setup

1. **Click the extension icon** to open the popup

2. **Set maximum tab count**
   - Select from dropdown: 10, 15, 20, 25, or 30
   - Default value: 20

3. **Enable management**
   - Toggle "Enable Management" switch to ON
   - Once enabled, the system will automatically monitor and manage tab count

## File List

Ensure the following files exist:

```
chrome-ext-tabquota/
├── manifest.json          # Extension configuration
├── popup.html            # Popup interface
├── popup.js              # Popup logic
├── background.js         # Background service worker
├── icons/                # Icon folder
│   ├── icon16.png       # 16x16 icon
│   ├── icon32.png       # 32x32 icon
│   ├── icon48.png       # 48x48 icon
│   └── icon128.png      # 128x128 icon
├── README.md            # Project documentation
├── TESTING.md           # Testing guide
└── INSTALL.md           # This installation guide
```

## Troubleshooting

### Cannot Load Extension

**Error: "Manifest file is missing or unreadable"**
- Confirm you selected the correct folder (containing manifest.json)
- Verify all files are downloaded correctly

**Error: "Permission denied"**
- Check file permissions are set correctly
- Try copying the project to a different location

### Extension Icon Not Showing

1. Check if icon files exist in the `icons/` folder
2. Reload the extension:
   - Go to `chrome://extensions/`
   - Click the "Reload" button under the extension

### Badge Number Not Showing

1. Confirm management is enabled
2. Try opening/closing a few tabs
3. Check browser console for error messages

### Cannot Close Tabs

**Possible causes:**
- Tab is pinned and currently active
- Browser permission settings issue

**Solutions:**
1. Check extension permissions: `chrome://extensions/` → Click "Details"
2. Verify "tabs" permission is enabled
3. Reload the extension

## Updating the Extension

When a new version is available:

1. Pull the latest code
   ```bash
   cd chrome-ext-tabquota
   git pull origin main
   ```

2. Reload the extension
   - Go to `chrome://extensions/`
   - Find Tab Quota extension
   - Click the "Reload" button (circular arrow icon)

## Uninstallation

1. Go to `chrome://extensions/`
2. Find Tab Quota extension
3. Click "Remove" button
4. Confirm uninstallation

## Technical Requirements

- Chrome browser version: 88 or newer (Manifest V3 support)
- Operating System: Windows, macOS, or Linux
- Required permissions:
  - `tabs`: Read and manage tabs
  - `storage`: Store settings
  - `notifications`: Display notifications

## Support

If you encounter any issues, please:
1. Check the [Testing Guide](TESTING.md)
2. Review browser console error messages
3. Submit an issue on GitHub
