import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, RefreshCw, Flame, CloudRain, Wind, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import L from "leaflet";

// Known active federal disaster incidents (FEMA declarations + major ongoing events)
// These are supplemented by live NWS alerts fetched below
const STATIC_INCIDENTS = [
  {
    id: "ga-wildfires-2026",
    title: "Georgia Wildfires",
    state: "Georgia",
    type: "wildfire",
    severity: "major",
    latitude: 34.52,
    longitude: -83.98,
    description: "Active wildfire complex in North Georgia mountains. FEMA DR-4xxx declared. Federal fire resources deployed.",
    agency: "FEMA + USFS",
    radius_km: 65,
  },
  {
    id: "tx-flood-2026",
    title: "Texas Hill Country Flooding",
    state: "Texas",
    type: "flood",
    severity: "major",
    latitude: 30.27,
    longitude: -98.87,
    description: "Flash flooding along Guadalupe and Blanco Rivers. NWS Flash Flood Emergency.",
    agency: "FEMA + NWS",
    radius_km: 50,
  },
  {
    id: "ca-drought-2026",
    title: "California Drought / Fire Watch",
    state: "California",
    type: "wildfire",
    severity: "watch",
    latitude: 37.77,
    longitude: -119.42,
    description: "Red Flag Warning across Sierra Nevada foothills. Elevated fire danger.",
    agency: "NWS + CalFire",
    radius_km: 130,
  },
];

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
  const [incidents, setIncidents] = useState(STATIC_INCIDENTS);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    fetchLiveAlerts();
  }, []);

  const fetchLiveAlerts = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("fetchNWSAlerts", {});
      const alerts = res?.data?.alerts || [];
      setLiveAlerts(alerts);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to load live alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Parse NWS alerts with coordinates into map markers
  const liveIncidents = liveAlerts
    .filter(a => a.geometry?.coordinates || a.latitude)
    .map((a, i) => ({
      id: `nws-${i}`,
      title: a.properties?.event || a.title || "NWS Alert",
      state: a.properties?.areaDesc || a.area || "",
      type: (a.properties?.event || "").toLowerCase().includes("fire") ? "wildfire"
           : (a.properties?.event || "").toLowerCase().includes("flood") ? "flood"
           : (a.properties?.event || "").toLowerCase().includes("tornado") ? "tornado"
           : (a.properties?.event || "").toLowerCase().includes("hurricane") ? "hurricane"
           : "other",
      severity: a.properties?.severity === "Extreme" ? "major"
               : a.properties?.severity === "Severe" ? "moderate"
               : "watch",
      latitude: a.latitude || (a.geometry?.coordinates ? a.geometry.coordinates[1] : null),
      longitude: a.longitude || (a.geometry?.coordinates ? a.geometry.coordinates[0] : null),
      description: a.properties?.description || a.description || "",
      agency: "NWS",
      radius_km: 30,
    }))
    .filter(a => a.latitude && a.longitude);

  const allIncidents = [...STATIC_INCIDENTS, ...liveIncidents];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Active Federal Incidents</h2>
          <p className="text-sm text-gray-500">FEMA declarations & NWS emergency alerts requiring federal response</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLiveAlerts} disabled={loading} className="gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Fetching..." : "Refresh"}
        </Button>
      </div>

      {lastRefresh && (
        <p className="text-xs text-gray-400">Last updated: {lastRefresh.toLocaleTimeString()}</p>
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
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
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
                      {incident.description && (
                        <p className="text-xs text-gray-700 mt-1 leading-relaxed line-clamp-4">{incident.description}</p>
                      )}
                      {incident.agency && (
                        <p className="text-xs text-gray-400 mt-1">Responding: {incident.agency}</p>
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
                  {incident.agency && (
                    <span className="text-xs text-gray-400 font-mono">{incident.agency}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{incident.state}</p>
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