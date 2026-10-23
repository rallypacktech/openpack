import React from "react";

/** Per-route outcome of a footer collection sweep. */
export default function SweepResultList({ results }) {
  if (!results.length) return null;
  return (
    <div className="max-h-64 overflow-y-auto rounded-md border border-border divide-y divide-border">
      {results.map((row) => (
        <div key={row.path} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
          <span className="text-foreground truncate">{row.label}</span>
          <span className="text-muted-foreground tabular-nums flex-shrink-0">
            {row.strings} found · {row.added} new
          </span>
        </div>
      ))}
    </div>
  );
}