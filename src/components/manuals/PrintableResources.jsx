import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// ── Shared print helper ───────────────────────────────────────────────
function openPrintWindow(title, innerHtml) {
  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — RallyPack</title>
  <style>
    body { font-family: Georgia, serif; max-width: 760px; margin: 36px auto; padding: 0 24px; color: #111; }
    h1 { font-size: 26px; margin-bottom: 4px; }
    .meta { font-size: 13px; color: #555; margin-bottom: 20px; font-family: sans-serif; }
    .intro { background: #f5f5f0; border-left: 4px solid #c0392b; padding: 12px 16px; margin-bottom: 24px; font-size: 14px; }
    h2 { font-size: 17px; margin-top: 26px; margin-bottom: 6px; font-family: sans-serif; border-bottom: 2px solid #222; padding-bottom: 4px; }
    h3 { font-size: 14px; margin-top: 16px; margin-bottom: 6px; font-family: sans-serif; color: #333; }
    ul { margin: 0; padding-left: 20px; }
    li { margin-bottom: 5px; font-size: 13.5px; line-height: 1.55; }
    li b { font-family: sans-serif; }
    .states { font-size: 12.5px; color: #555; font-family: sans-serif; margin: 2px 0 6px; }
    .note { font-size: 12.5px; color: #666; font-style: italic; margin: 2px 0 8px; }
    .footer { margin-top: 36px; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 12px; font-family: sans-serif; }
    .logo { font-family: Georgia, serif; font-size: 18px; font-weight: bold; margin-bottom: 4px; }
    .print-note { font-size: 12px; color: #888; font-family: sans-serif; margin-bottom: 20px; }
    @media print { .print-note { display: none; } body { margin: 0 auto; } }
  </style>
</head>
<body>
  <div class="logo">RallyPack</div>
  <p class="print-note">To save as PDF: File &rarr; Print &rarr; Save as PDF</p>
  ${innerHtml}
</body>
</html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

// ── Pet-Friendly Hotel Chains ─────────────────────────────────────────
const HOTELS_BY_COUNTRY = [
  {
    country: "United States",
    chains: [
      ["Motel 6", "Pets stay free at every location. No size limit."],
      ["Red Roof Inn", "One well-behaved pet per room, no fee."],
      ["La Quinta by Wyndham", "Most locations pet-friendly, usually no fee. Up to 2 pets."],
      ["Best Western / Best Western Plus", "Policy varies by location — many pet-friendly, fees typical."],
      ["Kimpton Hotels", "Pets of any size, no fees, no deposits."],
      ["Drury Hotels", "Up to 2 pets, nightly pet fee applies."],
      ["Extended Stay America", "Pet-friendly extended stay, fees apply."],
      ["Candlewood Suites & Staybridge Suites (IHG)", "Pet-friendly extended-stay brands."],
      ["Aloft & Element (Marriott)", "Pet-friendly; Aloft offers the 'Arf' pet program."],
      ["Hilton, Homewood Suites & Home2 Suites", "Many locations pet-friendly, fees vary."],
      ["Four Seasons", "Luxury pet-friendly, often with pet amenities."],
    ],
  },
  {
    country: "Canada",
    chains: [
      ["Best Western Canada", "Many pet-friendly locations, fees vary."],
      ["Motel 6 Canada", "Pets stay free."],
      ["Fairmont Hotels", "Pet-friendly; some offer a 'Canine Ambassador' program."],
      ["Delta Hotels (Marriott)", "Select pet-friendly locations."],
      ["Sandman Hotels", "Many pet-friendly locations across western Canada."],
    ],
  },
  {
    country: "United Kingdom",
    chains: [
      ["Premier Inn", "Select hotels accept dogs (max 2 per room), fee per night."],
      ["Travelodge", "Designated pet rooms at many locations, fee per stay."],
      ["Hilton UK", "Many locations pet-friendly, call ahead."],
    ],
  },
  {
    country: "Australia",
    chains: [
      ["Quest Apartment Hotels", "Many pet-friendly serviced apartments."],
      ["Mantra / Peppers (Accor)", "Select pet-friendly locations."],
      ["Best Western Australia", "Pet policy varies by property."],
    ],
  },
];

const US_FEMA_REGIONS = [
  { region: "Region 1 — New England", states: "CT, ME, MA, NH, RI, VT" },
  { region: "Region 2 — Northeast", states: "NJ, NY, Puerto Rico, US Virgin Islands" },
  { region: "Region 3 — Mid-Atlantic", states: "DE, DC, MD, PA, VA, WV" },
  { region: "Region 4 — Southeast", states: "AL, FL, GA, KY, MS, NC, SC, TN", note: "Hurricane season (Jun–Nov): book early and confirm pet rooms — coastal hotels fill fast during evacuations." },
  { region: "Region 5 — Great Lakes", states: "IL, IN, MI, MN, OH, WI" },
  { region: "Region 6 — South Central", states: "AR, LA, NM, OK, TX", note: "Hurricane & flood-prone Gulf areas — keep a backup inland reservation." },
  { region: "Region 7 — Central", states: "IA, KS, MO, NE", note: "Tornado country — know hotels along your evacuation route, not just your destination." },
  { region: "Region 8 — Mountain", states: "CO, MT, ND, SD, UT, WY" },
  { region: "Region 9 — Pacific Southwest", states: "AZ, CA, HI, NV, Guam, American Samoa", note: "Wildfire season — reserve early; pet-friendly rooms near fire zones sell out quickly." },
  { region: "Region 10 — Pacific Northwest", states: "AK, ID, OR, WA", note: "Wildfire & flood risk — confirm road access to your hotel before leaving." },
];

function printHotelList() {
  const countriesHtml = HOTELS_BY_COUNTRY.map(c => `
    <h2>${c.country}</h2>
    <ul>${c.chains.map(([name, desc]) => `<li><b>${name}</b> — ${desc}</li>`).join("")}</ul>
  `).join("");

  const femaHtml = US_FEMA_REGIONS.map(r => `
    <h3>${r.region}</h3>
    <p class="states">States: ${r.states}</p>
    ${r.note ? `<p class="note">${r.note}</p>` : ""}
  `).join("");

  const inner = `
    <h1>🏨 Pet-Friendly Hotel Chains</h1>
    <div class="meta">Evacuation lodging reference &nbsp;·&nbsp; Sources: Best Friends Animal Society, Red Cross, Local Emergency Management</div>
    <div class="intro"><b>Always call ahead.</b> Pet policies, fees, and size limits change and vary by individual location. During disasters, request a pet-friendly room as early as possible and confirm before you arrive.</div>
    ${countriesHtml}
    <h2>United States — by FEMA Region</h2>
    <p class="note">All national U.S. chains listed above operate across every FEMA region. Use these region notes to plan around your local disaster risks.</p>
    ${femaHtml}
    <div class="footer">RallyPack reference guide. Policies are subject to change — verify directly with each hotel. Many emergency shelters do not accept pets, so identify pet-friendly lodging before a disaster strikes.</div>
  `;
  openPrintWindow("Pet-Friendly Hotel Chains", inner);
}

// ── Emergency Contact Card ────────────────────────────────────────────
function printContactCard() {
  const line = (label) => `<div class="field"><span class="lbl">${label}</span><span class="ln"></span></div>`;
  const inner = `
    <style>
      .card { border: 2px solid #222; border-radius: 8px; padding: 16px 18px; margin-bottom: 18px; page-break-inside: avoid; }
      .card h2 { margin-top: 0; border: none; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; }
      .field { display: flex; align-items: flex-end; gap: 8px; margin-bottom: 11px; }
      .lbl { font-family: sans-serif; font-size: 11px; color: #444; white-space: nowrap; }
      .ln { flex: 1; border-bottom: 1px solid #999; height: 14px; }
      .row2 { display: flex; gap: 18px; }
      .row2 > .field { flex: 1; }
      .cut { text-align: center; font-family: sans-serif; font-size: 11px; color: #aaa; border-top: 1px dashed #bbb; margin: 22px 0; padding-top: 6px; }
    </style>
    <h1>🆔 Emergency Contact Card</h1>
    <div class="meta">Fill this out, cut along the dashed line, and keep a copy in every go-bag, wallet, and vehicle.</div>

    <div class="card">
      <h2>Personal Information</h2>
      ${line("Full Name")}
      <div class="row2">${line("Date of Birth")}${line("Blood Type")}</div>
      ${line("Home Address")}
      <div class="row2">${line("Allergies")}${line("Medical Conditions")}</div>
      ${line("Medications")}
    </div>

    <div class="card">
      <h2>Emergency Contacts</h2>
      <div class="row2">${line("Out-of-Area Contact")}${line("Phone")}</div>
      <div class="row2">${line("Local Contact 1")}${line("Phone")}</div>
      <div class="row2">${line("Local Contact 2")}${line("Phone")}</div>
      <div class="row2">${line("Doctor")}${line("Phone")}</div>
    </div>

    <div class="cut">— — — — — — — — — —  cut here  — — — — — — — — — —</div>

    <div class="card">
      <h2>Meeting Places</h2>
      ${line("Primary Meeting Place")}
      ${line("Out-of-Neighborhood Meeting Place")}
      <div class="row2">${line("Insurance Provider")}${line("Policy #")}</div>
    </div>

    <div class="card">
      <h2>Pets</h2>
      <div class="row2">${line("Pet Name / Species")}${line("Microchip #")}</div>
      <div class="row2">${line("Veterinarian")}${line("Phone")}</div>
      ${line("Pet-Friendly Lodging / Shelter")}
    </div>

    <div class="footer">RallyPack emergency contact card. Keep written copies — phones lose power and signal during disasters. In an emergency, contact your local emergency services immediately.</div>
  `;
  openPrintWindow("Emergency Contact Card", inner);
}

// ── Registry + reusable button ────────────────────────────────────────
const RESOURCES = {
  "pet-friendly hotel list": { label: "Download hotel list", print: printHotelList },
  "emergency contact card": { label: "Download contact card", print: printContactCard },
};

export function getPrintableResource(itemName) {
  if (!itemName) return null;
  return RESOURCES[itemName.trim().toLowerCase()] || null;
}

export function DownloadResourceButton({ itemName, className = "", variant = "outline", size = "sm", fullWidth = false }) {
  const resource = getPrintableResource(itemName);
  if (!resource) return null;
  return (
    <Button
      variant={variant}
      size={size}
      className={`${fullWidth ? "w-full " : ""}${className}`}
      onClick={resource.print}
    >
      <Download className="w-4 h-4 mr-1" />
      {resource.label}
    </Button>
  );
}