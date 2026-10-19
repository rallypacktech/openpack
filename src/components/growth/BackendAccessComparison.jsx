import React from "react";
import { Badge } from "@/components/ui/badge";
import { BACKEND_ACCESS_OPTIONS } from "@/lib/growthRoadmap";

const ROWS = [
  { key: "gives", label: "What it restores" },
  { key: "cost", label: "Cost" },
  { key: "risk", label: "Risk" },
  { key: "effort", label: "Effort" },
  { key: "guardrails", label: "Guardrails" },
];

export default function BackendAccessComparison() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground font-sans">
        Two ways to handle the current 402 errors and the missing backend-function access. Pick one before
        Phase 6 work begins — the constrained path must never claim to repair server-side records.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {BACKEND_ACCESS_OPTIONS.map((opt, i) => (
          <div key={opt.id} className={`border rounded-lg bg-card p-5 ${i === 0 ? "border-primary/40" : "border-border"}`}>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-serif text-base font-semibold text-foreground">{opt.label}</h3>
              {i === 0 && <Badge className="bg-primary text-primary-foreground text-[10px]">Recommended</Badge>}
            </div>
            <p className="text-xs font-sans text-muted-foreground mb-4">{opt.summary}</p>

            <dl className="space-y-3">
              {ROWS.map((row) => {
                const value = opt[row.key];
                return (
                  <div key={row.key}>
                    <dt className="text-[10px] uppercase tracking-widest font-sans font-semibold text-muted-foreground mb-1">
                      {row.label}
                    </dt>
                    <dd>
                      {Array.isArray(value) ? (
                        <ul className="space-y-1">
                          {value.map((v) => (
                            <li key={v} className="text-xs font-sans text-foreground">• {v}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs font-sans text-foreground">{value}</p>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}