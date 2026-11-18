# 🎄 SSG Holiday Wishlist Board

An interactive digital corkboard & festive wishlist wall built for the **Supreme Student Government (SSG)** Christmas Party / Secret Santa / Monito-Monita!

## ✨ Features

- **📌 Festive Digital Corkboard**: Each SSG member can pin their wishlist card with a holiday stamp, pushpin, and organic card tilt.
- **🎭 Name, Codename & Committee**: Includes Full Name, Monito-Monita Codename, and SSG Committee/Position filter—plus a 1-click **"Codename Mode"** toggle that hides real names on the board for blind Monito-Monita rounds!
- **🛍️ Multi-Item Wishlists with Store Links & Photos**:
  - Add up to 5 wishlist items per card with priority badges (`⭐ Top Wish`, `🎁 Would Love`, `✨ Surprise Option`) and budget/price tags.
  - Automatically detects and styles **Shopee**, **Lazada**, **TikTok Shop**, **SHEIN**, **Amazon**, or any reference link.
  - Supports pasting image links **or uploading photos/screenshots directly from a phone** (automatically compressed so they sync fast!).
- **👕 Do's & Don'ts, Allergies & Sizing**: Dedicated section for Favorite Colors, Shirt/Apparel Size, Likes/Do's, and highlighted **Allergies / Don'ts** warnings.
- **💌 Note to Secret Santa**: A personal holiday message at the bottom of each card.
- **🔒 Optional 4-Digit Edit PIN**: Members can set a personal PIN when posting so only they (or an officer with the Admin PIN in `config.js`) can edit or remove their card.
- **☁️ Zero-Setup Live Shared Backend**: Connect a free **Firebase Realtime Database** (60 seconds) or **Google Sheet** (90 seconds) so everyone sees live updates on their phones.

---

## 🚀 Quick Start

1. Open `index.html` in any browser to test and explore the board immediately (comes preloaded with 3 sample SSG cards you can edit or delete).
2. Customize your SSG name, committees list, or Admin PIN inside [`config.js`](./config.js).

---

## ☁️ Connecting the Free Shared Backend (So All Phones See Live Updates)

You have **two 100% free options** that require zero server coding:

### Option A: Firebase Realtime Database (Fastest — 60 seconds)
1. Go to [console.firebase.google.com](https://console.firebase.google.com/) and create a project.
2. Click **Build → Realtime Database → Create Database** and choose **Start in test mode**.
3. Copy your database URL (e.g., `https://ssg-xmas-default-rtdb.asia-southeast1.firebasedatabase.app`).
4. Paste it into `BACKEND_URL` inside [`config.js`](./config.js) **OR** click the **"Local Board (Click to Connect Live Cloud Sync)"** pill at the top of the webpage and paste it there.

### Option B: Google Sheets Backend (View all entries in a spreadsheet — 90 seconds)
1. Open a new Google Sheet ([sheets.new](https://sheets.new)) and click **Extensions → Apps Script**.
2. Copy the entire contents of [`google-sheets-backend.gs`](./google-sheets-backend.gs) and paste it into the Apps Script editor, then save (`Ctrl+S`).
3. Click **Deploy → New deployment**, choose **Web app**, set:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click **Deploy**, authorize access, and copy the **Web App URL**.
5. Paste the Web App URL into `BACKEND_URL` inside [`config.js`](./config.js) (or into the in-app Cloud Sync modal).

---

## 📱 Sharing with Your SSG on Phones

Once your `BACKEND_URL` is saved in [`config.js`](./config.js):
- **Netlify Drop (30 seconds)**: Drag and drop this entire `XMAS` folder onto [app.netlify.com/drop](https://app.netlify.com/drop) to get an instant public link to send to the SSG group chat.
- **GitHub Pages**: Push these files to a GitHub repository and enable GitHub Pages in Settings.
- **Magic Link**: Even if you don't edit `config.js`, connecting your backend URL inside the website and clicking **"🔗 Share Link"** generates a URL with `?sync=<your-db-url>` so anyone tapping the link automatically connects to the same database!
