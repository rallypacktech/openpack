import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { COUNTRY_NAMES } from '../../shared/wildfireCountries.ts';
import {
  haversine,
  datesWithinDays,
  namesMatch,
  directionsDiffer,
  acresBothPresentAndMatch,
} from '../../shared/wildfireDedup.ts';

// A pair is a "continuing incident" double-count if hectares differ (>10%) OR
// containment date differs — i.e. the same fire re-reported as it grew.
function isContinuingPair(a, b) {
  const haA = a.hectares_burned || 0, haB = b.hectares_burned || 0;
  const haDiffer = (haA && haB)
    ? Math.abs(haA - haB) > Math.max(haA, haB) * 0.10
    : (!!haA !== !!haB);
  const cDiffer = (a.containment_date || '') !== (b.containment_date || '');
  return haDiffer || cDiffer;
}

function isDupCandidate(a, b) {
  if (namesMatch(a.incident_name, b.incident_name)) return true;
  if (directionsDiffer(a.incident_name, b.incident_name)) return acresBothPresentAndMatch(a.acres_burned, b.acres_burned);
  return acresBothPresentAndMatch(a.acres_burned, b.acres_burned);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const since = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    let logs = [];
    try { logs = await base44.asServiceRole.entities.WildfireImportLog.list('-imported_at', 500); } catch (e) { /* entity may not exist */ }
    const recentCodes = new Set();
    for (const l of logs) {
      if (l.imported_at && new Date(l.imported_at) >= since && l.country_code) recentCodes.add(l.country_code);
    }
    const codes = Array.from(recentCodes);

    const perCountry = [];
    let totalDoubleCounted = 0;

    for (const code of codes) {
      const incs = await base44.asServiceRole.entities.WildfireIncident.filter({ country_code: code });
      const active = incs.filter((i) => !i.is_merged_away);

      const pairs = [];
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          const a = active[i], b = active[j];
          const nameSame = namesMatch(a.incident_name, b.incident_name);
          const geoClose = a.latitude && b.latitude && haversine(a.latitude, a.longitude, b.latitude, b.longitude) <= 10;
          const datesClose = datesWithinDays(a.start_date, b.start_date);
          let candidate = false;
          if (nameSame && datesClose) candidate = true;
          else if (geoClose && datesClose && isDupCandidate(a, b)) candidate = true;
          if (!candidate) continue;
          if (!isContinuingPair(a, b)) continue;
          pairs.push({
            a: { id: a.id, name: a.incident_name, start: a.start_date, hectares: a.hectares_burned, containment: a.containment_date, source: a.source },
            b: { id: b.id, name: b.incident_name, start: b.start_date, hectares: b.hectares_burned, containment: b.containment_date, source: b.source },
          });
        }
      }
      totalDoubleCounted += pairs.length;
      perCountry.push({
        country_code: code,
        country_name: COUNTRY_NAMES[code] || code,
        double_counted: pairs.length,
        pairs,
      });
    }

    return Response.json({
      success: true,
      audited_countries: codes.length,
      total_double_counted: totalDoubleCounted,
      per_country: perCountry,
      audited_at: new Date().toISOString(),
      note: 'Estimate from currently-present records in countries imported in the last 10 days. Previously hard-deleted merges cannot be recovered from the database; this counts double-count pairs still present in recent imports (same fire re-reported as it grew).',
    });
  } catch (error) {
    console.error('backfillMergeAudit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}