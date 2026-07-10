// NIFC Monthly/Seasonal Significant Wildland Fire Potential Outlook
// Source: https://www.nifc.gov/nicc-files/predictive/outlooks/monthly_seasonal_outlook.pdf
// Issued: July 1, 2026 — Next issuance: August 1, 2026.
// Updated manually each month when NIFC publishes the new outlook.

export const NIFC_OUTLOOK_META = {
  source: "National Interagency Fire Center (NIFC)",
  sourceUrl: "https://www.nifc.gov/nicc-files/predictive/outlooks/monthly_seasonal_outlook.pdf",
  issued: "2026-07-01",
  nextIssuance: "2026-08-01",
  period: "July–October 2026",
  preparednessLevel: 4, // National Preparedness Level (scale 1–5)
  preparednessLevelMax: 5,
  acresBurned: 3168102,
  acresVsAverage: "157%", // % of 10-year average
  wildfiresReported: 36262,
  wildfiresVsAverage: "133%",
  summary:
    "Above-normal significant fire potential is forecast across much of the Greater Four Corners, Great Basin, Northwest, and northeast California in July, expanding across the Northwest, central Idaho, and western Wyoming in August, and persisting in the Northwest, northern Great Basin, and northeast California in September. Normal potential nationwide by October.",
};

// Above-normal significant fire potential regions.
// `months` uses numeric month codes: 7 = July, 8 = August, 9 = September.
// lat/lng is an approximate geographic center; radius_km is the visual radius.
export const NIFC_ABOVE_NORMAL_REGIONS = [
  { id: "four-corners", label: "Greater Four Corners (AZ/NM/CO/UT)", months: [7], latitude: 36.5, longitude: -108.5, radius_km: 250 },
  { id: "great-basin", label: "Great Basin (NV/UT)", months: [7], latitude: 39.5, longitude: -116.5, radius_km: 220 },
  { id: "northwest", label: "Northwest (OR/WA)", months: [7, 8, 9], latitude: 44.0, longitude: -120.5, radius_km: 220 },
  { id: "ne-california", label: "Northeast California", months: [7, 8, 9], latitude: 41.0, longitude: -120.5, radius_km: 120 },
  { id: "central-tx", label: "Central Texas", months: [7, 8], latitude: 31.5, longitude: -99.5, radius_km: 150 },
  { id: "w-oklahoma", label: "Western Oklahoma", months: [7, 8], latitude: 35.5, longitude: -99.0, radius_km: 120 },
  { id: "carolinas", label: "Carolinas", months: [7, 8], latitude: 34.5, longitude: -80.0, radius_km: 150 },
  { id: "s-florida", label: "Central & South Florida", months: [7, 8], latitude: 27.5, longitude: -81.0, radius_km: 150 },
  { id: "pr-usvi", label: "Puerto Rico & U.S. Virgin Islands", months: [7], latitude: 18.2, longitude: -66.5, radius_km: 120 },
  { id: "central-idaho", label: "Central Idaho", months: [8], latitude: 45.0, longitude: -114.5, radius_km: 120 },
  { id: "w-wyoming", label: "Western Wyoming", months: [8], latitude: 43.0, longitude: -110.0, radius_km: 100 },
  { id: "nw-colorado", label: "Northwest Colorado", months: [8], latitude: 40.5, longitude: -108.0, radius_km: 100 },
  { id: "lower-mississippi", label: "Lower Mississippi Valley", months: [8], latitude: 33.0, longitude: -91.0, radius_km: 180 },
  { id: "n-great-basin", label: "Northern Great Basin", months: [9], latitude: 41.5, longitude: -115.0, radius_km: 160 },
];

// Resource references surfaced on the map and appended to fire-related alerts.
export const FIRE_PREP_RESOURCES = [
  { name: "NIFC Predictive Outlook", url: "https://www.nifc.gov/nicc-files/predictive/outlooks/monthly_seasonal_outlook.pdf" },
  { name: "National VOAD (Volunteer Organizations Active in Disaster)", url: "https://www.nvoad.org" },
  { name: "Find a Local COAD", url: "https://www.nvoad.org/local-affiliates/" },
];

export function getActiveFireRegions(month) {
  // month: 1–12 (JS Date.getMonth() + 1)
  return NIFC_ABOVE_NORMAL_REGIONS.filter((r) => r.months.includes(month));
}

// Haversine distance in km between two lat/lng points
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
}