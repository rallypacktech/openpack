/* global pendo */
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, ExternalLink, X, PawPrint, ChevronDown, ChevronUp, Flame, CloudRain, Wind, Zap, RefreshCw, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ─── Curated incident registry ─────────────────────────────────────────────
// Federally declared disasters with verified responding organizations.
// Add new incidents here as they become active. Archive by setting active: false.
const CURATED_INCIDENTS = [
  {
    id: "ga-wildfires-2026",
    active: false,
    type: "wildfire",
    severity: "major",
    title: "South Georgia Wildfires",
    location: "Clinch, Echols & Brantley Counties, GA",
    declared: "April 21, 2026",
    summary:
      "The Pineland Road (Clinch/Echols) and Highway 82 (Brantley) fires burned 27,000+ acres under extreme drought conditions. 120+ homes destroyed. 1,050+ homes threatened. FEMA Fire Management Assistance Grants approved April 21, 2026. State of Emergency declared.",
    stats: [
      { label: "Acres burned", value: "27,000+" },
      { label: "Homes destroyed", value: "120+" },
      { label: "Homes threatened", value: "1,050+" },
    ],
    warnings: [
      {
        icon: "air",
        text: "Air quality alert: Heavy smoke in Clinch, Echols, Brantley, and neighboring counties. Wear N95 masks outdoors. Keep pets and livestock indoors.",
        link: { label: "Check AQI at AirNow.gov", url: "https://www.airnow.gov" },
      },
    ],
    orgs: [
      { name: "Good360 — Georgia Wildfire Relief", badge: "DONATE", badgeColor: "bg-red-600 text-white", url: "https://good360.org/donate/georgia-wildfires/", desc: "120+ homes destroyed. $1 = $50 in disaster relief supplies delivered to South Georgia families." },
      { name: "Direct Relief — Medical Aid", badge: "DEPLOYED", badgeColor: "bg-emerald-700 text-white", url: "https://www.directrelief.org/emergency/wildfire/", desc: "$25,000 committed + N95 respirators + medications for Brantley County health centers impacted by the 22,600-acre Highway 82 fire." },
      { name: "American Red Cross — Georgia", badge: "SHELTERING", badgeColor: "bg-red-700 text-white", url: "https://www.redcross.org/local/georgia.html", desc: "Operating emergency shelters across Clinch, Echols & Brantley Counties. Meals, relief supplies, and mental health support." },
      { name: "FEMA — Fire Management Assistance", badge: "FEDERAL", badgeColor: "bg-blue-700 text-white", url: "https://www.fema.gov/press-release/20260423/fema-authorizes-federal-funds-help-georgia-battle-wildfires", desc: "Approved grants covering up to 75% of Georgia's firefighting costs for both fires." },
      { name: "FEMA — Apply for Individual Assistance", badge: "APPLY NOW", badgeColor: "bg-blue-600 text-white", url: "https://www.disasterassistance.gov", desc: "Georgia state of emergency declared. Apply if your home or property was damaged." },
      { name: "Georgia Forestry Foundation", badge: "DONATE", badgeColor: "bg-red-600 text-white", url: "https://www.gfagrow.org", desc: "Dedicated wildfire relief fund for affected landowners and communities across South Georgia." },
      { name: "Best Friends Animal Society", badge: "ANIMALS", badgeColor: "bg-amber-600 text-white", url: "https://bestfriends.org/emergency-response", desc: "Supporting animal rescues and displaced pets. Coordinates with shelters for livestock and companion animals." },
      { name: "GVMA — Animal Evacuation Resources", badge: "ANIMALS", badgeColor: "bg-amber-600 text-white", url: "https://gvma.net/2026/04/29/south-georgia-wildfires-resources-and-response-for-veterinary-members/", desc: "Veterinary resources + Crawford's Double O Farm (Thomson, GA) accepting livestock from affected farms." },
      { name: "Norfolk Southern Disaster Relief Grant", badge: "GRANTS", badgeColor: "bg-slate-700 text-white", url: "https://www.norfolksouthern.com/en/newsroom/story-yard/norfolk-southern-opens-georgia-wildfire-disaster-relief-program", desc: "Community Disaster Relief Grant Program open for South Georgia wildfire-affected organizations." },
      { name: "GoFundMe — Verified Fundraisers", badge: "DONATE", badgeColor: "bg-red-600 text-white", url: "https://www.gofundme.com/communities/georgia-wildfire-relief-2026", desc: "Trust & Safety team-verified fundraisers for individuals and families who lost homes." },
    ],
  },
];

