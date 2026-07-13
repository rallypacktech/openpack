import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, RefreshCw, Globe, TrendingDown, AlertCircle, MapPin, Database, Loader2 } from "lucide-react";

const SEVERITY_STYLES = {
  catastrophic: { label: "Catastrophic", className: "bg-red-100 text-red-800 border-red-300", color: "#7f1d1d" },
  major: { label: "Major", className: "bg-orange-100 text-orange-800 border-orange-300", color: "#ea580c" },
  moderate: { label: "Moderate", className: "bg-yellow-100 text-yellow-800 border-yellow-300", color: "#ca8a04" },
  minor: { label: "Minor", className: "bg-green-100 text-green-800 border-green-300", color: "#16a34a" },
};

function makeFireIcon(severity) {
  const color = SEVERITY_STYLES[severity]?.color || "#6b7280";
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:13px;">🔥</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function formatNumber(n) {
  if (!n) return "0";
  return n.toLocaleString();
}

export default function HistoricalIncidentsDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [fetchingData, setFetchingData] = useState(false);
  const [fetchResult, setFetchResult] = useState(null);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.WildfireIncident.list("-start_date", 500);
      setIncidents(data);
    } catch (e) {
      console.error("Error loading incidents:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadIncidents(); }, []);

  const countries = useMemo(() => {
    const set = new Set(incidents.map(i => i.country_code).filter(Boolean));
    return Array.from(set).sort();
  }, [incidents]);

  const years = useMemo(() => {
    const set = new Set(incidents.map(i => i.start_date?.substring(0, 4)).filter(Boolean));
    return Array.from(set).sort().reverse();
  }, [incidents]);

  const filtered = useMemo(() => {
    return incidents.filter(i => {
      if (filterYear !== "all" && i.start_date?.substring(0, 4) !== filterYear) return false;
      if (filterCountry !== "all" && i.country_code !== filterCountry) return false;
      return true;
    });
  }, [incidents, filterYear, filterCountry]);

  const stats = useMemo(() => {
    const totalHectares = filtered.reduce((s, i) => s + (i.hectares_burned || 0), 0);
    const totalStructures = filtered.reduce((s, i) => s + (i.structures_destroyed || 0), 0);
    const totalFatalities = filtered.reduce((s, i) => s + (i.fatalities || 0), 0);
    const byState = {};
    filtered.forEach(i => {
      const key = `${i.admin2_name || "?"}, ${i.admin1_name || "?"}`;
      byState[key] = (byState[key] || 0) + 1;
    });
    const sortedStates = Object.entries(byState).sort((a, b) => b[1] - a[1]);
    const topArea = sortedStates[0] || ["—", 0];
    return { totalHectares, totalStructures, totalFatalities, topArea: topArea[0], topAreaCount: topArea[1] };
  }, [filtered]);

  const mappedIncidents = filtered.filter(i => i.latitude && i.longitude);

  const handleFetchHistory = async (countryCode, admin1Name) => {
    setFetchingData(true);
    setFetchResult(null);
    try {
      const res = await base44.functions.invoke("fetchWildfireHistory", {
        country_code: countryCode || "US",
        admin1_name: admin1Name || null,
        years_back: 10
      });
      setFetchResult(res.data);
      if (res.data?.success) await loadIncidents();
    } catch (e) {
      setFetchResult({ error: e.response?.data?.error || e.message || "Failed to fetch" });
    } finally {
      setFetchingData(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Flame className="w-3.5 h-3.5" /> Total Incidents
            </div>
            <div className="text-2xl font-bold">{filtered.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Globe className="w-3.5 h-3.5" /> Hectares Burned
            </div>
            <div className="text-2xl font-bold">{formatNumber(Math.round(stats.totalHectares))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <AlertCircle className="w-3.5 h-3.5" /> Structures Lost
            </div>
            <div className="text-2xl font-bold">{formatNumber(stats.totalStructures)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingDown className="w-3.5 h-3.5" /> Fatalities
            </div>
            <div className="text-2xl font-bold">{formatNumber(stats.totalFatalities)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" /> Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleFetchHistory("US", null)}
            disabled={fetchingData}
          >
            {fetchingData ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
            Fetch US Wildfire History (10yr)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleFetchHistory("ES", null)}
            disabled={fetchingData}
          >
            Fetch Spain Wildfire History
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleFetchHistory("AU", null)}
            disabled={fetchingData}
          >
            Fetch Australia Wildfire History
          </Button>
          {fetchResult && (
            <span className={`text-xs ${fetchResult.error ? "text-red-600" : "text-green-600"}`}>
              {fetchResult.error
                ? `Error: ${fetchResult.error}`
                : `Created ${fetchResult.incidents_created} incidents (${fetchResult.counties_matched} county matches)`}
            </span>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Filters:</span>
        <select
          value={filterCountry}
          onChange={e => setFilterCountry(e.target.value)}
          className="text-sm border border-border rounded px-2 py-1 bg-white"
        >
          <option value="all">All Countries</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterYear}
          onChange={e => setFilterYear(e.target.value)}
          className="text-sm border border-border rounded px-2 py-1 bg-white"
        >
          <option value="all">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <Button size="sm" variant="ghost" onClick={loadIncidents} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Map */}
      {mappedIncidents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Incident Map ({mappedIncidents.length} mapped)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: "400px", borderRadius: "8px", overflow: "hidden" }}>
              <MapContainer center={[37.5, -120]} zoom={5} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                {mappedIncidents.map(inc => (
                  <Marker key={inc.id} position={[inc.latitude, inc.longitude]} icon={makeFireIcon(inc.severity)}>
                    <Popup>
                      <div style={{ minWidth: "200px" }}>
                        <strong>{inc.incident_name}</strong><br />
                        {inc.admin2_name}, {inc.admin1_name}, {inc.country_code}<br />
                        Started: {inc.start_date}<br />
                        Burned: {formatNumber(Math.round(inc.hectares_burned))} ha
                        ({formatNumber(inc.acres_burned)} acres)<br />
                        {inc.structures_destroyed > 0 && `Structures: ${inc.structures_destroyed} | `}
                        {inc.fatalities > 0 && `Fatalities: ${inc.fatalities}`}<br />
                        {inc.cause && `Cause: ${inc.cause}`}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Incident Records ({filtered.length})</CardTitle>
          {stats.topArea && (
            <p className="text-xs text-muted-foreground">
              Most affected: <strong>{stats.topArea}</strong> ({stats.topAreaCount} incidents)
            </p>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No wildfire incidents in the database yet. Use the "Fetch" buttons above to populate historical data.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-3">Incident</th>
                    <th className="py-2 pr-3">County, State</th>
                    <th className="py-2 pr-3">Start</th>
                    <th className="py-2 pr-3 text-right">Hectares</th>
                    <th className="py-2 pr-3 text-right">Structures</th>
                    <th className="py-2 pr-3 text-right">Fatalities</th>
                    <th className="py-2 pr-3">Severity</th>
                    <th className="py-2">Organizations</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 100).map(inc => {
                    const sev = SEVERITY_STYLES[inc.severity] || SEVERITY_STYLES.moderate;
                    return (
                      <tr key={inc.id} className="border-b hover:bg-muted/30">
                        <td className="py-2 pr-3 font-medium">{inc.incident_name}</td>
                        <td className="py-2 pr-3">{inc.admin2_name}, {inc.admin1_name}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">{inc.start_date}</td>
                        <td className="py-2 pr-3 text-right">{formatNumber(Math.round(inc.hectares_burned))}</td>
                        <td className="py-2 pr-3 text-right">{formatNumber(inc.structures_destroyed)}</td>
                        <td className="py-2 pr-3 text-right">{formatNumber(inc.fatalities)}</td>
                        <td className="py-2 pr-3">
                          <Badge variant="outline" className={sev.className}>{sev.label}</Badge>
                        </td>
                        <td className="py-2 text-muted-foreground max-w-xs truncate">
                          {(inc.responding_organizations || []).join(", ")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length > 100 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Showing first 100 of {filtered.length} records
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}