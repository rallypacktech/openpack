import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { loadActiveFloods } from '../../shared/floodSources.ts';

// Admin-only flood cleanup. Scans for records that describe the same event,
// then merges (soft-delete, reversible) or deletes the ones the admin chose.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'scan';

    if (action === 'scan') {
      const records = await loadActiveFloods(base44, { fields: null });

      const bySourceId = new Map();
      const byNameDate = new Map();
      for (const r of records) {
        if (r.source_record_id) {
          const key = `${r.source}:${r.source_record_id}`;
          const list = bySourceId.get(key) || [];
          list.push(r);
          bySourceId.set(key, list);
        }
        if (r.admin1_name) {
          const key = `${String(r.event_name).trim().toLowerCase()}|${r.start_date}|${r.admin1_name}`;
          const list = byNameDate.get(key) || [];
          list.push(r);
          byNameDate.set(key, list);
        }
      }

      const toGroup = (entries, reason) =>
        [...entries.entries()]
          .filter(([, list]) => list.length > 1)
          .map(([key, list]) => ({
            key,
            reason,
            count: list.length,
            records: list
              .sort((a, b) => (a.created_date || '') < (b.created_date || '') ? -1 : 1)
              .map((r) => ({
                id: r.id,
                event_name: r.event_name,
                start_date: r.start_date,
                admin1_name: r.admin1_name,
                source: r.source,
                damage_usd: r.damage_usd || 0,
              })),
          }));

      return Response.json({
        total_active: records.length,
        exact_duplicates: toGroup(bySourceId, 'same source record'),
        likely_duplicates: toGroup(byNameDate, 'same name, date and state'),
        data_as_of: new Date().toISOString(),
      });
    }

    if (action === 'merge') {
      const primaryId = body.primary_id;
      const duplicateIds = Array.isArray(body.duplicate_ids) ? body.duplicate_ids.filter((id) => id && id !== primaryId) : [];
      if (!primaryId || duplicateIds.length === 0) {
        return Response.json({ error: 'primary_id and duplicate_ids are required' }, { status: 400 });
      }
      if (duplicateIds.length > 200) {
        return Response.json({ error: 'Merge at most 200 records at a time' }, { status: 400 });
      }

      await base44.entities.FloodIncident.bulkUpdate(
        duplicateIds.map((id) => ({
          id,
          is_merged_away: true,
          notes: `Merged into flood record ${primaryId} on ${new Date().toISOString().slice(0, 10)}`,
        })),
      );

      return Response.json({ merged: duplicateIds.length, into: primaryId });
    }

    if (action === 'delete') {
      const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
      if (ids.length === 0) return Response.json({ error: 'ids are required' }, { status: 400 });
      if (ids.length > 200) return Response.json({ error: 'Delete at most 200 records at a time' }, { status: 400 });

      for (const id of ids) {
        await base44.entities.FloodIncident.delete(id);
      }
      return Response.json({ deleted: ids.length });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('cleanupFloodData error:', error?.message, error?.stack);
    return Response.json({ error: error?.message || 'Cleanup failed' }, { status: 500 });
  }
}