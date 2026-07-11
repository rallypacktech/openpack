import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Fetch AEMET (Spain's meteorological agency) weather alerts and create
// in-app notifications for RallyPack users who live in Spain.
// Uses LLM with internet context to extract current active alerts from AEMET.

function isSpainUser(profile) {
  const country = (profile.country || '').toLowerCase().trim();
  return country === 'spain' || country === 'españa' || country === 'es' || country === 'esp';
}

function getNotificationType(severity) {
  const s = (severity || '').toLowerCase();
  if (s === 'extreme') return 'alert';
  if (s === 'severe' || s === 'moderate') return 'warning';
  return 'info';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const srBase44 = base44.asServiceRole;

    // 1. Load all user profiles in Spain
    const profiles = await srBase44.entities.UserProfile.list();
    const spainProfiles = profiles.filter(isSpainUser);

    if (spainProfiles.length === 0) {
      return Response.json({ message: 'No Spanish users found.', processed: 0 });
    }

    // 2. Fetch current AEMET alerts using LLM with internet context
    const llmResponse = await srBase44.integrations.Core.InvokeLLM({
      prompt: `Search for and extract the current active weather alerts issued by AEMET (Agencia Estatal de Meteorología) for Spain today. Check https://www.aemet.es/es/eltiempo/prediccion/avisos for active warnings. Extract all active alerts and return them as structured data. For each alert, provide: the weather phenomenon (event), severity level (Minor, Moderate, Severe, or Extreme), the geographic zone affected (area), a brief description, and expiration date if available. Only include alerts that are currently active. If no alerts are active, return an empty alerts array.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: "object",
        properties: {
          alerts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                event: { type: "string", description: "Weather phenomenon, e.g. Maximum temperatures, Wind, Rain" },
                severity: { type: "string", description: "Minor, Moderate, Severe, or Extreme" },
                area: { type: "string", description: "Geographic zone affected" },
                description: { type: "string", description: "Brief description of the alert" },
                expires: { type: "string", description: "ISO date or null" }
              }
            }
          }
        }
      }
    });

    const alerts = (llmResponse && Array.isArray(llmResponse.alerts)) ? llmResponse.alerts : [];

    if (alerts.length === 0) {
      return Response.json({
        success: true,
        message: 'No active AEMET alerts found.',
        spanish_users: spainProfiles.length,
        alerts_found: 0,
        alerts_created: 0,
      });
    }

    // 3. Load existing AEMET notifications to avoid duplicates
    const existingNotifs = await srBase44.entities.Notification.list();
    const existingKeys = new Set(
      existingNotifs
        .filter(n => n.title && n.title.startsWith('[aemet_'))
        .map(n => {
          const match = n.title.match(/^\[aemet_([^\]]+)\]/);
          return match ? `aemet_${match[1]}` : null;
        })
        .filter(Boolean)
    );

    let totalCreated = 0;
    const errors = [];

    // 4. Create notifications for each alert, for each Spanish user
    for (const alert of alerts) {
      // Build a dedup key from event + area
      const alertId = `${alert.event}_${alert.area}`.replace(/\s+/g, '_').slice(0, 60);
      const key = `aemet_${alertId}`;

      if (existingKeys.has(key)) continue;

      // Skip expired alerts
      if (alert.expires && new Date(alert.expires) < new Date()) continue;

      const type = getNotificationType(alert.severity);
      const shortDesc = (alert.description || alert.event || 'AEMET weather alert').slice(0, 350);
      const expiresNote = alert.expires
        ? ` Caduca: ${new Date(alert.expires).toLocaleString('es-ES')}.`
        : '';

      for (const profile of spainProfiles) {
        try {
          await srBase44.entities.Notification.create({
            title: `[aemet_${alertId}] AEMET: ${alert.event}`.slice(0, 200),
            message: (`${shortDesc}\n\nZona: ${alert.area}\nSeveridad: ${alert.severity}${expiresNote}`).slice(0, 500),
            type,
            read: false,
            created_by: profile.created_by,
            recipient_email: profile.created_by,
            original_event_time: new Date().toISOString(),
            delivery_channel: 'in_app',
            delivery_status: 'delivered',
          });
          totalCreated++;
        } catch (e) {
          errors.push({ profile_id: profile.id, error: e.message });
        }
      }
      existingKeys.add(key);
    }

    return Response.json({
      success: true,
      spanish_users: spainProfiles.length,
      alerts_found: alerts.length,
      alerts_created: totalCreated,
      errors,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});