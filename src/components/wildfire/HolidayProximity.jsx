import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Flame, Calendar, ChevronDown } from "lucide-react";

function fmt(n) {
  return new Intl.NumberFormat("en-US").format(Math.round(n || 0));
}

function countryName(code) {
  const map = {
    US: "United States", AU: "Australia", CA: "Canada", CN: "China",
    IN: "India", CH: "Switzerland", GB: "United Kingdom", FR: "France",
    ES: "Spain", SG: "Singapore", MY: "Malaysia", NZ: "New Zealand",
    IE: "Ireland", DE: "Germany", IT: "Italy", PT: "Portugal", GR: "Greece",
  };
  return map[code] || code;
}

// Firework-holiday proximity — fed from the server aggregate (full dataset),
// grouped by holiday (no top-N cap) so every firework-tradition holiday renders.
export default function HolidayProximity({ hp }) {
  if (!hp || !hp.total_scoped) return null;
  const groups = hp.holiday_groups || [];
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

      {groups.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {groups.length} firework-tradition holidays matched nearby fires. Tap a row to see individual incidents.
          </p>
          {groups.map((g, i) => (
            <HolidayGroup key={`${g.country_code}|${g.holiday_name}|${i}`} group={g} />
          ))}
        </div>
      )}
    </div>
  );
}

function HolidayGroup({ group }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border border-border rounded-lg bg-card">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-secondary/40 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-medium text-foreground truncate font-sans">{group.holiday_name}</span>
          <span className="text-xs text-muted-foreground shrink-0">{countryName(group.country_code)}</span>
          <span className="inline-flex items-center gap-1 bg-crimson/10 text-crimson text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
            <Flame className="w-3 h-3" /> {fmt(group.total_fires)}
          </span>
          {group.within_24h > 0 && (
            <span className="inline-flex items-center bg-orange-500/10 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full shrink-0">
              {fmt(group.within_24h)} ≤24h
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {group.hectares_total > 0 ? `${fmt(group.hectares_total)} ha` : ""}
          </span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 pr-4">Incident</th>
                <th className="px-2 py-2 pr-4">Start date</th>
                <th className="px-2 py-2 pr-4 text-right">Days from holiday</th>
                <th className="px-2 py-2 pr-4 text-right">Hectares</th>
              </tr>
            </thead>
            <tbody>
              {group.fires
                .slice()
                .sort((a, b) => a.days_from_holiday - b.days_from_holiday)
                .map((f, idx) => (
                  <tr key={idx} className="border-t border-border/60">
                    <td className="px-4 py-2 pr-4 text-foreground font-sans">
                      {f.incident_name}
                      {f.within_24h && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-orange-600 font-semibold">≤24h</span>
                      )}
                    </td>
                    <td className="px-2 py-2 pr-4 text-muted-foreground">{f.start_date}</td>
                    <td className="px-2 py-2 pr-4 text-right text-muted-foreground">{f.days_from_holiday} d</td>
                    <td className="px-2 py-2 pr-4 text-right text-muted-foreground">
                      {f.hectares_burned > 0 ? fmt(f.hectares_burned) : "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
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