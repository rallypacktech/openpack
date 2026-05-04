import React, { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp, Phone, Globe, MapPin, Heart, Home, Brain, Shield, Plane, TrendingUp } from "lucide-react";

const RESOURCE_CATEGORIES = [
  {
    id: "immediate",
    label: "Immediate Response",
    icon: Shield,
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    resources: [
      { name: "FEMA Ready.gov", desc: "Official family preparedness guides, kit checklists, and disaster-specific plans.", url: "https://www.ready.gov", icon: "🏛️" },
      { name: "FEMA Disaster Declarations", desc: "Current federally declared disasters and individual assistance programs.", url: "https://www.fema.gov/disasters", icon: "📋" },
      { name: "FEMA Apply for Assistance", desc: "Apply for FEMA individual assistance after a declared disaster at DisasterAssistance.gov.", url: "https://www.disasterassistance.gov", icon: "💬" },
      { name: "American Red Cross", desc: "Shelter finder, disaster relief, first aid training, and emergency blood supply.", url: "https://www.redcross.org", icon: "🔴" },
      { name: "NOAA Weather Alerts", desc: "Real-time severe weather warnings, watches, and advisories.", url: "https://www.weather.gov/alerts", icon: "⛈️" },
      { name: "211.org — Local Resources", desc: "County and city-level social services, shelters, and emergency support.", url: "https://www.211.org", icon: "📞" },
    ],
  },
  {
    id: "americorps",
    label: "AmeriCorps & Volunteers",
    icon: Heart,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    resources: [
      { name: "AmeriCorps Disaster Services", desc: "AmeriCorps deploys trained volunteers to disaster-affected areas for debris removal, rebuilding, and recovery support.", url: "https://americorps.gov/serve/fit-finder/americorps-nccc", icon: "🇺🇸" },
      { name: "FEMA Corps (AmeriCorps)", desc: "FEMA Corps members assist disaster survivors with case management, recovery support, and community outreach.", url: "https://americorps.gov/serve/fit-finder/americorps-nccc/fema-corps", icon: "🏕️" },
      { name: "All Hands and Hearts", desc: "Volunteer-powered disaster relief — rebuilding homes and communities after floods, hurricanes, and earthquakes.", url: "https://www.allhandsandhearts.org", icon: "🤲" },
      { name: "Team Rubicon", desc: "Veteran-led disaster response organization. Deploys rapidly for debris removal, structure assessment, and relief operations.", url: "https://teamrubiconusa.org", icon: "⚙️" },
      { name: "SBP (formerly St. Bernard Project)", desc: "Shrinks the time between disaster and recovery. Long-term rebuilding for low-income disaster survivors.", url: "https://sbpusa.org", icon: "🔨" },
    ],
  },
  {
    id: "donations",
    label: "Donations & Goods",
    icon: Heart,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    resources: [
      { name: "Good360 — Disaster Relief", desc: "Delivers essential goods to disaster survivors. $1 donation = up to $50 in product value delivered to families in need.", url: "https://good360.org", icon: "📦" },
      { name: "Direct Relief", desc: "Provides humanitarian medical aid and emergency funds to health organizations in disaster zones.", url: "https://www.directrelief.org", icon: "💊" },
      { name: "Operation Blessing", desc: "Rapid-response disaster relief with food, water, and essential supplies deployed within hours of a disaster.", url: "https://www.ob.org", icon: "🚚" },
      { name: "Convoy of Hope", desc: "Emergency food distribution and disaster relief logistics for survivors nationwide and internationally.", url: "https://convoyofhope.org", icon: "🌾" },
      { name: "GoFundMe Trust & Safety Verified", desc: "Community-vetted fundraisers for disaster survivors. GoFundMe's Trust & Safety team reviews claims.", url: "https://www.gofundme.com/c/community/disaster-relief", icon: "💛" },
      { name: "Feeding America — Disaster Relief", desc: "Emergency food bank network activated after disasters. Find or donate to a local food bank near an impacted area.", url: "https://www.feedingamerica.org", icon: "🥫" },
    ],
  },
  {
    id: "insurance",
    label: "Insurance & Financial",
    icon: Shield,
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    resources: [
      { name: "NFIP — National Flood Insurance", desc: "Federally backed flood insurance. File a claim, find a policy, or check coverage status after a flood disaster.", url: "https://www.floodsmart.gov", icon: "💧" },
      { name: "FEMA Individual Assistance", desc: "Grants for temporary housing, home repairs, and other disaster-related expenses when insurance doesn't cover everything.", url: "https://www.disasterassistance.gov", icon: "🏠" },
      { name: "Operation HOPE Disaster Recovery", desc: "Free financial counseling, credit rebuilding, and small business recovery assistance after disasters.", url: "https://operationhope.org", icon: "🤝" },
      { name: "SBA Disaster Loans", desc: "Low-interest disaster loans for homeowners, renters, and businesses to repair or replace damaged property.", url: "https://www.sba.gov/funding-programs/disaster-assistance", icon: "🏦" },
      { name: "USDA Rural Disaster Assistance", desc: "Farm loan programs, emergency conservation, and rural business recovery assistance for agricultural disaster losses.", url: "https://www.usda.gov/topics/disaster", icon: "🌾" },
      { name: "Insurance Information Institute", desc: "Guides for filing claims, understanding coverage gaps, and navigating the insurance process after a disaster.", url: "https://www.iii.org/article/what-if-my-home-is-damaged", icon: "📄" },
    ],
  },
  {
    id: "mental_health",
    label: "Mental Health",
    icon: Brain,
    color: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
    resources: [
      { name: "SAMHSA Disaster Distress Helpline", desc: "24/7 crisis counseling after disasters. Call or text 1-800-985-5990. Multilingual support available.", url: "https://www.samhsa.gov/find-help/disaster-distress-helpline", phone: "1-800-985-5990", icon: "🧠" },
      { name: "Crisis Text Line", desc: "Text HOME to 741741 for free, 24/7 crisis counseling from a trained counselor. Confidential and available nationwide.", url: "https://www.crisistextline.org", icon: "💬" },
      { name: "988 Suicide & Crisis Lifeline", desc: "Call or text 988. Mental health, substance use, and crisis support. Available 24/7 in English and Spanish.", url: "https://988lifeline.org", phone: "988", icon: "🌐" },
      { name: "Red Cross Psychological First Aid", desc: "The Red Cross provides mental health and spiritual care services to disaster survivors, family members, and responders.", url: "https://www.redcross.org/local/georgia.html", icon: "🔴" },
      { name: "FEMA Crisis Counseling Program", desc: "Free short-term individual and group counseling funded by FEMA for survivors in presidentially declared disaster areas.", url: "https://www.samhsa.gov/dtac/ccp", icon: "🏛️" },
      { name: "Headspace — First Responders", desc: "Free mindfulness and meditation app access for first responders and disaster relief workers experiencing burnout or trauma.", url: "https://www.headspace.com/first-responders", icon: "🧘" },
    ],
  },
  {
    id: "housing",
    label: "Housing Assistance",
    icon: Home,
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    resources: [
      { name: "FEMA Transitional Sheltering Assistance", desc: "Eligible disaster survivors can stay in hotels/motels while searching for longer-term housing. Costs covered by FEMA.", url: "https://www.fema.gov/assistance/individual/program/transitional-sheltering-assistance", icon: "🏨" },
      { name: "HUD Disaster Housing Assistance", desc: "Emergency housing vouchers and mortgage relief programs for disaster-affected families through local public housing authorities.", url: "https://www.hud.gov/info/disasterhelp", icon: "🏛️" },
      { name: "Airbnb Emergency Housing", desc: "Airbnb's Open Homes program offers free, short-term stays to disaster evacuees and relief workers. Hosts volunteer their spaces.", url: "https://www.airbnb.com/openhomes", icon: "🏡" },
      { name: "Extended Stay America — Disaster Rates", desc: "Offers special disaster relief rates for evacuees and emergency personnel during declared disasters.", url: "https://www.extendedstayamerica.com", icon: "🛏️" },
      { name: "Hotel Engine — Disaster Rate Finder", desc: "Aggregates hotel inventory with disaster-specific rates for insurance policyholders and emergency workers.", url: "https://www.hotelengine.com", icon: "🏩" },
      { name: "USDA Rural Housing Service", desc: "Emergency mortgage payment assistance and housing repair grants for rural homeowners impacted by disasters.", url: "https://www.rd.usda.gov/programs-services/all-programs/single-family-housing-programs", icon: "🌲" },
    ],
  },
  {
    id: "tsa_travel",
    label: "TSA & Travel",
    icon: Plane,
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
    resources: [
      { name: "TSA — Lost ID Evacuation Policy", desc: "Travelers without ID due to evacuation can still fly. Bring alternative documents or notify TSA officers. Identity verification available at checkpoints.", url: "https://www.tsa.gov/travel/security-screening/identification", icon: "✈️" },
      { name: "TSA Cares — Travelers with Disabilities", desc: "Free assistance hotline for travelers with disabilities, injuries, or medical conditions displaced by disasters. Call 72 hrs before travel.", url: "https://www.tsa.gov/travel/tsa-cares", phone: "1-855-787-2227", icon: "♿" },
      { name: "DOT Aviation Consumer Protection", desc: "File complaints about airline cancellations, fees, or denials during disaster evacuations. Airlines may waive fees during declared disasters.", url: "https://www.transportation.gov/airconsumer/file-consumer-complaint", icon: "📋" },
      { name: "Amtrak Disaster Relief Travel", desc: "Amtrak may offer free or reduced travel to evacuees during major declared disasters. Check their emergency travel page.", url: "https://www.amtrak.com/travel-news/travel-alerts.html", icon: "🚆" },
      { name: "FEMA Disaster Evacuation Routes", desc: "State and FEMA-coordinated evacuation routes, contraflow corridors, and public transit options during disasters.", url: "https://www.ready.gov/evacuating-yourself-and-your-family", icon: "🗺️" },
    ],
  },
  {
    id: "tourism",
    label: "Tourism Boost & Economic Recovery",
    icon: TrendingUp,
    color: "text-lime-700",
    bg: "bg-lime-50",
    border: "border-lime-200",
    resources: [
      { name: "U.S. Travel Association — Disaster Recovery", desc: "Guides on how tourism rebounds after disasters, and how travelers can support affected communities by visiting and spending locally.", url: "https://www.ustravel.org", icon: "🌍" },
      { name: "Explore Georgia — Support Local Tourism", desc: "Visit Georgia's state tourism bureau to find open attractions, businesses, and events supporting recovery in affected communities.", url: "https://www.exploregeorgia.org", icon: "🍑" },
      { name: "Small Business Administration (SBA) Recovery", desc: "Economic Injury Disaster Loans (EIDL) for small businesses and tourism operators impacted by disasters.", url: "https://www.sba.gov/funding-programs/disaster-assistance", icon: "🏪" },
      { name: "EDA — Economic Development Administration", desc: "Federal grants to help communities rebuild economic infrastructure, tourism assets, and local businesses after declared disasters.", url: "https://www.eda.gov/disaster-recovery", icon: "📊" },
      { name: "USDA Rural Business Recovery", desc: "Rural Business Development Grants and recovery resources for tourism-dependent rural communities hit by wildfires and disasters.", url: "https://www.usda.gov/rural-development", icon: "🌿" },
      { name: "Certify Georgia — Buy Local Campaign", desc: "Support verified Georgia-based businesses still operating in disaster-affected areas to speed up local economic recovery.", url: "https://georgia.org", icon: "✅" },
    ],
  },
  {
    id: "cdc_health",
    label: "Health & Safety",
    icon: Shield,
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    resources: [
      { name: "CDC Emergency Preparedness", desc: "Health-focused emergency checklists, wildfire smoke safety, water safety, and medical preparedness.", url: "https://emergency.cdc.gov", icon: "🏥" },
      { name: "AirNow.gov — Air Quality Index", desc: "Real-time AQI maps and wildfire smoke forecasts. Critical for wildfire-affected areas.", url: "https://www.airnow.gov", icon: "💨" },
      { name: "EPA Wildfire Smoke Guide", desc: "How to protect yourself from wildfire smoke, indoor air quality tips, and when to evacuate due to smoke.", url: "https://www.airnow.gov/wildfire-guide-factsheets/", icon: "🌫️" },
      { name: "CDC — Safe Water After Disaster", desc: "How to find, treat, and store safe drinking water during and after a wildfire, flood, or hurricane.", url: "https://www.cdc.gov/healthywater/emergency/", icon: "💧" },
    ],
  },
];

