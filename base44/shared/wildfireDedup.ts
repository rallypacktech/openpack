// Shared wildfire deduplication helpers used by findDuplicateIncidents and
// backfillMergeAudit. Plain module — no Deno.serve; import and reuse.

export const DATE_PROXIMITY_DAYS = 7;

// Cardinal / intercardinal direction tokens. Records whose names differ only by
// one of these (e.g. "North Complex" vs "South Complex") are treated as distinct
// fires and only grouped as duplicates if their acreage genuinely matches.
export const DIRECTIONS = new Set([
  'north', 'south', 'east', 'west',
  'northern', 'southern', 'eastern', 'western',
  'northeast', 'northwest', 'southeast', 'southwest',
  'northeastern', 'northwestern', 'southeastern', 'southwestern',
  'central', 'ne', 'nw', 'se', 'sw',
]);

export function normalizeName(name) {
  return (name || '').toLowerCase()
    .replace(/\s*fire\s*$/i, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function directionTokens(name) {
  return normalizeName(name).split(' ').filter((w) => DIRECTIONS.has(w));
}

export function stripDirections(name) {
  return normalizeName(name).split(' ').filter((w) => !DIRECTIONS.has(w)).join(' ').trim();
}

export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function datesWithinDays(d1, d2) {
  if (!d1 || !d2) return true;
  const diff = Math.abs(new Date(d1).getTime() - new Date(d2).getTime());
  return diff <= DATE_PROXIMITY_DAYS * 24 * 60 * 60 * 1000;
}

export function acresMatch(a1, a2) {
  if (!a1 && !a2) return true;
  if (!a1 || !a2) return false;
  const tolerance = Math.max(a1, a2) * 0.10;
  return Math.abs(a1 - a2) <= tolerance;
}

export function acresBothPresentAndMatch(a1, a2) {
  if (!a1 || !a2) return false;
  const tolerance = Math.max(a1, a2) * 0.10;
  return Math.abs(a1 - a2) <= tolerance;
}

export function namesMatch(n1, n2) {
  const a = normalizeName(n1), b = normalizeName(n2);
  if (a === b) return true;
  // Same base name after stripping directions but different directions => different fire
  const sa = stripDirections(n1), sb = stripDirections(n2);
  if (sa && sb && sa === sb) {
    return directionTokens(n1).join(',') === directionTokens(n2).join(',');
  }
  return false;
}

export function directionsDiffer(n1, n2) {
  const da = directionTokens(n1), db = directionTokens(n2);
  if (da.length === 0 && db.length === 0) return false;
  return da.join(',') !== db.join(',');
}

// A pair is a duplicate candidate if names match, or (for direction-differing
// names) acreage genuinely matches, or acreage matches otherwise.
export function isDuplicateCandidate(inc1, inc2) {
  if (namesMatch(inc1.incident_name, inc2.incident_name)) return true;
  if (directionsDiffer(inc1.incident_name, inc2.incident_name)) {
    return acresBothPresentAndMatch(inc1.acres_burned, inc2.acres_burned);
  }
  return acresMatch(inc1.acres_burned, inc2.acres_burned);
}