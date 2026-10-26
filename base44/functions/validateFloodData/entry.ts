import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { loadActiveFloods, yearOf } from '../../shared/floodSources.ts';

// Admin-only, read-only validation report over the flood dataset. Flags
// suspected issues with record IDs so the admin can act through the flood
// cleanup tools. Never writes.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const records = await loadActiveFloods(base44, { fields: null });
    const currentYear = new Date().getUTCFullYear();

    const missingStartDate = [];
    const missingGeo = [];
    const missingSourceId = [];
    const noImpactFigures = [];
    const futureDates = [];
    const tooOld = [];
    const hugeDamage = [];
    const missingCountry = [];
    const hurricaneTagged = [];
    const duplicatesBySource = new Map();

    for (const r of records) {
      const year = yearOf(r.start_date);
      const damage = Number(r.damage_usd) || 0;

      if (!r.start_date) missingStartDate.push({ id: r.id, event_name: r.event_name });
      if (!r.admin1_name && !(r.latitude && r.longitude)) {
        missingGeo.push({ id: r.id, event_name: r.event_name, country: r.country_code });
      }
      if (!r.source_record_id) missingSourceId.push({ id: r.id, event_name: r.event_name, source: r.source });
      if (!r.deaths && !damage && !r.affected_people) {
        noImpactFigures.push({ id: r.id, event_name: r.event_name, source: r.source });
      }
      if (year && year > currentYear) futureDates.push({ id: r.id, event_name: r.event_name, start_date: r.start_date });
      if (year && year < 2015) tooOld.push({ id: r.id, event_name: r.event_name, start_date: r.start_date });
      if (damage > 50000000000) hugeDamage.push({ id: r.id, event_name: r.event_name, damage_usd: damage });
      if (!r.country_code) missingCountry.push({ id: r.id, event_name: r.event_name });
      if (r.hurricane_related || r.hazard_type === 'hurricane_flood') {
        hurricaneTagged.push({ id: r.id, event_name: r.event_name, start_date: r.start_date });
      }
      if (r.source_record_id) {
        const key = `${r.source}:${r.source_record_id}`;
        const list = duplicatesBySource.get(key) || [];
        list.push({ id: r.id, event_name: r.event_name });
        duplicatesBySource.set(key, list);
      }
    }

    const duplicateGroups = [...duplicatesBySource.entries()]
      .filter(([, list]) => list.length > 1)
      .map(([key, list]) => ({ key, count: list.length, records: list }));

    return Response.json({
      summary: {
        total_active: records.length,
        missing_start_date: missingStartDate.length,
        missing_geo: missingGeo.length,
        missing_source_id: missingSourceId.length,
        no_impact_figures: noImpactFigures.length,
        future_dates: futureDates.length,
        before_2015: tooOld.length,
        damage_outliers: hugeDamage.length,
        missing_country: missingCountry.length,
        hurricane_tagged: hurricaneTagged.length,
        duplicate_groups: duplicateGroups.length,
      },
      missing_start_date: missingStartDate.slice(0, 200),
      missing_geo: missingGeo.slice(0, 200),
      missing_source_id: missingSourceId.slice(0, 200),
      no_impact_figures: noImpactFigures.slice(0, 200),
      future_dates: futureDates.slice(0, 200),
      before_2015: tooOld.slice(0, 200),
      damage_outliers: hugeDamage.slice(0, 200),
      missing_country: missingCountry.slice(0, 200),
      hurricane_tagged: hurricaneTagged.slice(0, 200),
      duplicate_groups: duplicateGroups.slice(0, 100),
      data_as_of: new Date().toISOString(),
    });
  } catch (error) {
    console.error('validateFloodData error:', error?.message, error?.stack);
    return Response.json({ error: error?.message || 'Validation failed' }, { status: 500 });
  }
}