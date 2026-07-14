import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Filter, Calendar, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SEVERITY_COLORS = {
  catastrophic: "#7f1d1d",
  major: "#dc2626",
  moderate: "#f97316",
  minor: "#fbbf24",
};

const SEVERITY_LABELS = {
  catastrophic: "Catastrophic",
  major: "Major",
  moderate: "Moderate",
  minor: "Minor",
};

function formatNumber(n) {
  if (!n) return "—";
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs max-w-xs">
      <div className="font-bold text-gray-900 mb-1">{d.name}</div>
      <div className="text-gray-600">{d.fullDate}</div>
      <div className="text-gray-600">{d.county}</div>
      <div className="text-gray-900 font-medium mt-1">{formatNumber(d.hectares)} ha burned</div>
      <div className="mt-1">
        <span className="px-1.5 py-0.5 rounded text-white text-xs font-medium" style={{ backgroundColor: SEVERITY_COLORS[d.severity] }}>
          {SEVERITY_LABELS[d.severity]}
        </span>
      </div>
      {d.cause && <div className="text-gray-500 mt-1">Cause: {d.cause}</div>}
      {d.structures > 0 && <div className="text-red-600">Structures: {d.structures}</div>}
      {d.fatalities > 0 && <div className="text-red-800">Fatalities: {d.fatalities}</div>}
    </div>
  );
}

export default function WildfireTimeline({ showIncidentList = false, maxHeight = 380 }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countyFilter, setCountyFilter] = useState("all");

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.WildfireIncident.list("-start_date", 500);
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      const recent = data.filter(i => i.start_date && new Date(i.start_date) >= tenYearsAgo);
      setIncidents(recent);
    } catch (e) {
      console.error("Error loading incidents:", e);
    } finally {
      setLoading(false);
    }
  };

  const counties = useMemo(() => {
    const set = new Set();
    incidents.forEach(i => {
      if (i.admin2_name && i.admin1_name) {
        set.add(`${i.admin2_name}, ${i.admin1_name}`);
      } else if (i.admin1_name) {
        set.add(i.admin1_name);
      }
    });
    return Array.from(set).sort();
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    if (countyFilter === "all") return incidents;
    return incidents.filter(i => {
      const loc = i.admin2_name ? `${i.admin2_name}, ${i.admin1_name}` : i.admin1_name;
      return loc === countyFilter;
    });
  }, [incidents, countyFilter]);

  const chartData = useMemo(() => {
    return filteredIncidents
      .filter(i => i.start_date)
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
      .map(i => ({
        dateLabel: new Date(i.start_date).toLocaleDateString("en-US", { year: "numeric", month: "short" }),
        hectares: i.hectares_burned || 0,
        name: i.incident_name,
        severity: i.severity || "moderate",
        county: i.admin2_name ? `${i.admin2_name}, ${i.admin1_name}` : i.admin1_name || "Unknown",
        fullDate: formatDate(i.start_date),
        structures: i.structures_destroyed,
        fatalities: i.fatalities,
        cause: i.cause,
      }));
  }, [filteredIncidents]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600" /> Wildfire Timeline — Last 10 Years
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Interactive timeline of incidents by date, size, and severity.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select value={countyFilter} onValueChange={setCountyFilter}>
            <SelectTrigger className="w-[240px] h-8 text-sm">
              <SelectValue placeholder="Filter by county/territory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {counties.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="pt-5">
          {loading ? (
            <div className="flex items-center justify-center" style={{ height: maxHeight }}>
              <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-400 text-sm" style={{ height: maxHeight }}>
              <Flame className="w-8 h-8 mb-2 opacity-30" />
              No wildfire incidents found for the selected filter.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={maxHeight}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickFormatter={(v) => formatNumber(v)}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="hectares" radius={[2, 2, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={SEVERITY_COLORS[entry.severity] || SEVERITY_COLORS.moderate} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(SEVERITY_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-600">{SEVERITY_LABELS[key]}</span>
          </div>
        ))}
        <span className="text-xs text-gray-400 ml-auto">
          {filteredIncidents.length} incidents
        </span>
      </div>

      {showIncidentList && filteredIncidents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Incident List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500">
                    <th className="pb-2 pr-4">Incident</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Location</th>
                    <th className="pb-2 pr-4 text-right">Hectares</th>
                    <th className="pb-2">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents
                    .slice()
                    .sort((a, b) => new Date(b.start_date || 0) - new Date(a.start_date || 0))
                    .slice(0, 50)
                    .map(inc => {
                      const color = SEVERITY_COLORS[inc.severity] || SEVERITY_COLORS.moderate;
                      return (
                        <tr key={inc.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 pr-4 font-medium text-gray-900">{inc.incident_name}</td>
                          <td className="py-2 pr-4 text-gray-600">{formatDate(inc.start_date)}</td>
                          <td className="py-2 pr-4 text-gray-600">
                            {inc.admin2_name ? `${inc.admin2_name}, ` : ""}{inc.admin1_name || "—"}
                          </td>
                          <td className="py-2 pr-4 text-right text-gray-900 font-medium">{formatNumber(inc.hectares_burned)}</td>
                          <td className="py-2">
                            <span className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: color }}>
                              {SEVERITY_LABELS[inc.severity] || "Moderate"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {filteredIncidents.length > 50 && (
                <div className="text-center text-xs text-gray-400 mt-2">
                  Showing 50 of {filteredIncidents.length} incidents
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}