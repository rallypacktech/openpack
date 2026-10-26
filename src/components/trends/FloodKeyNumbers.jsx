import React from "react";
import { Droplets, Users, DollarSign, MapPin } from "lucide-react";

const fmt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n || 0));

export function compactMoney(n) {
  const v = Number(n) || 0;
  if (v === 0) return "$0";
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${fmt(v)}`;
}

// Sticky headline figures for the public flood report.
export default function FloodKeyNumbers({ totals }) {
  const cards = [
    { icon: Droplets, label: "Floods recorded", value: fmt(totals.total_events), accent: "text-crimson" },
    { icon: Users, label: "Deaths reported", value: fmt(totals.total_deaths), accent: "text-crimson" },
    { icon: DollarSign, label: "Damage reported", value: compactMoney(totals.total_damage_usd), accent: "text-foreground" },
    { icon: MapPin, label: "States / regions", value: fmt(totals.states_affected), accent: "text-foreground" },
  ];

  return (
    <div className="sticky top-14 z-30 bg-cream/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cards.map((c) => (
            <div key={c.label} className="flex items-center gap-3">
              <c.icon className={`w-5 h-5 ${c.accent} flex-shrink-0`} aria-hidden="true" />
              <div className="min-w-0">
                <div className={`text-xl sm:text-2xl font-serif font-bold ${c.accent} leading-none`}>{c.value}</div>
                <div className="text-[11px] text-muted-foreground font-sans mt-0.5 truncate">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}