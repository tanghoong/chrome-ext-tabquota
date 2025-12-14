# Tab Quota - Chrome Extension

一個用於管理分頁配額的 Chrome 擴充功能，使用 Manifest V3 開發。

## 功能特色

- ✅ 啟用/停用分頁管理
- ✅ 設定最大分頁數 (10-30)
- ✅ 即時顯示剩餘配額 (badge 標記)
- ✅ 自動關閉超過配額的新分頁
- ✅ 建議關閉清單（排除活動分頁，優先關閉非固定分頁，按最後存取時間排序）
- ✅ 切換到指定分頁
- ✅ 一鍵關閉前 3 個建議分頁

## 安裝方式

1. 下載或 clone 此專案
2. 開啟 Chrome 瀏覽器，輸入 `chrome://extensions/`
3. 開啟右上角的「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇此專案的資料夾
6. 完成！擴充功能圖示會出現在工具列

## 使用方式

1. 點擊工具列上的擴充功能圖示
2. 使用切換開關啟用分頁管理
3. 選擇最大分頁數限制
4. 系統會自動監控並管理分頁數量
5. 當分頁數達到上限時，新開分頁會被自動關閉並顯示通知
6. 查看建議關閉清單，可以切換或關閉指定分頁
7. 使用「一鍵關閉前 3 個」快速釋放配額

## 技術規格

- Chrome Extension Manifest V3
- 使用 chrome.storage.sync 儲存設定
- 使用 chrome.tabs API 監控分頁
- 使用 chrome.notifications API 顯示通知
- 使用 chrome.action.setBadgeText 顯示剩餘配額

## 檔案結構

```
chrome-ext-tabquota/
├── manifest.json       # 擴充功能設定檔
├── popup.html         # 彈出視窗 UI
├── popup.js           # 彈出視窗邏輯
├── background.js      # 背景服務工作者
├── icons/             # 圖示檔案
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## License

MIT