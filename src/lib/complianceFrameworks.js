// Country-specific fire & life safety compliance content for business accounts.
// The regulating authority, the framework a business is inspected against, and
// the on-site checklist all differ by country — so they live here as data
// instead of being hardcoded into the dashboard UI.

const US = {
  code: "US",
  label: "United States",
  authority: "Local fire marshal / fire prevention bureau",
  framework: "NFPA standards and OSHA workplace safety requirements",
  checklist: [
    "AED units, batteries, and pads in date (check monthly)",
    "Staff CPR / first aid / AED certifications current",
    "Fire extinguishers inspected and tagged (annual)",
    "Exit signs lit and emergency lighting tested monthly",
    "Egress paths clear and unobstructed at all times",
    "Posted evacuation maps on every floor",
    "Annual fire drill conducted and logged",
    "Hazardous materials stored per fire code",
    "Sprinkler/alarm system inspection current",
    "Trained floor wardens on each occupied floor",
  ],
};

const CA = {
  code: "CA",
  label: "Canada",
  authority: "Municipal fire department / provincial fire commissioner",
  framework:
    "National Fire Code of Canada, CSA standards, and provincial occupational health and safety law",
  checklist: [
    "AED units, batteries, and pads in date (check monthly)",
    "Staff first aid and CPR certifications current",
    "Fire extinguishers inspected monthly and serviced annually",
    "Smoke and carbon monoxide alarms tested monthly",
    "Emergency lighting and exit signs tested monthly",
    "Egress paths and exit doors clear and unobstructed",
    "Evacuation plans posted on every floor",
    "Annual fire drill conducted and documented",
    "Sprinkler and fire alarm systems inspected to provincial code",
    "Hazardous materials stored per the National Fire Code",
  ],
};

const AU = {
  code: "AU",
  label: "Australia",
  authority: "State or territory work health and safety regulator",
  framework:
    "WHS legislation, AS 1851 (maintenance of fire protection systems) and AS 3745 (evacuation planning)",
  checklist: [
    "AED units, batteries, and pads in date (check monthly)",
    "First aid kits stocked and checked to the workplace first aid code of practice",
    "Fire extinguishers, hose reels, and fire blankets serviced to AS 1851",
    "Smoke alarms and fire detection systems tested and maintained",
    "Emergency lighting and exit signs tested at least every 6 months",
    "Evacuation diagrams displayed and current on every floor",
    "Chief warden, wardens, and first aid officers appointed for each area",
    "Emergency evacuation exercise conducted at least annually",
    "Egress paths and fire doors clear and unobstructed",
    "Hazardous substances stored and labelled per the WHS regulations",
  ],
};

const IE = {
  code: "IE",
  label: "Ireland",
  authority: "Local fire authority and the Health and Safety Authority (HSA)",
  framework:
    "Fire Services Acts, the Safety, Health and Welfare at Work Act 2005, and IS 291 fire safety guidance",
  checklist: [
    "AED units, batteries, and pads in date (check monthly)",
    "Fire safety register maintained and available for inspection",
    "Fire extinguishers serviced annually and tagged",
    "Fire detection and alarm system serviced and tested",
    "Emergency lighting tested monthly and certified annually",
    "Escape routes and fire doors clear and unobstructed",
    "Fire safety notices and evacuation plans displayed",
    "Emergency evacuation drill carried out and recorded",
    "Staff first aid and occupational first aid training current",
    "Hazardous substances assessed and stored under the chemical agents regulations",
  ],
};

const GB = {
  code: "GB",
  label: "United Kingdom",
  authority: "Local fire and rescue service",
  framework:
    "Regulatory Reform (Fire Safety) Order 2005 and the Health and Safety at Work etc. Act 1974",
  checklist: [
    "AED units, batteries, and pads in date (check monthly)",
    "Fire risk assessment reviewed and up to date",
    "Fire extinguishers serviced annually and tagged",
    "Fire detection and alarm system tested weekly and serviced",
    "Emergency lighting and exit signs tested monthly",
    "Escape routes and fire doors clear and unobstructed",
    "Fire safety notices and evacuation plans displayed",
    "Emergency evacuation drill carried out and recorded",
    "Staff first aid and appointed person training current",
    "Hazardous substances stored and assessed under COSHH",
  ],
};

const REGIONS = { US, CA, AU, IE, GB };

// Accepts an ISO country code or a country name and always returns a region,
// falling back to the United States so the checklist never renders empty.
export function getComplianceRegion(countryCode) {
  const raw = (countryCode || "").toString().trim();
  if (!raw) return US;
  const upper = raw.toUpperCase();
  if (REGIONS[upper]) return REGIONS[upper];
  const byName = Object.values(REGIONS).find(
    (r) => r.label.toLowerCase() === raw.toLowerCase(),
  );
  return byName || US;
}