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
  BACKEND_URL: "",

  // Admin Passcode (allows editing/deleting any card if someone forgets their PIN)
  ADMIN_PIN: "SSG2026",

  // Default Committees / Positions (members can also type a custom one)
  committees: [
    "Executive Board",
    "Secretariat",
    "Finance & Audit",
    "Public Information / PR",
    "Logistics & Events",
    "Student Welfare & Rights",
    "Batch / Grade Representatives",
    "Adviser / Committee Member"
  ]
};
