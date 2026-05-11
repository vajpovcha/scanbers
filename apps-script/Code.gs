// ============================================================
// Scanbers – Google Apps Script Web App
// Deploy as: Execute as ME, Anyone can access
// ============================================================

var SHEET_NAME  = 'Reports';
var ADMIN_SECRET = 'scanbers_secret_2026';

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

// ------- Helpers -------
function checkSecret(s) { return s === ADMIN_SECRET; }

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function forbidden() {
  return json({ error: 'Unauthorized' });
}

function submitRecord(data) {
  var sheet   = getSheet();
  var phone   = (data.phoneNumber   ||'').trim();
  var account = (data.accountNumber ||'').trim();
  if (phone || account) {
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      var rPhone   = String(rows[i][COLS.PHONE_NUMBER-1]  ||'').trim();
      var rAccount = String(rows[i][COLS.ACCOUNT_NUMBER-1]||'').trim();
      if ((phone && rPhone === phone) || (account && rAccount === account)) {
        sheet.getRange(i+1, COLS.REPORT_COUNT).setValue((rows[i][COLS.REPORT_COUNT-1]||1)+1);
        return { success: true, duplicate: true };
      }
    }
  }
  var id      = Utilities.getUuid();
  var nextRow = sheet.getLastRow() + 1;
  // Set plain-text format BEFORE writing so leading zeros are preserved
  sheet.getRange(nextRow, COLS.PHONE_NUMBER).setNumberFormat('@');
  sheet.getRange(nextRow, COLS.ACCOUNT_NUMBER).setNumberFormat('@');
  sheet.getRange(nextRow, 1, 1, 12).setValues([[
    id,
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
  return { success: true, id: id };
}
