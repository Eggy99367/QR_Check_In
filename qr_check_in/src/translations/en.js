export const en = {
  // Navbar
  navbar: {
    title: "QR Check-In",
    logout: "Logout"
  },

  // Home Page
  home: {
    title: "QR Check-In System",
    subtitle: "Streamline your event check-ins with QR codes",
    features: {
      manage: {
        title: "Manage Spreadsheets",
        description: "Connect your Google Sheets to automatically sync registration data and track check-ins in real-time."
      },
      email: {
        title: "Email QR Codes", 
        description: "Automatically send personalized QR codes to registered attendees via email for seamless check-in."
      },
      scan: {
        title: "Quick Scanning",
        description: "Use your device's camera to scan QR codes and instantly check in attendees with audio feedback."
      },
      analytics: {
        title: "Real-time Analytics",
        description: "Monitor check-in statistics, track attendance, and get insights into your event's success."
      }
    },
    cta: {
      title: "Get Started",
      description: "Ready to streamline your event check-ins?",
      manageButton: "Manage Events",
      checkinButton: "Check-In Station"
    },
    footer: {
      privacy: "Privacy Policy",
      support: "Contact Support"
    }
  },

  // Login Page
  login: {
    title: "Welcome to QR Check-In",
    subtitle: "Sign in to continue",
    googleButton: "Sign in with Google"
  },

  // Manage Page
  manage: {
    title: "Manage Events",
    subtitle: "Set up and manage your event check-in system",
    steps: {
      selectSpreadsheet: {
        title: "📋 Step 1: Select Spreadsheet",
        description: "Choose your event registration spreadsheet from Google Sheets",
        selectLabel: "Select from your spreadsheets:",
        placeholder: "-- Select a spreadsheet --",
        urlLabel: "Enter Google Sheets URL:",
        urlPlaceholder: "https://docs.google.com/spreadsheets/d/...",
        urlHint: "💡 Paste the full URL of your Google Spreadsheet",
        urlDropdownOption: "-----Enter a Google Spreadsheet URL-----"
      },
      configureEvent: {
        title: "⚙️ Step 2: Configure Event",
        description: "Map your spreadsheet columns to the required fields",
        selectSheetLabel: "Select the sheet with registration data:",
        columnMapping: "Column Mapping:",
        nameColumn: "Name Column:",
        emailColumn: "Email Column:",
        setupTitle: "🛠️ Setup Check-In System",
        setupDescription: "Create the necessary sheets for your check-in system if they don't already exist.",
        createButton: "📋 Create Check-In Sheets",
        creatingButton: "Creating Sheets...",
        readyButton: "✅ Check-In Sheets Ready",
        setupHint: "💡 This creates a \"Check-In List\" sheet and \"Email Template\" sheet in your spreadsheet (Do not modify sheet names or columns)",
        sheetPlaceholder: "-- Select a sheet --",
        emailColumnPlaceholder: "-- Select email column --",
        nameColumnPlaceholder: "-- Select name column --",
        columnHint: "💡 These columns will be used to identify attendees and send QR codes"
      },
      syncData: {
        title: "🔄 Step 3: Sync Attendee Data",
        description: "Update your check-in list with the latest registration data",
        syncButton: "📊 Sync Attendee Data",
        syncingButton: "Syncing Data...",
        syncSuccess: "✅ Added {count} new attendees to check-in list",
        syncHint: "💡 This will add new registrations to your check-in system without affecting existing data"
      },
      sendQR: {
        title: "📧 Step 4: Send QR Codes",
        description: "Send personalized QR codes to your attendees",
        emailTemplate: "Email Template Editor:",
        showEditor: "📝 Edit Email Template",
        hideEditor: "❌ Hide Email Template",
        loadingTemplate: "Loading template...",
        emailSubject: "Email Subject:",
        emailMessage: "Email Message:",
        messagePlaceholder: "Enter email message... Use {{Name}} for attendee name and {{QRcode}} for QR code.",
        emailSubjectPlaceholder: "Enter email subject...",
        editorHint: "💡 Customize the subject and message for your QR code emails. Use {{Name}} and {{QRcode}} as placeholders.",
        testEmail: "🧪 Test Your Template",
        testEmailLabel: "Test Email Address:",
        testEmailPlaceholder: "Enter email address to send test...",
        sendTestButton: "🧪 Send Test Email",
        sendingTestButton: "Sending Test...",
        testHint: "💡 This will send a test email using \"Test User\" as the name placeholder.",
        saveButton: "💾 Save Template",
        savingButton: "Saving...",
        sendNewButton: "📤 Send to New Attendees ({count})",
        sendAllButton: "📬 Resend to All Attendees",
        sendingButton: "Sending Emails...",
        calculatingButton: "📊 Calculating Count...",
        allNotifiedButton: "✅ All Attendees Notified",
        qrHint: "💡 QR codes are unique to each attendee and contain their registration information"
      },
      startCheckin: {
        title: "🎯 Step 5: Start Check-In",
        description: "Navigate to the check-in station to begin scanning QR codes",
        startButton: "🚀 Go to Check-In Station",
        startHint: "💡 Use this on a tablet or phone at your event entrance for easy scanning"
      }
    },
    loading: "Loading your spreadsheets...",
    backButton: "← Back to Home"
  },

  // Check-in Page
  checkin: {
    title: "🎯 Check-In Station",
    eventLoading: "Loading event...",
    scanTitle: "📱 Scan QR Code",
    scanHint: "💡 Point the camera at a QR code to check in attendees",
    stats: {
      totalRegistered: "Total Registered",
      checkedIn: "Checked In", 
      remaining: "Remaining"
    },
    attendance: "Attendance",
    backButton: "← Back to Event Selection",
    messages: {
      notInList: "{email} is not in the check-in list!",
      alreadyCheckedIn: "{name} checked-in before!",
      checkInSuccess: "{name} check-in successful!"
    }
  },

  // Select Event Page
  selectEvent: {
    title: "Select Event for Check-In",
    subtitle: "Choose a spreadsheet with an active check-in system",
    selectSpreadsheet: "📋 Select Spreadsheet",
    selectDescription: "Choose your event spreadsheet from Google Sheets or enter a URL",
    selectLabel: "Select from your spreadsheets:",
    placeholder: "-- Select a spreadsheet --",
    urlLabel: "Enter Google Sheets URL:",
    urlPlaceholder: "https://docs.google.com/spreadsheets/d/...",
    urlHint: "💡 Paste the full URL of your Google Spreadsheet",
    urlDropdownOption: "-----Enter a Google Spreadsheet URL-----",
    loading: "Loading your spreadsheets...",
    validating: "Validating spreadsheet access...",
    validated: "Validated: {date}",
    startButton: "🎯 Start Check-In Station",
    noCheckInSheet: "This spreadsheet doesn't have a \"Check-In List\" sheet. Please set it up in the Manage Events page first.",
    manageButton: "📊 Go to Manage Events",
    backButton: "← Back to Home",
    refreshButton: "🔄 Refresh List"
  },

  // Privacy Page
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: June 5, 2024",
    backButton: "← Back to Home"
  },

  // Common
  common: {
    loading: "Loading...",
    error: "Error",
    retry: "Retry",
    save: "Save",
    cancel: "Cancel",
    ok: "OK"
  }
}; 