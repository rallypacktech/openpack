import React, { useState } from "react";
import { AlertTriangle, X, ExternalLink, Heart, PawPrint } from "lucide-react";

const RESPONSE_ORGS = [
  {
    name: "Good360 — Georgia Wildfire Relief",
    desc: "120+ homes destroyed. $1 = $50 in disaster relief supplies delivered to South Georgia families.",
    url: "https://good360.org/donate/georgia-wildfires/",
    badge: "DONATE",
    badgeColor: "bg-red-600 text-white",
  },
  {
    name: "Direct Relief — Medical Aid",
    desc: "Committed $25,000 + medical inventory (N95 respirators, medications) for Brantley County health centers impacted by the 22,600-acre Highway 82 fire.",
    url: "https://www.directrelief.org/emergency/wildfire/",
    badge: "DEPLOYED",
    badgeColor: "bg-emerald-700 text-white",
  },
  {
    name: "American Red Cross",
    desc: "Operating emergency shelters across Clinch, Echols, and Brantley Counties. Providing meals, relief supplies, and mental health support.",
    url: "https://www.redcross.org/local/georgia.html",
    badge: "SHELTERING",
    badgeColor: "bg-red-700 text-white",
  },
  {
    name: "FEMA Fire Management Assistance",
    desc: "FEMA approved Fire Management Assistance Grants April 21, 2026 — covering up to 75% of Georgia's eligible firefighting costs for the Pineland Road & Highway 82 fires (11,085+ acres).",
    url: "https://www.fema.gov/press-release/20260423/fema-authorizes-federal-funds-help-georgia-battle-wildfires",
    badge: "FEDERAL",
    badgeColor: "bg-blue-700 text-white",
  },
  {
    name: "FEMA Disaster Assistance",
    desc: "Georgia state of emergency declared. Apply for individual assistance if your home was damaged.",
    url: "https://www.disasterassistance.gov",
    badge: "APPLY NOW",
    badgeColor: "bg-blue-600 text-white",
  },
  {
    name: "Georgia Forestry Foundation",
    desc: "Established a dedicated wildfire relief fund supporting affected landowners and communities across South Georgia.",
    url: "https://www.gfagrow.org",
    badge: "DONATE",
    badgeColor: "bg-red-600 text-white",
  },
  {
    name: "Best Friends Animal Society",
    desc: "Supporting animal rescues and displaced pets from fire evacuations across South Georgia. Coordinates with shelters for large livestock and companion animals.",
    url: "https://bestfriends.org/emergency-response",
    badge: "ANIMALS",
    badgeColor: "bg-amber-600 text-white",
  },
  {
    name: "Georgia Veterinary Medical Assoc. (GVMA)",
    desc: "Coordinating veterinary resources, emergency animal care, and evacuation farm sanctuary via Crawford's Double O Farm in Thomson, GA.",
    url: "https://gvma.net/2026/04/29/south-georgia-wildfires-resources-and-response-for-veterinary-members/",
    badge: "ANIMALS",
    badgeColor: "bg-amber-600 text-white",
  },
  {
    name: "Norfolk Southern Disaster Relief Grant",
    desc: "Community Disaster Relief Grant Program open for South Georgia wildfire-affected organizations.",
    url: "https://www.norfolksouthern.com/en/newsroom/story-yard/norfolk-southern-opens-georgia-wildfire-disaster-relief-program",
    badge: "GRANTS",
    badgeColor: "bg-slate-700 text-white",
  },
  {
    name: "GoFundMe — Georgia Wildfire Community",
    desc: "Verified fundraisers for individuals and families who lost homes in the South Georgia fires. Trust & Safety team actively monitoring.",
    url: "https://www.gofundme.com/communities/georgia-wildfire-relief-2026",
    badge: "DONATE",
    badgeColor: "bg-red-600 text-white",
  },
];

export default function GeorgiaWildfireAlert() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed) return null;

  return (
    <div className="border border-orange-300 rounded-lg overflow-hidden bg-orange-50 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 bg-orange-100 border-b border-orange-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-sans font-bold text-orange-900 text-sm">Active Disaster — South Georgia Wildfires (April 2026)</p>
            <p className="font-sans text-xs text-orange-800 mt-0.5 leading-relaxed">
              The Pineland Road (Clinch/Echols Co.) and Highway 82 fires (Brantley Co.) burned 27,000+ acres. 120+ homes destroyed. 1,050+ homes threatened. FEMA Fire Management Assistance Grants approved April 21, 2026. State of Emergency declared. Relief organizations are actively deployed.
            </p>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-orange-500 hover:text-orange-700 shrink-0 mt-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-px bg-orange-200 border-b border-orange-200">
        {[
          { label: "Acres burned", value: "27,000+" },
          { label: "Homes destroyed", value: "120+" },
          { label: "Homes threatened", value: "1,050+" },
        ].map(s => (
          <div key={s.label} className="bg-orange-50 text-center py-3 px-2">
            <p className="font-serif font-bold text-orange-900 text-lg">{s.value}</p>
            <p className="font-sans text-xs text-orange-700">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Response orgs — collapsed by default, show top 3 */}
      <div className="px-5 py-4 space-y-3">
        <p className="text-xs font-sans font-semibold text-orange-800 uppercase tracking-widest">Organizations Actively Responding</p>
        {(expanded ? RESPONSE_ORGS : RESPONSE_ORGS.slice(0, 3)).map(org => (
          <a
            key={org.name}
            href={org.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 group"
          >
            <span className={`text-xs font-sans font-bold px-2 py-0.5 rounded shrink-0 mt-0.5 ${org.badgeColor}`}>{org.badge}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-sans font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{org.name}</p>
                <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">{org.desc}</p>
            </div>
          </a>
        ))}

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-sans text-primary hover:underline mt-1"
        >
          {expanded ? "Show less" : `+ Show ${RESPONSE_ORGS.length - 3} more organizations`}
        </button>
      </div>

      {/* Air quality warning */}
      <div className="mx-5 mb-4 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded px-3 py-2.5">
        <PawPrint className="w-3.5 h-3.5 text-yellow-700 shrink-0 mt-0.5" />
        <p className="text-xs font-sans text-yellow-800 leading-relaxed">
          <strong>Air quality alert:</strong> Heavy smoke affecting Clinch, Echols, Brantley, and neighboring counties. Wear N95 masks outdoors. Keep pets and livestock indoors. Check{" "}
          <a href="https://www.airnow.gov" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900">AirNow.gov</a> for real-time AQI.
        </p>
      </div>
    </div>
  );
}