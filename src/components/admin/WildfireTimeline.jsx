import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Filter, Calendar, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRY_NAMES } from "@/lib/wildfireCountries";
import YearTrendChart from "@/components/wildfire/YearTrendChart";
import CauseDistribution from "@/components/wildfire/CauseDistribution";

const SEVERITY_LABELS = { catastrophic: "Catastrophic", major: "Major", moderate: "Moderate", minor: "Minor" };
const SEVERITY_COLORS = { catastrophic: "#7f1d1d", major: "#dc2626", moderate: "#f97316", minor: "#fbbf24" };

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
function formatNumber(n) {
  if (!n) return "—";
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

// Rewired to the server-side aggregate (getPublicWildfireReport) so the
// year trend + causes reflect ALL active records, not the latest 500.
// The recent-incidents list still uses a client fetch (it's a detail view).
export default function WildfireTimeline({ showIncidentList = false }) {
  const [report, setReport] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const [rep, incs] = await Promise.all([
          base44.functions.invoke("getPublicWildfireReport", {}),
          base44.entities.WildfireIncident.list("-start_date", 500),
        ]);
        setReport(rep.data);
        setRecent(incs);
      } catch (e) {
        console.error("WildfireTimeline load failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const countries = useMemo(() => {
    const set = new Set();
    recent.forEach((i) => { if (i.country_code) set.add(i.country_code); });
    return Array.from(set).sort();
  }, [recent]);

  const filteredRecent = useMemo(() => {
    if (countryFilter === "all") return recent;
    return recent.filter((i) => i.country_code === countryFilter);
  }, [recent, countryFilter]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-5 flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-red-600" /> Wildfire Trend — 10 Years (full dataset)
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">Annual fire count and hectares burned across all recorded incidents.</p>
      </div>

      <Card>
        <CardContent className="pt-5">
          {report?.by_year?.length ? (
            <YearTrendChart byYear={report.by_year} />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 text-sm py-12">
              <Flame className="w-8 h-8 mb-2 opacity-30" /> No wildfire data available.
            </div>
          )}
        </CardContent>
      </Card>

      {report?.cause_distribution?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Causes (canonicalized)</CardTitle></CardHeader>
          <CardContent>
            <CauseDistribution causeDistribution={report.cause_distribution} />
          </CardContent>
        </Card>
      )}

      {showIncidentList && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent incidents</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-[200px] h-8 text-sm"><SelectValue placeholder="Filter by country" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  {countries.map((c) => <SelectItem key={c} value={c}>{COUNTRY_NAMES[c] || c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
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
                  {filteredRecent.slice(0, 50).map((inc) => {
                    const color = SEVERITY_COLORS[inc.severity] || SEVERITY_COLORS.moderate;
                    return (
                      <tr key={inc.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 pr-4 font-medium text-gray-900">{inc.incident_name}</td>
                        <td className="py-2 pr-4 text-gray-600">{formatDate(inc.start_date)}</td>
                        <td className="py-2 pr-4 text-gray-600">{inc.admin2_name ? `${inc.admin2_name}, ` : ""}{inc.admin1_name || "—"}</td>
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
              {filteredRecent.length === 0 && <p className="text-center text-xs text-gray-400 py-6">No recent incidents for this filter.</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}