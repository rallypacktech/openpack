import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function latestDate(a, b) {
  if (!a) return b;
  if (!b) return a;
  return new Date(a) > new Date(b) ? a : b;
}
function earliestDate(a, b) {
  if (!a) return b;
  if (!b) return a;
  return new Date(a) < new Date(b) ? a : b;
}

// Recompute a kept record's merged fields from its pre-merge snapshot plus the
// snapshots of records that are STILL soft-deleted (i.e. excluding restored ones),
// using the same largest/latest/earliest precedence as the original merge.
function recomputeKept(keptSnap, stillDeletedSnaps) {
  const allSnaps = [keptSnap, ...stillDeletedSnaps];
  const maxHa = Math.max(...allSnaps.map((s) => s.hectares_burned || 0));
  const maxHaSnap = allSnaps.reduce((best, s) => (!best || (s.hectares_burned || 0) > (best.hectares_burned || 0)) ? s : best, null);

  let latestC = keptSnap.containment_date || null;
  let latestE = keptSnap.end_date || null;
  let earliestS = keptSnap.start_date || null;
  for (const s of stillDeletedSnaps) {
    latestC = latestDate(latestC, s.containment_date || null);
    latestE = latestDate(latestE, s.end_date || null);
    earliestS = earliestDate(earliestS, s.start_date || null);
  }
  const allOrgs = new Set([...(keptSnap.responding_organizations || [])]);
  stillDeletedSnaps.forEach((s) => (s.responding_organizations || []).forEach((o) => allOrgs.add(o)));

  const updateData = {
    hectares_burned: maxHa,
    responding_organizations: Array.from(allOrgs),
  };
  if (maxHaSnap && maxHaSnap.acres_burned != null) updateData.acres_burned = maxHaSnap.acres_burned;
  if (latestC) updateData.containment_date = latestC;
  if (latestE) updateData.end_date = latestE;
  if (earliestS) updateData.start_date = earliestS;
  return updateData;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const log_id = body?.log_id;
    const incident_id = body?.incident_id;
    if (!log_id || !incident_id) return Response.json({ error: 'log_id and incident_id are required' }, { status: 400 });

    const log = await base44.asServiceRole.entities.WildfireMergeLog.get(log_id);
    if (!log) return Response.json({ error: 'Merge log not found' }, { status: 404 });

    const deletedIds = log.deleted_incident_ids || [];
    if (!deletedIds.includes(incident_id)) {
      return Response.json({ error: 'incident_id is not part of this merge' }, { status: 400 });
    }

    // Un-soft-delete the record (its original fields were never overwritten by the merge)
    await base44.asServiceRole.entities.WildfireIncident.update(incident_id, { is_merged_away: false });

    // Recompute the kept record from kept_snapshot + still-soft-deleted snapshots
    const restoredIds = new Set([...(log.restored_incident_ids || []), incident_id]);
    const stillDeletedIndices = deletedIds.map((id, i) => (restoredIds.has(id) ? -1 : i)).filter((i) => i >= 0);
    const stillDeletedSnaps = stillDeletedIndices.map((i) => (log.deleted_snapshots || [])[i]).filter(Boolean);

    const keptSnap = log.kept_snapshot || {};
    const updateData = recomputeKept(keptSnap, stillDeletedSnaps);
    await base44.asServiceRole.entities.WildfireIncident.update(log.kept_incident_id, updateData);

    await base44.asServiceRole.entities.WildfireMergeLog.update(log_id, {
      restored_incident_ids: Array.from(restoredIds),
    });

    return Response.json({
      success: true,
      restored_incident_id: incident_id,
      kept_incident_id: log.kept_incident_id,
      kept_recomputed_fields: Object.keys(updateData),
    });
  } catch (error) {
    console.error('restoreMergedIncident error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}