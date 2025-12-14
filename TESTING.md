# Manual Testing Guide

## Installation Testing

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the project folder
6. Confirm the extension icon appears in the toolbar

## Feature Testing Checklist

### 1. Basic Settings Test

- [ ] Click extension icon, popup displays correctly
- [ ] Toggle "Enable Management" switch, settings should save
- [ ] Change "Max Tabs" dropdown (10-30), settings should save
- [ ] Close and reopen popup, settings should persist

### 2. Badge Display Test

- [ ] Badge displays remaining quota number
- [ ] Remaining quota > 5: Green
- [ ] Remaining quota 1-5: Orange
- [ ] Remaining quota = 0: Red
- [ ] When disabled: Gray
- [ ] Badge updates in real-time when opening/closing tabs

### 3. Quota Limit Test

- [ ] Set max tabs to 10
- [ ] Enable management
- [ ] Open tabs until reaching 10
- [ ] Try to open the 11th tab
- [ ] New tab should be immediately closed
- [ ] Notification message should appear

### 4. Suggested Close List Test

- [ ] Open multiple tabs (including pinned tabs)
- [ ] Open popup
- [ ] Suggested list does not include currently active tab
- [ ] Suggested list prioritizes non-pinned tabs
- [ ] Suggested list sorted by last accessed time (oldest first)
- [ ] Click "Switch" button, should switch to that tab
- [ ] Click "Close" button, should close that tab

### 5. Bulk Close Test

- [ ] Suggested list has 3 or more tabs
- [ ] Click "Close First 3 Tabs" button
- [ ] Should close the first 3 tabs in the list
- [ ] Remaining quota number updates
- [ ] Suggested list updates

### 6. Status Display Test

- [ ] "Current Tabs" displays correctly
- [ ] "Remaining Quota" calculates correctly
- [ ] Updates in real-time when tabs change

## Expected Behavior

### When Management is Enabled:
- Opening new tabs beyond quota will immediately close them
- Notification appears to inform user
- Badge displays remaining quota

### When Management is Disabled:
- Tabs can be opened freely
- Badge still displays remaining quota but in gray
- No automatic tab closure

### Suggested Close List Rules:
1. Excludes currently active tabs
2. Prioritizes non-pinned tabs
3. Sorted by last accessed time (oldest first)

## Test Scenarios

### Scenario 1: Normal Usage Flow
1. Install extension
2. Set max tabs to 15
3. Enable management
4. Open 10 tabs → Badge shows 5
5. Open 5 more tabs → Badge shows 0
6. Try to open new tab → Closes with notification

### Scenario 2: Clean Up Old Tabs
1. Open 20 tabs
2. Browse a few tabs randomly
3. Open popup
4. Check suggested close list
5. Click "Close First 3 Tabs"
6. Confirm least recently used tabs were closed

### Scenario 3: Disable and Re-enable
1. Enable management and set quota
2. Disable management
3. Open tabs beyond quota → Not closed
4. Re-enable management
5. Badge shows negative or 0
6. Try to open new tab → Closes

## Issue Reporting

If you find any issues, please record:
- Browser version
- Extension version
- Steps to reproduce
- Expected behavior vs actual behavior
- Screenshots or error messages
