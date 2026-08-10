// Shared wildfire country lists used by the admin data dashboard and timeline.
// Kept in sync with the backend getWildfireStats / fetch functions.

export const EFFIS_COUNTRIES = [
  { code: "ES", name: "Spain" }, { code: "PT", name: "Portugal" }, { code: "GR", name: "Greece" },
  { code: "IT", name: "Italy" }, { code: "FR", name: "France" }, { code: "HR", name: "Croatia" },
  { code: "BG", name: "Bulgaria" }, { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czech Republic" },
  { code: "EE", name: "Estonia" }, { code: "FI", name: "Finland" }, { code: "DE", name: "Germany" },
  { code: "HU", name: "Hungary" }, { code: "LV", name: "Latvia" }, { code: "LT", name: "Lithuania" },
  { code: "PL", name: "Poland" }, { code: "RO", name: "Romania" }, { code: "SK", name: "Slovakia" },
  { code: "SE", name: "Sweden" }, { code: "CH", name: "Switzerland" }, { code: "TR", name: "Turkey" },
  { code: "LB", name: "Lebanon" },
];

export const GLOBAL_COUNTRIES = [
  { code: "US", name: "United States" }, { code: "AU", name: "Australia" }, { code: "CA", name: "Canada" },
  { code: "BR", name: "Brazil" }, { code: "AR", name: "Argentina" }, { code: "CL", name: "Chile" },
  { code: "ZA", name: "South Africa" }, { code: "ID", name: "Indonesia" }, { code: "RU", name: "Russia" },
  { code: "MX", name: "Mexico" }, { code: "CO", name: "Colombia" }, { code: "BO", name: "Bolivia" },
  { code: "NZ", name: "New Zealand" }, { code: "MN", name: "Mongolia" }, { code: "KZ", name: "Kazakhstan" },
  { code: "IN", name: "India" }, { code: "CN", name: "China" }, { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" }, { code: "PH", name: "Philippines" }, { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" }, { code: "TZ", name: "Tanzania" }, { code: "PE", name: "Peru" },
  { code: "EC", name: "Ecuador" }, { code: "VE", name: "Venezuela" }, { code: "PY", name: "Paraguay" },
  { code: "UY", name: "Uruguay" }, { code: "MZ", name: "Mozambique" }, { code: "AO", name: "Angola" },
  { code: "ZM", name: "Zambia" }, { code: "ZW", name: "Zimbabwe" }, { code: "BW", name: "Botswana" },
  { code: "NA", name: "Namibia" },
];

// Deduped union, sorted by full name.
export const ALL_COUNTRIES = (() => {
  const seen = new Set();
  const list = [];
  for (const c of [...EFFIS_COUNTRIES, ...GLOBAL_COUNTRIES]) {
    if (!seen.has(c.code)) { seen.add(c.code); list.push(c); }
  }
  return list.sort((a, b) => a.name.localeCompare(b.name));
})();

export const COUNTRY_NAMES = (() => {
  const m = {};
  for (const c of ALL_COUNTRIES) m[c.code] = c.name;
  return m;
})();

export const isEffisCountry = (code) => EFFIS_COUNTRIES.some((c) => c.code === code);