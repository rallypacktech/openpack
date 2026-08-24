import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Authoritative per-year Gregorian dates for lunar-calendar firework holidays.
// The decade seeder stamped one month/day into every year, which is only correct
// for the representative year — so computeHolidayProximity matched fires against
// the wrong date in every other year. This table holds the true Gregorian date
// for each year 2016–2026.
const LUNAR_HOLIDAY_DATES = {
  'Chinese New Year': {
    2016: '2016-02-08', 2017: '2017-01-28', 2018: '2018-02-16',
    2019: '2019-02-05', 2020: '2020-01-25', 2021: '2021-02-12',
    2022: '2022-02-01', 2023: '2023-01-22', 2024: '2024-02-10',
    2025: '2025-01-29', 2026: '2026-02-17',
  },
  // "Lunar New Years" rows follow the same Chinese-lunar calendar.
  'Lunar New Years': {
    2016: '2016-02-08', 2017: '2017-01-28', 2018: '2018-02-16',
    2019: '2019-02-05', 2020: '2020-01-25', 2021: '2021-02-12',
    2022: '2022-02-01', 2023: '2023-01-22', 2024: '2024-02-10',
    2025: '2025-01-29', 2026: '2026-02-17',
  },
  'Diwali': {
    2016: '2016-10-30', 2017: '2017-10-19', 2018: '2018-11-07',
    2019: '2019-10-27', 2020: '2020-11-14', 2021: '2021-11-04',
    2022: '2022-10-24', 2023: '2023-11-12', 2024: '2024-11-01',
    2025: '2025-10-20', 2026: '2026-11-08',
  },
};

function isLunarHoliday(name) {
  return Object.prototype.hasOwnProperty.call(LUNAR_HOLIDAY_DATES, name);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Load all HolidayFireworkDisplay rows.
    const all = [];
    let skip = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.HolidayFireworkDisplay.list(undefined, 200, skip);
      all.push(...batch);
      if (batch.length < 200) break;
      skip += 200;
    }

    const toUpdate = []; // { id, date }
    const toDelete = [];  // ids — outliers beyond the table range or dups after correction
    const seen = new Set(); // holiday|country|date — dedup after correction

    let lunarRows = 0;
    let alreadyCorrect = 0;

    for (const row of all) {
      if (!isLunarHoliday(row.holiday_name)) continue;
      if (!row.date) continue;
      lunarRows++;
      const year = parseInt(String(row.date).substring(0, 4), 10);
      const table = LUNAR_HOLIDAY_DATES[row.holiday_name];
      const correct = table[year];
      const key = `${row.holiday_name}|${row.country_code}|${correct || row.date}`;
      if (!correct) {
        // Year outside 2016–2026 (e.g. a stray 2027 outlier). Delete it.
        toDelete.push(row.id);
        continue;
      }
      if (seen.has(key)) {
        // Corrected date collides with an already-kept row → delete the dup.
        toDelete.push(row.id);
        continue;
      }
      seen.add(key);
      if (row.date !== correct) {
        toUpdate.push({ id: row.id, date: correct });
      } else {
        alreadyCorrect++;
      }
    }

    let updated = 0;
    if (toUpdate.length > 0) {
      const res = await base44.asServiceRole.entities.HolidayFireworkDisplay.bulkUpdate(toUpdate);
      updated = res.length;
    }
    let deleted = 0;
    for (const id of toDelete) {
      try {
        await base44.asServiceRole.entities.HolidayFireworkDisplay.delete(id);
        deleted++;
      } catch (e) {
        console.error('delete failed for', id, e);
      }
    }

    return Response.json({
      success: true,
      lunar_rows_seen: lunarRows,
      updated,
      already_correct: alreadyCorrect,
      deleted,
      holidays_corrected: Object.keys(LUNAR_HOLIDAY_DATES),
    });
  } catch (error) {
    console.error('correctLunarHolidayDates error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}