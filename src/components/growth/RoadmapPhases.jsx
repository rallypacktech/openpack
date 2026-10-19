import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Link2, Target } from "lucide-react";

export default function RoadmapPhases({ phases }) {
  return (
    <div className="space-y-4">
      {phases.map((phase) => (
        <div key={phase.id} className="border border-border rounded-lg bg-card p-5">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-serif text-lg font-semibold text-foreground">{phase.label}</h3>
            {phase.signupLift && (
              <Badge className="bg-primary text-primary-foreground text-[10px]">Sign-up growth</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-sans mb-4">{phase.goal}</p>

          <ul className="space-y-2 mb-4">
            {phase.items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm font-sans text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="grid sm:grid-cols-2 gap-4 border-t border-border pt-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-sans font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                <Target className="w-3 h-3" aria-hidden="true" /> Success metrics
              </p>
              <ul className="space-y-1">
                {phase.metrics.map((m) => (
                  <li key={m} className="text-xs font-sans text-muted-foreground">{m}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-sans font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                <Link2 className="w-3 h-3" aria-hidden="true" /> Depends on
              </p>
              <ul className="space-y-1">
                {phase.dependsOn.length === 0 ? (
                  <li className="text-xs font-sans text-muted-foreground">Nothing — can start now</li>
                ) : (
                  phase.dependsOn.map((d) => (
                    <li key={d} className="text-xs font-sans text-muted-foreground">{d}</li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {phase.tradeoff && (
            <p className="text-xs font-sans text-muted-foreground mt-3 italic">Tradeoff: {phase.tradeoff}</p>
          )}
        </div>
      ))}
    </div>
  );
}