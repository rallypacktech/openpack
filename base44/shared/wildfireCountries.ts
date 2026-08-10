// =============================================================================
// Master, single-source-of-truth country list for wildfire data imports.
// Imported by backend functions (getWildfireStats, fetchWildfireHistory,
// fetchEFFISHistory) AND the frontend admin dashboard
// (src/lib/wildfireCountries.js re-exports from here) so the three can never drift.
// =============================================================================

export const COVERAGE_YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

// Full display name for every country the platform can import wildfire history for.
// This is the master "all countries" list used to build the data-coverage table.
export const COUNTRY_NAMES: Record<string, string> = {
  // ---- Europe (EFFIS / Copernicus) ----
  AT: 'Austria', AL: 'Albania', AD: 'Andorra', AM: 'Armenia', AZ: 'Azerbaijan',
  BY: 'Belarus', BE: 'Belgium', BA: 'Bosnia and Herzegovina', BG: 'Bulgaria',
  HR: 'Croatia', CY: 'Cyprus', CZ: 'Czechia', DK: 'Denmark', EE: 'Estonia',
  FI: 'Finland', FR: 'France', GE: 'Georgia', DE: 'Germany', GR: 'Greece',
  HU: 'Hungary', IS: 'Iceland', IE: 'Ireland', IT: 'Italy', LV: 'Latvia',
  LI: 'Liechtenstein', LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta', MD: 'Moldova',
  MC: 'Monaco', ME: 'Montenegro', NL: 'Netherlands', MK: 'North Macedonia',
  NO: 'Norway', PL: 'Poland', PT: 'Portugal', RO: 'Romania', RU: 'Russia',
  SM: 'San Marino', RS: 'Serbia', SK: 'Slovakia', SI: 'Slovenia', ES: 'Spain',
  SE: 'Sweden', CH: 'Switzerland', TR: 'Turkey', UA: 'Ukraine', GB: 'United Kingdom',
  VA: 'Vatican City',
  // ---- Mediterranean basin / North Africa / Middle East (EFFIS-adjacent) ----
  DZ: 'Algeria', EG: 'Egypt', IL: 'Israel', IQ: 'Iraq', JO: 'Jordan', LB: 'Lebanon',
  LY: 'Libya', MA: 'Morocco', PS: 'Palestine', SY: 'Syria', TN: 'Tunisia',
  EH: 'Western Sahara',
  // ---- Middle East / Gulf / Central Asia ----
  AF: 'Afghanistan', BH: 'Bahrain', IR: 'Iran', KG: 'Kyrgyzstan', KZ: 'Kazakhstan',
  KW: 'Kuwait', OM: 'Oman', PK: 'Pakistan', QA: 'Qatar', SA: 'Saudi Arabia',
  TJ: 'Tajikistan', TM: 'Turkmenistan', AE: 'United Arab Emirates', UZ: 'Uzbekistan',
  YE: 'Yemen',
  // ---- South / East / Southeast Asia ----
  BD: 'Bangladesh', BT: 'Bhutan', BN: 'Brunei', KH: 'Cambodia', CN: 'China',
  IN: 'India', ID: 'Indonesia', JP: 'Japan', KP: 'North Korea', KR: 'South Korea',
  LA: 'Laos', MY: 'Malaysia', MV: 'Maldives', MN: 'Mongolia', MM: 'Myanmar',
  NP: 'Nepal', PH: 'Philippines', LK: 'Sri Lanka', SG: 'Singapore', TH: 'Thailand',
  TL: 'Timor-Leste', VN: 'Vietnam',
  // ---- North & Central America ----
  BZ: 'Belize', CR: 'Costa Rica', CU: 'Cuba', DO: 'Dominican Republic', SV: 'El Salvador',
  GT: 'Guatemala', HT: 'Haiti', HN: 'Honduras', JM: 'Jamaica', MX: 'Mexico',
  NI: 'Nicaragua', PA: 'Panama', PR: 'Puerto Rico', US: 'United States',
  TT: 'Trinidad and Tobago', AG: 'Antigua and Barbuda', BS: 'Bahamas',
  BB: 'Barbados', DM: 'Dominica', GD: 'Grenada', KN: 'Saint Kitts and Nevis',
  LC: 'Saint Lucia', VC: 'Saint Vincent and the Grenadines',
  // ---- South America ----
  AR: 'Argentina', BO: 'Bolivia', BR: 'Brazil', CA: 'Canada', CL: 'Chile',
  CO: 'Colombia', EC: 'Ecuador', GY: 'Guyana', PY: 'Paraguay', PE: 'Peru',
  SR: 'Suriname', UY: 'Uruguay', VE: 'Venezuela',
  // ---- Sub-Saharan Africa ----
  AO: 'Angola', BW: 'Botswana', BF: 'Burkina Faso', BI: 'Burundi', CM: 'Cameroon',
  CV: 'Cape Verde', CF: 'Central African Republic', TD: 'Chad', KM: 'Comoros',
  CG: 'Congo', CD: 'DR Congo', CI: "Côte d'Ivoire", DJ: 'Djibouti', ER: 'Eritrea',
  SZ: 'Eswatini', ET: 'Ethiopia', GA: 'Gabon', GM: 'Gambia', GH: 'Ghana',
  GN: 'Guinea', GW: 'Guinea-Bissau', KE: 'Kenya', LS: 'Lesotho', LR: 'Liberia',
  MG: 'Madagascar', MW: 'Malawi', ML: 'Mali', MR: 'Mauritania', MU: 'Mauritius',
  MZ: 'Mozambique', NA: 'Namibia', NE: 'Niger', NG: 'Nigeria', RW: 'Rwanda',
  ST: 'São Tomé and Príncipe', SN: 'Senegal', SC: 'Seychelles', SL: 'Sierra Leone',
  SO: 'Somalia', ZA: 'South Africa', SS: 'South Sudan', SD: 'Sudan',
  TZ: 'Tanzania', TG: 'Togo', UG: 'Uganda', ZM: 'Zambia', ZW: 'Zimbabwe',
  // ---- Oceania ----
  AU: 'Australia', FJ: 'Fiji', KI: 'Kiribati', MH: 'Marshall Islands',
  FM: 'Micronesia', NR: 'Nauru', NZ: 'New Zealand', PW: 'Palau',
  PG: 'Papua New Guinea', WS: 'Samoa', SB: 'Solomon Islands', TO: 'Tonga',
  TV: 'Tuvalu', VU: 'Vanuatu',
};

