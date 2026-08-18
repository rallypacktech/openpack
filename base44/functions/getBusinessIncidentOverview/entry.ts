import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Business-facing, read-only aggregate of wildfire data.
// Surfaces totals + merge-audit + NIFC freshness without exposing admin-only
// entities (WildfireMergeLog, WildfireImportLog) directly to business users.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Global wildfire totals — exclude soft-deleted (merged-away) records.
    // Most recent 2000 keeps the call lightweight; full per-country accuracy
    // lives in the admin-only getWildfireStats function.
    const incidents = await base44.asServiceRole.entities.WildfireIncident.list('-start_date', 2000);

    let totalIncidents = 0;
    let totalHectares = 0;
    let totalStructures = 0;
    let totalFatalities = 0;
    let mostRecent = null;
    const territoriesSet = new Set();
    const byArea = {};
    const currentYear = new Date().getFullYear();
    let usSeasonIncidents = 0;
    let usSeasonAcres = 0;
    let usSeasonHectares = 0;

    for (const inc of incidents) {
      if (inc.is_merged_away) continue;
      totalIncidents++;
      totalHectares += inc.hectares_burned || 0;
      totalStructures += inc.structures_destroyed || 0;
      totalFatalities += inc.fatalities || 0;
      if (inc.admin1_name) territoriesSet.add(inc.admin1_name);
      if (inc.start_date) {
        const y = parseInt(String(inc.start_date).substring(0, 4), 10);
        if (y === currentYear && inc.country_code === 'US') {
          usSeasonIncidents++;
          usSeasonAcres += inc.acres_burned || 0;
          usSeasonHectares += inc.hectares_burned || 0;
        }
        if (!mostRecent || inc.start_date > mostRecent) mostRecent = inc.start_date;
      }
      const key = `${inc.admin2_name || '?'}, ${inc.admin1_name || '?'}`;
      byArea[key] = (byArea[key] || 0) + 1;
    }

    let topArea = null;
    let topAreaCount = 0;
    for (const [k, v] of Object.entries(byArea)) {
      if (v > topAreaCount) { topAreaCount = v; topArea = k; }
    }

    // Merge-audit summary (admin-only entity → aggregate only).
    let mergeAudit = {
      total_merges: 0,
      double_counted_fires: 0,
      continuing_incident_double_counts: 0,
      net_hectares_corrected: 0,
    };
    try {
      const logs = await base44.asServiceRole.entities.WildfireMergeLog.list('-merged_at', 500);
      let doubleCounted = 0;
      let continuing = 0;
      let netHectares = 0;
      for (const log of logs) {
        doubleCounted += (log.deleted_incident_ids || []).length;
        if ((log.hectares_delta || 0) > 0 || (log.containment_date_diff_days || 0) > 0) continuing++;
        netHectares += log.hectares_delta || 0;
      }
      mergeAudit = {
        total_merges: logs.length,
        double_counted_fires: doubleCounted,
        continuing_incident_double_counts: continuing,
        net_hectares_corrected: Math.round(netHectares),
      };
    } catch (e) {
      console.error('merge log read failed:', e);
    }

    // NIFC freshness — timestamp of the most recent NIFC import.
    let nifcLastImportedAt = null;
    try {
      const logs = await base44.asServiceRole.entities.WildfireImportLog.filter({ source: 'NIFC' });
      let latest = null;
      for (const log of logs) {
        if (log.imported_at && (!latest || new Date(log.imported_at) > new Date(latest))) {
          latest = log.imported_at;
        }
      }
      nifcLastImportedAt = latest;
    } catch (e) {
      console.error('import log read failed:', e);
    }

    return Response.json({
      stats: {
        total_incidents: totalIncidents,
        total_hectares: Math.round(totalHectares),
        total_structures: totalStructures,
        total_fatalities: totalFatalities,
        distinct_territories: territoriesSet.size,
        most_recent_date: mostRecent,
        top_area: topArea,
        top_area_count: topAreaCount,
      },
      us_season: {
        year: currentYear,
        incidents: usSeasonIncidents,
        acres: Math.round(usSeasonAcres),
        hectares: Math.round(usSeasonHectares),
      },
      merge_audit: mergeAudit,
      nifc: { last_imported_at: nifcLastImportedAt },
      based_on_record_count: incidents.length,
    });
  } catch (error) {
    console.error('getBusinessIncidentOverview error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}