export const zhTW = {
  // Navbar
  navbar: {
    title: "QR Check-In",
    logout: "登出"
  },

  // Home Page
  home: {
    title: "QR Check-In 系統",
    subtitle: "使用QR碼簡化您的活動報到流程",
    features: {
      manage: {
        title: "管理試算表",
        description: "連接您的Google試算表，自動同步報名資料並即時追蹤報到狀況。"
      },
      email: {
        title: "郵寄QR碼", 
        description: "自動發送個人化QR碼給已報名的參與者，讓報到過程更順暢。"
      },
      scan: {
        title: "快速掃描",
        description: "使用您裝置的相機掃描QR碼，即時為參與者完成報到並提供音效回饋。"
      },
      analytics: {
        title: "即時分析",
        description: "監控報到統計數據、追蹤出席率，獲得活動成功的深入洞察。"
      }
    },
    cta: {
      title: "開始使用",
      description: "準備好簡化您的活動報到流程了嗎？",
      manageButton: "管理活動",
      checkinButton: "簽到頁面"
    },
    footer: {
      privacy: "隱私政策",
      support: "聯絡客服"
    }
  },

  // Login Page
  login: {
    title: "歡迎使用 QR Check-In",
    subtitle: "請登入以繼續",
    googleButton: "使用Google登入"
  },

  // Manage Page
  manage: {
    title: "管理活動",
    subtitle: "設定和管理您的活動報到系統",
    steps: {
      selectSpreadsheet: {
        title: "📋 步驟一：選擇試算表",
        description: "從Google試算表中選擇您的活動報名表",
        selectLabel: "從您的試算表中選擇：",
        placeholder: "-- 選擇一個試算表 --",
        urlLabel: "輸入Google試算表網址：",
        urlPlaceholder: "https://docs.google.com/spreadsheets/d/...",
        urlHint: "💡 貼上您的Google試算表完整網址",
        urlDropdownOption: "-----輸入Google試算表網址-----"
      },
      configureEvent: {
        title: "⚙️ 步驟二：設定活動",
        description: "將您的試算表欄位對應到必要的欄位",
        selectSheetLabel: "選擇包含報名資料的工作表：",
        columnMapping: "欄位對應：",
        nameColumn: "姓名欄位：",
        emailColumn: "電子郵件欄位：",
        setupTitle: "🛠️ 設定報到系統",
        setupDescription: "如果尚未存在，則為您的報到系統建立必要的工作表。",
        createButton: "📋 建立報到工作表",
        creatingButton: "建立工作表中...",
        readyButton: "✅ 報到工作表已就緒",
        setupHint: "💡 這將在您的試算表中建立「Check-In List」和「Email Template」工作表（請勿更改工作表名稱和欄位）",
        sheetPlaceholder: "-- 選擇一個工作表 --",
        emailColumnPlaceholder: "-- 選擇電子郵件欄位 --",
        nameColumnPlaceholder: "-- 選擇姓名欄位 --",
        columnHint: "💡 這些欄位將用於識別參與者並發送QR碼"
      },
      syncData: {
        title: "🔄 步驟三：同步參與者資料",
        description: "使用最新的報名資料更新您的報到清單",
        syncButton: "📊 同步參與者資料",
        syncingButton: "同步資料中...",
        syncSuccess: "✅ 已新增 {count} 位新參與者到報到清單",
        syncHint: "💡 這將新增新報名者到您的報到系統，不會影響現有資料"
      },
      sendQR: {
        title: "📧 步驟四：發送QR碼",
        description: "發送個人化QR碼給您的參與者",
        emailTemplate: "電子郵件範本編輯器：",
        showEditor: "📝 編輯電子郵件範本",
        hideEditor: "❌ 隱藏電子郵件範本",
        loadingTemplate: "載入範本中...",
        emailSubject: "電子郵件主旨：",
        emailMessage: "電子郵件內容：",
        messagePlaceholder: "輸入電子郵件內容... 使用 {{Name}} 代表參與者姓名，{{QRcode}} 代表QR碼。",
        emailSubjectPlaceholder: "輸入電子郵件主旨...",
        editorHint: "💡 自訂您QR碼電子郵件的主旨和內容。使用 {{Name}} 和 {{QRcode}} 作為預留位置。",
        testEmail: "🧪 測試您的範本",
        testEmailLabel: "測試電子郵件地址：",
        testEmailPlaceholder: "輸入電子郵件地址來發送測試...",
        sendTestButton: "🧪 發送測試電子郵件",
        sendingTestButton: "發送測試中...",
        testHint: "💡 這將使用「測試使用者」作為姓名預留位置發送測試電子郵件。",
        saveButton: "💾 儲存範本",
        savingButton: "儲存中...",
        sendNewButton: "📤 發送給新參與者 ({count})",
        sendAllButton: "📬 重新發送給所有參與者",
        sendingButton: "發送電子郵件中...",
        calculatingButton: "📊 計算中...",
        allNotifiedButton: "✅ 已通知所有參與者",
        qrHint: "💡 QR碼對每位參與者都是獨特的，包含他們的報名資訊"
      },
      startCheckin: {
        title: "🎯 步驟五：開始簽到",
        description: "前往簽到頁面開始掃描QR碼",
        startButton: "🚀 前往簽到頁面",
        startHint: "💡 在活動入口處使用平板或手機進行簡便掃描"
      }
    },
    loading: "載入您的試算表中...",
    backButton: "← 返回首頁"
  },

  // Check-in Page
  checkin: {
    title: "🎯 簽到頁面",
    eventLoading: "載入活動中...",
    scanTitle: "📱 掃描QR碼",
    scanHint: "💡 將相機對準QR碼為參與者完成報到",
    stats: {
      totalRegistered: "總報名人數",
      checkedIn: "已報到", 
      remaining: "未報到"
    },
    attendance: "出席率",
    backButton: "← 返回活動選擇",
    messages: {
      notInList: "{email} 不在報到清單中！",
      alreadyCheckedIn: "{name} 之前已經報到過了！",
      checkInSuccess: "{name} 報到成功！"
    }
  },

  // Select Event Page
  selectEvent: {
    title: "選擇簽到活動",
    subtitle: "選擇一個已啟動報到系統的試算表",
    selectSpreadsheet: "📋 選擇試算表",
    selectDescription: "從Google試算表中選擇您的活動試算表或輸入網址",
    selectLabel: "從您的試算表中選擇：",
    placeholder: "-- 選擇一個試算表 --",
    urlLabel: "輸入Google試算表網址：",
    urlPlaceholder: "https://docs.google.com/spreadsheets/d/...",
    urlHint: "💡 貼上您的Google試算表完整網址",
    urlDropdownOption: "-----輸入Google試算表網址-----",
    loading: "載入您的試算表中...",
    validating: "驗證試算表存取權限中...",
    validated: "已驗證：{date}",
    startButton: "🎯 開始簽到頁面",
    noCheckInSheet: "此試算表沒有「報到清單」工作表。請先在管理活動頁面中設定。",
    manageButton: "📊 前往管理活動",
    backButton: "← 返回首頁",
    refreshButton: "🔄 重新整理清單"
  },

  // Privacy Page
  privacy: {
    title: "隱私政策",
    lastUpdated: "最後更新：2024年6月5日",
    backButton: "← 返回首頁"
  },

  // Common
  common: {
    loading: "載入中...",
    error: "錯誤",
    retry: "重試",
    save: "儲存",
    cancel: "取消",
    ok: "確定"
  }
}; 