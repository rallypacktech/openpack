import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Loader2 } from "lucide-react";
import { COUNTRY_EMERGENCY_DATA } from "@/components/settings/CountryEmergencySettings";

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];

// State-specific disaster context
const STATE_DISASTERS = {
  TX: { primary: "wildfires, tornadoes, and hurricanes (Gulf Coast)", stayWhen: "Tornado warning — go to interior room or storm shelter", leaveWhen: "Hurricane warning along the coast or major wildfire evacuation order" },
  CA: { primary: "wildfires and earthquakes", stayWhen: "Earthquake — drop, cover, hold on. Shelter until shaking stops", leaveWhen: "Wildfire evacuation order or mandatory evacuation zone alert" },
  FL: { primary: "hurricanes, tornadoes, and flooding", stayWhen: "Tornado warning — go to interior room without windows", leaveWhen: "Hurricane Category 3+ warning or storm surge evacuation zone notice" },
  LA: { primary: "hurricanes and flooding", stayWhen: "Heavy rain and local flooding — avoid driving through water", leaveWhen: "Hurricane warning or rising flood water above street level" },
  OK: { primary: "tornadoes and severe storms", stayWhen: "Tornado watch — monitor alerts, be ready to move to shelter immediately", leaveWhen: "Tornado warning near you — move to a storm shelter or interior room NOW" },
  KS: { primary: "tornadoes and severe thunderstorms", stayWhen: "Tornado watch — prepare your storm shelter and stay alert", leaveWhen: "Tornado warning — take cover in lowest floor interior room immediately" },
  CO: { primary: "wildfires and blizzards", stayWhen: "Blizzard warning — stay off roads, stay indoors with supplies", leaveWhen: "Wildfire evacuation order in your zone" },
  WA: { primary: "wildfires, earthquakes, and volcanic activity", stayWhen: "Earthquake — shelter in place, check for gas leaks after shaking stops", leaveWhen: "Wildfire evacuation order or volcanic ash advisory to leave the area" },
  OR: { primary: "wildfires, earthquakes, and tsunamis (coast)", stayWhen: "Earthquake — drop, cover, hold on; then move to high ground if near coast", leaveWhen: "Wildfire evacuation order or tsunami warning if near the Oregon coast" },
  NC: { primary: "hurricanes and flooding", stayWhen: "Inland flooding or tornado warning — shelter in place", leaveWhen: "Hurricane landfall warning or coastal surge evacuation order" },
};

function getStateDisaster(stateCode) {
  return STATE_DISASTERS[stateCode] || {
    primary: "severe weather, flooding, and local hazards",
    stayWhen: "Tornado warning, severe winter storms, chemical spill or local hazard",
    leaveWhen: "Hurricane warning, wildfire evacuation order, or major flooding",
  };
}

