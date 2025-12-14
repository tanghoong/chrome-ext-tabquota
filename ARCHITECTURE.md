# 架構說明 (Architecture)

## 系統架構

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

## 組件說明

### 1. Popup UI (popup.html + popup.js)

**功能：**
- 提供使用者介面
- 設定管理（啟用/停用、最大分頁數）
- 顯示目前狀態（分頁數、剩餘名額）
- 建議關閉清單
- 分頁操作（切換、關閉）

**關鍵功能：**
```javascript
loadSettings()          // 載入儲存的設定
saveSettings()          // 儲存設定到 chrome.storage
updateStatus()          // 更新狀態顯示
getSuggestedTabs()      // 取得建議關閉的分頁
updateSuggestedList()   // 更新建議清單 UI
closeFirstThree()       // 關閉前三個建議分頁
```

**資料流：**
1. 使用者變更設定 → 儲存到 chrome.storage
2. 通知 background.js 設定已變更
3. 監聽 tab 事件 → 更新 UI（使用 debouncing）

### 2. Background Service Worker (background.js)

**功能：**
- 監聽所有分頁事件
- 計算分頁總數（包含 pinned）
- 更新 badge 顯示
- 執行配額限制
- 發送通知

**關鍵功能：**
```javascript
getSettings()      // 取得設定
getTabCount()      // 計算所有分頁數
updateBadge()      // 更新 badge 文字和顏色
enforceQuota()     // 執行配額限制
```

**事件監聽：**
- `chrome.tabs.onCreated` → 新分頁建立時
- `chrome.tabs.onRemoved` → 分頁關閉時
- `chrome.tabs.onUpdated` → 分頁更新時
- `chrome.storage.onChanged` → 設定變更時
- `chrome.runtime.onMessage` → 接收訊息

### 3. Storage Schema

```javascript
{
  enabled: boolean,      // 是否啟用管理
  maxTabs: number       // 最大分頁數 (10-30)
}
```

預設值：
```javascript
{
  enabled: false,
  maxTabs: 20
}
```

## 核心邏輯

### Badge 顏色邏輯

```javascript
if (enabled) {
  if (remaining <= 0)  → Red (#f44336)
  if (remaining <= 5)  → Orange (#FF9800)
  if (remaining > 5)   → Green (#4CAF50)
} else {
  → Gray (#9E9E9E)
}
```

### 配額執行流程

```
1. 使用者開啟新分頁
2. chrome.tabs.onCreated 事件觸發
3. 更新 badge
4. 檢查是否啟用管理 && 分頁數 >= 最大值
5. 如果是：
   a. 關閉新分頁
   b. 顯示通知
6. 如果否：
   允許開啟
```

### 建議關閉清單排序

```javascript
tabs
  .filter(tab => !tab.active)           // 排除活動分頁
  .sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? 1 : -1;         // 優先非 pinned
    }
    return (a.lastAccessed || 0) - (b.lastAccessed || 0);  // 舊的在前
  })
```

**排序優先級：**
1. 非活動分頁
2. 非固定分頁優先
3. 最後存取時間較早的優先

## API 使用

### Chrome Extension APIs

**chrome.tabs**
```javascript
chrome.tabs.query({})              // 取得所有分頁
chrome.tabs.get(tabId)             // 取得特定分頁
chrome.tabs.remove(tabId)          // 關閉分頁
chrome.tabs.update(tabId, props)   // 更新分頁
chrome.windows.update(windowId, props) // 更新視窗
```

**chrome.storage**
```javascript
chrome.storage.sync.get(keys)      // 讀取設定
chrome.storage.sync.set(items)     // 儲存設定
```

**chrome.action**
```javascript
chrome.action.setBadgeText({text}) // 設定 badge 文字
chrome.action.setBadgeBackgroundColor({color}) // 設定 badge 顏色
```

**chrome.notifications**
```javascript
chrome.notifications.create({...}) // 顯示通知
```

**chrome.runtime**
```javascript
chrome.runtime.sendMessage({...})  // 發送訊息
chrome.runtime.onMessage.addListener(...) // 監聽訊息
```

## 效能優化

### 1. Debouncing
- Popup UI 更新使用 100ms debounce
- 避免頻繁的 API 呼叫

### 2. 事件處理
- 使用 async/await 避免阻塞
- 錯誤處理確保穩定性

### 3. 資料同步
- 使用 chrome.storage.sync 跨裝置同步
- 最小化儲存資料量

## 安全性考量

### 權限最小化
- 僅請求必要權限：tabs, storage, notifications
- 不請求 `<all_urls>` 等廣泛權限

### 資料保護
- 設定資料儲存在 chrome.storage.sync
- 不傳送資料到外部伺服器
- 不存取分頁內容

### 錯誤處理
- Try-catch 包裹所有 API 呼叫
- 優雅處理分頁不存在的情況
- Console log 記錄錯誤但不影響運作

## 限制與已知問題

### 限制
1. 無法阻止系統分頁（如 chrome:// 頁面）
2. 無法阻止某些特殊分頁（如擴充功能頁面）
3. 短時間內快速開啟多個分頁可能有延遲

### 解決方案
- 100ms 延遲確保分頁完全建立後再檢查
- 檢查分頁存在性再執行關閉
- 清楚的錯誤處理

## 未來改進方向

1. **白名單功能**：允許特定網域不受限制
2. **排程功能**：不同時段設定不同配額
3. **統計功能**：記錄分頁使用情況
4. **匯出/匯入設定**：方便備份
5. **國際化**：支援多語言
6. **深色模式**：自動偵測系統主題
