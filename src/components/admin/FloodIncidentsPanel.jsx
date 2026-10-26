import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Waves, RefreshCw, Droplets, Skull, CircleDollarSign, MapPin } from "lucide-react";
import FloodImportPanel from "./FloodImportPanel";

const HAZARD_LABELS = {
  flood: "Flood",
  flash_flood: "Flash flood",
  coastal_flood: "Coastal flood",
  riverine_flood: "Riverine flood",
  hurricane_flood: "Hurricane flood",
  other: "Other",
};

const SOURCE_LABELS = {
  OPENFEMA: "OpenFEMA",
  NOAA_STORM_EVENTS: "NOAA",
  EM_DAT: "EM-DAT",
  UNDRR_DESINVENTAR: "DesInventar",
  MANUAL: "Manual",
};

const ACTIVE = { is_merged_away: false };

function fmt(n) {
  return new Intl.NumberFormat("en-US").format(Math.round(n || 0));
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt) ? "—" : dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-4 h-4 ${tone}`} />
          <span className="text-xs font-medium text-gray-500">{label}</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function FloodIncidentsPanel() {
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ events: 0, deaths: 0, damage_usd: 0, sources: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [page, eventCount, bySource] = await Promise.all([
        base44.entities.FloodIncident.filter(ACTIVE, { sort: "-start_date", limit: 50 }),
        base44.entities.FloodIncident.count(ACTIVE),
        base44.entities.FloodIncident.aggregate({ query: ACTIVE, groupBy: "source", sum: ["deaths", "damage_usd"] }),
      ]);
      setRows(page.items || []);
      const sourceRows = bySource?.rows || [];
      setTotals({
        events: eventCount || 0,
        deaths: sourceRows.reduce((s, r) => s + (r.sum_deaths || 0), 0),
        damage_usd: sourceRows.reduce((s, r) => s + (r.sum_damage_usd || 0), 0),
        sources: sourceRows.length,
      });
    } catch (e) {
      console.error("Error loading flood incidents:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Waves className="w-4 h-4 text-blue-600" /> Flood Records
          </h3>
          <p className="text-sm text-gray-500">
            Imported flood events, kept separate from wildfire and hurricane records so nothing is double-counted.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Droplets} label="Flood events" value={loading ? "—" : fmt(totals.events)} tone="text-blue-600" />
        <Stat icon={Skull} label="Reported deaths" value={loading ? "—" : fmt(totals.deaths)} tone="text-gray-600" />
        <Stat icon={CircleDollarSign} label="Reported damage" value={loading ? "—" : `$${fmt(totals.damage_usd)}`} tone="text-green-700" />
        <Stat icon={MapPin} label="Sources in use" value={loading ? "—" : fmt(totals.sources)} tone="text-orange-600" />
      </div>

      <FloodImportPanel onImported={load} />

      <Card>
        <CardContent className="pt-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-center py-8 text-sm text-gray-400">
              No flood records yet. Fetch a source above and press Import to populate this section.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500">
                    <th className="pb-2 pr-4">Event</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Location</th>
                    <th className="pb-2 pr-4">Hazard</th>
                    <th className="pb-2 pr-4 text-right">Deaths</th>
                    <th className="pb-2 pr-4 text-right">Damage (USD)</th>
                    <th className="pb-2">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-900 max-w-[240px] truncate" title={r.event_name}>{r.event_name}</td>
                      <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">{fmtDate(r.start_date)}</td>
                      <td className="py-2 pr-4 text-gray-600">
                        {[r.admin1_name, r.country_code].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{HAZARD_LABELS[r.hazard_type] || r.hazard_type || "—"}</td>
                      <td className="py-2 pr-4 text-right">{r.deaths ? fmt(r.deaths) : "—"}</td>
                      <td className="py-2 pr-4 text-right">{r.damage_usd ? `$${fmt(r.damage_usd)}` : "—"}</td>
                      <td className="py-2 text-gray-600 text-xs">{SOURCE_LABELS[r.source] || r.source || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-3">Showing the 50 most recent records. Totals above cover the full dataset.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}