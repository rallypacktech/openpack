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
  forecast: "Below-Normal — tracking below the forecast range",
  namedStorms: "8–14 forecast (5 so far)",
  hurricanes: "3–6 forecast (none so far)",
  majorHurricanes: "1–3 forecast (none so far)",
  elNinoNote: "Strong El Niño developing — strong wind shear and dry air continue to suppress Atlantic development",
  summary: "2026 remains one of the quietest Atlantic hurricane seasons on record — only five short-lived tropical storms have formed all season, none reaching hurricane strength. The climatological peak has passed. Forecasters are watching a disturbance in the central Atlantic that could organize later this week, but no Gulf or Caribbean development is expected in the next 7 days. Even a quiet season carries risk — coastal residents should prepare.",
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
  period: "September 2026",
  summary: "Flash flooding is the most acute hazard right now. Monsoonal thunderstorms are driving widespread, often life-threatening flash flooding across the Southwest — including recurring post-wildfire flooding below the Salt burn scar in Ruidoso, New Mexico, where up to 2 inches of rain fell in under an hour. Southern Utah slot canyons and southern Arizona are also under flash flood warnings. The monsoon pattern is expected to keep producing scattered flash flood warnings through the month.",
  risk_regions: [
    { id: "ruidoso-burn-scar", label: "Ruidoso / Salt burn scar (NM)", months: [9], latitude: 33.33, longitude: -105.67, radius_km: 70, description: "Repeated Flash Flood Warnings downstream of the Salt burn scar — flooding along Cree Meadows Drive, White Mountain Drive, Cedar Creek, and Fence Canyon. A direct, recurring post-wildfire hazard, now actively producing life-threatening flooding." },
    { id: "southern-utah", label: "Southern Utah slot canyons (Garfield/Kane)", months: [9], latitude: 37.4, longitude: -111.6, radius_km: 150, description: "Flash Flood Warnings for slot canyons and washes — including the Escalante River corridor and canyons off Hole-in-the-Rock Road. These are classic flash-flood-death locations for hikers and canyoneers." },
    { id: "southern-arizona", label: "Southern Arizona (San Pedro / Tucson)", months: [9], latitude: 32.2, longitude: -110.5, radius_km: 160, description: "Flash flood warnings from heavy thunderstorm rainfall." },
    { id: "new-mexico-nw", label: "Northwest New Mexico (Mexican Springs / Nakaibito)", months: [9], latitude: 35.6, longitude: -108.8, radius_km: 120, description: "Saturated ground from earlier rain means it takes far less new rainfall to cause flooding." },
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

// ── NOAA CPC ENSO Advisory — El Niño / Winter 2026–27 ──
// Source: https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/
// Regional U.S. detail plus the global teleconnections that matter to users
// outside North America — El Niño is a Pacific-wide signal, not a U.S. one.
export const EL_NINO_OUTLOOK = {
  source: "NOAA Climate Prediction Center / WMO",
  sourceUrl: "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/",
  season: "Northern Hemisphere winter 2026–27",
  strength: "90%+ chance of a 'very strong' event",
  summary:
    "NOAA's Climate Prediction Center projects a historically strong El Niño for winter 2026–27 — with a 90%+ chance of a 'very strong' event and a real possibility it exceeds every El Niño on record dating back to 1950. El Niño pushes the Pacific jet stream south and keeps it more active, typically producing a wetter, stormier winter across the southern tier of the United States and a milder, drier winter across the north. It also suppresses Atlantic hurricane activity while shifting cyclone risk toward the central and eastern Pacific — and it reshapes rainfall, drought, and fire risk across South America, southern Africa, Australia, and Southeast Asia.",
  us_regions: [
    { id: "pnw", label: "Pacific Northwest (WA, OR, ID)", outlook: "Warmer & drier", note: "Reduced mountain snowpack is possible, with downstream implications for spring/summer drought and fire risk in 2027." },
    { id: "california", label: "California", outlook: "Wetter than normal", note: "Historically strong El Niño winters bring well above-average rain and snow, with an earlier start to the atmospheric river season. Raises landslide, debris-flow, and urban flooding risk — especially in areas burned by 2026 wildfires (Big Sur, Lake County / Upper Lake)." },
    { id: "southwest", label: "Southwest (AZ, NM, southern UT)", outlook: "Wetter than normal", note: "Extends burn-scar flood risk in New Mexico well past fire season — a wetter winter means more runoff over the Ruidoso/Salt scar." },
    { id: "southern-plains", label: "Southern Plains & Gulf Coast (TX, LA, and neighbors)", outlook: "Wetter than normal", note: "Elevated flood risk through the winter." },
    { id: "southeast", label: "Southeast (FL, GA, and neighbors)", outlook: "Wetter than normal", note: "Wetter-than-normal winter favored." },
    { id: "north-central", label: "Northern tier, Upper Midwest & Great Lakes", outlook: "Warmer & drier", note: "Drier conditions favored in the Northwest into the north-central states, trending toward the Great Lakes later in the season." },
    { id: "alaska", label: "Alaska", outlook: "Significantly warmer", note: "The strongest El Niño warming signal of any U.S. region." },
    { id: "south-central-temp", label: "South-Central U.S. temperatures", outlook: "Uncertain", note: "Some models show equal chances of below-, near-, or above-normal temperatures — cold snaps are still possible in an overall mild winter." },
  ],
  global_regions: [
    { id: "peru-ecuador", label: "Peru & Ecuador", outlook: "Heavy rain & flooding", note: "The classic El Niño core — warm coastal water drives torrential rain, flash flooding, and landslides along a normally arid Pacific coast." },
    { id: "australia", label: "Australia", outlook: "Drier & hotter", note: "Reduced rainfall and above-average heat raise drought and bushfire risk across eastern and northern Australia." },
    { id: "southeast-asia", label: "Southeast Asia & Indonesia", outlook: "Drier", note: "Drought conditions increase peat and forest fire risk, with transboundary haze affecting the region." },
    { id: "southern-africa", label: "Southern Africa", outlook: "Drier", note: "Below-normal rainfall raises drought and food-security risk across the region." },
    { id: "south-america", label: "South America (Brazil & Amazonia)", outlook: "Mixed", note: "Drier than normal in the north and northeast, wetter in the south — with elevated Amazon fire risk in dry years." },
    { id: "pacific-islands", label: "Pacific Islands", outlook: "Shifting cyclone & coral risk", note: "Cyclone activity shifts toward the central and eastern Pacific, and prolonged warm water raises coral bleaching risk." },
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