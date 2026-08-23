import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CAUSE_COLORS = {
  "Human Activity": "hsl(var(--crimson))",
  "Lightning": "hsl(var(--gold))",
  "Agricultural": "hsl(var(--sage))",
  "Power/Infrastructure": "#6366f1",
  "Under Investigation": "hsl(var(--muted-foreground))",
  "Other": "hsl(var(--border))",
};

// Canonicalized cause distribution — the fix for the stale, fragmented pie.
export default function CauseDistribution({ causeDistribution }) {
  const data = (causeDistribution || []).slice();
  if (!data.length) return null;
  const total = data.reduce((s, c) => s + c.value, 0);
  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="38%" cy="50%" outerRadius={90} label={false}>
            {data.map((d, i) => (
              <Cell key={i} fill={CAUSE_COLORS[d.name] || "#94a3b8"} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${fmtPct(v, total)}% (${new Intl.NumberFormat("en-US").format(v)})`} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ fontSize: 12, lineHeight: "18px" }}
            formatter={(value) => `${value} — ${fmtPctLabel(value, data, total)}%`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function fmtPct(v, total) {
  return total > 0 ? Math.round((v / total) * 100) : 0;
}
function fmtPctLabel(name, data, total) {
  const d = data.find((x) => x.name === name);
  return d ? fmtPct(d.value, total) : 0;
}