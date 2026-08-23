import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function fmt(n) {
  return new Intl.NumberFormat("en-US").format(Math.round(n || 0));
}

function LeaderChart({ data, dataKey, color, label }) {
  if (!data?.length) return null;
  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={fmt} />
          <YAxis
            type="category"
            dataKey="name"
            width={104}
            tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
            // Alternate labels by rank: #1, #3, #5… visible; #2, #4, #6… blank.
            // #1 is always shown regardless (index 0 is even, but kept explicit).
            tickFormatter={(value, index) => (index === 0 || index % 2 === 0 ? value : "")}
          />
          <Tooltip
            // Label the tooltip with the country name so hidden-axis bars stay identifiable.
            formatter={(value, _name, item) => [fmt(value), item?.payload?.name ?? label]}
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
          />
          <Bar dataKey={dataKey} name={label} radius={[0, 3, 3, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Top countries by fire count and by hectares burned, side by side.
export default function CountryLeaders({ topByCount, topByHectares }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-sans font-semibold text-foreground mb-2">Most fires recorded</h3>
        <LeaderChart data={topByCount} dataKey="count" color="hsl(var(--crimson))" label="Fires" />
      </div>
      <div>
        <h3 className="text-sm font-sans font-semibold text-foreground mb-2">Most hectares burned</h3>
        <LeaderChart data={topByHectares} dataKey="hectares" color="hsl(var(--foreground))" label="Hectares" />
      </div>
    </div>
  );
}