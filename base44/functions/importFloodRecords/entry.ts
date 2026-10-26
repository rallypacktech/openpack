import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const ALLOWED_FIELDS = [
  'event_name',
  'hazard_type',
  'hurricane_related',
  'country_code',
  'country_name',
  'admin1_name',
  'admin2_name',
  'locality',
  'latitude',
  'longitude',
  'start_date',
  'end_date',
  'deaths',
  'injured',
  'affected_people',
  'damage_usd',
  'damage_year',
  'source',
  'source_record_id',
  'source_url',
  'source_description',
  'original_values',
  'notes',
];

const HAZARD_TYPES = ['flood', 'flash_flood', 'coastal_flood', 'riverine_flood', 'hurricane_flood', 'other'];
const SOURCES = ['OPENFEMA', 'NOAA_STORM_EVENTS', 'EM_DAT', 'UNDRR_DESINVENTAR', 'MANUAL'];

function cleanRecord(raw) {
  const record = {};
  for (const key of ALLOWED_FIELDS) {
    if (raw[key] !== undefined && raw[key] !== null && raw[key] !== '') record[key] = raw[key];
  }
  if (!record.event_name || !record.country_code || !record.start_date || !record.source) return null;
  if (!SOURCES.includes(record.source)) return null;
  if (!HAZARD_TYPES.includes(record.hazard_type)) record.hazard_type = 'flood';
  if (record.original_values && typeof record.original_values !== 'object') delete record.original_values;
  for (const num of ['deaths', 'injured', 'affected_people', 'damage_usd', 'damage_year', 'latitude', 'longitude']) {
    if (record[num] !== undefined) {
      const n = Number(record[num]);
      record[num] = Number.isFinite(n) ? n : undefined;
      if (record[num] === undefined) delete record[num];
    }
  }
  record.is_merged_away = false;
  return record;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const incoming = Array.isArray(body.records) ? body.records : null;
    if (!incoming || incoming.length === 0) {
      return Response.json({ error: 'records must be a non-empty array' }, { status: 400 });
    }
    if (incoming.length > 500) {
      return Response.json({ error: 'Import at most 500 records at a time' }, { status: 400 });
    }

    const cleaned = incoming.map(cleanRecord).filter(Boolean);
    if (cleaned.length === 0) {
      return Response.json({ error: 'None of the records had the required fields' }, { status: 400 });
    }

    // Dedupe against what is already stored: the same source record may only
    // ever arrive once, however many times an admin re-runs a fetch.
    const bySource = new Map();
    for (const record of cleaned) {
      if (!bySource.has(record.source)) bySource.set(record.source, new Set());
      bySource.get(record.source).add(String(record.source_record_id || ''));
    }

    const existingKeys = new Set();
    for (const [source, ids] of bySource) {
      const idList = [...ids].filter(Boolean);
      for (let i = 0; i < idList.length; i += 100) {
        const chunk = idList.slice(i, i + 100);
        const existing = await base44.entities.FloodIncident.filter(
          { source, source_record_id: { $in: chunk } },
          { fields: ['source_record_id'], limit: 200 },
        );
        const items = Array.isArray(existing) ? existing : existing.items || [];
        items.forEach((r) => existingKeys.add(`${source}:${r.source_record_id}`));
      }
    }

    const seen = new Set();
    const toCreate = [];
    let skipped = 0;
    for (const record of cleaned) {
      const key = `${record.source}:${record.source_record_id || ''}`;
      if (record.source_record_id && (existingKeys.has(key) || seen.has(key))) {
        skipped++;
        continue;
      }
      if (record.source_record_id) seen.add(key);
      toCreate.push(record);
    }

    let created = 0;
    for (let i = 0; i < toCreate.length; i += 100) {
      const batch = toCreate.slice(i, i + 100);
      await base44.entities.FloodIncident.bulkCreate(batch);
      created += batch.length;
    }

    return Response.json({ created, skipped, received: cleaned.length });
  } catch (error) {
    console.error('importFloodRecords error:', error?.message, error?.stack);
    return Response.json({ error: error?.message || 'Import failed' }, { status: 500 });
  }
}