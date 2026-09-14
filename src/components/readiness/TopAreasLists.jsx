import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

function scoreToColor(score) {
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

export default function TopAreasLists({ top5Best, top5Worst, onSelect, level }) {
  const canDrill = level !== "postal";

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <h3 className="font-sans font-semibold text-sm text-foreground">
            Top 5 Best Prepared
          </h3>
        </div>
        {top5Best.length === 0 ? (
          <p className="text-xs text-muted-foreground font-sans">No data yet.</p>
        ) : (
          <div className="space-y-1">
            {top5Best.map((loc, i) => (
              <button
                key={`best-${loc.name}-${i}`}
                onClick={() => canDrill && onSelect(loc)}
                disabled={!canDrill}
                className={`w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-card transition-colors ${
                  canDrill
                    ? "hover:border-green-300 hover:bg-green-50/50 cursor-pointer"
                    : "cursor-default"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-serif text-sm font-bold text-muted-foreground w-5 flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-sans text-foreground truncate">
                    {loc.name}
                  </span>
                </div>
                <span
                  className={`text-sm font-sans font-semibold flex-shrink-0 ml-2 ${scoreToColor(
                    loc.avg_score
                  )}`}
                >
                  {loc.avg_score}%
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-red-600" />
          <h3 className="font-sans font-semibold text-sm text-foreground">
            Top 5 Least Prepared
          </h3>
        </div>
        {top5Worst.length === 0 ? (
          <p className="text-xs text-muted-foreground font-sans">No data yet.</p>
        ) : (
          <div className="space-y-1">
            {top5Worst.map((loc, i) => (
              <button
                key={`worst-${loc.name}-${i}`}
                onClick={() => canDrill && onSelect(loc)}
                disabled={!canDrill}
                className={`w-full flex items-center justify-between px-3 py-2 rounded border border-border bg-card transition-colors ${
                  canDrill
                    ? "hover:border-red-300 hover:bg-red-50/50 cursor-pointer"
                    : "cursor-default"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-serif text-sm font-bold text-muted-foreground w-5 flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-sans text-foreground truncate">
                    {loc.name}
                  </span>
                </div>
                <span
                  className={`text-sm font-sans font-semibold flex-shrink-0 ml-2 ${scoreToColor(
                    loc.avg_score
                  )}`}
                >
                  {loc.avg_score}%
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}