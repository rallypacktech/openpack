import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Flame, Calendar } from "lucide-react";

const MS_24H = 24 * 60 * 60 * 1000;
const MS_7D = 7 * 24 * 60 * 60 * 1000;

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function HolidayFireworkCorrelation() {
  const [holidays, setHolidays] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [holidayData, incidentData] = await Promise.all([
        base44.entities.HolidayFireworkDisplay.list("-date", 200),
        base44.entities.WildfireIncident.list("-start_date", 500),
      ]);
      setHolidays(holidayData);
      setIncidents(incidentData);
    } catch (e) {
      console.error("Error loading firework correlation data:", e);
    } finally {
      setLoading(false);
    }
  };

  const analysis = useMemo(() => {
    if (!holidays.length || !incidents.length) return null;

    const holidayDates = holidays
      .filter(h => h.date)
      .map(h => new Date(h.date).getTime());

    const within24h = [];
    const within7d = [];
    const matchedHolidays = new Map();

    incidents.forEach(inc => {
      if (!inc.start_date) return;
      const fireTime = new Date(inc.start_date).getTime();
      let bestHoliday = null;
      let bestDiff = Infinity;

      holidayDates.forEach(hTime => {
        const diff = Math.abs(fireTime - hTime);
        if (diff <= MS_7D && diff < bestDiff) {
          bestDiff = diff;
          bestHoliday = hTime;
        }
      });

      if (bestHoliday !== null) {
        within7d.push(inc);
        if (bestDiff <= MS_24H) {
          within24h.push(inc);
        }
        const hKey = String(bestHoliday);
        if (!matchedHolidays.has(hKey)) {
          matchedHolidays.set(hKey, []);
        }
        matchedHolidays.get(hKey).push(inc);
      }
    });

    const totalWithDates = incidents.filter(i => i.start_date).length;

    const holidayMatches = holidays
      .filter(h => h.date)
      .map(h => {
        const hTime = new Date(h.date).getTime();
        const matched = matchedHolidays.get(String(hTime)) || [];
        return {
          ...h,
          matchedCount: matched.length,
          hectaresTotal: matched.reduce((sum, i) => sum + (i.hectares_burned || 0), 0),
        };
      })
      .filter(h => h.matchedCount > 0)
      .sort((a, b) => b.matchedCount - a.matchedCount);

    return {
      totalIncidents: totalWithDates,
      within24hCount: within24h.length,
      within7dCount: within7d.length,
      pct24h: totalWithDates > 0 ? (within24h.length / totalWithDates) * 100 : 0,
      pct7d: totalWithDates > 0 ? (within7d.length / totalWithDates) * 100 : 0,
      holidayMatches,
    };
  }, [holidays, incidents]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col items-center justify-center text-gray-400 text-sm py-12">
            <Sparkles className="w-8 h-8 mb-2 opacity-30" />
            No holiday firework or wildfire data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" /> Firework Holiday — Wildfire Correlation
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Percentage of wildfire incidents that started within 24 hours or 7 days of a holiday with public firework displays.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Flame className="w-3.5 h-3.5" /> Total Wildfires
            </div>
            <div className="text-2xl font-bold text-gray-900">{analysis.totalIncidents}</div>
            <div className="text-xs text-gray-400">with recorded start dates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Calendar className="w-3.5 h-3.5 text-orange-500" /> Within 24 Hours
            </div>
            <div className="text-2xl font-bold text-orange-600">{analysis.within24hCount}</div>
            <div className="text-xs text-gray-400">{analysis.pct24h.toFixed(1)}% of all wildfires</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Calendar className="w-3.5 h-3.5 text-red-600" /> Within 7 Days
            </div>
            <div className="text-2xl font-bold text-red-600">{analysis.within7dCount}</div>
            <div className="text-xs text-gray-400">{analysis.pct7d.toFixed(1)}% of all wildfires</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar visualization */}
      <Card>
        <CardContent className="pt-5">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Within 24h of a firework holiday</span>
                <span className="font-semibold text-gray-900">{analysis.pct24h.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(analysis.pct24h, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Within 7 days of a firework holiday</span>
                <span className="font-semibold text-gray-900">{analysis.pct7d.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 rounded-full" style={{ width: `${Math.min(analysis.pct7d, 100)}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holiday match breakdown */}
      {analysis.holidayMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Holidays With Nearby Wildfires (≤7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500">
                    <th className="pb-2 pr-4">Holiday</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Country</th>
                    <th className="pb-2 pr-4 text-right">Nearby Fires</th>
                    <th className="pb-2 text-right">Hectares</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.holidayMatches.slice(0, 20).map((h, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-900">{h.holiday_name}</td>
                      <td className="py-2 pr-4 text-gray-600">{formatDate(h.date)}</td>
                      <td className="py-2 pr-4 text-gray-600">{h.country_code || "—"}</td>
                      <td className="py-2 pr-4 text-right text-gray-900 font-medium">{h.matchedCount}</td>
                      <td className="py-2 text-right text-gray-600">
                        {h.hectaresTotal > 0 ? new Intl.NumberFormat("en-US").format(Math.round(h.hectaresTotal)) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {analysis.holidayMatches.length > 20 && (
                <div className="text-center text-xs text-gray-400 mt-2">
                  Showing 20 of {analysis.holidayMatches.length} matching holidays
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}