// Shared source metadata and parsers for flood data imported from public
// disaster datasets. Used by the import/report/validation/cleanup functions so
// the mapping rules live in one place.

export const FLOOD_SOURCES = [
  {
    id: "OPENFEMA",
    label: "OpenFEMA",
    agency: "FEMA",
    scope: "United States — federal flood disaster declarations, county by county.",
    coverage:
      "Declaration level: records when a flood disaster was declared and which areas were designated. Carries no death or dollar-damage figures.",
    limit_note: "US only",
    url: "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries",
  },
  {
    id: "NOAA_STORM_EVENTS",
    label: "NOAA Storm Events",
    agency: "NOAA NCEI",
    scope: "United States — event-level flood, flash flood and coastal flood reports with deaths, injuries and property damage.",
    coverage:
      "Event level, one year per fetch. Damage is as reported at the time, not inflation-adjusted. Only notable events (≥ $100,000 damage or at least one death) are offered for import.",
    limit_note: "US only · one year per fetch",
    url: "https://www.ncei.noaa.gov/stormevents/",
  },
  {
    id: "EM_DAT",
    label: "EM-DAT",
    agency: "CRED / UCLouvain",
    scope: "Global — internationally reported flood disasters that meet EM-DAT's inclusion criteria.",
    coverage:
      "Covers every country, but needs an EM-DAT API key set as EMDAT_API_KEY. Only disasters meeting inclusion thresholds appear, and figures are as reported by the source country.",
    limit_note: "Global · API key required",
    url: "https://public.emdat.be/",
  },
  {
    id: "UNDRR_DESINVENTAR",
    label: "UNDRR DesInventar",
    agency: "UNDRR",
    scope: "Global — national disaster loss databases maintained with UNDRR support.",
    coverage:
      "No shared open API: each participating country runs its own DesInventar server, so records are downloaded per country. Use the DesInventar site to pull a country file, then import it as manual records.",
    limit_note: "Global · no open API",
    url: "https://www.desinventar.net/",
  },
];

export const FLOOD_EVENT_TYPES = ["Flood", "Flash Flood", "Coastal Flood", "Lakeshore Flood"];

// Damages are worth reviewing separately from counts: an event with no reported
// dollar figure is still a real flood, but it cannot move a damage trend.
export const NOTABLE_DAMAGE_USD = 100000;

