/**
 * ============================================================================
 * SSG WISHLIST BOARD - GOOGLE SHEETS BACKEND (Google Apps Script)
 * ============================================================================
 * HOW TO USE (Takes 90 seconds):
 * 1. Create a new Google Sheet (https://sheets.new)
 * 2. Click Extensions > Apps Script
 * 3. Delete any existing code and paste this entire file, then press Ctrl+S (Save)
 * 4. Click "Deploy" (top right) > "New deployment"
 * 5. Select type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 6. Click "Deploy", authorize access, and copy the Web App URL!
 * 7. Paste the Web App URL into `config.js` (BACKEND_URL) or into the
 *    "Cloud Sync" modal on the Wishlist Board website.
 */

const SHEET_NAME = "Wishlists";

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["ID", "Name", "Codename", "Committee", "UpdatedAt", "JSON_Data"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  const sheet = getOrCreateSheet();
  const rows = sheet.getDataRange().getValues();
  const cards = [];

  for (let i = 1; i < rows.length; i++) {
    const jsonStr = rows[i][5];
    if (jsonStr) {
      try {
        cards.push(JSON.parse(jsonStr));
      } catch (err) {
        // Ignore malformed row
      }
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", cards: cards }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action || "upsert";
    const sheet = getOrCreateSheet();
    const rows = sheet.getDataRange().getValues();

    if (action === "upsert" && payload.card) {
      const card = payload.card;
      let foundRow = -1;
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(card.id)) {
          foundRow = i + 1;
          break;
        }
      }

      const rowValues = [
        card.id,
        card.name || "",
        card.codename || "",
        card.committee || "",
        card.updatedAt || new Date().toISOString(),
        JSON.stringify(card)
      ];

      if (foundRow > 0) {
        sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }
    } else if (action === "delete" && payload.id) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(payload.id)) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
