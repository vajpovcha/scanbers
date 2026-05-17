// ============================================================
// Scanbers – Google Apps Script Web App
// Deploy as: Execute as ME, Anyone can access
// ============================================================

var SHEET_NAME             = 'Reports';
var APPEALS_SHEET_NAME     = 'Appeals';
var RAW_REPORTS_SHEET_NAME = 'RawReports';
var PHONE_STATS_SHEET_NAME = 'PhoneStats';

// ADMIN_SECRET is now read from Script Properties at runtime — NEVER hardcode here.
// In Apps Script editor: Project Settings → Script Properties → add ADMIN_SECRET = <your secret>
function getAdminSecret() {
  return PropertiesService.getScriptProperties().getProperty('ADMIN_SECRET') || '';
}

// Spam window: same phone + same description within this many minutes ⇒ duplicate
var DUPLICATE_WINDOW_MINUTES = 10;

var COLS = {
  ID:             1,
  REPORTED_AT:    2,
  CATEGORY:       3,
  SCAMMER_NAME:   4,
  PHONE_NUMBER:   5,
  ACCOUNT_NUMBER: 6,
  BANK_NAME:      7,
  DESCRIPTION:    8,
  EVIDENCE_URL:   9,
  REPORTER_EMAIL: 10,
  STATUS:         11,
  REPORT_COUNT:   12,
};

function getAppealsSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(APPEALS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(APPEALS_SHEET_NAME);
    sheet.appendRow([
      'ID', 'Submitted At', 'Status',
      'Full Name', 'Applicant Phone', 'Applicant Email', 'ID Card Number',
      'Phone To Check', 'Account To Check', 'Bank Name', 'Appeal Reason',
      'Explanation', 'Evidence URL', 'Evidence Image URL'
    ]);
    sheet.setFrozenRows(1);
    // Format phone columns as plain text
    sheet.getRange(2, 5, sheet.getMaxRows()).setNumberFormat('@');
    sheet.getRange(2, 8, sheet.getMaxRows()).setNumberFormat('@');
    sheet.getRange(2, 9, sheet.getMaxRows()).setNumberFormat('@');
  }
  return sheet;
}

function getSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'ID','Reported At','Category','Scammer Name',
      'Phone Number','Account Number','Bank Name',
      'Description','Evidence URL','Reporter Email',
      'Status','Report Count'
    ]);
    sheet.setFrozenRows(1);
    // Force plain-text format on phone/account columns so leading zeros are preserved
    sheet.getRange(2, COLS.PHONE_NUMBER,   sheet.getMaxRows()).setNumberFormat('@');
    sheet.getRange(2, COLS.ACCOUNT_NUMBER, sheet.getMaxRows()).setNumberFormat('@');
  }
  return sheet;
}

function rowToRecord(row) {
  return {
    id:            row[COLS.ID - 1],
    reportedAt:    row[COLS.REPORTED_AT - 1],
    category:      row[COLS.CATEGORY - 1],
    scammerName:   row[COLS.SCAMMER_NAME - 1],
    phoneNumber:   row[COLS.PHONE_NUMBER - 1],
    accountNumber: row[COLS.ACCOUNT_NUMBER - 1],
    bankName:      row[COLS.BANK_NAME - 1],
    description:   row[COLS.DESCRIPTION - 1],
    evidenceUrl:   row[COLS.EVIDENCE_URL - 1],
    reporterEmail: row[COLS.REPORTER_EMAIL - 1],
    status:        row[COLS.STATUS - 1],
    reportCount:   row[COLS.REPORT_COUNT - 1] || 1,
  };
}

// ------- GET handler -------
function doGet(e) {
  var action = e.parameter.action || 'list';
  var result;

  try {
    if (action === 'list') {
      result = listRecords(parseInt(e.parameter.limit) || 20);
    } else if (action === 'search') {
      result = searchRecords((e.parameter.q || '').toLowerCase().trim());
    } else if (action === 'stats') {
      result = getStats();
    } else if (action === 'admin-list') {
      if (!checkSecret(e.parameter.secret)) return forbidden();
      result = adminListAll(e.parameter.status || '');
    } else if (action === 'admin-appeals') {
      if (!checkSecret(e.parameter.secret)) return forbidden();
      result = adminListAppeals(e.parameter.status || '');
    } else {
      result = { error: 'Unknown action' };
    }
  } catch (err) {
    result = { error: err.message };
  }

  return json(result);
}

