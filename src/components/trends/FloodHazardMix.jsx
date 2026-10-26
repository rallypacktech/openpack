import React from "react";

const SOURCE_LABELS = {
  OPENFEMA: "FEMA declarations",
  NOAA_STORM_EVENTS: "NOAA Storm Events",
  EM_DAT: "EM-DAT",
  UNDRR_DESINVENTAR: "DesInventar",
  MANUAL: "Manually entered",
};

function Bars({ rows, total }) {
  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const pct = total ? Math.round((r.value / total) * 100) : 0;
        return (
          <div key={r.name}>
            <div className="flex items-baseline justify-between text-xs font-sans mb-1">
              <span className="text-foreground">{r.name}</span>
              <span className="text-muted-foreground tabular-nums">
                {r.value.toLocaleString()} · {pct}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-sm overflow-hidden">
              <div className="h-full bg-crimson" style={{ width: `${Math.max(pct, 2)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// What kind of flooding is recorded, and where the records come from.
export default function FloodHazardMix({ hazardMix, sourceMix }) {
  const hazards = (hazardMix || []).filter((h) => h.value > 0);
  const sources = (sourceMix || [])
    .filter((s) => s.value > 0)
    .map((s) => ({ name: SOURCE_LABELS[s.name] || s.name, value: s.value }));
  if (!hazards.length && !sources.length) return null;

  const hazardTotal = hazards.reduce((sum, h) => sum + h.value, 0);
  const sourceTotal = sources.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {hazards.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-sans font-semibold mb-3">
            Type of flooding
          </h3>
          <Bars rows={hazards} total={hazardTotal} />
        </div>
      )}
      {sources.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-sans font-semibold mb-3">
            Where the records come from
          </h3>
          <Bars rows={sources} total={sourceTotal} />
        </div>
      )}
    </div>
  );
}