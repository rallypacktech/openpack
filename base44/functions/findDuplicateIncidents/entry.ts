import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const all = await base44.asServiceRole.entities.WildfireIncident.list("-start_date", 1000);

    function normalizeName(name) {
      return (name || '').toLowerCase()
        .replace(/\s*fire\s*$/i, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function haversine(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    // Two fires in the same location with different start dates are SEPARATE fires.
    // Only consider them duplicates if start dates are within 7 days of each other
    // (allows for source reporting delays while excluding different time frames).
    const DATE_PROXIMITY_DAYS = 7;
    function datesWithinDays(d1, d2) {
      if (!d1 || !d2) return true; // missing date = can't confirm different, allow grouping
      const diff = Math.abs(new Date(d1).getTime() - new Date(d2).getTime());
      return diff <= DATE_PROXIMITY_DAYS * 24 * 60 * 60 * 1000;
    }

    // Two records are only duplicates if EITHER the name matches OR the acres match.
    // If both differ, they are separate fires — keep both, don't group.
    function acresMatch(a1, a2) {
      if (!a1 && !a2) return true; // both missing = can't confirm different
      if (!a1 || !a2) return false; // one missing = don't assume match
      const tolerance = Math.max(a1, a2) * 0.10;
      return Math.abs(a1 - a2) <= tolerance;
    }

    function namesMatch(n1, n2) {
      return normalizeName(n1) === normalizeName(n2);
    }

    function isDuplicateCandidate(inc1, inc2) {
      return namesMatch(inc1.incident_name, inc2.incident_name) ||
             acresMatch(inc1.acres_burned, inc2.acres_burned);
    }

    // Group by normalized name + state, then cluster by date proximity
    const nameGroups = {};
    all.forEach(inc => {
      const normName = normalizeName(inc.incident_name);
      const state = (inc.admin1_name || '').toLowerCase().trim();
      const key = `${normName}_${state}`;
      if (!normName) return;
      if (!nameGroups[key]) nameGroups[key] = [];
      nameGroups[key].push(inc);
    });

    // Within each name+state group, split into sub-clusters by date proximity
    const nameDups = [];
    Object.values(nameGroups).forEach(group => {
      if (group.length <= 1) return;
      const clusters = [];
      for (const inc of group) {
        let placed = false;
        for (const cluster of clusters) {
          if (cluster.some(c => datesWithinDays(c.start_date, inc.start_date))) {
            cluster.push(inc);
            placed = true;
            break;
          }
        }
        if (!placed) clusters.push([inc]);
      }
      clusters.forEach(c => { if (c.length > 1) nameDups.push(c); });
    });

    // Track which IDs are already grouped by name
    const alreadyGrouped = new Set();
    nameDups.forEach(g => g.forEach(inc => alreadyGrouped.add(inc.id)));

    // Find geo-based duplicates (within 10km, not already name-grouped)
    const geoGroups = [];
    const ungrouped = all.filter(inc => !alreadyGrouped.has(inc.id) && inc.latitude && inc.longitude);

    for (let i = 0; i < ungrouped.length; i++) {
      for (let j = i + 1; j < ungrouped.length; j++) {
        const dist = haversine(ungrouped[i].latitude, ungrouped[i].longitude, ungrouped[j].latitude, ungrouped[j].longitude);
        if (dist <= 10 && datesWithinDays(ungrouped[i].start_date, ungrouped[j].start_date) && isDuplicateCandidate(ungrouped[i], ungrouped[j])) {
          let group = geoGroups.find(g => g.some(inc => inc.id === ungrouped[i].id || inc.id === ungrouped[j].id));
          if (!group) { group = []; geoGroups.push(group); }
          if (!group.find(inc => inc.id === ungrouped[i].id)) group.push(ungrouped[i]);
          if (!group.find(inc => inc.id === ungrouped[j].id)) group.push(ungrouped[j]);
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
      ...nameDups.map(g => ({ match_type: 'name', count: g.length, incidents: g.map(formatIncident) })),
      ...geoGroups.map(g => ({ match_type: 'geo', count: g.length, incidents: g.map(formatIncident) })),
    ];

    return Response.json({
      success: true,
      total_records: all.length,
      duplicate_groups: allGroups,
      total_groups: allGroups.length,
      total_duplicates: allGroups.reduce((s, g) => s + g.count - 1, 0),
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('findDuplicateIncidents error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});