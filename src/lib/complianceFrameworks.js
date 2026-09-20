// Country-specific fire & life safety compliance content for business accounts.
// The regulating authority, the framework a business is inspected against, the
// inspection cadence, the regulatory requirements and the on-site checklist all
// differ by country — so they live here as data instead of being hardcoded into
// the dashboard and portal UI.

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
  inspections: [
    { item: "Fire extinguishers", cadence: "Monthly visual check, annual professional service" },
    { item: "Exit signs & emergency lighting", cadence: "Tested monthly" },
    { item: "Sprinkler & fire alarm systems", cadence: "Inspected annually to NFPA 25 / NFPA 72" },
    { item: "AED units, batteries & pads", cadence: "Checked monthly, replaced to manufacturer date" },
    { item: "Staff CPR / first aid / AED certifications", cadence: "Renewed every 2 years" },
    { item: "Fire drill", cadence: "Conducted and logged annually" },
  ],
  requirements: [
    "Keep egress paths and exit doors clear and unobstructed at all times.",
    "Post evacuation maps on every floor of the building.",
    "Assign a trained floor warden for each occupied floor.",
    "Store hazardous materials according to the applicable fire code.",
    "Retain drill and inspection records for the authority having jurisdiction.",
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
  inspections: [
    { item: "Fire extinguishers", cadence: "Monthly inspection, annual service" },
    { item: "Smoke & carbon monoxide alarms", cadence: "Tested monthly" },
    { item: "Emergency lighting & exit signs", cadence: "Tested monthly" },
    { item: "Fire alarm & sprinkler systems", cadence: "Inspected to provincial code" },
    { item: "Staff first aid & CPR certifications", cadence: "Renewed to provincial OHS requirements" },
    { item: "Fire drill", cadence: "Conducted and documented annually" },
  ],
  requirements: [
    "Keep a documented fire safety plan for the building.",
    "Post evacuation plans on every floor.",
    "Store hazardous materials per the National Fire Code of Canada.",
    "Meet provincial OHS first aid and CPR requirements for the number of workers on site.",
    "Retain inspection and maintenance records for review by the fire department.",
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
  inspections: [
    { item: "Fire extinguishers, hose reels & fire blankets", cadence: "Serviced to AS 1851 (typically every 6 months)" },
    { item: "Emergency lighting & exit signs", cadence: "Tested at least every 6 months" },
    { item: "Fire detection & alarm systems", cadence: "Maintained to AS 1851" },
    { item: "First aid kits", cadence: "Checked to the workplace first aid code of practice" },
    { item: "AED units, batteries & pads", cadence: "Checked monthly" },
    { item: "Evacuation exercise", cadence: "Conducted at least annually" },
  ],
  requirements: [
    "Appoint chief wardens, wardens and first aid officers for each area.",
    "Display current evacuation diagrams on every floor (AS 3745).",
    "Maintain fire protection systems to AS 1851 and keep the records.",
    "Provide first aid equipment and trained first aiders under the WHS regulations.",
    "Store and label hazardous substances per the WHS regulations.",
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
  inspections: [
    { item: "Fire extinguishers", cadence: "Serviced annually and tagged" },
    { item: "Fire detection & alarm system", cadence: "Serviced and tested periodically" },
    { item: "Emergency lighting", cadence: "Tested monthly, certified annually" },
    { item: "Escape routes & fire doors", cadence: "Checked regularly and kept clear" },
    { item: "AED units, batteries & pads", cadence: "Checked monthly" },
    { item: "Emergency evacuation drill", cadence: "Carried out and recorded" },
  ],
  requirements: [
    "Maintain a fire safety register and make it available for inspection.",
    "Display fire safety notices and evacuation plans.",
    "Provide and maintain adequate means of escape from the building.",
    "Provide occupational first aid training and equipment under the 2005 Act.",
    "Assess and store hazardous substances under the chemical agents regulations.",
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
  inspections: [
    { item: "Fire risk assessment", cadence: "Recorded, reviewed and kept up to date" },
    { item: "Fire extinguishers", cadence: "Serviced annually and tagged" },
    { item: "Fire detection & alarm system", cadence: "Tested weekly, serviced periodically" },
    { item: "Emergency lighting & exit signs", cadence: "Tested monthly" },
    { item: "AED units, batteries & pads", cadence: "Checked monthly" },
    { item: "Emergency evacuation drill", cadence: "Carried out and recorded" },
  ],
  requirements: [
    "Record the fire risk assessment and review it regularly.",
    "Appoint one or more competent persons to manage fire safety.",
    "Display fire safety notices and evacuation plans.",
    "Assess and store hazardous substances under COSHH.",
    "Keep escape routes and fire doors clear and unobstructed.",
  ],
};

const REGIONS = { US, CA, AU, IE, GB };

// Ordered list for the compliance portal selector.
export const COMPLIANCE_REGIONS = [US, CA, AU, IE, GB];

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