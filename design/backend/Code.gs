/* Design Studio backend — Google Apps Script web app.
 *
 * Storage: one Google Sheet (a tab per table, readable by people) and one Drive folder for photos.
 * Logic: engine.gs, a verbatim copy of design/engine.js. Never edit the rules here; edit engine.js and re-paste.
 *
 * Setup (once): see design/backend/README.md.
 *   Script properties: ADMIN_TOKEN (same value as the Plant Studio admin key), AGENT_TOKEN (for the iMac agents).
 */

var TABLES = {
  projects: ['id', 'name', 'stage', 'archived', 'created_at', 'updated_at', 'status', 'data'],
  ghosts: ['ghost_id', 'project_id', 'stage', 'agent', 'state', 'summary', 'created_at', 'resolved_at', 'resolved_by', 'request_id', 'fields', 'notes', 'questions'],
  requests: ['request_id', 'project_id', 'stage', 'agent', 'state', 'ask', 'created_at', 'created_by', 'claimed_by', 'claimed_at'],
  events: ['at', 'project_id', 'who', 'what'],
  photos: ['photo_id', 'project_id', 'stage', 'name', 'caption', 'file_id', 'width', 'height', 'created_at']
};
var TAB_NAMES = {projects: 'Projects', ghosts: 'Ghost drafts', requests: 'Asks', events: 'Activity', photos: 'Photos'};

function setup() {
  var props = PropertiesService.getScriptProperties();
  var ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('G&S Design Studio');
  props.setProperty('SHEET_ID', ss.getId());
  Object.keys(TABLES).forEach(function (t) {
    var sh = ss.getSheetByName(TAB_NAMES[t]) || ss.insertSheet(TAB_NAMES[t]);
    sh.getRange(1, 1, 1, TABLES[t].length).setValues([TABLES[t]]).setFontWeight('bold');
    sh.setFrozenRows(1);
  });
  if (!props.getProperty('PHOTO_FOLDER_ID')) {
    props.setProperty('PHOTO_FOLDER_ID', DriveApp.createFolder('G&S Design Studio photos').getId());
  }
  if (!props.getProperty('AGENT_TOKEN')) props.setProperty('AGENT_TOKEN', Utilities.getUuid().replace(/-/g, ''));
  Logger.log('Sheet: ' + ss.getUrl());
  Logger.log('Set ADMIN_TOKEN in Project Settings → Script properties if you have not yet.');
  Logger.log('AGENT_TOKEN for the iMac: ' + props.getProperty('AGENT_TOKEN'));
}

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json({ok: false, error: 'Bad request'}); }
  var props = PropertiesService.getScriptProperties();
  var role = null, who = 'studio';
  if (body.admin_token && body.admin_token === props.getProperty('ADMIN_TOKEN')) role = 'admin';
  else if (body.agent_token && body.agent_token === props.getProperty('AGENT_TOKEN')) { role = 'agent'; who = String(body.runner || 'agent').slice(0, 40); }
  if (!role) return json({ok: false, error: 'Unauthorized'});

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
    var db = load(ss);
    var folder = DriveApp.getFolderById(props.getProperty('PHOTO_FOLDER_ID'));
    var ctx = {
      now: new Date().toISOString(), who: who, role: role,
      id: function (prefix) { return prefix + '-' + Utilities.getUuid().slice(0, 8).toUpperCase(); },
      putPhoto: function (dataUrl, name, project) {
        var m = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
        if (!m) throw new Error('Photo must be a data URL');
        var sub = folder.getFoldersByName(project.id);
        var dir = sub.hasNext() ? sub.next() : folder.createFolder(project.id);
        var file = dir.createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], name));
        return {file_id: file.getId()};
      },
      getPhoto: function (fileId) {
        var blob = DriveApp.getFileById(fileId).getBlob();
        return 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes());
      }
    };
    var out = Engine.handle(db, body, ctx);
    out.dirty.forEach(function (t) { save(ss, t, db[t]); });
    return json(out.res);
  } catch (err) {
    return json({ok: false, error: String(err && err.message || err)});
  } finally {
    lock.releaseLock();
  }
}

function load(ss) {
  var db = {};
  Object.keys(TABLES).forEach(function (t) {
    var sh = ss.getSheetByName(TAB_NAMES[t]);
    var values = sh.getDataRange().getValues();
    var head = values.shift() || [];
    db[t] = values.filter(function (r) { return r.join('') !== ''; }).map(function (r) {
      var o = {};
      head.forEach(function (k, i) {
        var v = r[i];
        if (v instanceof Date) v = v.toISOString();
        if (typeof v === 'string' && /^[\[{]/.test(v)) { try { v = JSON.parse(v); } catch (e) {} }
        if (k === 'archived') v = String(v).toLowerCase() === 'true';
        o[k] = v;
      });
      return o;
    });
  });
  return db;
}

// Rewrites the whole tab. Fine at studio scale; switch to row updates past a few thousand rows.
function save(ss, t, rows) {
  var sh = ss.getSheetByName(TAB_NAMES[t]), cols = TABLES[t];
  var out = rows.map(function (o) {
    return cols.map(function (k) {
      var v = o[k];
      if (v === undefined || v === null) return '';
      return typeof v === 'object' ? JSON.stringify(v) : v;
    });
  });
  var last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, cols.length).clearContent();
  if (out.length) sh.getRange(2, 1, out.length, cols.length).setNumberFormat('@').setValues(out);
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