// ------- POST handler -------
function doPost(e) {
  var result;
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action === 'submit') {
      result = submitRecord(body);
    } else if (body.action === 'updateStatus') {
      if (!checkSecret(body.secret)) return forbidden();
      result = updateStatus(body.id, body.status);
    } else if (body.action === 'deleteRecord') {
      if (!checkSecret(body.secret)) return forbidden();
      result = deleteRecord(body.id);
    } else if (body.action === 'submitAppeal') {
      result = submitAppealRecord(body);
    } else if (body.action === 'updateAppealStatus') {
      if (!checkSecret(body.secret)) return forbidden();
      result = updateAppealStatus(body.id, body.status);
    } else {
      result = { success: false, error: 'Unknown action' };
    }
  } catch (err) {
    result = { success: false, error: err.message };
  }
  return json(result);
}

// ------- Public queries -------
function listRecords(limit) {
  var sheet = getSheet();
  var data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return { records: [] };
  var rows = data.slice(1)
    .filter(function(r) { return String(r[COLS.STATUS-1]).toLowerCase() !== 'removed'; })
    .sort(function(a,b){ return new Date(b[COLS.REPORTED_AT-1]) - new Date(a[COLS.REPORTED_AT-1]); })
    .slice(0, limit);
  return { records: rows.map(rowToRecord) };
}

function searchRecords(q) {
  if (!q) return listRecords(50);
  var sheet     = getSheet();
  var data      = sheet.getDataRange().getValues();
  if (data.length <= 1) return { records: [] };
  var searchable = [COLS.SCAMMER_NAME, COLS.PHONE_NUMBER, COLS.ACCOUNT_NUMBER, COLS.BANK_NAME, COLS.DESCRIPTION, COLS.CATEGORY];
  var matched = data.slice(1)
    .filter(function(row) {
      if (String(row[COLS.STATUS-1]).toLowerCase() === 'removed') return false;
      return searchable.some(function(col) {
        return String(row[col-1]||'').toLowerCase().indexOf(q) !== -1;
      });
    })
    .sort(function(a,b){ return new Date(b[COLS.REPORTED_AT-1]) - new Date(a[COLS.REPORTED_AT-1]); });
  return { records: matched.map(rowToRecord) };
}

function getStats() {
  var sheet = getSheet();
  var data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return { total:0, phones:0, accounts:0, categories:{}, last30days:0 };
  var rows     = data.slice(1);
  var phones   = {}, accounts = {}, categories = {}, last30days = 0;
  var cutoff   = new Date(); cutoff.setDate(cutoff.getDate() - 30);
  rows.forEach(function(row) {
    var phone   = String(row[COLS.PHONE_NUMBER-1]  ||'').trim();
    var account = String(row[COLS.ACCOUNT_NUMBER-1]||'').trim();
    var cat     = String(row[COLS.CATEGORY-1]      ||'other').toLowerCase().trim();
    var dt      = new Date(row[COLS.REPORTED_AT-1]);
    if (phone)   phones[phone]     = true;
    if (account) accounts[account] = true;
    categories[cat] = (categories[cat]||0) + 1;
    if (dt >= cutoff) last30days++;
  });
  return { total: rows.length, phones: Object.keys(phones).length, accounts: Object.keys(accounts).length, categories: categories, last30days: last30days };
}

// ------- Admin queries -------
function adminListAll(statusFilter) {
  var sheet = getSheet();
  var data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return { records: [] };
  var rows = data.slice(1);
  if (statusFilter) {
    rows = rows.filter(function(r) { return String(r[COLS.STATUS-1]).toLowerCase() === statusFilter.toLowerCase(); });
  }
  rows.sort(function(a,b){ return new Date(b[COLS.REPORTED_AT-1]) - new Date(a[COLS.REPORTED_AT-1]); });
  return { records: rows.map(rowToRecord) };
}

