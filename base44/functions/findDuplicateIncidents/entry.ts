import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  normalizeName,
  haversine,
  datesWithinDays,
  isDuplicateCandidate,
} from '../../shared/wildfireDedup.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const all = await base44.asServiceRole.entities.WildfireIncident.list('-start_date', 1000);
    // Exclude already-soft-deleted records from duplicate scanning
    const active = all.filter((inc) => !inc.is_merged_away);

    // Group by normalized name + state, then cluster by date proximity
    const nameGroups = {};
    active.forEach((inc) => {
      const normName = normalizeName(inc.incident_name);
      const state = (inc.admin1_name || '').toLowerCase().trim();
      const key = `${normName}_${state}`;
      if (!normName) return;
      if (!nameGroups[key]) nameGroups[key] = [];
      nameGroups[key].push(inc);
    });

    const nameDups = [];
    Object.values(nameGroups).forEach((group) => {
      if (group.length <= 1) return;
      const clusters = [];
      for (const inc of group) {
        let placed = false;
        for (const cluster of clusters) {
          if (cluster.some((c) => datesWithinDays(c.start_date, inc.start_date))) {
            cluster.push(inc);
            placed = true;
            break;
          }
        }
        if (!placed) clusters.push([inc]);
      }
      clusters.forEach((c) => { if (c.length > 1) nameDups.push(c); });
    });

    const alreadyGrouped = new Set();
    nameDups.forEach((g) => g.forEach((inc) => alreadyGrouped.add(inc.id)));

    const geoGroups = [];
    const ungrouped = active.filter((inc) => !alreadyGrouped.has(inc.id) && inc.latitude && inc.longitude);
    for (let i = 0; i < ungrouped.length; i++) {
      for (let j = i + 1; j < ungrouped.length; j++) {
        const dist = haversine(ungrouped[i].latitude, ungrouped[i].longitude, ungrouped[j].latitude, ungrouped[j].longitude);
        if (dist <= 10 && datesWithinDays(ungrouped[i].start_date, ungrouped[j].start_date) && isDuplicateCandidate(ungrouped[i], ungrouped[j])) {
          let group = geoGroups.find((g) => g.some((inc) => inc.id === ungrouped[i].id || inc.id === ungrouped[j].id));
          if (!group) { group = []; geoGroups.push(group); }
          if (!group.find((inc) => inc.id === ungrouped[i].id)) group.push(ungrouped[i]);
          if (!group.find((inc) => inc.id === ungrouped[j].id)) group.push(ungrouped[j]);
        }
      }
    }

    function formatIncident(inc) {
      return {
        id: inc.id,
        incident_name: inc.incident_name,
        admin1_name: inc.admin1_name,
        admin2_name: inc.admin2_name,
        start_date: inc.start_date,
        containment_date: inc.containment_date,
        end_date: inc.end_date,
        acres_burned: inc.acres_burned,
        hectares_burned: inc.hectares_burned,
        severity: inc.severity,
        source: inc.source,
        cause: inc.cause,
        latitude: inc.latitude,
        longitude: inc.longitude,
        notes: inc.notes,
        responding_organizations: inc.responding_organizations,
        structures_destroyed: inc.structures_destroyed,
        fatalities: inc.fatalities,
        county_territory_id: inc.county_territory_id,
      };
    }

    const allGroups = [
      ...nameDups.map((g) => ({ match_type: 'name', count: g.length, incidents: g.map(formatIncident) })),
      ...geoGroups.map((g) => ({ match_type: 'geo', count: g.length, incidents: g.map(formatIncident) })),
    ];

    return Response.json({
      success: true,
      total_records: active.length,
      duplicate_groups: allGroups,
      total_groups: allGroups.length,
      total_duplicates: allGroups.reduce((s, g) => s + g.count - 1, 0),
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('findDuplicateIncidents error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}