const TYPE_ICON = {
  wildfire: Flame,
  flood: CloudRain,
  hurricane: Wind,
  tornado: Zap,
  other: AlertTriangle,
};

const SEVERITY_STYLE = {
  major:    "bg-red-100 text-red-800 border-red-300",
  moderate: "bg-orange-100 text-orange-800 border-orange-300",
  watch:    "bg-yellow-100 text-yellow-800 border-yellow-300",
};

const TYPE_HEADER = {
  wildfire: "bg-orange-50 border-orange-300",
  flood:    "bg-blue-50 border-blue-300",
  hurricane:"bg-purple-50 border-purple-300",
  tornado:  "bg-amber-50 border-amber-300",
  other:    "bg-gray-50 border-gray-300",
};

function CuratedIncidentCard({ incident }) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const Icon = TYPE_ICON[incident.type] || AlertTriangle;
  const headerStyle = TYPE_HEADER[incident.type] || TYPE_HEADER.other;

  if (dismissed) return null;

  return (
    <div className={`border rounded-lg overflow-hidden ${headerStyle}`}>
      <div className={`flex items-start justify-between gap-3 px-5 py-4 border-b ${headerStyle}`}>
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 text-orange-700 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-sans font-bold text-foreground text-sm">{incident.title}</p>
              <span className={`text-xs font-sans font-bold px-2 py-0.5 rounded border ${SEVERITY_STYLE[incident.severity]}`}>
                {incident.severity.toUpperCase()}
              </span>
            </div>
            <p className="font-sans text-xs text-muted-foreground">{incident.location} · Declared {incident.declared}</p>
            <p className="font-sans text-xs text-foreground/80 mt-1.5 leading-relaxed">{incident.summary}</p>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>
      {incident.stats?.length > 0 && (
        <div className="grid grid-cols-3 gap-px bg-border border-b border-border">
          {incident.stats.map(s => (
            <div key={s.label} className="bg-card text-center py-3 px-2">
              <p className="font-serif font-bold text-foreground text-lg">{s.value}</p>
              <p className="font-sans text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}
      {incident.warnings?.map((w, i) => (
        <div key={i} className="mx-4 mt-3 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded px-3 py-2.5">
          <PawPrint className="w-3.5 h-3.5 text-yellow-700 shrink-0 mt-0.5" />
          <p className="text-xs font-sans text-yellow-800 leading-relaxed">
            {w.text}{" "}
            {w.link && (
              <a href={w.link.url} target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-yellow-900">
                {w.link.label}
              </a>
            )}
          </p>
        </div>
      ))}
      <div className="px-5 py-4 space-y-3 bg-card">
        <p className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-widest">Organizations Actively Responding</p>
        {(expanded ? incident.orgs : incident.orgs.slice(0, 3)).map(org => (
          <a key={org.name} href={org.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
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
        {incident.orgs.length > 3 && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs font-sans text-primary hover:underline">
            {expanded ? "Show less" : `+ Show ${incident.orgs.length - 3} more organizations`}
          </button>
        )}
      </div>
    </div>
  );
}

function LiveAlertRow({ alert }) {
  const Icon = TYPE_ICON[alert.type] || AlertTriangle;
  const sevClass = SEVERITY_STYLE[alert.severity] || SEVERITY_STYLE.watch;
  return (
    <div className={`border rounded-lg overflow-hidden ${TYPE_HEADER[alert.type] || TYPE_HEADER.other}`}>
      <div className="flex items-start gap-3 px-4 py-3">
        <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="font-sans font-semibold text-sm text-foreground truncate">{alert.title}</p>
            <span className={`text-xs font-sans font-bold px-1.5 py-0.5 rounded border ${sevClass}`}>{(alert.severity || "advisory").toUpperCase()}</span>
          </div>
          <p className="font-sans text-xs text-muted-foreground truncate">{alert.location}</p>
          {alert.description && <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">{alert.description}</p>}
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{alert.agency}</span>
            {alert.expires && <span>· Expires {new Date(alert.expires).toLocaleDateString()}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActiveIncidents() {
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [error, setError] = useState(null);

  const curatedActive = CURATED_INCIDENTS.filter(i => i.active);

  const fetchLiveAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [nwsRes, globalRes] = await Promise.all([
        base44.functions.invoke("fetchNationalAlerts", {}).catch(() => null),
        base44.functions.invoke("fetchGlobalCAPAlerts", {}).catch(() => null),
      ]);
      const nwsAlerts = (nwsRes?.data?.alerts || []).map(a => {
        const eventText = (a.event || "").toLowerCase();
        return {
          id: `nws-${a.id || Math.random()}`,
          type: eventText.includes("fire") ? "wildfire" : eventText.includes("flood") ? "flood" : eventText.includes("tornado") ? "tornado" : eventText.includes("hurricane") || eventText.includes("tropical") ? "hurricane" : "other",
          title: a.headline || a.event || "NWS Alert",
          location: a.areaDesc || "",
          severity: a.severity === "Extreme" ? "major" : a.severity === "Severe" ? "moderate" : "watch",
          description: a.description || "",
          agency: "NWS (US)",
          expires: a.expires || null,
        };
      });
      const globalAlerts = (globalRes?.data?.alerts || []).map(a => ({
        id: `cap-${a.id || Math.random()}`,
        type: (a.event || "").toLowerCase().includes("fire") ? "wildfire" : (a.event || "").toLowerCase().includes("flood") ? "flood" : "other",
        title: a.headline || a.event || "Global Alert",
        location: a.areaDesc || a.country || "",
        severity: a.severity === "Extreme" || a.severity === "Severe" ? "major" : "moderate",
        description: a.description || "",
        agency: a.source || "Global CAP",
        expires: a.expires || null,
      }));
      setLiveAlerts([...nwsAlerts, ...globalAlerts]);
      setLastRefresh(new Date());
    } catch (e) {
      setError("Could not load live alerts. Showing curated incidents only.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAlerts();
    // Refresh every 12 hours (43200000 ms)
    const interval = setInterval(fetchLiveAlerts, 12 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const totalActive = curatedActive.length + liveAlerts.length;

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground">
            {totalActive} Active Incident{totalActive !== 1 ? "s" : ""}
          </p>
          <button onClick={fetchLiveAlerts} disabled={loading} className="text-xs text-primary hover:underline flex items-center gap-1">
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh now"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground font-sans">
          Federally declared disasters + live NWS and global CAP alerts. Auto-refreshes every 12 hours.
          {lastRefresh && <span> · Last: {lastRefresh.toLocaleString()}</span>}
        </p>
        {error && <p className="text-xs text-orange-600 mt-1">{error}</p>}
      </div>

      {curatedActive.map(incident => (
        <CuratedIncidentCard key={incident.id} incident={incident} />
      ))}

      {liveAlerts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground pt-2">Live Global Alerts (NWS + CAP)</p>
          {liveAlerts.slice(0, 20).map(alert => (
            <LiveAlertRow key={alert.id} alert={alert} />
          ))}
          {liveAlerts.length > 20 && (
            <p className="text-xs text-muted-foreground text-center pt-2">Showing 20 of {liveAlerts.length} live alerts</p>
          )}
        </div>
      )}

      {totalActive === 0 && (
        <div className="text-center py-16 text-muted-foreground font-sans">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No active declared incidents at this time.</p>
          <p className="text-xs mt-1">Check back during active emergencies for real-time response resources.</p>
        </div>
      )}
    </div>
  );
}