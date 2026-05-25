import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

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

      // Build email body
      let body = `Hi ${user.full_name || "there"},\n\nHere's your monthly emergency preparedness update from RallyPack:\n\n`;

      if (expired.length > 0) {
        body += `🚨 EXPIRED ITEMS — replace these now:\n`;
        expired.forEach(i => { body += `  • ${i.name} (expired ${new Date(i.date).toLocaleDateString()})\n`; });
        body += "\n";
      }

      if (expiringSoon.length > 0) {
        body += `⚠️ EXPIRING SOON — replace within 30 days:\n`;
        expiringSoon.forEach(i => { body += `  • ${i.name} (expires ${new Date(i.date).toLocaleDateString()})\n`; });
        body += "\n";
      }

      if (missingItems.length > 0) {
        body += `📦 MISSING ESSENTIALS — ${missingItems.length} recommended item${missingItems.length !== 1 ? "s" : ""} not yet in your inventory:\n`;
        missingItems.slice(0, 10).forEach(i => { body += `  • ${i.item_name} (${i.category})\n`; });
        if (missingItems.length > 10) body += `  … and ${missingItems.length - 10} more.\n`;
        body += "\n";
      }

      body += `Shop now and mark items as owned at:\nhttps://rallypack.tech/Shopping\n\n`;
      body += `Stay safe,\nThe RallyPack Team\n\n`;
      body += `You received this because you have a RallyPack account. To stop these reminders, update your notification settings.`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        from_name: "RallyPack",
        subject: `Your monthly emergency preparedness checklist update`,
        body
      });

      sent++;
    }

    return Response.json({ message: "Done", sent, total_users: users.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});