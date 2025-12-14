# 安裝指南 (Installation Guide)

## 方式一：從源碼安裝 (Development Mode)

1. **下載專案**
   ```bash
   git clone https://github.com/tanghoong/chrome-ext-tabquota.git
   cd chrome-ext-tabquota
   ```

2. **開啟 Chrome 擴充功能頁面**
   - 在 Chrome 瀏覽器中輸入：`chrome://extensions/`
   - 或點擊「設定」> 「更多工具」> 「擴充功能」

3. **啟用開發人員模式**
   - 在擴充功能頁面右上角，開啟「開發人員模式」開關

4. **載入擴充功能**
   - 點擊「載入未封裝項目」按鈕
   - 選擇 `chrome-ext-tabquota` 資料夾
   - 確認載入成功

5. **確認安裝**
   - 擴充功能圖示應出現在瀏覽器工具列
   - 圖示顯示為藍色圓形，中間有 # 符號

## 使用前設定

1. **點擊擴充功能圖示** 開啟彈出視窗

2. **設定最大分頁數**
   - 從下拉選單選擇 10、15、20、25 或 30
   - 預設值：20

3. **啟用管理功能**
   - 切換「啟用管理」開關至開啟狀態
   - 啟用後，系統會自動監控並管理分頁數量

## 檔案清單

確保以下檔案都存在：

```
chrome-ext-tabquota/
├── manifest.json          # 擴充功能設定檔
├── popup.html            # 彈出視窗介面
├── popup.js              # 彈出視窗邏輯
├── background.js         # 背景服務工作者
├── icons/                # 圖示資料夾
│   ├── icon16.png       # 16x16 圖示
│   ├── icon32.png       # 32x32 圖示
│   ├── icon48.png       # 48x48 圖示
│   └── icon128.png      # 128x128 圖示
├── README.md            # 專案說明
├── TESTING.md           # 測試指南
└── INSTALL.md           # 本安裝指南
```

## 疑難排解

### 無法載入擴充功能

**錯誤訊息：「資訊清單檔案遺失或無法讀取」**
- 確認選擇了正確的資料夾（包含 manifest.json 的資料夾）
- 確認所有檔案都已正確下載

**錯誤訊息：「權限被拒絕」**
- 確認檔案權限設定正確
- 嘗試複製專案到其他位置

### 擴充功能圖示未顯示

1. 檢查圖示檔案是否存在於 `icons/` 資料夾
2. 重新載入擴充功能：
   - 前往 `chrome://extensions/`
   - 點擊擴充功能下的「重新載入」按鈕

### Badge 數字未顯示

1. 確認已啟用管理功能
2. 嘗試開啟/關閉幾個分頁
3. 檢查瀏覽器控制台是否有錯誤訊息

### 無法關閉分頁

**可能原因：**
- 該分頁為固定分頁且為目前活動分頁
- 瀏覽器權限設定問題

**解決方式：**
1. 檢查擴充功能權限：`chrome://extensions/` → 點擊「詳細資料」
2. 確認「tabs」權限已啟用
3. 重新載入擴充功能

## 更新擴充功能

當有新版本時：

1. 拉取最新程式碼
   ```bash
   cd chrome-ext-tabquota
   git pull origin main
   ```

2. 重新載入擴充功能
   - 前往 `chrome://extensions/`
   - 找到 Tab Quota 擴充功能
   - 點擊「重新載入」按鈕（圓形箭頭圖示）

## 解除安裝

1. 前往 `chrome://extensions/`
2. 找到 Tab Quota 擴充功能
3. 點擊「移除」按鈕
4. 確認解除安裝

## 技術需求

- Chrome 瀏覽器版本：88 或更新版本（支援 Manifest V3）
- 作業系統：Windows、macOS 或 Linux
- 權限需求：
  - `tabs`：讀取和管理分頁
  - `storage`：儲存設定
  - `notifications`：顯示通知

## 支援

如遇到問題，請：
1. 查看 [測試指南](TESTING.md)
2. 檢查瀏覽器控制台錯誤訊息
3. 在 GitHub 上提交 Issue
