import React, { useMemo } from "react";
import { Flame, Globe, TrendingUp, Users } from "lucide-react";

// Sticky "key numbers" band at the top of the public trend report.
export default function KeyNumbersBand({ totals, causeDistribution }) {
  const humanPct = useMemo(() => {
    const total = (causeDistribution || []).reduce((s, c) => s + c.value, 0) || 1;
    const human = (causeDistribution || [])
      .filter((c) => ["Human Activity", "Agricultural", "Power/Infrastructure"].includes(c.name))
      .reduce((s, c) => s + c.value, 0);
    return Math.round((human / total) * 100);
  }, [causeDistribution]);

  const fmt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n || 0));

  const cards = [
    { icon: Flame, label: "10-yr wildfires", value: fmt(totals.total_incidents), accent: "text-crimson" },
    { icon: Globe, label: "Hectares burned", value: fmt(totals.total_hectares), accent: "text-foreground" },
    { icon: Users, label: "Human-caused", value: `${humanPct}%`, accent: "text-crimson" },
    { icon: TrendingUp, label: "Countries affected", value: fmt(totals.countries_affected), accent: "text-foreground" },
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