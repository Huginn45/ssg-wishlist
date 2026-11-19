// ============================================================================
// SSG CHRISTMAS WISHLIST BOARD - CONFIGURATION
// ============================================================================
// Once you create your free Firebase Realtime Database or Google Apps Script URL,
// paste it in `BACKEND_URL` below so every SSG member who opens the website on
// their phone is automatically connected to the same live board!

window.SSG_CONFIG = {
  // Organization & Event Details
  orgName: "Supreme Student Government",
  eventTitle: "SSG Holiday Wishlist Board",
  eventSubtitle: "Pin your wishes, share your links, and help your Secret Santa / Monito-Monita find the perfect gift!",
  budgetNote: "Check item links, sizes, and Do's & Don'ts before checking out!",

  // Shared Backend Setup:
  // Option A (Fastest - Real-time): Paste a free Firebase Realtime Database URL
  //   e.g. "https://ssg-wishlist-default-rtdb.asia-southeast1.firebasedatabase.app"
  // Option B (Google Sheets): Paste a deployed Google Apps Script Web App URL
  //   e.g. "https://script.google.com/macros/s/AKfycb.../exec"
  // Leave empty ("") to configure via the in-app "Cloud Sync" button or use local storage.
  BACKEND_URL: "https://script.google.com/macros/s/AKfycbxGE87pdCr1tsbRFrtGhm29H8tLW2NLH4F3Oc09unJ6M63ElgSC1SdPB77ntHuOj92q/exec",

  // Admin Passcode (allows editing/deleting any card if someone forgets their PIN)
  ADMIN_PIN: "SSG2026",

  // SSG Committees / Positions (Grouped cleanly for dropdowns)
  committees: {
    "Executive Officers": [
      "President",
      "Vice President"
    ],
    "Senators": [
      "Senator - COED",
      "Senator - CAS",
      "Senator - COTE",
      "Senator - CHMT",
      "Senator - CAFE"
    ],
    "House Representatives": [
      "BSED-Math House Representative",
      "BSED-English House Representative",
      "BEED House Representative",
      "BTLED House Representative",
      "BSA House Representative",
      "BSF House Representative",
      "BSES House Representative",
      "BSP House Representative",
      "BAEL House Representative",
      "BALit House Representative",
      "BSIE House Representative",
      "BSIT House Representative",
      "BIT-Automotive House Representative",
      "BIT-Comptech House Representative",
      "BIT-Electronics House Representative",
      "BIT-Garments House Representative",
      "BIT-Drafting House Representative",
      "BSHM House Representative",
      "BSTM House Representative"
    ],
    "Secretariat & Finance": [
      "Executive Secretary",
      "Deputy Executive Secretary",
      "Press Secretary",
      "Deputy Press Secretary",
      "Executive Secretary on Finance",
      "Deputy Secretary on Finance",
      "Secretary on Audit"
    ],
    "Media & Creative": [
      "Multi Media Director",
      "Graphics Officer",
      "Documentation Officer",
      "Creative Media Officer",
      "Design Officer"
    ],
    "Committees": [
      "Technical Committee",
      "Events and Planning Committee",
      "Logistics Committee",
      "Linkages Committee"
    ]
  }
};
