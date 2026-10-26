import React from "react";
import { compactMoney } from "@/components/trends/FloodKeyNumbers";

const fmt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n || 0));

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const SOURCE_LABELS = {
  OPENFEMA: "FEMA",
  NOAA_STORM_EVENTS: "NOAA",
  EM_DAT: "EM-DAT",
  UNDRR_DESINVENTAR: "DesInventar",
  MANUAL: "Manual",
};

// The largest reported events and what they cost.
export default function FloodSevereList({ events }) {
  const rows = (events || []).filter((e) => (e.damage_usd || 0) > 0 || (e.deaths || 0) > 0);
  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full min-w-[640px] text-sm font-sans">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-2 pr-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Event</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Where</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Started</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold text-right">Deaths</th>
            <th className="py-2 pr-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold text-right">Damage</th>
            <th className="py-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((e, i) => (
            <tr key={`${e.event_name}-${i}`}>
              <td className="py-3 pr-4 text-foreground font-medium max-w-[22rem]">{e.event_name}</td>
              <td className="py-3 pr-4 text-muted-foreground">{e.place || "—"}</td>
              <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">{fmtDate(e.start_date)}</td>
              <td className="py-3 pr-4 text-right tabular-nums text-foreground">{e.deaths ? fmt(e.deaths) : "—"}</td>
              <td className="py-3 pr-4 text-right tabular-nums text-foreground whitespace-nowrap">
                {e.damage_usd ? compactMoney(e.damage_usd) : "—"}
              </td>
              <td className="py-3 text-xs text-muted-foreground">{SOURCE_LABELS[e.source] || e.source || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground mt-3">
        Damage figures are shown as the source published them, not adjusted for inflation.
      </p>
    </div>
  );
}