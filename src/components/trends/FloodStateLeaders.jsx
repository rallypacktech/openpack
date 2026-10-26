import React from "react";
import { compactMoney } from "@/components/trends/FloodKeyNumbers";

const fmt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n || 0));

function Column({ title, rows, valueLabel, valueOf }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-sans font-semibold mb-3">{title}</h3>
      <ol className="divide-y divide-border border-t border-border">
        {(rows || []).map((row, i) => (
          <li key={`${row.name}-${i}`} className="flex items-baseline justify-between gap-4 py-2">
            <span className="text-sm font-sans text-foreground truncate">
              <span className="text-muted-foreground mr-2 tabular-nums">{i + 1}</span>
              {row.name}
            </span>
            <span className="text-sm font-sans font-semibold text-foreground tabular-nums whitespace-nowrap">
              {valueOf(row)}
              <span className="text-xs font-normal text-muted-foreground ml-1">{valueLabel}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Two rankings side by side: frequency vs reported damage — they rarely match.
export default function FloodStateLeaders({ topByCount, topByDamage }) {
  const byCount = (topByCount || []).filter((s) => s.count > 0);
  const byDamage = (topByDamage || []).filter((s) => (s.damage_usd || 0) > 0);
  if (!byCount.length && !byDamage.length) return null;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {byCount.length > 0 && <Column title="Most floods recorded" rows={byCount} valueLabel="floods" valueOf={(r) => fmt(r.count)} />}
      {byDamage.length > 0 && (
        <Column title="Most reported damage" rows={byDamage} valueLabel="reported" valueOf={(r) => compactMoney(r.damage_usd)} />
      )}
    </div>
  );
}