import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { DAY_MS, escapeHtml, daysUntil, isAutomationRequest } from '../../shared/reminderUtils.ts';

/**
 * Monthly scheduled job: emails each household a single summary of its safety
 * devices (smoke alarms, CO alarms, extinguishers) that are overdue or due within
 * 30 days. Creates an in-app notification too, and is deduped to one per user per
 * ~25 days via the notification record it writes.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const isAutomation = isAutomationRequest(req, body);

    if (!isAutomation) {
      let user;
      try { user = await base44.auth.me(); } catch (_) { user = null; }
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    const allRecords = await base44.asServiceRole.entities.ComplianceRecord.list();
    const devices = allRecords.filter((r) => r.record_type === 'home_device' && r.expiration_date);

    let emailsSent = 0;
    let skipped = 0;

    for (const profile of profiles) {
      const email = profile.created_by;
      if (!email) { skipped++; continue; }
      // Respect the user's notification preference — in-app only means no email.
      if (profile.notification_method === 'in_app') { skipped++; continue; }

      const mine = devices.filter((d) => d.created_by === email);
      if (mine.length === 0) { skipped++; continue; }

      const overdue = [];
      const dueSoon = [];
      for (const d of mine) {
        const days = daysUntil(d.expiration_date);
        const entry = {
          label: `${d.title}${d.location ? ' — ' + d.location : ''}`,
          date: d.expiration_date,
          days,
        };
        if (days < 0) overdue.push(entry);
        else if (days <= 30) dueSoon.push(entry);
      }

      if (overdue.length === 0 && dueSoon.length === 0) { skipped++; continue; }

      // Dedup: at most one home-safety reminder per user per 25 days.
      const existing = await base44.asServiceRole.entities.Notification.filter({
        recipient_email: email,
        title: 'Home Safety Check',
      });
      const twentyFiveDaysAgo = new Date(Date.now() - 25 * DAY_MS);
      if (existing.some((n) => new Date(n.created_date) > twentyFiveDaysAgo)) { skipped++; continue; }

      const summary =
        `${overdue.length} device(s) overdue and ${dueSoon.length} due within 30 days: ` +
        [...overdue, ...dueSoon].slice(0, 3).map((e) => e.label).join(', ') +
        ([...overdue, ...dueSoon].length > 3 ? ' and more' : '') +
        '. Test or replace them and log the check to reset the next due date.';

      await base44.asServiceRole.entities.Notification.create({
        title: 'Home Safety Check',
        message: summary,
        type: 'warning',
        read: false,
        recipient_email: email,
      });

      const row = (e) =>
        `<li style="margin:0 0 6px;">${escapeHtml(e.label)} — <strong>${e.days < 0 ? 'overdue since' : 'due'} ${new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>${e.days < 0 ? ` (${Math.abs(e.days)} days ago)` : ` (in ${e.days} days)`}</li>`;

      const bodyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home safety check — RallyPack</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Inter,DM Sans,Arial,sans-serif;color:#1c1c1a;line-height:1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #d8d2c6;max-width:600px;">
        <tr>
          <td style="background-color:#1c1c1a;padding:28px 32px;">
            <h1 style="margin:0;font-family:Georgia,serif;font-size:22px;color:#ffffff;">RallyPack</h1>
            <p style="margin:4px 0 0;font-size:12px;color:#ffffff;opacity:0.6;text-transform:uppercase;letter-spacing:2px;">Home Safety Check</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-size:19px;">Your alarms and extinguishers</h2>
            <p style="margin:0 0 18px;font-size:15px;">Here is what needs a check at home.</p>
            ${overdue.length > 0 ? `
            <div style="background:#fdecea;border-left:4px solid #b3261e;padding:12px 16px;margin:0 0 16px;">
              <h3 style="margin:0 0 8px;font-size:14px;color:#b3261e;">Overdue — ${overdue.length} device${overdue.length !== 1 ? 's' : ''}</h3>
              <ul style="margin:0;padding-left:18px;font-size:14px;">${overdue.map(row).join('')}</ul>
            </div>` : ''}
            ${dueSoon.length > 0 ? `
            <div style="background:#fff8e7;border-left:4px solid #d64a2e;padding:12px 16px;margin:0 0 16px;">
              <h3 style="margin:0 0 8px;font-size:14px;color:#a83a20;">Due within 30 days — ${dueSoon.length} device${dueSoon.length !== 1 ? 's' : ''}</h3>
              <ul style="margin:0;padding-left:18px;font-size:14px;">${dueSoon.map(row).join('')}</ul>
            </div>` : ''}
            <p style="margin:0 0 18px;font-size:14px;">Test the alarm or service the extinguisher, then tap <strong>Log check</strong> and we will set the next due date for you.</p>
            <p style="margin:18px 0 0;">
              <a href="https://www.rallypack.org/Resources?tab=safety" style="display:inline-block;background-color:#d64a2e;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 28px;border-radius:4px;">Log your checks &rarr;</a>
            </p>
            <p style="margin:20px 0 0;font-size:14px;">Stay safe,<br><strong>The RallyPack Team</strong></p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#1c1c1a;padding:18px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#ffffff;opacity:0.5;">
              You receive this monthly because you track home safety devices in RallyPack.<br>
              In an emergency, always call your local emergency services first.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          from_name: 'RallyPack',
          subject: `Home safety check: ${overdue.length + dueSoon.length} device(s) need attention`,
          body: bodyHtml,
          is_html: true,
        });
        emailsSent++;
      } catch (sendErr) {
        console.error(`Home safety reminder failed for ${email}:`, sendErr.message);
      }
    }

    return Response.json({
      success: true,
      usersChecked: profiles.length,
      emailsSent,
      skipped,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}