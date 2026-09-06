/**
 * Where Gardens Begin — Submission Handler
 * ----------------------------------------
 * Receives JSON submissions from the Where Gardens Begin form.
 *
 * On every submission:
 *   1. Saves any uploaded photos into a dated Drive folder (auto-created)
 *   2. Appends a row to a Google Sheet (auto-created on first run)
 *   3. Sends a notification email to the studio (Tyson + Natasha)
 *   4. Sends a warm confirmation email to the client with their snapshot
 *
 * To deploy:
 *   1. Edit STUDIO_CONFIG below (notifyEmails, fromName, etc.)
 *   2. Click Deploy → New deployment → Web app
 *   3. Execute as: Me  ·  Who has access: Anyone
 *   4. Copy the /exec URL and paste into where-gardens-begin.html
 *      as window.BEGIN.submitEndpoint
 */

// ─────────────────────────────────────────────────────────────
//  CONFIG — edit these to match the studio
// ─────────────────────────────────────────────────────────────
const STUDIO_CONFIG = {
  // Where studio notifications go. Add multiple addresses comma-separated.
  notifyEmails: 'hello@gardenerandson.com, natasha@gardenerandson.com, tyson@gardenerandson.com',

  // The name shown in the "From" line of client confirmation emails.
  fromName: 'Gardener & Son',

  // Optional: a signed-off name for the client email.
  signature: 'Tyson & Natasha',

  // The studio reply-to address (where client replies go).
  replyTo: 'hello@gardenerandson.com',

  // PDF guide URL — linked from the client confirmation email.
  guideUrl: 'https://www.gardenerandson.com/assets/Where-Gardens-Begin-First-Steps.pdf',

  // Public-facing site URLs (used in the email footer).
  studioUrl: 'https://www.gardenerandson.com',
  registryUrl: 'https://ecologicalregistry.org/',

  // Leave empty to auto-create on first run. After the first run you can
  // optionally paste the IDs back here to lock to specific Sheet / Drive folder.
  sheetId: '',
  rootFolderId: ''
};

const SHEET_NAME = 'Where Gardens Begin — Submissions';
const ROOT_FOLDER_NAME = 'Where Gardens Begin';

// ─────────────────────────────────────────────────────────────
//  ENTRY POINTS
// ─────────────────────────────────────────────────────────────

function doGet() {
  return ContentService
    .createTextOutput('Where Gardens Begin endpoint is alive.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    const data = JSON.parse(raw);
    const summary  = data.summary  || {};
    const snapshot = data.snapshot || {};
    const photos   = Array.isArray(data.photos) ? data.photos : [];

    // 1. Save photos
    const photoLinks = photos.length ? savePhotos_(photos, summary) : [];

    // 2. Log to Sheet
    logToSheet_(summary, snapshot, photoLinks);

    // 3. Notify the studio
    sendStudioEmail_(summary, snapshot, photoLinks);

    // 4. Confirm with the client
    if (summary.email) sendClientEmail_(summary, snapshot);

    return jsonResponse_({ ok: true });
  } catch (err) {
    console.error(err);
    return jsonResponse_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────────────────────
//  DRIVE — save uploaded photos into a dated, client-named folder
// ─────────────────────────────────────────────────────────────

function getRootFolder_() {
  if (STUDIO_CONFIG.rootFolderId) {
    return DriveApp.getFolderById(STUDIO_CONFIG.rootFolderId);
  }
  // Find or create a root folder in My Drive.
  const it = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);
  if (it.hasNext()) return it.next();
  return DriveApp.createFolder(ROOT_FOLDER_NAME);
}

function safeName_(s) {
  return String(s || 'unknown').replace(/[^\w\-]+/g, '_').slice(0, 40);
}

function savePhotos_(photos, summary) {
  const root = getRootFolder_();

  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Australia/Melbourne', 'yyyy-MM-dd_HHmm');
  const folderName = `${stamp}_${safeName_(summary.name)}_${safeName_(summary.suburb)}`;
  const folder = root.createFolder(folderName);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const links = [];
  photos.forEach((p, i) => {
    try {
      const bytes = Utilities.base64Decode(p.data);
      const blob = Utilities.newBlob(bytes, p.type || 'image/jpeg', p.name || `photo_${i+1}.jpg`);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      links.push({ name: file.getName(), url: file.getUrl() });
    } catch (err) {
      console.warn('Photo failed:', p && p.name, err);
    }
  });

  // Store the folder link too — useful in emails.
  links.folderUrl = folder.getUrl();
  return links;
}

// ─────────────────────────────────────────────────────────────
//  SHEET — log every submission
// ─────────────────────────────────────────────────────────────

function getSheet_() {
  let ss;
  if (STUDIO_CONFIG.sheetId) {
    ss = SpreadsheetApp.openById(STUDIO_CONFIG.sheetId);
  } else {
    // Look in Drive for an existing spreadsheet by name.
    const files = DriveApp.getFilesByName(SHEET_NAME);
    if (files.hasNext()) {
      ss = SpreadsheetApp.openById(files.next().getId());
    } else {
      ss = SpreadsheetApp.create(SHEET_NAME);
    }
  }

  const sheet = ss.getSheets()[0];

  // Header row on first run
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Name', 'Email', 'Suburb',
      'Unfinished (Q1)', 'Hopes (Q2)', 'Help (Q3)', 'Easy beginning (Q3B)',
      'Use (Q4)', 'Hands-on (0–100)', 'Light', 'Slope',
      'Photo count', 'Photo folder', 'Note',
      'Direction', 'First step (head)', 'First step',
      'User agent', 'Page URL', 'Budget'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 21).setFontWeight('bold');
  } else {
    // Self-heal: sheets created before the Budget column existed gain it here,
    // appended at the end so existing rows stay aligned with their header.
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (header.indexOf('Budget') === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue('Budget').setFontWeight('bold');
    }
  }

  return sheet;
}