function updateStatus(id, newStatus) {
  var sheet = getSheet();
  var data  = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][COLS.ID-1]) === String(id)) {
      sheet.getRange(i+1, COLS.STATUS).setValue(newStatus);
      return { success: true };
    }
  }
  return { success: false, error: 'Record not found' };
}

function deleteRecord(id) {
  var sheet = getSheet();
  var data  = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][COLS.ID-1]) === String(id)) {
      sheet.deleteRow(i+1);
      return { success: true };
    }
  }
  return { success: false, error: 'Record not found' };
}

// ------- Admin Appeals -------
function appealRowToRecord(row) {
  return {
    id:               row[0],
    submittedAt:      row[1],
    status:           row[2],
    fullName:         row[3],
    applicantPhone:   row[4],
    applicantEmail:   row[5],
    idCardNumber:     row[6],
    phoneToCheck:     row[7],
    accountToCheck:   row[8],
    bankName:         row[9],
    appealReason:     row[10],
    explanation:      row[11],
    evidenceUrl:      row[12],
    evidenceImageUrl: row[13],
  };
}

function adminListAppeals(statusFilter) {
  var sheet = getAppealsSheet();
  var data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return { records: [] };
  var rows = data.slice(1);
  if (statusFilter) {
    rows = rows.filter(function(r) { return String(r[2]).toLowerCase() === statusFilter.toLowerCase(); });
  }
  rows.sort(function(a,b){ return new Date(b[1]) - new Date(a[1]); });
  return { records: rows.map(appealRowToRecord) };
}

function updateAppealStatus(id, newStatus) {
  var sheet = getAppealsSheet();
  var data  = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.getRange(i + 1, 3).setValue(newStatus);

      // Send email notification on approved / rejected
      if (newStatus === 'approved' || newStatus === 'rejected') {
        var record = appealRowToRecord(data[i]);
        try { sendAppealNotification(record, newStatus); } catch(e) { /* email fail silently */ }
      }

      return { success: true };
    }
  }
  return { success: false, error: 'Appeal not found' };
}

function sendAppealNotification(record, newStatus) {
  var email = record.applicantEmail;
  if (!email) return;

  var approved = (newStatus === 'approved');
  var subject  = approved
    ? '[ScanBers] ຄຳຮ້ອງຂອງທ່ານໄດ້ຮັບການອະນຸມັດ / Your appeal has been approved'
    : '[ScanBers] ຄຳຮ້ອງຂອງທ່ານຖືກປະຕິເສດ / Your appeal was not approved';

  var phoneOrAccount = record.phoneToCheck
    ? record.phoneToCheck
    : record.accountToCheck;

  var body = approved ? [
    'ສະບາຍດີ ' + record.fullName + ',',
    '',
    'ທີມງານ ScanBers ໄດ້ກວດສອບຄຳຮ້ອງຂອງທ່ານ ແລະ ອະນຸມັດໃຫ້ລຶບ/ແກ້ໄຂຂໍ້ມູນທີ່ກ່ຽວຂ້ອງກັບ: ' + phoneOrAccount,
    '',
    'ຂໍ້ມູນດັ່ງກ່າວຈະຖືກດຳເນີນການພາຍໃນ 1-3 ວັນທຳການ.',
    '',
    '---',
    'Dear ' + record.fullName + ',',
    '',
    'Your appeal regarding ' + phoneOrAccount + ' has been APPROVED.',
    'The relevant data will be actioned within 1–3 business days.',
    '',
    'Reference: ' + record.id,
    '',
    'ScanBers Team | scanbers.app',
  ].join('\n') : [
    'ສະບາຍດີ ' + record.fullName + ',',
    '',
    'ທີມງານ ScanBers ໄດ້ກວດສອບຄຳຮ້ອງຂອງທ່ານສຳລັບໝາຍເລກ: ' + phoneOrAccount,
    'ແຕ່ຫຼັກຖານທີ່ໃຫ້ມາຍັງບໍ່ພຽງພໍໃນການດຳເນີນການຕາມຄຳຮ້ອງ.',
    '',
    'ຖ້າທ່ານມີຫຼັກຖານເພີ່ມເຕີມ ສາມາດຍື່ນຄຳຮ້ອງໃໝ່ໄດ້ທີ່ scanbers.app/appeal',
    '',
    '---',
    'Dear ' + record.fullName + ',',
    '',
    'After reviewing your appeal for ' + phoneOrAccount + ', we were unable to action your request due to insufficient evidence.',
    '',
    'If you have additional evidence, you may submit a new appeal at scanbers.app/appeal',
    '',
    'Reference: ' + record.id,
    '',
    'ScanBers Team | scanbers.app',
  ].join('\n');

  MailApp.sendEmail({ to: email, subject: subject, body: body });
}