const FEMA_REGIONS = [
  { region: "I — New England", states: "CT, MA, ME, NH, RI, VT", url: "https://www.fema.gov/region-1-ct-ma-me-nh-ri-vt" },
  { region: "II — NY/NJ/Caribbean", states: "NJ, NY, PR, USVI", url: "https://www.fema.gov/region-2-nj-ny-pr-vi" },
  { region: "III — Mid-Atlantic", states: "DC, DE, MD, PA, VA, WV", url: "https://www.fema.gov/region-3-dc-de-md-pa-va-wv" },
  { region: "IV — Southeast", states: "AL, FL, GA, KY, MS, NC, SC, TN", url: "https://www.fema.gov/region-4-al-fl-ga-ky-ms-nc-sc-tn" },
  { region: "V — Great Lakes", states: "IL, IN, MI, MN, OH, WI", url: "https://www.fema.gov/region-5-il-in-mi-mn-oh-wi" },
  { region: "VI — South Central", states: "AR, LA, NM, OK, TX", url: "https://www.fema.gov/region-6-ar-la-nm-ok-tx" },
  { region: "VII — Midwest", states: "IA, KS, MO, NE", url: "https://www.fema.gov/region-7-ia-ks-mo-ne" },
  { region: "VIII — Mountain", states: "CO, MT, ND, SD, UT, WY", url: "https://www.fema.gov/region-8-co-mt-nd-sd-ut-wy" },
  { region: "IX — Pacific Southwest", states: "AZ, CA, HI, NV, Pacific Islands", url: "https://www.fema.gov/region-9-az-ca-hi-nv-pacific-islands" },
  { region: "X — Pacific Northwest", states: "AK, ID, OR, WA", url: "https://www.fema.gov/region-10-ak-id-or-wa" },
];

