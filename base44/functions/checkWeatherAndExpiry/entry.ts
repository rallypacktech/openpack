import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Scheduled function: checks NWS weather alerts and supply expiration for all users.
 * Creates in-app Notification records always.
 * Sends email only if user has notification_method "email" or "both".
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only or automation-only
    const authHeader = req.headers.get("authorization") || "";
    let isAutomation = authHeader.includes("automation") || authHeader.includes("service");

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
            body: `Hi,\n\n${msg}\n\nLog in to RallyPack to update your cache.\n\nStay prepared,\nThe RallyPack Team`,
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
            body: `Hi,\n\n${msg}\n\nLog in to RallyPack to review and restock.\n\nStay prepared,\nThe RallyPack Team`,
          });
          emailsSent++;
        }
      }

      // ── 2. Weather alerts check via NWS ──
      if (!profile.latitude || !profile.longitude) continue;
      if (!alertSettings.severe_weather && !alertSettings.tornado && !alertSettings.flood && !alertSettings.hurricane) continue;

      try {
        const nwsPoint = await fetch(
          `https://api.weather.gov/points/${profile.latitude},${profile.longitude}`,
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
              body: `Weather Alert for your area:\n\n${headline}\n\n${desc}\n\nStay safe,\nThe RallyPack Team`,
            });
            emailsSent++;
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
      usersChecked: profiles.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});