export default function CommunityOneSheet({ organizationName }) {
  const [selectedState, setSelectedState] = useState("TX");
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const state = US_STATES.find(s => s.code === selectedState);
      const disaster = getStateDisaster(selectedState);
      const emergencyNum = "911";

      const html = buildOneSheetHTML(state?.name || selectedState, disaster, emergencyNum, organizationName);

      // Open in new window so user can print/save as PDF
      const win = window.open("", "_blank");
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 800);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-foreground mb-1">Community One Sheet</h3>
        <p className="text-sm text-muted-foreground">
          Download a printable one-page safety guide customized for your state — share it with your team or community.
        </p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Select your state" />
          </SelectTrigger>
          <SelectContent>
            {US_STATES.map(s => (
              <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleDownload} disabled={generating} className="flex items-center gap-2">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
          {generating ? "Generating…" : "Download One Sheet (PDF)"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Opens a print dialog — choose "Save as PDF" to download.</p>
    </div>
  );
}

function buildOneSheetHTML(stateName, disaster, emergencyNum, orgName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>RallyPack — ${stateName} Family Safety Guide</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Inter, Arial, sans-serif; color: #1C1C1A; background: #fff; width: 8.5in; min-height: 11in; padding: 0.55in 0.6in; }
  h1 { font-size: 2.6rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 0.15in; }
  h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.1in; margin-top: 0.25in; text-transform: uppercase; letter-spacing: 0.05em; }
  p { font-size: 0.85rem; line-height: 1.6; color: #44433E; }
  hr { border: none; border-top: 2px solid #1C1C1A; margin: 0.18in 0; }
  .tagline { font-size: 0.82rem; color: #44433E; margin-bottom: 0.25in; max-width: 5in; line-height: 1.6; }
  .intro-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.2in 0.4in; margin-bottom: 0.2in; }
  .intro-item strong { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 2px; }
  .intro-item p { font-size: 0.78rem; color: #55534E; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0 0.35in; margin-top: 0.1in; }
  ul { padding-left: 1.1rem; }
  ul li { font-size: 0.82rem; line-height: 1.7; color: #44433E; }
  .checklist li { list-style: none; padding-left: 0; }
  .checklist li::before { content: "✓ "; font-weight: 700; color: #1C1C1A; }
  .arrow-list li { list-style: none; padding-left: 0; }
  .arrow-list li::before { content: "► "; font-weight: 700; }
  .section-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.12em; color: #888; font-weight: 600; margin-bottom: 3px; }
  .emergency-box { background: #F5F0E8; border-left: 4px solid #D64A2E; padding: 0.12in 0.18in; margin-top: 0.18in; margin-bottom: 0.1in; }
  .emergency-box strong { font-size: 0.88rem; }
  .emergency-box p { font-size: 0.8rem; margin-top: 3px; }
  .footer-block { margin-top: 0.3in; border-top: 1px solid #ccc; padding-top: 0.15in; display: flex; justify-content: space-between; align-items: flex-end; }
  .footer-block .badge { font-size: 0.72rem; color: #888; }
  .badge-row { display: flex; gap: 0.2in; margin-top: 0.1in; }
  .badge-item { font-size: 0.72rem; font-weight: 600; background: #F5F0E8; padding: 3px 8px; }
  @media print {
    body { padding: 0.45in 0.5in; }
    @page { size: letter portrait; margin: 0; }
  }
</style>
</head>
<body>

<p class="section-label">${stateName} Family Safety Guide</p>
<h1>YOUR FAMILY'S SAFETY,<br/>SIMPLY PREPARED.</h1>
<hr/>

<p class="tagline">${stateName} families sometimes face unexpected events — from ${disaster.primary} to power outages. Do you have a simple plan to keep everyone safe?</p>

<h2>Introducing: RallyPack.org <span style="font-size:0.8rem;font-weight:500;text-transform:none;letter-spacing:0">(Currently in Beta)</span></h2>
<div class="intro-grid">
  <div class="intro-item"><strong>Stay Informed</strong><p>Real-time alerts for important local events in your area.</p></div>
  <div class="intro-item"><strong>Be Prepared</strong><p>Clear advice: Stay home or go? Know what's best for your family.</p></div>
  <div class="intro-item"><strong>Always Free</strong><p>Safety shouldn't depend on your income. No fees. Ever.</p></div>
  <div class="intro-item"><strong>Community-Powered</strong><p>Help your neighbors stay safe and informed, together.</p></div>
</div>

<hr/>
<h2>Family Safety Choices: Stay or Go?</h2>

<div class="two-col">
  <div>
    <p style="font-weight:700;font-size:0.82rem;margin-bottom:6px;">► STAY HOME when:</p>
    <ul class="arrow-list">
      <li style="list-style:none;padding-left:0;font-size:0.8rem;line-height:1.7;color:#44433E;">${disaster.stayWhen}</li>
      <li style="list-style:none;padding-left:0;font-size:0.8rem;line-height:1.7;color:#44433E;">Heavy rain, flooding (NEVER drive in water)</li>
      <li style="list-style:none;padding-left:0;font-size:0.8rem;line-height:1.7;color:#44433E;">Chemical spill or danger nearby</li>
      <li style="list-style:none;padding-left:0;font-size:0.8rem;line-height:1.7;color:#44433E;">Very hot weather, power problems</li>
    </ul>
    <ul class="checklist" style="margin-top:8px;">
      <li>Stay inside, in the safest room</li>
      <li>Close doors/windows if air is bad</li>
      <li>Watch for safety alerts</li>
      <li>Charge phone, have water ready</li>
    </ul>
  </div>
  <div>
    <p style="font-weight:700;font-size:0.82rem;margin-bottom:6px;">► LEAVE HOME when:</p>
    <ul style="list-style:none;padding-left:0;">
      <li style="font-size:0.8rem;line-height:1.7;color:#44433E;padding-left:0;">${disaster.leaveWhen}</li>
      <li style="font-size:0.8rem;line-height:1.7;color:#44433E;padding-left:0;">Police or city authorities tell you to leave</li>
      <li style="font-size:0.8rem;line-height:1.7;color:#44433E;padding-left:0;">Your home is not safe</li>
    </ul>
    <ul class="checklist" style="margin-top:8px;">
      <li>Leave early — don't wait for roads to close</li>
      <li>Take medicine, important papers, and emergency kit</li>
      <li>Know your way out before you go</li>
      <li>Tell a friend or family member where you are going</li>
    </ul>
  </div>
</div>

<div class="emergency-box">
  <strong>🚨 ${stateName} Emergency Number: ${emergencyNum}</strong>
  <p>In any life-threatening emergency, call ${emergencyNum} immediately. RallyPack supports — but never replaces — emergency services.</p>
</div>

<hr/>
<h2>Why We Built RallyPack</h2>
<p>We believe every family deserves life-saving information, no matter their income. RallyPack is free to use and always will be. We earn money through partnerships for emergency supplies, which helps us keep the platform running without charging you.</p>

<hr/>
<h2>Get Ready with RallyPack!</h2>
<div class="badge-row">
  <span class="badge-item">※ Currently in BETA</span>
  <span class="badge-item">※ NO COST, NO CATCH</span>
  <span class="badge-item">※ PRIVACY FIRST</span>
</div>

<div class="footer-block">
  <div>
    <p style="font-size:0.78rem;color:#555;">Questions? Contact us: <strong>beta@rallypack.org</strong></p>
    <p style="font-size:0.78rem;color:#555;">Learn more: <strong>rallypack.org</strong></p>
    ${orgName ? `<p style="font-size:0.72rem;color:#888;margin-top:4px;">Shared by: ${orgName}</p>` : ""}
  </div>
  <div style="text-align:right;">
    <p style="font-size:1.3rem;font-weight:800;letter-spacing:-0.02em;">RallyPack</p>
    <p style="font-size:0.68rem;color:#aaa;">Free Emergency Preparedness</p>
  </div>
</div>

</body>
</html>`;
}