/** FEMA/NOAA damage strings come as "1.5M", "250K", "0.00K" or plain dollars. */
export function parseDamage(value) {
  if (!value) return 0;
  const s = String(value).replace(/"/g, "").trim().toUpperCase();
  if (!s || s === "0" || s === "0.00K") return 0;
  const m = s.match(/^(\d+(?:\.\d+)?)([KMB])?$/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const mult = m[2] === "K" ? 1e3 : m[2] === "M" ? 1e6 : m[2] === "B" ? 1e9 : 1;
  return Math.round(n * mult);
}

const MONTHS = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };

/** NOAA dates read like "01-JAN-24 15:30:00" — returns YYYY-MM-DD. */
export function noaaDate(value) {
  if (!value) return null;
  const m = String(value).trim().match(/^(\d{2})-([A-Z]{3})-(\d{2})/);
  if (!m) return null;
  const mm = MONTHS[m[2]];
  if (!mm) return null;
  const year = parseInt(m[3], 10) >= 70 ? `19${m[3]}` : `20${m[3]}`;
  return `${year}-${mm}-${m[1]}`;
}

/**
 * Streaming CSV reader. The Storm Events detail files carry quoted narratives
 * with embedded commas and newlines, so a plain split on "," corrupts rows.
 * Rows are handed to the callback one at a time so a 70 MB file never has to be
 * held in memory as a parsed table.
 */
export function eachCsvRow(text, onRow) {
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      onRow(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    onRow(row);
  }
}

function hazardTypeFor(eventType) {
  if (eventType === "Flash Flood") return "flash_flood";
  if (eventType === "Coastal Flood" || eventType === "Lakeshore Flood") return "coastal_flood";
  if (eventType === "Flood") return "riverine_flood";
  return "flood";
}

/**
 * NOAA Storm Events detail rows -> importable records.
 * Rows are filtered to flood event types and to notable events only.
 */
export function noaaRecords(text, { limit = 300 } = {}) {
  const records = [];
  let headers = null;
  eachCsvRow(text, (row) => {
    if (!headers) {
      headers = row;
      return;
    }
    const typeIdx = headers.indexOf("EVENT_TYPE");
    if (typeIdx === -1 || !FLOOD_EVENT_TYPES.includes(row[typeIdx])) return;

    const get = (key) => {
      const idx = headers.indexOf(key);
      return idx === -1 ? "" : row[idx] || "";
    };

    const damage = parseDamage(get("DAMAGE_PROPERTY")) + parseDamage(get("DAMAGE_CROPS"));
    const deaths = parseInt(get("DEATHS_DIRECT"), 10) || 0;
    if (damage < NOTABLE_DAMAGE_USD && deaths === 0) return;

    const eventId = get("EVENT_ID");
    const startDate = noaaDate(get("BEGIN_DATE_TIME"));
    if (!eventId || !startDate) return;

    const eventType = get("EVENT_TYPE");
    const state = get("STATE");
    const zone = get("CZ_NAME");
    const cause = get("FLOOD_CAUSE");

    records.push({
      event_name: cause
        ? `${eventType} — ${zone || state} (${cause})`
        : `${eventType} — ${zone || state}`,
      hazard_type: get("EVENT_TYPE") === "Flash Flood" ? "flash_flood" : hazardTypeFor(eventType),
      hurricane_related: get("TOR_F_SCALE").startsWith("H") || /hurricane/i.test(get("EVENT_NARRATIVE") || ""),
      country_code: "USA",
      country_name: "United States",
      admin1_name: state,
      admin2_name: zone,
      locality: get("BEGIN_LOCATION"),
      latitude: parseFloat(get("BEGIN_LAT")) || undefined,
      longitude: parseFloat(get("BEGIN_LON")) || undefined,
      start_date: startDate,
      end_date: noaaDate(get("END_DATE_TIME")) || startDate,
      deaths,
      injured: parseInt(get("INJURIES_DIRECT"), 10) || 0,
      affected_people: 0,
      damage_usd: damage,
      damage_year: parseInt(get("YEAR"), 10) || parseInt(startDate.slice(0, 4), 10),
      source: "NOAA_STORM_EVENTS",
      source_record_id: eventId,
      source_url: `https://www.ncei.noaa.gov/stormevents/eventdetails.jsp?id=${eventId}`,
      source_description: (get("EVENT_NARRATIVE") || "").slice(0, 400),
      original_values: {
        event_type: eventType,
        state,
        cz_name: zone,
        begin_date_time: get("BEGIN_DATE_TIME"),
        damage_property: get("DAMAGE_PROPERTY"),
        damage_crops: get("DAMAGE_CROPS"),
        deaths_direct: get("DEATHS_DIRECT"),
        injuries_direct: get("INJURIES_DIRECT"),
        flood_cause: cause,
        data_source: get("DATA_SOURCE"),
      },
    });
  });

  // Worst-first so an admin reviewing a capped list sees the events that move a trend.
  records.sort((a, b) => b.damage_usd - a.damage_usd || b.deaths - a.deaths);
  return records.slice(0, limit);
}

/** OpenFEMA declaration rows -> one record per disaster number. */
export function femaRecordsFromRows(rows, { limit = 600 } = {}) {
  const byDisaster = new Map();

  for (const row of rows) {
    const number = row.disasterNumber;
    if (!number) continue;
    const existing = byDisaster.get(number);
    if (existing) {
      existing.areas.push(row.designatedArea);
      const begin = (row.incidentBeginDate || "").slice(0, 10);
      const end = (row.incidentEndDate || "").slice(0, 10);
      if (begin && (!existing.start_date || begin < existing.start_date)) existing.start_date = begin;
      if (end && (!existing.end_date || end > existing.end_date)) existing.end_date = end;
      continue;
    }
    byDisaster.set(number, {
      areas: [row.designatedArea],
      start_date: (row.incidentBeginDate || row.declarationDate || "").slice(0, 10),
      end_date: (row.incidentEndDate || "").slice(0, 10) || null,
      declaration_type: row.declarationType,
      declaration_date: row.declarationDate,
      state: row.state,
      title: row.declarationTitle,
    });
  }

  const records = [];
  for (const [number, d] of byDisaster) {
    if (!d.start_date) continue;
    records.push({
      event_name: d.title || `Flood disaster declaration ${number}`,
      hazard_type: "flood",
      hurricane_related: false,
      country_code: "USA",
      country_name: "United States",
      admin1_name: d.state || undefined,
      admin2_name: undefined,
      locality: undefined,
      start_date: d.start_date,
      end_date: d.end_date || undefined,
      deaths: 0,
      injured: 0,
      affected_people: 0,
      damage_usd: 0,
      damage_year: parseInt(d.start_date.slice(0, 4), 10),
      source: "OPENFEMA",
      source_record_id: String(number),
      source_url: `https://www.fema.gov/disaster/${number}`,
      source_description: `${d.declaration_type || "Declaration"} ${number} — ${d.areas.length} designated area${d.areas.length === 1 ? "" : "s"}`,
      original_values: {
        disaster_number: number,
        declaration_type: d.declaration_type,
        declaration_date: d.declaration_date,
        incident_type: "Flood",
        designated_areas: d.areas.filter(Boolean).slice(0, 50),
      },
    });
  }

  records.sort((a, b) => (a.start_date < b.start_date ? 1 : -1));
  return records.slice(0, limit);
}

/** Load every active flood record, paginated, with the fields a report needs. */
const REPORT_FIELDS = [
  "event_name",
  "hazard_type",
  "hurricane_related",
  "country_code",
  "country_name",
  "admin1_name",
  "start_date",
  "deaths",
  "injured",
  "affected_people",
  "damage_usd",
  "damage_year",
  "source",
  "source_record_id",
  "is_merged_away",
];

export async function loadActiveFloods(base44, { pageLimit = 500, maxPages = 40, fields = REPORT_FIELDS } = {}) {
  const all = [];
  let cursor;
  let hasMore = true;
  let pages = 0;

  while (hasMore && pages < maxPages) {
    const page = await base44.asServiceRole.entities.FloodIncident.filter(
      {},
      {
        sort: "-start_date",
        limit: pageLimit,
        ...(fields ? { fields } : {}),
        ...(cursor ? { cursor } : {}),
      },
    );
    const items = Array.isArray(page) ? page : page.items || [];
    all.push(...items);
    cursor = Array.isArray(page) ? null : page.next_cursor;
    hasMore = !Array.isArray(page) && !!page.has_more && !!cursor;
    pages++;
  }

  return all.filter((r) => !r.is_merged_away);
}

export function yearOf(dateString) {
  const y = parseInt(String(dateString || "").slice(0, 4), 10);
  return Number.isFinite(y) ? y : null;
}