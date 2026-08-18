import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const DATE_PROXIMITY_DAYS = 7;

function normalizeName(name) {
  return (name || '').toLowerCase()
    .replace(/\s*fire\s*$/i, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function acresMatch(a1, a2) {
  if (!a1 && !a2) return true;
  if (!a1 || !a2) return false;
  const tolerance = Math.max(a1, a2) * 0.10;
  return Math.abs(a1 - a2) <= tolerance;
}

function daysBetween(d1, d2) {
  if (!d1 || !d2) return null;
  const t = new Date(d2).getTime() - new Date(d1).getTime();
  if (isNaN(t)) return null;
  return Math.round(t / (24 * 60 * 60 * 1000));
}

function snapshot(inc) {
  return {
    incident_name: inc.incident_name,
    start_date: inc.start_date,
    containment_date: inc.containment_date,
    end_date: inc.end_date,
    hectares_burned: inc.hectares_burned,
    acres_burned: inc.acres_burned,
    responding_organizations: inc.responding_organizations || [],
    source: inc.source,
  };
}

function pickMaxHectares(records) {
  let best = null;
  for (const r of records) {
    if (!r) continue;
    if (!best || (r.hectares_burned || 0) > (best.hectares_burned || 0)) best = r;
  }
  return best;
}

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

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const keep_id = body?.keep_id;
    const delete_ids = body?.delete_ids || [];
    const merge_reason = body?.merge_reason || 'admin manual';

    if (!keep_id) return Response.json({ error: 'keep_id is required' }, { status: 400 });
    if (!Array.isArray(delete_ids) || delete_ids.length === 0) return Response.json({ error: 'delete_ids must have at least one ID' }, { status: 400 });
    if (delete_ids.includes(keep_id)) return Response.json({ error: 'keep_id cannot be in delete_ids' }, { status: 400 });

    const keepRecord = await base44.asServiceRole.entities.WildfireIncident.get(keep_id);
    if (!keepRecord) return Response.json({ error: 'Keep record not found' }, { status: 404 });

    const deleteRecords = [];
    for (const id of delete_ids) {
      try {
        const rec = await base44.asServiceRole.entities.WildfireIncident.get(id);
        if (rec) deleteRecords.push(rec);
      } catch (e) {
        console.error(`Failed to fetch record ${id}:`, e);
      }
    }

    // Safety guards: refuse to merge fires that are likely separate, not duplicates.
    for (const rec of deleteRecords) {
      if (keepRecord.start_date && rec.start_date) {
        const diff = Math.abs(new Date(keepRecord.start_date).getTime() - new Date(rec.start_date).getTime());
        if (diff > DATE_PROXIMITY_DAYS * 24 * 60 * 60 * 1000) {
          return Response.json({
            error: `Refused to merge: "${rec.incident_name}" (start ${rec.start_date}) and "${keepRecord.incident_name}" (start ${keepRecord.start_date}) are more than ${DATE_PROXIMITY_DAYS} days apart — these are likely separate fires, not duplicates.`,
          }, { status: 400 });
        }
      }
      const namesSame = normalizeName(keepRecord.incident_name) === normalizeName(rec.incident_name);
      const acresSame = acresMatch(keepRecord.acres_burned, rec.acres_burned);
      if (!namesSame && !acresSame) {
        return Response.json({
          error: `Refused to merge: "${rec.incident_name}" (${rec.acres_burned || '?'} acres) and "${keepRecord.incident_name}" (${keepRecord.acres_burned || '?'} acres) differ in both name and acreage — these are likely separate fires, not duplicates.`,
        }, { status: 400 });
      }
    }

    const keptSnapshot = snapshot(keepRecord);
    const deletedSnapshots = deleteRecords.map(snapshot);

    // Smart precedence: largest hectares, latest containment/end, earliest start, union of orgs.
    const allRecords = [keepRecord, ...deleteRecords];
    const maxHaRecord = pickMaxHectares(allRecords);
    const updateData = {};
    const mergedFields = [];

    const maxHa = Math.max(...allRecords.map((r) => r.hectares_burned || 0));
    if (maxHa > (keepRecord.hectares_burned || 0)) {
      updateData.hectares_burned = maxHa;
      mergedFields.push('hectares_burned');
    }
    if (maxHaRecord && (maxHaRecord.acres_burned || 0) > (keepRecord.acres_burned || 0)) {
      updateData.acres_burned = maxHaRecord.acres_burned;
      mergedFields.push('acres_burned');
    }

    let latestContainment = keepRecord.containment_date || null;
    for (const r of deleteRecords) latestContainment = latestDate(latestContainment, r.containment_date || null);
    if (latestContainment && latestContainment !== keepRecord.containment_date) {
      updateData.containment_date = latestContainment;
      mergedFields.push('containment_date');
    }

    let latestEnd = keepRecord.end_date || null;
    for (const r of deleteRecords) latestEnd = latestDate(latestEnd, r.end_date || null);
    if (latestEnd && latestEnd !== keepRecord.end_date) {
      updateData.end_date = latestEnd;
      mergedFields.push('end_date');
    }

    let earliestStart = keepRecord.start_date || null;
    for (const r of deleteRecords) earliestStart = earliestDate(earliestStart, r.start_date || null);
    if (earliestStart && earliestStart !== keepRecord.start_date) {
      updateData.start_date = earliestStart;
      mergedFields.push('start_date');
    }

    const allOrgs = new Set([...(keepRecord.responding_organizations || [])]);
    deleteRecords.forEach((r) => (r.responding_organizations || []).forEach((o) => allOrgs.add(o)));
    const mergedOrgs = Array.from(allOrgs);
    if (mergedOrgs.length > (keepRecord.responding_organizations || []).length) {
      updateData.responding_organizations = mergedOrgs;
      mergedFields.push('responding_organizations');
    }

    // Fill missing scalar fields from delete records
    const fillFields = ['latitude', 'longitude', 'cause', 'structures_destroyed', 'fatalities', 'county_territory_id', 'admin2_name', 'severity', 'notes'];
    for (const field of fillFields) {
      const keepValue = keepRecord[field];
      if (!keepValue || keepValue === 0 || keepValue === '') {
        for (const rec of deleteRecords) {
          if (rec[field] && rec[field] !== 0 && rec[field] !== '') {
            updateData[field] = rec[field];
            mergedFields.push(field);
            break;
          }
        }
      }
    }

    if (mergedFields.length > 0) {
      await base44.asServiceRole.entities.WildfireIncident.update(keep_id, updateData);
    }

    // Soft-delete the other records (retain for audit + restore)
    let softDeleted = 0;
    for (const id of delete_ids) {
      try {
        await base44.asServiceRole.entities.WildfireIncident.update(id, { is_merged_away: true });
        softDeleted++;
      } catch (e) {
        console.error(`Failed to soft-delete ${id}:`, e);
      }
    }

    // Deltas vs the largest deleted record (the "continuing incident" later report)
    const bestDeleted = pickMaxHectares(deleteRecords);
    let containmentDiff = null, endDiff = null, haDelta = null, orgsAdded = [], orgsRemoved = [];
    if (bestDeleted) {
      containmentDiff = daysBetween(keepRecord.containment_date, bestDeleted.containment_date);
      endDiff = daysBetween(keepRecord.end_date, bestDeleted.end_date);
      haDelta = (bestDeleted.hectares_burned || 0) - (keepRecord.hectares_burned || 0);
      const keptOrgs = new Set(keepRecord.responding_organizations || []);
      const delOrgs = new Set(bestDeleted.responding_organizations || []);
      orgsAdded = [...delOrgs].filter((o) => !keptOrgs.has(o));
      orgsRemoved = [...keptOrgs].filter((o) => !delOrgs.has(o));
    }

    await base44.asServiceRole.entities.WildfireMergeLog.create({
      kept_incident_id: keep_id,
      kept_snapshot: keptSnapshot,
      deleted_incident_ids: delete_ids,
      deleted_snapshots: deletedSnapshots,
      restored_incident_ids: [],
      merged_at: new Date().toISOString(),
      merged_by: user.email,
      merge_reason,
      containment_date_diff_days: containmentDiff,
      end_date_diff_days: endDiff,
      hectares_delta: haDelta,
      responding_orgs_added: orgsAdded,
      responding_orgs_removed: orgsRemoved,
    });

    return Response.json({
      success: true,
      kept_id: keep_id,
      kept_name: keepRecord.incident_name,
      merged_fields: mergedFields,
      soft_deleted_count: softDeleted,
      deltas: {
        containment_date_diff_days: containmentDiff,
        end_date_diff_days: endDiff,
        hectares_delta: haDelta,
        responding_orgs_added: orgsAdded,
        responding_orgs_removed: orgsRemoved,
      },
    });
  } catch (error) {
    console.error('mergeIncidents error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}