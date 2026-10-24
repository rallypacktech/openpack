import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { COUNTRY_NAMES } from "@/lib/countryCodes";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";

const DIMENSIONS = [
  { value: "query", label: "Top queries" },
  { value: "page", label: "Top pages" },
  { value: "country", label: "Countries" },
  { value: "device", label: "Devices" },
  { value: "date", label: "Daily trend" },
];

const WINDOWS = [
  { value: "7", label: "Last 7 days" },
  { value: "28", label: "Last 28 days" },
  { value: "90", label: "Last 90 days" },
];

const DIMENSION_HEADING = {
  query: "Query",
  page: "Page",
  country: "Country",
  device: "Device",
  date: "Date",
};

const formatPercent = (n) => `${(n * 100).toFixed(1)}%`;

function rowLabel(dimension, key) {
  if (!key) return "—";
  if (dimension === "country") return COUNTRY_NAMES[key] || key.toUpperCase();
  if (dimension === "device") return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
  if (dimension === "page") {
    try {
      return new URL(key).pathname;
    } catch (_e) {
      return key;
    }
  }
  return key;
}

const Metric = ({ label, value }) => (
  <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-serif text-2xl font-bold text-foreground tabular-nums mt-0.5">{value}</p>
  </div>
);

export default function SearchOverviewPanel({ siteUrl }) {
  const [dimension, setDimension] = useState("query");
  const [days, setDays] = useState("28");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("getSearchPerformance", {
        site_url: siteUrl,
        dimension,
        days: Number(days),
        row_limit: 25,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setData(res.data);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [siteUrl, dimension, days]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = data?.totals;

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Break down by</label>
            <Select value={dimension} onValueChange={setDimension}>
              <SelectTrigger className="w-full sm:w-52 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIMENSIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Window</label>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-full sm:w-44 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WINDOWS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>
                    {w.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
            <p className="text-xs text-amber-900">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Metric label="Clicks" value={(totals?.clicks ?? 0).toLocaleString()} />
              <Metric label="Impressions" value={(totals?.impressions ?? 0).toLocaleString()} />
              <Metric label="Average CTR" value={formatPercent(totals?.ctr ?? 0)} />
              <Metric label="Average position" value={(totals?.position ?? 0).toFixed(1)} />
            </div>

            {data?.rows?.length ? (
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-border">
                      <th className="text-left font-medium py-2 pr-3">
                        {DIMENSION_HEADING[dimension]}
                      </th>
                      <th className="text-right font-medium py-2 px-2">Clicks</th>
                      <th className="text-right font-medium py-2 px-2">Impr.</th>
                      <th className="text-right font-medium py-2 px-2">CTR</th>
                      <th className="text-right font-medium py-2 pl-2">Pos.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row) => (
                      <tr key={row.key} className="border-b border-border/60 last:border-0">
                        <td className="py-2 pr-3 text-foreground max-w-[16rem] truncate" title={row.key}>
                          {rowLabel(dimension, row.key)}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums text-foreground">
                          {row.clicks.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums text-muted-foreground">
                          {row.impressions.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums text-muted-foreground">
                          {formatPercent(row.ctr)}
                        </td>
                        <td className="py-2 pl-2 text-right tabular-nums text-muted-foreground">
                          {row.position.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No search data for this window yet.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}