import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Authorization: admin user OR valid automation secret (for scheduled jobs)
    const automationSecret = Deno.env.get("AUTOMATION_SECRET");
    const providedSecret = req.headers.get("x-automation-secret");
    let isAuthorized = false;
    if (automationSecret && providedSecret) {
      const a = new TextEncoder().encode(automationSecret);
      const b = new TextEncoder().encode(providedSecret);
      if (a.length === b.length) {
        let diff = 0;
        for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
        isAuthorized = diff === 0;
      }
    }
    if (!isAuthorized) {
      try {
        const user = await base44.auth.me();
        isAuthorized = !!(user && user.role === 'admin');
      } catch {
        isAuthorized = false;
      }
    }
    if (!isAuthorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // This runs as a scheduled job — use service role
    const users = await base44.asServiceRole.entities.User.list();
    const requiredItems = await base44.asServiceRole.entities.ProductRecommendation.filter({ is_required: true, active: true });

    if (requiredItems.length === 0) {
      return Response.json({ message: "No required items configured", sent: 0 });
    }

    const today = new Date();
    const thirtyDaysOut = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    let sent = 0;

    for (const user of users) {
      if (!user.email) continue;

      // Get this user's progress records
      const progress = await base44.asServiceRole.entities.UserCacheProgress.filter({ created_by: user.email });
      const progressMap = {};
      progress.forEach(p => { progressMap[p.recommendation_id] = p; });

      // --- Find missing required items ---
      const missingItems = requiredItems.filter(item => {
        const p = progressMap[item.id];
        return !p || (p.status !== "purchased" && p.status !== "manually_added");
      });

      // --- Find expiring soon / expired owned items ---
      const expiringSoon = [];
      const expired = [];
      progress.forEach(p => {
        if (!p.expiration_date) return;
        if (p.status !== "purchased" && p.status !== "manually_added") return;
        const rec = requiredItems.find(r => r.id === p.recommendation_id);
        if (!rec) return;
        const expDate = new Date(p.expiration_date);
        if (expDate < today) {
          expired.push({ name: rec.item_name, date: p.expiration_date });
        } else if (expDate <= thirtyDaysOut) {
          expiringSoon.push({ name: rec.item_name, date: p.expiration_date });
        }
      });

      // Skip if nothing to report
      if (missingItems.length === 0 && expiringSoon.length === 0 && expired.length === 0) {
        continue;
      }

      // Build email body (HTML)
      let body = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#222;"><h1 style="font-size:1.1em;border-bottom:2px solid #222;padding-bottom:8px;">RallyPack</h1><h2 style="font-size:1em;">Monthly Emergency Preparedness Update</h2><p>Hi ${user.full_name || "there"},</p>`;

      if (expired.length > 0) {
        body += `<p><strong>🚨 EXPIRED ITEMS — replace these now:</strong><br>`;
        expired.forEach(i => { body += `• ${i.name} (expired ${new Date(i.date).toLocaleDateString()})<br>`; });
        body += `</p>`;
      }

      if (expiringSoon.length > 0) {
        body += `<p><strong>⚠️ EXPIRING SOON — replace within 30 days:</strong><br>`;
        expiringSoon.forEach(i => { body += `• ${i.name} (expires ${new Date(i.date).toLocaleDateString()})<br>`; });
        body += `</p>`;
      }

      if (missingItems.length > 0) {
        body += `<p><strong>📦 MISSING ESSENTIALS — ${missingItems.length} recommended item${missingItems.length !== 1 ? "s" : ""} not yet in your inventory:</strong><br>`;
        missingItems.slice(0, 10).forEach(i => { body += `• ${i.item_name} (${i.category})<br>`; });
        if (missingItems.length > 10) body += `… and ${missingItems.length - 10} more.<br>`;
        body += `</p>`;
      }

      body += `<p><a href="https://rallypack.tech/Shopping" style="color:#222;">Shop now and mark items as owned</a></p><p>Stay safe,<br>The RallyPack Team</p><hr style="margin-top:30px;border:1px solid #ccc;"><p style="font-size:0.85em;color:#555;">You received this because you have a RallyPack account. To stop these reminders, update your notification settings.</p></body></html>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        from_name: "RallyPack",
        subject: `Your monthly emergency preparedness checklist update`,
        body,
        is_html: true
      });

      sent++;
    }

    return Response.json({ message: "Done", sent, total_users: users.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});