export default function ExternalResourcesTab() {
  const [openCategories, setOpenCategories] = useState({ immediate: true });
  const [femaOpen, setFemaOpen] = useState(false);

  const toggle = (id) => setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-4">
      {/* Category Accordions */}
      {RESOURCE_CATEGORIES.map(cat => {
        const Icon = cat.icon;
        const isOpen = openCategories[cat.id];
        return (
          <div key={cat.id} className={`border rounded-lg overflow-hidden ${cat.border}`}>
            <button
              onClick={() => toggle(cat.id)}
              className={`w-full flex items-center justify-between px-5 py-3.5 text-left ${cat.bg}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${cat.color}`} />
                <span className={`font-sans font-semibold text-sm ${cat.color}`}>{cat.label}</span>
                <span className="text-xs text-muted-foreground font-sans">{cat.resources.length} resources</span>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {isOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-card">
                {cat.resources.map(r => (
                  <a
                    key={r.name}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 bg-background border border-border rounded p-4 hover:border-primary/40 hover:shadow-sm transition-all"
                  >
                    <span className="text-xl mt-0.5 shrink-0">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-sans font-semibold text-foreground text-sm">{r.name}</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground font-sans leading-relaxed">{r.desc}</p>
                      {r.phone && (
                        <p className="text-xs font-sans font-semibold text-primary mt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {r.phone}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* FEMA Regions Accordion */}
      <div className="border border-border rounded-lg bg-card">
        <button
          onClick={() => setFemaOpen(!femaOpen)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground text-sm font-sans">Find Your FEMA Region</span>
          </div>
          {femaOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {femaOpen && (
          <div className="border-t border-border px-5 pb-5 pt-4">
            <p className="text-xs text-muted-foreground font-sans mb-4">FEMA divides the U.S. into 10 regions with dedicated emergency management staff.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FEMA_REGIONS.map(r => (
                <a
                  key={r.region}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-sans text-muted-foreground hover:text-primary transition-colors py-1.5 border-b border-border/40 last:border-0 group"
                >
                  <Globe className="w-3 h-3 shrink-0 group-hover:text-primary" />
                  <div>
                    <span className="font-semibold text-foreground">Region {r.region}</span>
                    <span className="text-muted-foreground"> — {r.states}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hotline bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-primary/5 border border-primary/20 rounded p-5">
        <Phone className="w-5 h-5 text-primary shrink-0" />
        <div className="text-center sm:text-left">
          <p className="font-sans font-semibold text-foreground text-sm">
            In an active emergency: <strong>911</strong> · FEMA Helpline: <strong>1-800-621-3362</strong> · Disaster Distress: <strong>1-800-985-5990</strong>
          </p>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">TTY: 1-800-462-7585 · Crisis Text: text HOME to 741741 · 988 Lifeline: call or text 988</p>
        </div>
      </div>
    </div>
  );
}