function logToSheet_(summary, snapshot, photoLinks) {
  const sheet = getSheet_();
  sheet.appendRow([
    new Date(),
    summary.name || '',
    summary.email || '',
    summary.suburb || '',
    summary.q1 || '',
    (summary.hopes || []).join(', '),
    summary.help || '',
    summary.easyBeginning || '',
    (summary.use || []).join(', '),
    summary.handsOn,
    summary.light || '',
    summary.slope || '',
    summary.photoCount || 0,
    (photoLinks && photoLinks.folderUrl) || '',
    summary.note || '',
    snapshot.direction || '',
    snapshot.head || '',
    snapshot.step || '',
    summary.userAgent || '',
    summary.pageUrl || '',
    summary.budget || ''
  ]);
}

// ─────────────────────────────────────────────────────────────
//  EMAIL — studio notification
// ─────────────────────────────────────────────────────────────

function escapeHtml_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function row_(label, value) {
  return `<tr>
    <td style="padding:6px 12px 6px 0; vertical-align:top; color:#666; font-size:13px; white-space:nowrap;">${escapeHtml_(label)}</td>
    <td style="padding:6px 0; vertical-align:top; font-size:14px; color:#222;">${value || '—'}</td>
  </tr>`;
}

function sendStudioEmail_(summary, snapshot, photoLinks) {
  const subject = `New garden beginning — ${summary.name || 'Unknown'} (${summary.suburb || 'no suburb'})`;

  let photosBlock = '';
  if (photoLinks && photoLinks.length) {
    const items = photoLinks.map(p => `<li><a href="${escapeHtml_(p.url)}">${escapeHtml_(p.name)}</a></li>`).join('');
    photosBlock = `<p style="margin:16px 0 4px; font-size:13px; color:#666;">Photos (${photoLinks.length})</p>
      <ul style="margin:0 0 8px 18px; padding:0; font-size:13px;">${items}</ul>
      <p style="margin:0 0 16px; font-size:13px;"><a href="${escapeHtml_(photoLinks.folderUrl)}">Open the folder in Drive →</a></p>`;
  } else {
    photosBlock = `<p style="margin:16px 0; font-size:13px; color:#999;"><em>No photos submitted.</em></p>`;
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; color:#222; line-height: 1.5;">
      <p style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#999; margin:0 0 4px;">Where Gardens Begin</p>
      <h2 style="margin:0 0 16px; font-family: Georgia, serif; font-weight: normal; font-size: 22px;">
        New beginning — ${escapeHtml_(summary.name)} in ${escapeHtml_(summary.suburb)}
      </h2>

      <table style="border-collapse: collapse; width: 100%;">
        ${row_('Name', escapeHtml_(summary.name))}
        ${row_('Email', `<a href="mailto:${escapeHtml_(summary.email)}">${escapeHtml_(summary.email)}</a>`)}
        ${row_('Suburb', escapeHtml_(summary.suburb))}
        ${row_('Submitted', new Date().toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' }))}
      </table>

      <hr style="border:none; border-top: 1px solid #eee; margin: 20px 0;" />

      <h3 style="font-family: Georgia, serif; font-weight: normal; font-size: 16px; margin: 0 0 10px;">Snapshot</h3>
      <table style="border-collapse: collapse; width: 100%;">
        ${row_('Direction', escapeHtml_(snapshot.direction))}
        ${row_('First step', `<strong>${escapeHtml_(snapshot.head)}</strong> — ${escapeHtml_(snapshot.step)}`)}
      </table>

      <hr style="border:none; border-top: 1px solid #eee; margin: 20px 0;" />

      <h3 style="font-family: Georgia, serif; font-weight: normal; font-size: 16px; margin: 0 0 10px;">Answers</h3>
      <table style="border-collapse: collapse; width: 100%;">
        ${row_('Unfinished', escapeHtml_(summary.q1))}
        ${row_('Hoped for', escapeHtml_((summary.hopes || []).join(', ')))}
        ${row_('Help wanted', escapeHtml_(summary.help))}
        ${row_('Easy beginning', escapeHtml_(summary.easyBeginning))}
        ${row_('Use', escapeHtml_((summary.use || []).join(', ')))}
        ${row_('Hands-on (0–100)', summary.handsOn)}
        ${row_('Light', escapeHtml_(summary.light))}
        ${row_('Slope', escapeHtml_(summary.slope))}
        ${row_('Budget', escapeHtml_(summary.budget))}
      </table>

      ${summary.note ? `
        <hr style="border:none; border-top: 1px solid #eee; margin: 20px 0;" />
        <h3 style="font-family: Georgia, serif; font-weight: normal; font-size: 16px; margin: 0 0 8px;">Their note</h3>
        <p style="margin:0; font-size:14px; white-space: pre-wrap;">${escapeHtml_(summary.note)}</p>
      ` : ''}

      ${photosBlock}

      <p style="margin-top: 28px; font-size: 12px; color: #999;">
        Logged to the submissions sheet · Replies to ${escapeHtml_(summary.email)} will land here.
      </p>
    </div>
  `;

  MailApp.sendEmail({
    to: STUDIO_CONFIG.notifyEmails,
    subject: subject,
    htmlBody: html,
    name: STUDIO_CONFIG.fromName,
    replyTo: summary.email || STUDIO_CONFIG.replyTo
  });
}

// ─────────────────────────────────────────────────────────────
//  EMAIL — client confirmation
// ─────────────────────────────────────────────────────────────

function sendClientEmail_(summary, snapshot) {
  const subject = 'Your garden beginning — Gardener & Son';

  // Attach the guide PDF when possible (more reliable than a link).
  let attachments = [];
  try {
    if (STUDIO_CONFIG.guideUrl) {
      const blob = UrlFetchApp.fetch(STUDIO_CONFIG.guideUrl, { muteHttpExceptions: true }).getBlob();
      blob.setName('Where-Gardens-Begin-First-Steps.pdf');
      attachments.push(blob);
    }
  } catch (err) {
    console.warn('Could not fetch guide PDF — falling back to link only.', err);
    attachments = [];
  }

  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; color: #3d4535; line-height: 1.65; background: #fff0dc; padding: 36px 32px;">
      <p style="font-family: -apple-system, sans-serif; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(61,69,53,0.6); margin: 0 0 8px;">
        A gentle beginning
      </p>

      <h1 style="font-family: 'Abril Fatface', Georgia, serif; font-weight: normal; font-size: 28px; line-height: 1.1; margin: 0 0 20px;">
        Thank you, ${escapeHtml_(summary.name)}.
      </h1>

      <p style="font-size: 16px; margin: 0 0 16px;">
        Every garden begins somewhere — and what you've shared gives us a calm, clear starting point.
      </p>

      <p style="font-size: 16px; margin: 0 0 28px;">
        Here is what we heard, in shape.
      </p>

      <table style="border-collapse: collapse; width: 100%; margin: 0 0 24px; background: rgba(61,69,53,0.05); border-left: 2px solid #3d4535;">
        <tr>
          <td style="padding: 18px 20px;">
            <div style="font-family: -apple-system, sans-serif; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(61,69,53,0.6); margin-bottom: 6px;">Direction</div>
            <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">${escapeHtml_(snapshot.direction)}</div>
            <div style="font-size: 14px; opacity: 0.8;">${escapeHtml_(snapshot.directionText || '')}</div>
          </td>
        </tr>
      </table>

      <table style="border-collapse: collapse; width: 100%; margin: 0 0 28px; background: rgba(61,69,53,0.05); border-left: 2px solid #3d4535;">
        <tr>
          <td style="padding: 18px 20px;">
            <div style="font-family: -apple-system, sans-serif; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(61,69,53,0.6); margin-bottom: 6px;">An easy first step</div>
            <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">${escapeHtml_(snapshot.head)}</div>
            <div style="font-size: 14px; opacity: 0.8;">${escapeHtml_(snapshot.step)}</div>
          </td>
        </tr>
      </table>

      <p style="font-size: 16px; margin: 0 0 16px;">
        ${attachments.length
          ? `A short guide is attached to this email — keep it alongside the snapshot above. It covers the simple principles we return to in every project, and the staged way gardens grow over time.`
          : `A short guide goes alongside this email — <a href="${escapeHtml_(STUDIO_CONFIG.guideUrl)}" style="color:#3d4535;">download it here</a>. It covers the simple principles we return to in every project, and the staged way gardens grow over time.`}
      </p>

      <p style="font-size: 16px; margin: 0 0 28px;">
        If you'd like to talk it through, just reply to this email. There's no rush, and no pressure for a particular shape.
      </p>

      <p style="font-size: 16px; margin: 0 0 6px;">With care,</p>
      <p style="font-family: 'Abril Fatface', Georgia, serif; font-size: 20px; margin: 0 0 28px;">${escapeHtml_(STUDIO_CONFIG.signature)}</p>

      <hr style="border: none; border-top: 1px solid rgba(61,69,53,0.15); margin: 32px 0 20px;" />

      <p style="font-family: -apple-system, sans-serif; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(61,69,53,0.7); margin: 0 0 4px;">
        Gardener &amp; Son
      </p>
      <p style="font-family: -apple-system, sans-serif; font-size: 12px; color: rgba(61,69,53,0.7); margin: 0 0 12px;">
        2 Churchill Street, Mont Albert · ecological garden design &amp; long-term care
      </p>
      <p style="font-family: -apple-system, sans-serif; font-size: 12px; margin: 0;">
        <a href="${escapeHtml_(STUDIO_CONFIG.studioUrl)}" style="color: rgba(61,69,53,0.8); text-decoration: none; border-bottom: 1px solid rgba(61,69,53,0.3);">Studio</a>
        &nbsp;·&nbsp;
        <a href="${escapeHtml_(STUDIO_CONFIG.registryUrl)}" style="color: rgba(61,69,53,0.8); text-decoration: none; border-bottom: 1px solid rgba(61,69,53,0.3);">Ecological Registry</a>
      </p>
    </div>
  `;

  const opts = {
    htmlBody: html,
    name: STUDIO_CONFIG.fromName,
    replyTo: STUDIO_CONFIG.replyTo
  };
  if (attachments.length) opts.attachments = attachments;

  MailApp.sendEmail(summary.email, subject, '', opts);
}

// ─────────────────────────────────────────────────────────────
//  TEST — run this once from the editor to grant permissions
// ─────────────────────────────────────────────────────────────
function testRun() {
  const fakeSummary = {
    name: 'Test Client',
    email: 'hello@gardenerandson.com',
    suburb: 'Surrey Hills',
    q1: 'Maintenance feels heavy',
    hopes: ['A quiet retreat', 'Habitat, birds, and life'],
    help: 'A clear plan to follow',
    easyBeginning: 'Just a clear plan (low cost)',
    use: ['Quiet mornings / retreat', 'Wildlife / habitat'],
    handsOn: 40,
    light: 'A mix',
    slope: 'Gently sloped',
    budget: '$15k–$40k — a considered transformation',
    photoCount: 0,
    note: 'This is a test submission. Please ignore.',
    timestamp: new Date().toISOString()
  };
  const fakeSnapshot = {
    direction: 'Retreat + Habitat',
    directionText: 'A direction is forming: Retreat + Habitat. This can be designed to a balanced rhythm.',
    head: 'Begin with a plan.',
    step: 'A clear plan is the lowest-cost way to reduce overwhelm.'
  };
  const res = doPost({ postData: { contents: JSON.stringify({ summary: fakeSummary, snapshot: fakeSnapshot, photos: [] }) } });
  console.log(res.getContent());
}