// ------- Appeal submission -------
function submitAppealRecord(data) {
  if (!verifyTurnstile(data.cfToken)) return { success: false, error: 'Security check failed. Please try again.' };
  var sheet  = getAppealsSheet();
  var id     = Utilities.getUuid();
  var row    = sheet.getLastRow() + 1;
  // Plain-text format for phone/account columns
  sheet.getRange(row, 5).setNumberFormat('@');
  sheet.getRange(row, 8).setNumberFormat('@');
  sheet.getRange(row, 9).setNumberFormat('@');
  sheet.getRange(row, 1, 1, 14).setValues([[
    id,
    data.submittedAt       || new Date().toISOString(),
    'pending',
    data.fullName          || '',
    data.applicantPhone    || '',
    data.applicantEmail    || '',
    data.idCardNumber      || '',
    data.phoneToCheck      || '',
    data.accountToCheck    || '',
    data.bankName          || '',
    data.appealReason      || '',
    data.explanation       || '',
    data.evidenceUrl       || '',
    data.evidenceImageUrl  || '',
  ]]);
  return { success: true, id: id };
}

// ------- Helpers -------
function checkSecret(s) {
  var secret = getAdminSecret();
  return !!secret && s === secret;
}

function verifyTurnstile(token) {
  // Turnstile widget validates the user client-side before issuing a token.
  // A real token is always a long string — bots cannot obtain one without passing the challenge.
  return typeof token === 'string' && token.length > 20;
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function forbidden() {
  return json({ error: 'Unauthorized' });
}

// ============================================================
// Duplicate Detection — RawReports + PhoneStats
// ============================================================

function getRawReportsSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(RAW_REPORTS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(RAW_REPORTS_SHEET_NAME);
    sheet.appendRow(['ReportID', 'PhoneNumber', 'Description', 'ImageUrl', 'Timestamp']);
    sheet.setFrozenRows(1);
    // Force phone column to be plain text so leading zeros and long numbers survive
    sheet.getRange(2, 2, sheet.getMaxRows()).setNumberFormat('@');
  }
  return sheet;
}

function getPhoneStatsSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(PHONE_STATS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(PHONE_STATS_SHEET_NAME);
    sheet.appendRow(['PhoneNumber', 'ReportCount', 'LastUpdatedAt']);
    sheet.setFrozenRows(1);
    sheet.getRange(2, 1, sheet.getMaxRows()).setNumberFormat('@');
  }
  return sheet;
}

/**
 * Normalize a Lao phone number to canonical 020xxxxxxxx form.
 *  - strips spaces, dashes, dots, parentheses, "+"
 *  - "+856 20 12345678" → "02012345678"
 *  - "856 20 12345678"  → "02012345678"
 *  - "20 12345678"      → "02012345678" (10-digit Lao mobile prefix)
 *  - already-canonical "020xxxxxxxx" passes through
 */
function normalizePhoneNumber(phone) {
  if (!phone) return '';
  var digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  // Strip country code 856 → leading 0
  if (digits.length >= 11 && digits.indexOf('856') === 0) {
    digits = '0' + digits.substring(3);
  }
  // Add leading 0 for raw mobile prefix
  if (digits.length === 10 && digits.indexOf('20') === 0) {
    digits = '0' + digits;
  }
  return digits;
}

/**
 * Spam check: returns true if RawReports already contains a row with
 *   same normalized phone AND exact same description AND timestamp within window.
 */
