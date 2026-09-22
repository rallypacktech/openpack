import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { DAY_MS, escapeHtml, daysUntil, isAutomationRequest } from '../../shared/reminderUtils.ts';

/**
 * Monthly scheduled job: emails each business organization a single summary of
 * expiring/expired kit items, staff certifications, and fire equipment inspections.
 * Deduped to one email per organization per month via subscription.last_expiry_reminder_at.
 */
Deno.serve(async (req) => {
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

    const subscriptions = await base44.asServiceRole.entities.BusinessSubscription.list();
    const activeSubs = subscriptions.filter(
      (s) => s.owner_email && (s.status === 'active' || s.status === 'trialing')
    );

    const allCaches = await base44.asServiceRole.entities.EmergencyCache.list();
    const allItems = await base44.asServiceRole.entities.CacheItem.list();
    const allCompliance = await base44.asServiceRole.entities.ComplianceRecord.list();

    let emailsSent = 0;
    let skipped = 0;

    for (const sub of activeSubs) {
      // Dedup: at most one reminder per organization per 25 days
      if (sub.last_expiry_reminder_at) {
        const since = Date.now() - new Date(sub.last_expiry_reminder_at).getTime();
        if (since < 25 * DAY_MS) { skipped++; continue; }
      }

      const owner = sub.owner_email;
      const orgCaches = allCaches.filter((c) => c.created_by === owner);
      const cacheIds = new Set(orgCaches.map((c) => c.id));
      const cacheNameById = {};
      orgCaches.forEach((c) => { cacheNameById[c.id] = c.name || c.location || 'Kit'; });

      const items = allItems.filter((i) => cacheIds.has(i.cache_id) && i.expiration_date);
      const compliance = allCompliance.filter(
        (r) =>
          r.record_type !== 'home_device' &&
          ((r.subscription_id && r.subscription_id === sub.id) || r.created_by === owner)
      );

      const expired = [];
      const expiring = [];

      for (const i of items) {
        const d = daysUntil(i.expiration_date);
        const entry = {
          label: `${i.item_name} — ${cacheNameById[i.cache_id] || 'Kit'}`,
          date: i.expiration_date,
          days: d,
        };
        if (d < 0) expired.push(entry);
        else if (d <= 30) expiring.push(entry);
      }

      for (const r of compliance) {
        if (!r.expiration_date) continue;
        const d = daysUntil(r.expiration_date);
        const who = r.record_type === 'staff_certification'
          ? `${r.holder_name ? r.holder_name + ' — ' : ''}${r.title}`
          : `${r.title}${r.location ? ' — ' + r.location : ''}`;
        const entry = { label: who, date: r.expiration_date, days: d };
        if (d < 0) expired.push(entry);
        else if (d <= 30) expiring.push(entry);
      }

      if (expired.length === 0 && expiring.length === 0) { skipped++; continue; }

      const row = (e) =>
        `<li style="margin:0 0 6px;">${escapeHtml(e.label)} — <strong>${e.days < 0 ? 'expired' : 'expires'} ${new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>${e.days < 0 ? ` (${Math.abs(e.days)} days ago)` : ` (in ${e.days} days)`}</li>`;

      const orgName = escapeHtml(sub.organization_name || 'your organization');
      const bodyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly expiration check — RallyPack</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Inter,DM Sans,Arial,sans-serif;color:#1c1c1a;line-height:1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #d8d2c6;max-width:600px;">
        <tr>
          <td style="background-color:#1c1c1a;padding:28px 32px;">
            <h1 style="margin:0;font-family:Georgia,serif;font-size:22px;color:#ffffff;">RallyPack</h1>
            <p style="margin:4px 0 0;font-size:12px;color:#ffffff;opacity:0.6;text-transform:uppercase;letter-spacing:2px;">Monthly Compliance Check</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-size:19px;">Expiration summary for ${orgName}</h2>
            <p style="margin:0 0 18px;font-size:15px;">Here is what needs attention before your next inspection.</p>
            ${expired.length > 0 ? `
            <div style="background:#fdecea;border-left:4px solid #b3261e;padding:12px 16px;margin:0 0 16px;">
              <h3 style="margin:0 0 8px;font-size:14px;color:#b3261e;">Replace now — ${expired.length} item${expired.length !== 1 ? 's' : ''} expired</h3>
              <ul style="margin:0;padding-left:18px;font-size:14px;">${expired.map(row).join('')}</ul>
            </div>` : ''}
            ${expiring.length > 0 ? `
            <div style="background:#fff8e7;border-left:4px solid #d64a2e;padding:12px 16px;margin:0 0 16px;">
              <h3 style="margin:0 0 8px;font-size:14px;color:#a83a20;">Due within 30 days — ${expiring.length} item${expiring.length !== 1 ? 's' : ''}</h3>
              <ul style="margin:0;padding-left:18px;font-size:14px;">${expiring.map(row).join('')}</ul>
            </div>` : ''}
            <p style="margin:18px 0 0;">
              <a href="https://rallypack.org/BusinessDashboard" style="display:inline-block;background-color:#d64a2e;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 28px;border-radius:4px;">Open your dashboard &rarr;</a>
            </p>
            <p style="margin:20px 0 0;font-size:14px;">Stay compliant,<br><strong>The RallyPack Team</strong></p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#1c1c1a;padding:18px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#ffffff;opacity:0.5;">
              You receive this monthly because ${orgName} has a RallyPack business account.<br>
              In emergencies, always call your local emergency services first.
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
          to: owner,
          from_name: 'RallyPack',
          subject: `Compliance check for ${sub.organization_name || 'your organization'}: ${expired.length + expiring.length} item(s) need attention`,
          body: bodyHtml,
          is_html: true,
        });
        await base44.asServiceRole.entities.BusinessSubscription.update(sub.id, {
          last_expiry_reminder_at: new Date().toISOString(),
        });
        emailsSent++;
      } catch (sendErr) {
        console.error(`Expiry reminder failed for ${owner}:`, sendErr.message);
      }
    }

    return Response.json({
      success: true,
      organizationsChecked: activeSubs.length,
      emailsSent,
      skipped,
    });
  } catch (error) {
    console.error('sendBusinessExpiryReminders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});