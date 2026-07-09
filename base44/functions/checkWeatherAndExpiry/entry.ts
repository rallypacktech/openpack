import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Constant-time string comparison to prevent timing side-channel attacks on secret checks.
function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const bufA = enc.encode(String(a));
  const bufB = enc.encode(String(b));
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) {
    diff |= bufA[i] ^ bufB[i];
  }
  return diff === 0;
}

/**
 * Scheduled function: checks NWS weather alerts and supply expiration for all users.
 * Creates in-app Notification records always.
 * Sends email only if user has notification_method "email" or "both".
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only or automation-only (verified via shared secret from env — no hardcoded fallback).
    // Timing-safe comparison prevents auth-bypass via timing side-channels on the secret.
    const AUTOMATION_SECRET = Deno.env.get("AUTOMATION_SECRET");
    const body = await req.json().catch(() => ({}));
    const isAutomation = AUTOMATION_SECRET && timingSafeEqual(body.automation_secret, AUTOMATION_SECRET);

    if (!isAutomation) {
      const user = await base44.auth.me();
      if (user?.role !== "admin") {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    const allItems = await base44.asServiceRole.entities.CacheItem.list();
    const allFirstAid = await base44.asServiceRole.entities.FirstAidItem.list();

    const now = new Date();
    const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    let notificationsCreated = 0;
    let emailsSent = 0;
    let telegramPushed = 0;

    for (const profile of profiles) {
      const userEmail = profile.created_by;
      const wantsEmail = profile.notification_method === "email" || profile.notification_method === "both";
      const alertSettings = profile.alert_settings || {};

      // ── 1. Supply expiration check ──
      const userItems = allItems.filter(i => i.created_by === userEmail);
      const userFirstAid = allFirstAid.filter(i => i.created_by === userEmail);
      const allUserItems = [...userItems, ...userFirstAid];

      const expiringSoon = allUserItems.filter(item => {
        if (!item.expiration_date) return false;
        const exp = new Date(item.expiration_date);
        return exp >= now && exp <= soon;
      });

      const alreadyExpired = allUserItems.filter(item => {
        if (!item.expiration_date) return false;
        return new Date(item.expiration_date) < now;
      });

      if (alreadyExpired.length > 0) {
        const itemNames = alreadyExpired.map(i => i.item_name || i.name).slice(0, 3).join(", ");
        const msg = `${alreadyExpired.length} item(s) have expired: ${itemNames}${alreadyExpired.length > 3 ? " and more" : ""}. Replace them to keep your cache ready.`;

        await base44.asServiceRole.entities.Notification.create({
          title: "⚠️ Expired Supplies",
          message: msg,
          type: "alert",
          read: false,
          created_by: userEmail,
        });
        notificationsCreated++;

        if (wantsEmail) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: userEmail,
            subject: "RallyPack: You have expired emergency supplies",
            body: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#222;"><h1 style="font-size:1.1em;border-bottom:2px solid #222;padding-bottom:8px;">RallyPack</h1><h2 style="font-size:1em;">&#9888; Expired Emergency Supplies</h2><p>${msg}</p><p><a href="https://rallypack.tech/Resources" style="color:#222;">Log in to RallyPack to update your cache.</a></p><p>Stay prepared,<br>The RallyPack Team</p><hr style="margin-top:30px;border:1px solid #ccc;"><p style="font-size:0.85em;color:#555;">You received this because you have a RallyPack account. Update your notification settings to stop these alerts.</p></body></html>`,
            is_html: true,
          });
          emailsSent++;
        }
      } else if (expiringSoon.length > 0) {
        const itemNames = expiringSoon.map(i => i.item_name || i.name).slice(0, 3).join(", ");
        const msg = `${expiringSoon.length} item(s) expire within 30 days: ${itemNames}${expiringSoon.length > 3 ? " and more" : ""}. Plan to restock soon.`;

        await base44.asServiceRole.entities.Notification.create({
          title: "🕐 Supplies Expiring Soon",
          message: msg,
          type: "warning",
          read: false,
          created_by: userEmail,
        });
        notificationsCreated++;

        if (wantsEmail) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: userEmail,
            subject: "RallyPack: Some emergency supplies are expiring soon",
            body: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#222;"><h1 style="font-size:1.1em;border-bottom:2px solid #222;padding-bottom:8px;">RallyPack</h1><h2 style="font-size:1em;">&#128336; Supplies Expiring Soon</h2><p>${msg}</p><p><a href="https://rallypack.tech/Resources" style="color:#222;">Log in to RallyPack to review and restock.</a></p><p>Stay prepared,<br>The RallyPack Team</p><hr style="margin-top:30px;border:1px solid #ccc;"><p style="font-size:0.85em;color:#555;">You received this because you have a RallyPack account. Update your notification settings to stop these alerts.</p></body></html>`,
            is_html: true,
          });
          emailsSent++;
        }
      }

      // ── 2. Weather alerts check via NWS ──
      if (!profile.latitude || !profile.longitude) continue;
      if (!alertSettings.severe_weather && !alertSettings.tornado && !alertSettings.flood && !alertSettings.hurricane) continue;

      try {
        // Round coordinates to ~1km precision for privacy before sending to third-party API
        const roundedLat = Math.round(profile.latitude * 100) / 100;
        const roundedLon = Math.round(profile.longitude * 100) / 100;
        const nwsPoint = await fetch(
          `https://api.weather.gov/points/${roundedLat},${roundedLon}`,
          { headers: { "User-Agent": "RallyPack/1.0 (beta@rallypack.org)" } }
        );
        if (!nwsPoint.ok) continue;

        const pointData = await nwsPoint.json();
        const zone = pointData.properties?.county || pointData.properties?.forecastZone;
        if (!zone) continue;

        const zoneId = zone.split("/").pop();
        const alertsResp = await fetch(
          `https://api.weather.gov/alerts/active?zone=${zoneId}`,
          { headers: { "User-Agent": "RallyPack/1.0 (beta@rallypack.org)" } }
        );
        if (!alertsResp.ok) continue;

        const alertsData = await alertsResp.json();
        const activeAlerts = (alertsData.features || []).filter(a => {
          const event = (a.properties?.event || "").toLowerCase();
          if (alertSettings.tornado && (event.includes("tornado"))) return true;
          if (alertSettings.flood && (event.includes("flood"))) return true;
          if (alertSettings.hurricane && (event.includes("hurricane") || event.includes("tropical"))) return true;
          if (alertSettings.severe_weather && (event.includes("severe") || event.includes("thunderstorm") || event.includes("wind"))) return true;
          return false;
        });

        for (const alert of activeAlerts.slice(0, 2)) {
          const props = alert.properties;
          const headline = props.headline || props.event;
          const desc = (props.description || "").slice(0, 300);

          // Avoid duplicate notifications (check if we created one for this alert recently)
          const existing = await base44.asServiceRole.entities.Notification.filter({
            created_by: userEmail,
            title: `🌩️ ${props.event}`,
          });
          // Simple dedup: skip if a notification with same title was created in last 6h
          const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
          const recentDuplicate = existing.some(n => new Date(n.created_date) > sixHoursAgo);
          if (recentDuplicate) continue;

          await base44.asServiceRole.entities.Notification.create({
            title: `🌩️ ${props.event}`,
            message: headline + (desc ? `\n\n${desc}` : ""),
            type: "alert",
            read: false,
            created_by: userEmail,
          });
          notificationsCreated++;

          if (wantsEmail) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: userEmail,
              subject: `RallyPack Weather Alert: ${props.event}`,
              body: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#222;"><h1 style="font-size:1.1em;border-bottom:2px solid #222;padding-bottom:8px;">RallyPack</h1><h2 style="font-size:1em;">&#127785; Weather Alert for Your Area</h2><p><strong>${headline}</strong></p><p>${desc}</p><p>Stay safe,<br>The RallyPack Team</p><hr style="margin-top:30px;border:1px solid #ccc;"><p style="font-size:0.85em;color:#555;">You received this because you have a RallyPack account. Update your notification settings to stop these alerts.</p></body></html>`,
              is_html: true,
            });
            emailsSent++;
          }

          // Push critical weather alert via Telegram if connected
          if (profile.telegram_chat_id) {
            try {
              await base44.asServiceRole.functions.invoke('sendTelegramAlert', {
                message: `${headline}${desc ? '\n\n' + desc : ''}`,
                event_type: props.event,
                original_event_time: props.sent ? new Date(props.sent).toISOString() : new Date().toISOString(),
                user_email: userEmail,
                secret: AUTOMATION_SECRET
              });
              telegramPushed++;
            } catch (tgErr) {
              console.error(`Telegram delivery failed for ${userEmail}:`, tgErr.message);
            }
          }
        }
      } catch (weatherErr) {
        console.error(`Weather check failed for ${userEmail}:`, weatherErr.message);
      }
    }

    return Response.json({
      success: true,
      notificationsCreated,
      emailsSent,
      telegramPushed,
      usersChecked: profiles.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});