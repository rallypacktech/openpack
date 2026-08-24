import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

function monthDayOf(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return { month: d.getUTCMonth(), day: d.getUTCDate() };
}

// Last Monday of a given (year, monthIndex).
function lastMonday(year, month) {
  const d = new Date(Date.UTC(year, month + 1, 0)); // last day of month
  while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() - 1);
  return d;
}
// First Monday of a given (year, monthIndex).
function firstMonday(year, month) {
  const d = new Date(Date.UTC(year, month, 1));
  while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

function dateForYear(holidayName, md, year) {
  const name = (holidayName || '').toLowerCase();
  // Floating US holidays.
  if (name.includes('memorial')) {
    const d = lastMonday(year, 4); // May
    return d.toISOString().substring(0, 10);
  }
  if (name.includes('labor') || name.includes('labour')) {
    const d = firstMonday(year, 8); // September
    return d.toISOString().substring(0, 10);
  }
  // Fixed-date / lunar new year and others: shift stored month/day into the year.
  const d = new Date(Date.UTC(year, md.month, md.day));
  return d.toISOString().substring(0, 10);
}

function isFloating(holidayName) {
  const n = (holidayName || '').toLowerCase();
  return n.includes('memorial') || n.includes('labor') || n.includes('labour');
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Load all existing holidays (representatives + any already-seeded dated rows).
    const existing = [];
    let skip = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.HolidayFireworkDisplay.list(undefined, 200, skip);
      existing.push(...batch);
      if (batch.length < 200) break;
      skip += 200;
    }

    // Index existing by holiday_name|country_code|date for dedup.
    const existingKeys = new Set();
    for (const h of existing) {
      if (!h.date) continue;
      const d = new Date(h.date);
      const key = `${(h.holiday_name || '').toLowerCase()}|${(h.country_code || '').toLowerCase()}|${d.toISOString().substring(0, 10)}`;
      existingKeys.add(key);
    }

    const toCreate = [];
    let skipped = 0;
    const floatingFlags = new Set();

    for (const rep of existing) {
      const md = monthDayOf(rep.date);
      if (!md) continue;
      const name = rep.holiday_name;
      const floating = isFloating(name);
      if (floating) floatingFlags.add(name);
      for (const year of YEARS) {
        const date = dateForYear(name, md, year);
        const key = `${(name || '').toLowerCase()}|${(rep.country_code || '').toLowerCase()}|${date}`;
        if (existingKeys.has(key)) {
          skipped++;
          continue;
        }
        existingKeys.add(key); // avoid dup within this run
        toCreate.push({
          holiday_name: name,
          country_code: rep.country_code,
          admin1_name: rep.admin1_name || null,
          date,
          has_public_fireworks: rep.has_public_fireworks !== false,
          typical_location: rep.typical_location || null,
          description: rep.description || null,
          county_territory_id: rep.county_territory_id || null,
          admin1_code: rep.admin1_code || null,
        });
      }
    }

    let created = 0;
    if (toCreate.length > 0) {
      const recs = await base44.asServiceRole.entities.HolidayFireworkDisplay.bulkCreate(toCreate);
      created = recs.length;
    }

    return Response.json({
      success: true,
      representative_count: existing.length,
      created,
      skipped,
      floating_holidays: Array.from(floatingFlags),
      note: floatingFlags.size > 0
        ? 'Floating holidays (Memorial Day, Labor Day) computed from their weekday rules; all others shift the stored month/day into each year.'
        : 'All holidays shifted by stored month/day into each year.',
    });
  } catch (error) {
    console.error('seedHolidayDecadeDates error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}