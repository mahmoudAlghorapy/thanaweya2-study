/**
 * Backend for thanaweya2-study (index.html).
 * Turns this Google Sheet into a tiny database with two tabs:
 *   - "Visits"        : one row per page visit (visit counter)
 *   - "Registrations" : one row per student who submits the التسجيل form
 *
 * Setup:
 *  1. Open the target Google Sheet.
 *  2. Extensions > Apps Script.
 *  3. Delete any placeholder code, paste this whole file, save.
 *  4. Deploy > New deployment > type "Web app".
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  5. Copy the Web app URL (ends with /exec) and paste it into
 *     APPS_SCRIPT_URL in index.html (and any other page that has the
 *     visit beacon).
 */

function doGet(e) {
  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'visit') {
    var sheet = getOrCreateSheet_(ss, 'Visits', ['التاريخ والوقت', 'الصفحة', 'المصدر']);
    sheet.appendRow([new Date(), e.parameter.page || '', e.parameter.ref || '']);
    var visitors = sheet.getLastRow() - 1; // minus header row
    return jsonOut_({ visitors: visitors });
  }

  return jsonOut_({ status: 'ok' });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateSheet_(ss, 'Registrations', ['التاريخ والوقت', 'الاسم', 'رقم الموبايل', 'الصف']);

    var name = (data.name || '').toString().trim();
    var phone = (data.phone || '').toString().trim();
    var grade = (data.grade || '').toString().trim();

    if (!name || !phone) {
      return jsonOut_({ success: false, error: 'missing name or phone' });
    }

    sheet.appendRow([new Date(), name, phone, grade]);
    return jsonOut_({ success: true });
  } catch (err) {
    return jsonOut_({ success: false, error: err.message });
  }
}

function getOrCreateSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
