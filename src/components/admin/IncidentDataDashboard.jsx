import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, RefreshCw, TrendingUp, MapPin, Calendar, Database, Globe, Clock, AlertCircle } from "lucide-react";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WildfireTimeline from "@/components/admin/WildfireTimeline";
import { EFFIS_COUNTRIES, GLOBAL_COUNTRIES, ALL_COUNTRIES, COUNTRY_NAMES, isEffisCountry, SOURCE_LABELS } from "@/lib/wildfireCountries";

const SEVERITY_CONFIG = {
  catastrophic: { color: "#7f1d1d", fill: "rgba(127,29,29,0.35)", label: "Catastrophic" },
  major: { color: "#dc2626", fill: "rgba(220,38,38,0.3)", label: "Major" },
  moderate: { color: "#f97316", fill: "rgba(249,115,22,0.3)", label: "Moderate" },
  minor: { color: "#fbbf24", fill: "rgba(251,191,36,0.3)", label: "Minor" },
};

function formatNumber(n) {
  if (n === 0 || n == null) return "0";
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return "—";
  return dt.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function timeAgo(d) {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  if (isNaN(diff) || diff < 0) return "—";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function IncidentDataDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [busy, setBusy] = useState(null); // "nifc" | "import" | "fill" | "<CODE>" for per-row
  const [progress, setProgress] = useState("");

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.WildfireIncident.list("-start_date", 200);
      setIncidents(data);
    } catch (e) {
      console.error("Error loading incidents:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await base44.functions.invoke("getWildfireStats", {});
      setStats(res.data);
    } catch (e) {
      console.error("Error loading wildfire stats:", e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
    loadStats();
  }, [loadIncidents, loadStats]);

  // Run a 3-batch import for a single country. Returns a per-batch summary array.
  const importCountry = useCallback(async (code) => {
    const fnName = isEffisCountry(code) ? "fetchEFFISHistory" : "fetchWildfireHistory";
    const results = [];
    for (let b = 1; b <= 3; b++) {
      setProgress(`${COUNTRY_NAMES[code] || code} — batch ${b}/3…`);
      try {
        const r = await base44.functions.invoke(fnName, { country_code: code, years_back: 10, batch: b });
        results.push(`b${b}: ${r.data?.incidents_created ?? 0} new`);
      } catch (e) {
        results.push(`b${b}: FAILED`);
      }
    }
    return results;
  }, []);

  const handleRefreshAll = async () => {
    await Promise.all([loadIncidents(), loadStats()]);
  };

  const handleImportSelected = async (code, key) => {
    setBusy(key);
    setProgress("");
    try {
      await importCountry(code);
      await Promise.all([loadIncidents(), loadStats()]);
    } finally {
      setBusy(null);
      setProgress("");
    }
  };

  const handleFetchNifcActive = async () => {
    setBusy("nifc");
    setProgress("Pulling NIFC active incidents…");
    try {
      await base44.functions.invoke("fetchNIFCActiveIncidents", {});
      await Promise.all([loadIncidents(), loadStats()]);
    } catch (e) {
      console.error("Error fetching NIFC active incidents:", e);
    } finally {
      setBusy(null);
      setProgress("");
    }
  };

  const handleFillMissing = async () => {
    if (!stats) return;
    const missing = ALL_COUNTRIES.filter((c) => !stats.by_country[c.code] || stats.by_country[c.code].count === 0);
    if (missing.length === 0) {
      window.alert("All known countries already have data — nothing missing.");
      return;
    }
    if (!window.confirm(`Import wildfire history (3 batches each) for ${missing.length} missing countries:\n${missing.map((c) => c.name).join(", ")}?\n\nThis will take several minutes.`)) return;
    setBusy("fill");
    const summary = [];
    for (const country of missing) {
      const res = await importCountry(country.code);
      summary.push(`${country.name}: ${res.join(" | ")}`);
      await loadStats();
    }
    await loadIncidents();
    setBusy(null);
    setProgress("");
    window.alert(`Import complete:\n\n${summary.join("\n")}`);
  };

  // Coverage matrix rows — all known countries, merged with stats.
  const coverageRows = useMemo(() => {
    if (!stats) return [];
    return ALL_COUNTRIES.map((c) => {
      const entry = stats.by_country[c.code];
      return {
        code: c.code,
        name: c.name,
        count: entry?.count || 0,
        hectares: entry?.hectares || 0,
        coverage: entry?.coverage || {},
        sources: entry?.sources || [],
        last_refresh: stats.last_refresh?.[c.code] || null,
      };
    });
  }, [stats]);

  const missingEffis = useMemo(
    () => EFFIS_COUNTRIES.filter((c) => !stats || !stats.by_country[c.code] || stats.by_country[c.code].count === 0),
    [stats],
  );
  const missingGlobal = useMemo(
    () => GLOBAL_COUNTRIES.filter((c) => !stats || !stats.by_country[c.code] || stats.by_country[c.code].count === 0),
    [stats],
  );

  const [effisCountry, setEffisCountry] = useState("");
  const [globalCountry, setGlobalCountry] = useState("");
  useEffect(() => {
    if (!effisCountry && missingEffis.length > 0) setEffisCountry(missingEffis[0].code);
  }, [missingEffis, effisCountry]);
  useEffect(() => {
    if (!globalCountry && missingGlobal.length > 0) setGlobalCountry(missingGlobal[0].code);
  }, [missingGlobal, globalCountry]);

  const totals = stats?.totals || { total_incidents: 0, total_hectares: 0, distinct_territories: 0, most_recent_date: null };
  const coverageYears = stats?.coverage_years || [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

  const filtered = severityFilter === "all" ? incidents : incidents.filter((i) => i.severity === severityFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-600" /> Historical Wildfire Incidents
          </h2>
          <p className="text-sm text-gray-500 mt-1">Accurate totals, 2014–2025 coverage gaps, and last-refresh tracking per country.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={loadingStats}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loadingStats ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleFetchNifcActive} disabled={!!busy}>
            {busy === "nifc" ? <><RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Fetching...</> : <><Flame className="w-4 h-4 mr-1" /> NIFC Active</>}
          </Button>
        </div>
      </div>

      {progress && (
        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2 flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {progress}
        </div>
      )}

      {/* Accurate totals from getWildfireStats (full dataset, not the 200-row display slice) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-gray-500">Total Incidents</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{loadingStats ? "—" : formatNumber(totals.total_incidents)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-gray-500">Hectares Burned</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{loadingStats ? "—" : formatNumber(totals.total_hectares)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-500">Territories Affected</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{loadingStats ? "—" : formatNumber(totals.distinct_territories)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-500">Most Recent</span>
            </div>
            <div className="text-sm font-bold text-gray-900">{loadingStats ? "—" : formatDate(totals.most_recent_date)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Import controls — dropdowns show only countries still missing data, by full name */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" /> Import Wildfire History
          </CardTitle>
          <p className="text-xs text-gray-500">Each import runs in 3 year-range batches to avoid timeouts. Dropdowns list only countries with no data yet.</p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-600" />
            <Select value={effisCountry} onValueChange={setEffisCountry} disabled={missingEffis.length === 0}>
              <SelectTrigger className="w-[180px] h-8 text-sm">
                <SelectValue placeholder={missingEffis.length === 0 ? "All EFFIS populated" : "Missing EFFIS country"} />
              </SelectTrigger>
              <SelectContent>
                {missingEffis.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => effisCountry && handleImportSelected(effisCountry, `effis-${effisCountry}`)} disabled={!effisCountry || !!busy}>
              {busy === `effis-${effisCountry}` ? <><RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Importing…</> : <>Import EFFIS (3 batches)</>}
            </Button>
          </div>

          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-orange-600" />
            <Select value={globalCountry} onValueChange={setGlobalCountry} disabled={missingGlobal.length === 0}>
              <SelectTrigger className="w-[180px] h-8 text-sm">
                <SelectValue placeholder={missingGlobal.length === 0 ? "All Global populated" : "Missing global country"} />
              </SelectTrigger>
              <SelectContent>
                {missingGlobal.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => globalCountry && handleImportSelected(globalCountry, `global-${globalCountry}`)} disabled={!globalCountry || !!busy}>
              {busy === `global-${globalCountry}` ? <><RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Fetching…</> : <>Fetch History (3 batches)</>}
            </Button>
          </div>

          <Button size="sm" variant="secondary" onClick={handleFillMissing} disabled={!!busy}>
            {busy === "fill" ? <><RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Filling…</> : <>Fill All Missing ({missingEffis.length + missingGlobal.length})</>}
          </Button>
        </CardContent>
      </Card>

      {/* Coverage matrix — what is 0 for 2014-2025, plus last refresh per country */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Data Coverage 2014–2025
          </CardTitle>
          <p className="text-xs text-gray-500">Per-country incident counts by year. Zero cells (highlighted) are gaps. "Last Refresh" shows the most recent import run.</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-3 sticky left-0 bg-white">Country</th>
                  {coverageYears.map((y) => <th key={y} className="py-2 px-1.5 text-center">{y}</th>)}
                  <th className="py-2 px-2 text-right">Total</th>
                  <th className="py-2 px-2">Source</th>
                  <th className="py-2 pl-3 pr-2">Last Refresh</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {coverageRows.map((row) => (
                  <tr key={row.code} className="border-b hover:bg-gray-50">
                    <td className="py-1.5 pr-3 font-medium text-gray-900 sticky left-0 bg-white whitespace-nowrap">{row.name}</td>
                    {coverageYears.map((y) => {
                      const v = row.coverage[y] || 0;
                      return (
                        <td key={y} className={`py-1.5 px-1.5 text-center ${v === 0 ? "text-red-300" : "text-gray-700"}`}>
                          {v === 0 ? "0" : v}
                        </td>
                      );
                    })}
                    <td className="py-1.5 px-2">
                      <div className="flex flex-wrap gap-0.5 max-w-[140px]">
                        {row.sources.length === 0 ? (
                          <span className="text-gray-300 text-[10px]">—</span>
                        ) : row.sources.map((src) => (
                          <span
                            key={src}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              src === "COPERNICUS_EFFIS" ? "bg-blue-100 text-blue-800"
                              : src === "NIFC" ? "bg-amber-100 text-amber-800"
                              : src === "NASA_FIRMS" ? "bg-purple-100 text-purple-800"
                              : src === "CAL_FIRE" ? "bg-red-100 text-red-800"
                              : src === "INCIWEB" ? "bg-green-100 text-green-800"
                              : src === "GFW" ? "bg-emerald-100 text-emerald-800"
                              : src === "MANUAL" || src === "LLM" ? "bg-fuchsia-100 text-fuchsia-800"
                              : "bg-gray-100 text-gray-600"
                            }`}
                            title={SOURCE_LABELS[src] || src}
                          >
                            {SOURCE_LABELS[src] || src}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-1.5 pl-3 pr-2 text-gray-500 whitespace-nowrap" title={row.last_refresh || "Never imported"}>
                      <Clock className="w-3 h-3 inline mr-1 text-gray-400" />
                      {row.last_refresh ? timeAgo(row.last_refresh) : "never"}
                    </td>
                    <td className="py-1.5 px-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        disabled={!!busy}
                        onClick={() => handleImportSelected(row.code, `row-${row.code}`)}
                      >
                        {busy === `row-${row.code}` ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Import"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Severity filter for the display slice (map + table) */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-500 mr-2">Display filter:</span>
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
        <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Showing {filtered.length} most recent records on the map &amp; table
        </span>
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
              No wildfire incidents in the database yet. Use the coverage matrix above to import by country.
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
                    <th className="pb-2 pr-4">Source</th>
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
                        <td className="py-2 pr-4">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            inc.source === 'COPERNICUS_EFFIS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {SOURCE_LABELS[inc.source] || inc.source || '—'}
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