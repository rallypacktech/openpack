import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Calendar } from "lucide-react";

function fmt(n) {
  return new Intl.NumberFormat("en-US").format(Math.round(n || 0));
}

// Firework-holiday proximity — fed from the server aggregate (full dataset),
// not a 500-row client slice.
export default function HolidayProximity({ hp }) {
  if (!hp || !hp.total_scoped) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Flame className="w-3.5 h-3.5" /> Fires in firework-holiday countries
            </div>
            <div className="text-2xl font-serif font-bold text-foreground">{fmt(hp.total_scoped)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Calendar className="w-3.5 h-3.5 text-orange-500" /> Within 24h of a holiday
            </div>
            <div className="text-2xl font-serif font-bold text-crimson">{fmt(hp.within_24h)}</div>
            <div className="text-xs text-muted-foreground">{hp.pct_24h.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Calendar className="w-3.5 h-3.5 text-red-600" /> Within 7 days of a holiday
            </div>
            <div className="text-2xl font-serif font-bold text-red-600">{fmt(hp.within_7d)}</div>
            <div className="text-xs text-muted-foreground">{hp.pct_7d.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <ProgressBar label="Within 24h of a firework holiday" pct={hp.pct_24h} color="bg-orange-500" />
        <ProgressBar label="Within 7 days of a firework holiday" pct={hp.pct_7d} color="bg-red-600" />
      </div>

      {hp.holiday_matches?.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4">Holiday</th>
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Country</th>
                <th className="pb-2 pr-4 text-right">Nearby fires</th>
                <th className="pb-2 text-right">Hectares</th>
              </tr>
            </thead>
            <tbody>
              {hp.holiday_matches.slice(0, 12).map((h, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2 pr-4 font-medium text-foreground">{h.holiday_name}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{h.date}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{h.country_code}</td>
                  <td className="py-2 pr-4 text-right font-medium">{fmt(h.matched_count)}</td>
                  <td className="py-2 text-right text-muted-foreground">{h.hectares_total > 0 ? fmt(h.hectares_total) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ label, pct, color }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}