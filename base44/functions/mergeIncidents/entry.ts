import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const keep_id = body?.keep_id;
    const delete_ids = body?.delete_ids || [];

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

    // Safety guard: refuse to merge fires with start dates >7 days apart — they are
    // separate fires in different time frames, even if co-located.
    const DATE_PROXIMITY_DAYS = 7;
    for (const rec of deleteRecords) {
      if (keepRecord.start_date && rec.start_date) {
        const diff = Math.abs(new Date(keepRecord.start_date).getTime() - new Date(rec.start_date).getTime());
        if (diff > DATE_PROXIMITY_DAYS * 24 * 60 * 60 * 1000) {
          return Response.json({
            error: `Refused to merge: "${rec.incident_name}" (start ${rec.start_date}) and "${keepRecord.incident_name}" (start ${keepRecord.start_date}) are more than ${DATE_PROXIMITY_DAYS} days apart — these are likely separate fires, not duplicates.`,
          }, { status: 400 });
        }
      }
    }

    // Merge: fill in missing fields from delete records into keep record
    const updateData = {};
    const mergedFields = [];

    // Merge responding_organizations (unique union)
    const allOrgs = new Set([...(keepRecord.responding_organizations || [])]);
    deleteRecords.forEach(rec => {
      (rec.responding_organizations || []).forEach(org => allOrgs.add(org));
    });
    const mergedOrgs = Array.from(allOrgs);
    if (mergedOrgs.length > (keepRecord.responding_organizations || []).length) {
      updateData.responding_organizations = mergedOrgs;
      mergedFields.push('responding_organizations');
    }

    // Fill missing scalar fields from delete records
    const fieldsToMerge = [
      'latitude', 'longitude', 'containment_date', 'end_date', 'cause',
      'structures_destroyed', 'fatalities', 'county_territory_id', 'admin2_name',
      'acres_burned', 'hectares_burned', 'severity', 'notes',
    ];

    for (const field of fieldsToMerge) {
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

    // Update the keep record if any fields were merged
    if (mergedFields.length > 0) {
      await base44.asServiceRole.entities.WildfireIncident.update(keep_id, updateData);
    }

    // Delete the other records
    let deleted = 0;
    for (const id of delete_ids) {
      try {
        await base44.asServiceRole.entities.WildfireIncident.delete(id);
        deleted++;
      } catch (e) {
        console.error(`Failed to delete ${id}:`, e);
      }
    }

    return Response.json({
      success: true,
      kept_id: keep_id,
      kept_name: keepRecord.incident_name,
      merged_fields: mergedFields,
      deleted_count: deleted,
    });
  } catch (error) {
    console.error('mergeIncidents error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});