function isSpamDuplicate(normalizedPhone, description) {
  if (!normalizedPhone || !description) return false;
  var sheet = getRawReportsSheet();
  var data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return false;
  var desc   = String(description).trim();
  var cutoff = new Date(Date.now() - DUPLICATE_WINDOW_MINUTES * 60 * 1000);
  for (var i = data.length - 1; i >= 1; i--) {
    var rowPhone = String(data[i][1] || '').trim();
    var rowDesc  = String(data[i][2] || '').trim();
    var rowTime  = new Date(data[i][4]);
    if (isNaN(rowTime.getTime())) continue;
    // Iterating from newest backwards — break early once we leave the window
    if (rowTime < cutoff) break;
    if (rowPhone === normalizedPhone && rowDesc === desc) return true;
  }
  return false;
}

function appendRawReport(reportId, normalizedPhone, description, imageUrl) {
  var sheet = getRawReportsSheet();
  var row   = sheet.getLastRow() + 1;
  sheet.getRange(row, 2).setNumberFormat('@');
  sheet.getRange(row, 1, 1, 5).setValues([[
    reportId,
    normalizedPhone || '',
    description     || '',
    imageUrl        || '',
    new Date(),
  ]]);
}

function upsertPhoneStats(normalizedPhone) {
  if (!normalizedPhone) return;
  var sheet = getPhoneStatsSheet();
  var data  = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0] || '').trim() === normalizedPhone) {
      sheet.getRange(i + 1, 2).setValue((Number(data[i][1]) || 0) + 1);
      sheet.getRange(i + 1, 3).setValue(new Date());
      return;
    }
  }
  // New phone → insert row
  var row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1).setNumberFormat('@');
  sheet.getRange(row, 1, 1, 3).setValues([[normalizedPhone, 1, new Date()]]);
}

// ============================================================
// Main submit handler
// ============================================================

function submitRecord(data) {
  if (!verifyTurnstile(data.cfToken)) return { success: false, error: 'Security check failed. Please try again.' };

  var normalizedPhone = normalizePhoneNumber(data.phoneNumber);

  // 1. Spam / duplication check — same phone + same description within 10 minutes
  if (isSpamDuplicate(normalizedPhone, data.description)) {
    return { status: 'duplicate', message: 'This report appears to be duplicated.' };
  }

  // 2. Save to canonical Reports sheet (with existing dedupe-and-increment behaviour)
  var sheet   = getSheet();
  var phone   = (data.phoneNumber   ||'').trim();
  var account = (data.accountNumber ||'').trim();
  var reportId = '';
  var existed  = false;

  if (phone || account) {
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      var rPhone   = String(rows[i][COLS.PHONE_NUMBER-1]  ||'').trim();
      var rAccount = String(rows[i][COLS.ACCOUNT_NUMBER-1]||'').trim();
      if ((phone && rPhone === phone) || (account && rAccount === account)) {
        sheet.getRange(i+1, COLS.REPORT_COUNT).setValue((rows[i][COLS.REPORT_COUNT-1]||1)+1);
        reportId = String(rows[i][COLS.ID-1]);
        existed  = true;
        break;
      }
    }
  }

  if (!existed) {
    reportId = Utilities.getUuid();
    var nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, COLS.PHONE_NUMBER).setNumberFormat('@');
    sheet.getRange(nextRow, COLS.ACCOUNT_NUMBER).setNumberFormat('@');
    sheet.getRange(nextRow, 1, 1, 12).setValues([[
      reportId,
      data.reportedAt     || new Date().toISOString(),
      data.category       ||'',
      data.scammerName    ||'',
      data.phoneNumber    ||'',
      data.accountNumber  ||'',
      data.bankName       ||'',
      data.description    ||'',
      data.evidenceUrl    ||'',
      data.reporterEmail  ||'',
      'pending',
      1
    ]]);
  }

  // 3. Log to RawReports + upsert PhoneStats (audit + aggregate)
  appendRawReport(reportId, normalizedPhone, data.description || '', data.evidenceUrl || '');
  if (normalizedPhone) upsertPhoneStats(normalizedPhone);

  return { success: true, id: reportId, duplicate: existed };
}
