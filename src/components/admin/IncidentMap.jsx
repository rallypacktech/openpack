import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, WMSTileLayer } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, RefreshCw, Flame, CloudRain, Wind, Zap, Clock, ExternalLink, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import L from "leaflet";
import { NIFC_OUTLOOK_META, getActiveFireRegions } from "@/lib/nifcOutlook";
import { HURRICANE_OUTLOOK, FLOOD_OUTLOOK, TORNADO_OUTLOOK, getActiveHurricaneZones, getActiveFloodRegions, getActiveTornadoRegions } from "@/lib/hazardOutlooks";
import OutlookOverlay from "@/components/admin/OutlookOverlay";

// Static incidents removed — the map now shows live NWS active alerts fetched in real time.
// The NWS API provides timestamps (sent, expires) so admin can verify freshness at a glance.

const TYPE_CONFIG = {
  wildfire: { color: "#ef4444", bgColor: "rgba(239,68,68,0.15)", icon: Flame, label: "Wildfire" },
  flood:    { color: "#3b82f6", bgColor: "rgba(59,130,246,0.15)", icon: CloudRain, label: "Flood" },
  hurricane:{ color: "#8b5cf6", bgColor: "rgba(139,92,246,0.15)", icon: Wind, label: "Hurricane" },
  tornado:  { color: "#f59e0b", bgColor: "rgba(245,158,11,0.15)", icon: Zap, label: "Tornado" },
  other:    { color: "#6b7280", bgColor: "rgba(107,114,128,0.15)", icon: AlertTriangle, label: "Incident" },
};

const SEVERITY_BADGE = {
  major:    "bg-red-100 text-red-800 border-red-300",
  moderate: "bg-orange-100 text-orange-800 border-orange-300",
  watch:    "bg-yellow-100 text-yellow-800 border-yellow-300",
  advisory: "bg-blue-100 text-blue-800 border-blue-300",
};