// Codes covered by the Copernicus EFFIS feed (Europe + the Mediterranean basin).
// Everything else is fetched via the global LLM (fetchWildfireHistory).
export const EFFIS_COUNTRY_CODES = new Set<string>([
  // Europe
  'AT','AL','AD','AM','AZ','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FI','FR','GE',
  'DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','MD','MC','ME','NL','MK','NO',
  'PL','PT','RO','RU','SM','RS','SK','SI','ES','SE','CH','TR','UA','GB','VA',
  // Mediterranean / North Africa / Middle East
  'DZ','EG','IL','IQ','JO','LB','LY','MA','PS','SY','TN','EH',
]);

export const ALL_COUNTRIES = Object.entries(COUNTRY_NAMES)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const EFFIS_COUNTRIES = ALL_COUNTRIES.filter((c) => EFFIS_COUNTRY_CODES.has(c.code));
export const GLOBAL_COUNTRIES = ALL_COUNTRIES.filter((c) => !EFFIS_COUNTRY_CODES.has(c.code));

export const isEffisCountry = (code: string) => EFFIS_COUNTRY_CODES.has(code);

// Source labels shown in the admin UI. "LLM" = the global Large-Language-Model fetch
// (fetchWildfireHistory), stored on incidents as source 'MANUAL'.
export const SOURCE_LABELS: Record<string, string> = {
  COPERNICUS_EFFIS: 'EFFIS',
  NIFC: 'NIFC',
  NASA_FIRMS: 'NASA FIRMS',
  CAL_FIRE: 'CAL FIRE',
  INCIWEB: 'InciWeb',
  GFW: 'Global Forest Watch',
  MANUAL: 'LLM',
  LLM: 'LLM',
  OTHER: 'Other',
};