// Seasonal/Monthly Hazard Outlooks from National Organizations
// Each outlook is updated periodically based on the latest published data.

// ── NOAA CPC 2026 Atlantic Hurricane Season Outlook ──
// Source: https://www.cpc.ncep.noaa.gov/products/outlooks/hurricane.shtml
// Issued: May 2026 (next update: August 2026)
export const HURRICANE_OUTLOOK = {
  source: "NOAA Climate Prediction Center",
  sourceUrl: "https://www.cpc.ncep.noaa.gov/products/outlooks/hurricane.shtml",
  season: "June 1 – November 30, 2026",
  peakPeriod: "mid-August to late October",
  forecast: "Below-Normal",
  namedStorms: "8–14",
  hurricanes: "3–6",
  majorHurricanes: "1–3",
  elNinoNote: "El Niño developing (82% chance May–Jul 2026), suppressing Atlantic hurricane activity",
  summary: "NOAA predicts a below-normal 2026 Atlantic hurricane season due to developing El Niño. However, even a below-normal season carries risk — coastal residents should prepare.",
  // Coastal risk zones during hurricane season (month 6=Jun … 11=Nov)
  risk_zones: [
    { id: "gulf-coast", label: "Gulf Coast (TX–FL Panhandle)", months: [6, 7, 8, 9, 10, 11], latitude: 29.0, longitude: -93.0, radius_km: 300, description: "The Gulf Coast is the most hurricane-vulnerable U.S. coastline. Storm surges of 3–6 meters are possible in major landfalls." },
    { id: "florida-peninsula", label: "Florida Peninsula", months: [6, 7, 8, 9, 10, 11], latitude: 27.5, longitude: -81.0, radius_km: 200, description: "Florida has the highest hurricane landfall frequency of any U.S. state. Both Gulf and Atlantic coasts are at risk." },
    { id: "se-atlantic", label: "Southeast Atlantic Coast (GA–NC)", months: [7, 8, 9, 10, 11], latitude: 33.0, longitude: -79.5, radius_km: 200, description: "The Southeast Atlantic coast from Georgia to North Carolina frequently experiences hurricane impacts and storm surge." },
    { id: "mid-atlantic-ne", label: "Mid-Atlantic & Northeast Coast (VA–NY)", months: [8, 9, 10], latitude: 38.5, longitude: -74.0, radius_km: 200, description: "Less frequent but high-impact hurricane risk. Hybrid systems can cause catastrophic coastal flooding." },
  ],
};

// ── NWS Monthly Flood Hazard Outlook (July 2026) ──
// Source: NWS National Water Center — https://www.weather.gov/ahps/
export const FLOOD_OUTLOOK = {
  source: "NWS National Water Center",
  sourceUrl: "https://www.weather.gov/ahps/",
  period: "July 2026",
  summary: "Elevated flood risk across the Lower Mississippi Valley, Eastern Texas, and Missouri River basin. Communities along the Mississippi and Missouri Rivers should monitor for moderate flooding.",
  risk_regions: [
    { id: "lower-mississippi", label: "Lower Mississippi Valley (LA, AR, MS)", months: [7], latitude: 32.5, longitude: -91.0, radius_km: 220, description: "Elevated risk of moderate flooding along the Mississippi River and its tributaries." },
    { id: "eastern-tx", label: "Eastern Texas", months: [7], latitude: 31.0, longitude: -95.0, radius_km: 160, description: "Flash flood risk elevated due to above-normal precipitation and saturated soils." },
    { id: "missouri-river", label: "Missouri River Basin", months: [7], latitude: 39.0, longitude: -94.5, radius_km: 220, description: "Elevated flood risk along the Missouri River and tributaries." },
  ],
};

// ── NOAA/SPC Tornado Climatology — Peak Season by Region ──
// Source: NOAA Tornado Climatology / SPC — https://www.spc.noaa.gov/
// The SPC also issues Day 1–8 Convective Outlooks for real-time severe weather risk.
export const TORNADO_OUTLOOK = {
  source: "NOAA / SPC Storm Prediction Center",
  sourceUrl: "https://www.spc.noaa.gov/",
  liveOutlookUrl: "https://www.spc.noaa.gov/products/outlook/",
  summary: "Tornado risk follows a seasonal migration across the U.S. NOAA climatology shows peak tornado months by region. For real-time severe weather risk, check the SPC Convective Outlook (Day 1–8).",
  peak_season_regions: [
    { id: "dixie-alley", label: "Gulf Coast & Southeast (Dixie Alley)", months: [1, 2, 3, 4, 11, 12], latitude: 32.0, longitude: -88.0, radius_km: 250, description: "Peak tornado season for the Gulf Coast and Southeast. Dixie Alley tornadoes often occur at night and are particularly dangerous." },
    { id: "southern-plains", label: "Southern Plains (Tornado Alley)", months: [4, 5, 6], latitude: 35.5, longitude: -98.5, radius_km: 220, description: "Peak tornado season for Texas, Oklahoma, and Kansas — classic Tornado Alley." },
    { id: "central-northern-plains", label: "Central & Northern Plains", months: [5, 6, 7], latitude: 41.0, longitude: -99.0, radius_km: 220, description: "Peak tornado season for Nebraska, South Dakota, and North Dakota." },
    { id: "upper-midwest-ne", label: "Upper Midwest & Northeast", months: [6, 7, 8], latitude: 43.5, longitude: -90.0, radius_km: 230, description: "Peak tornado season for the Upper Midwest, Great Lakes, and Northeast." },
    { id: "gulf-coast-fall", label: "Gulf Coast (Hurricane-Spawned)", months: [8, 9, 10], latitude: 30.0, longitude: -89.0, radius_km: 180, description: "Fall tornado risk from tropical systems making landfall along the Gulf Coast." },
  ],
};

export function getActiveHurricaneZones(month) {
  return HURRICANE_OUTLOOK.risk_zones.filter((r) => r.months.includes(month));
}

export function getActiveFloodRegions(month) {
  return FLOOD_OUTLOOK.risk_regions.filter((r) => r.months.includes(month));
}

export function getActiveTornadoRegions(month) {
  return TORNADO_OUTLOOK.peak_season_regions.filter((r) => r.months.includes(month));
}