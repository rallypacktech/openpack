import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { FLOOD_SOURCES, femaRecordsFromRows, noaaRecords } from '../../shared/floodSources.ts';

const NOAA_INDEX = 'https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/';
const FEMA_ENDPOINT = 'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries';

async function noaaFileForYear(year) {
  const res = await fetch(NOAA_INDEX, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`NOAA file index unavailable (${res.status})`);
  const html = await res.text();
  const re = new RegExp(`href="(StormEvents_details-ftp_v1\\.0_d${year}_c(\\d+)\\.csv\\.gz)"`, 'g');
  let best = null;
  let match;
  while ((match = re.exec(html))) {
    if (!best || Number(match[2]) > Number(best.created)) {
      best = { file: match[1], created: match[2] };
    }
  }
  return best ? best.file : null;
}

async function fetchNoaaRecords(year, limit) {
  const file = await noaaFileForYear(year);
  if (!file) throw new Error(`NOAA has not published a Storm Events file for ${year} yet`);

  const res = await fetch(`${NOAA_INDEX}${file}`, { signal: AbortSignal.timeout(120000) });
  if (!res.ok || !res.body) throw new Error(`NOAA file download failed (${res.status})`);

  // Decompress while streaming so the 70 MB detail file is never held twice.
  const decompressed = res.body.pipeThrough(new DecompressionStream('gzip'));
  const text = await new Response(decompressed).text();

  return { records: noaaRecords(text, { limit }), file };
}

async function fetchOpenFemaRecords(limit) {
  const since = new Date();
  since.setFullYear(since.getFullYear() - 11);
  const filter = `incidentType eq 'Flood' and declarationDate ge '${since.toISOString().slice(0, 10)}T00:00:00.000Z'`;
  const select = [
    'disasterNumber',
    'declarationType',
    'declarationDate',
    'state',
    'designatedArea',
    'incidentBeginDate',
    'incidentEndDate',
    'declarationTitle',
    'incidentType',
  ].join(',');
  const url = `${FEMA_ENDPOINT}?$filter=${encodeURIComponent(filter)}&$select=${select}&$top=10000`;

  const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`OpenFEMA request failed (${res.status})`);
  const json = await res.json();
  const rows = json.DisasterDeclarationsSummaries || [];
  return { records: femaRecordsFromRows(rows, { limit }), total: rows.length };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const source = String(body.source || '');
    const known = FLOOD_SOURCES.find((s) => s.id === source);
    if (!known) return Response.json({ error: 'Unknown source' }, { status: 400 });

    const limit = Math.min(Math.max(parseInt(body.limit, 10) || 200, 10), 500);

    // EM-DAT and DesInventar have no openly usable API: EM-DAT requires a
    // registered key for every request, and each DesInventar country runs its
    // own server. Both are surfaced with their coverage rather than faked.
    if (source === 'EM_DAT') {
      return Response.json({
        source,
        unavailable: true,
        reason:
          "EM-DAT's API only answers requests signed with a registered account key, so it cannot be pulled automatically here. Request a key at public.emdat.be, then use the EM-DAT download to add its flood records as manual entries.",
        source_url: known.url,
        records: [],
      });
    }

    if (source === 'UNDRR_DESINVENTAR') {
      return Response.json({
        source,
        unavailable: true,
        reason:
          'UNDRR DesInventar has no shared open API — each participating country runs its own server. Download the country file from desinventar.net and add its flood records as manual entries.',
        source_url: known.url,
        records: [],
      });
    }

    if (source === 'OPENFEMA') {
      const { records, total } = await fetchOpenFemaRecords(limit);
      return Response.json({
        source,
        records,
        total_available: total,
        returned: records.length,
        note: 'One record per flood disaster declaration, with the designated areas kept in the source fields.',
      });
    }

    const year = parseInt(body.year, 10) || new Date().getUTCFullYear() - 1;
    const { records, file } = await fetchNoaaRecords(year, limit);
    return Response.json({
      source,
      year,
      records,
      returned: records.length,
      note: `NOAA Storm Events ${year} (${file}). Notable flood events only: $100,000 or more in reported damage, or at least one death.`,
    });
  } catch (error) {
    console.error('fetchFloodSourceRecords error:', error?.message, error?.stack);
    return Response.json({ error: error?.message || 'Failed to fetch source records' }, { status: 500 });
  }
}