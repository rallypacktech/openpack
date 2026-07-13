import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, RefreshCw, TrendingUp, MapPin, Calendar, Database } from "lucide-react";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import WildfireTimeline from "@/components/admin/WildfireTimeline";

const SEVERITY_CONFIG = {
  catastrophic: { color: "#7f1d1d", fill: "rgba(127,29,29,0.35)", label: "Catastrophic" },
  major: { color: "#dc2626", fill: "rgba(220,38,38,0.3)", label: "Major" },
  moderate: { color: "#f97316", fill: "rgba(249,115,22,0.3)", label: "Moderate" },
  minor: { color: "#fbbf24", fill: "rgba(251,191,36,0.3)", label: "Minor" },
};

function formatNumber(n) {
  if (!n) return "—";
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function IncidentDataDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.WildfireIncident.list("-start_date", 200);
      setIncidents(data);
    } catch (e) {
      console.error("Error loading incidents:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchHistory = async () => {
    setFetching(true);
    try {
      await base44.functions.invoke("fetchWildfireHistory", { country_code: "US" });
      await loadIncidents();
    } catch (e) {
      console.error("Error fetching history:", e);
    } finally {
      setFetching(false);
    }
  };

  const filtered = severityFilter === "all"
    ? incidents
    : incidents.filter((i) => i.severity === severityFilter);

  const totalHectares = filtered.reduce((sum, i) => sum + (i.hectares_burned || 0), 0);
  const statesAffected = new Set(filtered.map((i) => i.admin1_name).filter(Boolean)).size;
  const mostRecent = filtered[0]?.start_date;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-600" /> Historical Wildfire Incidents
          </h2>
          <p className="text-sm text-gray-500 mt-1">Past wildfire data with hectares burned, responding organizations, and location mapping.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadIncidents} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={handleFetchHistory} disabled={fetching}>
            {fetching ? <><RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Fetching...</> : <><Database className="w-4 h-4 mr-1" /> Fetch More Data</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-gray-500">Total Incidents</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{filtered.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-gray-500">Hectares Burned</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(totalHectares)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-500">States Affected</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{statesAffected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-500">Most Recent</span>
            </div>
            <div className="text-sm font-bold text-gray-900">{formatDate(mostRecent)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-500 mr-2">Filter:</span>
        {["all", "catastrophic", "major", "moderate", "minor"].map((s) => (
          <button
            key={s}
            onClick={() => setSeverityFilter(s)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              severityFilter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "all" ? "All" : SEVERITY_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      {filtered.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: "400px" }}>
              <MapContainer center={[39.5, -98.35]} zoom={4} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {filtered.map((inc) => {
                  if (!inc.latitude || !inc.longitude) return null;
                  const cfg = SEVERITY_CONFIG[inc.severity] || SEVERITY_CONFIG.moderate;
                  const radius = Math.max(3000, Math.min(60000, Math.sqrt(inc.hectares_burned || 1000) * 80));
                  return (
                    <Circle
                      key={inc.id}
                      center={[inc.latitude, inc.longitude]}
                      radius={radius}
                      pathOptions={{ color: cfg.color, fillColor: cfg.fill, fillOpacity: 0.5 }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <strong>{inc.incident_name}</strong>
                          <br />
                          {formatDate(inc.start_date)} — {inc.admin1_name}
                          {inc.admin2_name ? `, ${inc.admin2_name}` : ""}
                          <br />
                          {formatNumber(inc.hectares_burned)} ha burned
                          <br />
                          Severity: {cfg.label}
                          {inc.responding_organizations?.length > 0 && (
                            <><br />Responders: {inc.responding_organizations.join(", ")}</>
                          )}
                        </div>
                      </Popup>
                    </Circle>
                  );
                })}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <WildfireTimeline />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Incident Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No wildfire incidents in the database yet. Click "Fetch More Data" to populate from historical records.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500">
                    <th className="pb-2 pr-4">Incident</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Location</th>
                    <th className="pb-2 pr-4 text-right">Hectares</th>
                    <th className="pb-2 pr-4">Severity</th>
                    <th className="pb-2">Responding Orgs</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inc) => {
                    const cfg = SEVERITY_CONFIG[inc.severity] || SEVERITY_CONFIG.moderate;
                    return (
                      <tr key={inc.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 pr-4 font-medium text-gray-900">{inc.incident_name}</td>
                        <td className="py-2 pr-4 text-gray-600">{formatDate(inc.start_date)}</td>
                        <td className="py-2 pr-4 text-gray-600">{inc.admin1_name}{inc.admin2_name ? `, ${inc.admin2_name}` : ""}</td>
                        <td className="py-2 pr-4 text-right text-gray-900 font-medium">{formatNumber(inc.hectares_burned)}</td>
                        <td className="py-2 pr-4">
                          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: cfg.fill, color: cfg.color }}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-2 text-gray-600 text-xs">
                          {inc.responding_organizations?.length > 0
                            ? inc.responding_organizations.slice(0, 3).join(", ") + (inc.responding_organizations.length > 3 ? ` +${inc.responding_organizations.length - 3}` : "")
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}