function makeIncidentIcon(type) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.other;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:32px;height:32px;border-radius:50%;
      background:${cfg.color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      font-size:14px;
    ">🔥</div>`.replace("🔥",
      type === "wildfire" ? "🔥" :
      type === "flood" ? "🌊" :
      type === "hurricane" ? "🌀" :
      type === "tornado" ? "🌪" : "⚠️"
    ),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export default function IncidentMap() {
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [showOutlook, setShowOutlook] = useState(true);
  const [showFloodOutlook, setShowFloodOutlook] = useState(false);
  const [showHurricaneOutlook, setShowHurricaneOutlook] = useState(false);
  const [showTornadoOutlook, setShowTornadoOutlook] = useState(false);
  const [showEffisFires, setShowEffisFires] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const activeFireRegions = getActiveFireRegions(currentMonth);
  const activeFloodRegions = getActiveFloodRegions(currentMonth);
  const activeHurricaneZones = getActiveHurricaneZones(currentMonth);
  const activeTornadoRegions = getActiveTornadoRegions(currentMonth);

  useEffect(() => {
    fetchLiveAlerts();
  }, []);

  const fetchLiveAlerts = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("fetchNationalAlerts", {});
      const alerts = res?.data?.alerts || [];
      setLiveAlerts(alerts);
      setLastRefresh(new Date());
      setFetchedAt(res?.data?.fetched_at || null);
    } catch (err) {
      console.error("Failed to load live alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Parse NWS alerts into map incidents — now with timestamps for freshness tracking
  const liveIncidents = liveAlerts
    .filter(a => a.latitude && a.longitude)
    .map((a, i) => {
      const eventText = a.event || "";
      const isExpired = a.expires && new Date(a.expires) < new Date();
      return {
        id: `nws-${a.id || i}`,
        title: a.headline || eventText || "NWS Alert",
        state: a.areaDesc || "",
        type: eventText.toLowerCase().includes("fire") ? "wildfire"
             : eventText.toLowerCase().includes("flood") ? "flood"
             : eventText.toLowerCase().includes("tornado") ? "tornado"
             : eventText.toLowerCase().includes("hurricane") || eventText.toLowerCase().includes("tropical") ? "hurricane"
             : "other",
        severity: a.severity === "Extreme" ? "major"
                 : a.severity === "Severe" ? "moderate"
                 : a.urgency === "Immediate" ? "major"
                 : a.urgency === "Expected" ? "moderate"
                 : "advisory",
        latitude: a.latitude,
        longitude: a.longitude,
        description: a.description || "",
        agency: "NWS",
        radius_km: 30,
        sent: a.sent || null,
        effective: a.effective || null,
        expires: a.expires || null,
        isExpired,
        eventId: a.id,
      };
    });

  const allIncidents = liveIncidents;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Active Incidents</h2>
          <p className="text-sm text-gray-500">Live NWS alerts nationwide — refresh to pull the latest data</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={showOutlook ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOutlook(!showOutlook)}
            className="gap-2"
            title="Toggle NIFC significant fire potential outlook overlay"
          >
            <Flame className="w-3.5 h-3.5" />
            Fire
          </Button>
          <Button
            variant={showFloodOutlook ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFloodOutlook(!showFloodOutlook)}
            className="gap-2"
            title="Toggle NWS monthly flood outlook overlay"
          >
            <CloudRain className="w-3.5 h-3.5" />
            Flood
          </Button>
          <Button
            variant={showHurricaneOutlook ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHurricaneOutlook(!showHurricaneOutlook)}
            className="gap-2"
            title="Toggle NOAA hurricane season outlook overlay"
          >
            <Wind className="w-3.5 h-3.5" />
            Hurricane
          </Button>
          <Button
            variant={showTornadoOutlook ? "default" : "outline"}
            size="sm"
            onClick={() => setShowTornadoOutlook(!showTornadoOutlook)}
            className="gap-2"
            title="Toggle NOAA/SPC peak tornado season overlay"
          >
            <Zap className="w-3.5 h-3.5" />
            Tornado
          </Button>
          <Button
            variant={showEffisFires ? "default" : "outline"}
            size="sm"
            onClick={() => setShowEffisFires(!showEffisFires)}
            className="gap-2"
            title="Toggle EFFIS (Copernicus) active fire detection overlay — satellite hotspots for Europe"
          >
            <Globe className="w-3.5 h-3.5" />
            EFFIS
          </Button>
          <Button variant="outline" size="sm" onClick={fetchLiveAlerts} disabled={loading} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Fetching..." : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-gray-400">
          {liveAlerts.length > 0
            ? `${liveAlerts.length} active NWS alert${liveAlerts.length !== 1 ? "s" : ""} loaded`
            : "No live alerts loaded yet"}
          {lastRefresh && ` · Refreshed: ${lastRefresh.toLocaleString()}`}
        </p>
        <a
          href="https://api.weather.gov/alerts/active"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          Verify on NWS
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>

      {/* NIFC Preparedness banner */}
      {showOutlook && (
        <div className="flex items-center gap-3 rounded-lg border border-orange-300 bg-orange-50 px-4 py-3">
          <Flame className="w-5 h-5 text-orange-600 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-orange-900">
              National Preparedness Level {NIFC_OUTLOOK_META.preparednessLevel}/{NIFC_OUTLOOK_META.preparednessLevelMax} — {activeFireRegions.length} above-normal fire potential region(s) active this month
            </p>
            <p className="text-xs text-orange-700">
              {NIFC_OUTLOOK_META.acresBurned.toLocaleString()} acres burned ({NIFC_OUTLOOK_META.acresVsAverage} of 10-yr avg) · {NIFC_OUTLOOK_META.wildfiresReported.toLocaleString()} wildfires ({NIFC_OUTLOOK_META.wildfiresVsAverage} of avg) · Source: {NIFC_OUTLOOK_META.source}
            </p>
          </div>
        </div>
      )}

      {/* Flood outlook banner */}
      {showFloodOutlook && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-300 bg-blue-50 px-4 py-3">
          <CloudRain className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900">
              NWS Monthly Flood Outlook ({FLOOD_OUTLOOK.period}) — {activeFloodRegions.length} elevated risk region(s)
            </p>
            <p className="text-xs text-blue-700">
              {FLOOD_OUTLOOK.summary} · Source: {FLOOD_OUTLOOK.source}
            </p>
          </div>
        </div>
      )}

      {/* Hurricane outlook banner */}
      {showHurricaneOutlook && (
        <div className="flex items-center gap-3 rounded-lg border border-purple-300 bg-purple-50 px-4 py-3">
          <Wind className="w-5 h-5 text-purple-600 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-purple-900">
              2026 Atlantic Hurricane Season: {HURRICANE_OUTLOOK.forecast} Forecast — {HURRICANE_OUTLOOK.namedStorms} named storms, {HURRICANE_OUTLOOK.hurricanes} hurricanes
            </p>
            <p className="text-xs text-purple-700">
              Season: {HURRICANE_OUTLOOK.season} (peak {HURRICANE_OUTLOOK.peakPeriod}) · {activeHurricaneZones.length} coastal risk zone(s) shown · {HURRICANE_OUTLOOK.elNinoNote} · Source: {HURRICANE_OUTLOOK.source}
            </p>
          </div>
        </div>
      )}

      {/* Tornado outlook banner */}
      {showTornadoOutlook && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <Zap className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">
              Peak Tornado Season (NOAA Climatology) — {activeTornadoRegions.length} region(s) in peak season this month
            </p>
            <p className="text-xs text-amber-700">
              {TORNADO_OUTLOOK.summary} · Live outlooks: {TORNADO_OUTLOOK.liveOutlookUrl} · Source: {TORNADO_OUTLOOK.source}
            </p>
          </div>
        </div>
      )}

      {/* EFFIS active fires banner */}
      {showEffisFires && (
        <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
          <Globe className="w-5 h-5 text-red-600 shrink-0" />
          <div className="text-sm flex-1">
            <p className="font-semibold text-red-900">
              EFFIS Active Fire Detection — Copernicus Emergency Management Service
            </p>
            <p className="text-xs text-red-700">
              Satellite hotspots (MODIS + VIIRS, filtered to reduce false alarms) for Europe, Middle East, and North Africa · Updated 6× daily within 2–3 hours of satellite pass
            </p>
          </div>
          <a
            href="https://forest-fire.emergency.copernicus.eu/apps/effis.viewer/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-red-700 hover:underline inline-flex items-center gap-1 shrink-0"
          >
            EFFIS Viewer
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      )}

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: 420 }}>
        <MapContainer
          center={[38.5, -96]}
          zoom={4}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {showOutlook && (
            <OutlookOverlay
              regions={activeFireRegions}
              color="#f97316"
              icon="🔥"
              badgeText="ABOVE-NORMAL FIRE POTENTIAL"
              badgeClass="bg-orange-100 text-orange-800 border-orange-300"
              descriptionFallback="NIFC forecast: above-normal significant wildland fire potential for this region this month."
              sourceLabel="Source: NIFC Predictive Services"
            />
          )}
          {showFloodOutlook && (
            <OutlookOverlay
              regions={activeFloodRegions}
              color="#3b82f6"
              icon="🌊"
              badgeText="ELEVATED FLOOD RISK"
              badgeClass="bg-blue-100 text-blue-800 border-blue-300"
              descriptionFallback="NWS flood outlook: elevated flood risk for this region this month."
              sourceLabel="Source: NWS National Water Center"
            />
          )}
          {showHurricaneOutlook && (
            <OutlookOverlay
              regions={activeHurricaneZones}
              color="#8b5cf6"
              icon="🌀"
              badgeText="HURRICANE SEASON RISK ZONE"
              badgeClass="bg-purple-100 text-purple-800 border-purple-300"
              descriptionFallback="This coastal region is at risk during the 2026 Atlantic hurricane season (June 1 – November 30)."
              sourceLabel="Source: NOAA Climate Prediction Center"
            />
          )}
          {showEffisFires && (
            <WMSTileLayer
              url="https://maps.effis.emergency.copernicus.eu/effis"
              layers="all.hs"
              format="image/png"
              transparent={true}
              version="1.1.1"
              srs="EPSG:4326"
              opacity={0.85}
              attribution="&copy; EFFIS — Copernicus Emergency Management Service (JRC)"
            />
          )}
          {showTornadoOutlook && (
            <OutlookOverlay
              regions={activeTornadoRegions}
              color="#f59e0b"
              icon="🌪"
              badgeText="PEAK TORNADO SEASON"
              badgeClass="bg-amber-100 text-amber-800 border-amber-300"
              descriptionFallback="NOAA climatology: this region is in peak tornado season this month. Check SPC Convective Outlook for real-time risk."
              sourceLabel="Source: NOAA / SPC Storm Prediction Center"
            />
          )}
          {allIncidents.map(incident => {
            const cfg = TYPE_CONFIG[incident.type] || TYPE_CONFIG.other;
            const radiusMeters = (incident.radius_km || 30) * 1000;
            return (
              <React.Fragment key={incident.id}>
                <Circle
                  center={[incident.latitude, incident.longitude]}
                  radius={radiusMeters}
                  pathOptions={{ color: cfg.color, fillColor: cfg.color, fillOpacity: 0.12, weight: 1.5 }}
                />
                <Marker
                  position={[incident.latitude, incident.longitude]}
                  icon={makeIncidentIcon(incident.type)}
                >
                  <Popup maxWidth={280}>
                    <div className="text-sm space-y-1">
                      <p className="font-bold text-gray-900">{incident.title}</p>
                      <p className="text-xs text-gray-500">{incident.state}</p>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded border font-medium ${SEVERITY_BADGE[incident.severity] || SEVERITY_BADGE.watch}`}>
                        {incident.severity?.toUpperCase()}
                      </span>
                      {incident.sent && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          Issued: {new Date(incident.sent).toLocaleString()}
                        </p>
                      )}
                      {incident.expires && (
                        <p className={`text-xs flex items-center gap-1 ${incident.isExpired ? "text-red-600 font-medium" : "text-gray-500"}`}>
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {incident.isExpired ? "Expired: " : "Expires: "}
                          {new Date(incident.expires).toLocaleString()}
                        </p>
                      )}
                      {incident.description && (
                        <p className="text-xs text-gray-700 mt-1 leading-relaxed line-clamp-4">{incident.description}</p>
                      )}
                      {incident.agency && (
                        <p className="text-xs text-gray-400 mt-1">Source: {incident.agency}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs font-sans text-gray-600">
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
          <span key={type} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: cfg.color }} />
            {cfg.label}
          </span>
        ))}
      </div>

      {/* Incident List */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">Incident List</h3>
        {allIncidents.map(incident => {
          const cfg = TYPE_CONFIG[incident.type] || TYPE_CONFIG.other;
          const Icon = cfg.icon;
          return (
            <div key={incident.id} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-shadow">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: cfg.bgColor }}>
                <Icon className="w-4 h-4" style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 text-sm">{incident.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${SEVERITY_BADGE[incident.severity] || SEVERITY_BADGE.watch}`}>
                    {incident.severity?.toUpperCase()}
                  </span>
                  {incident.isExpired && (
                    <span className="text-xs px-2 py-0.5 rounded border font-medium bg-gray-100 text-gray-500 border-gray-300">
                      EXPIRED
                    </span>
                  )}
                  {incident.agency && (
                    <span className="text-xs text-gray-400 font-mono">{incident.agency}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{incident.state}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {incident.sent && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      Issued {new Date(incident.sent).toLocaleString()}
                    </p>
                  )}
                  {incident.expires && (
                    <p className={`text-xs flex items-center gap-1 ${incident.isExpired ? "text-red-600 font-medium" : "text-gray-400"}`}>
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {incident.isExpired ? "Expired" : "Expires"} {new Date(incident.expires).toLocaleString()}
                    </p>
                  )}
                </div>
                {incident.description && (
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">{incident.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}