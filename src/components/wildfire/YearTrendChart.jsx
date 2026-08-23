import React from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

function fmt(n) {
  return new Intl.NumberFormat("en-US").format(Math.round(n || 0));
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-lg p-3 text-xs">
      <div className="font-bold text-foreground">{label}</div>
      <div className="text-muted-foreground">{fmt(d.count)} fires</div>
      <div className="text-muted-foreground">{fmt(d.hectares)} ha burned</div>
    </div>
  );
}

// 10-year trend: bars = fire count, line = hectares (secondary axis).
export default function YearTrendChart({ byYear }) {
  const data = (byYear || []).slice().sort((a, b) => a.year - b.year);
  if (!data.length) return null;
  return (
    <div className="w-full h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="year" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={fmt} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : fmt(v))} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar yAxisId="left" dataKey="count" name="Fires" fill="hsl(var(--crimson))" radius={[3, 3, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="hectares" name="Hectares" stroke="hsl(var(--foreground))" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}