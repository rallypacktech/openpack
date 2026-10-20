import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Loader2, Link2, Target } from "lucide-react";

// One place decides how a phase's state reads, so the badge, the card styling
// and the summary line can never disagree with each other.
const STATUS = {
  complete: {
    label: "Complete",
    Icon: CheckCircle2,
    iconClass: "text-green-600",
    badge: "bg-green-600 text-white",
    card: "border-green-200 bg-green-50/50",
    title: "text-green-900",
  },
  in_progress: {
    label: "In progress",
    Icon: Loader2,
    iconClass: "text-primary",
    badge: "bg-primary text-primary-foreground",
    card: "border-primary/30 bg-card",
    title: "text-foreground",
  },
  planned: {
    label: "Not started",
    Icon: Circle,
    iconClass: "text-muted-foreground",
    badge: "bg-secondary text-muted-foreground",
    card: "border-border bg-card",
    title: "text-foreground",
  },
};

export default function RoadmapPhases({ phases }) {
  const done = phases.filter((p) => p.status === "complete");
  const open = phases.filter((p) => p.status !== "complete");
  const phaseNumber = (phase) => phase.label.split(" — ")[0];

  return (
    <div className="space-y-4">
      {/* Which phases are done, answered before the detail. */}
      <div className="border border-border rounded-lg bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
          <span className="text-sm font-sans font-semibold text-foreground">
            {done.length} of {phases.length} phases complete
          </span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-sans">
          <span className="text-muted-foreground">
            <span className="font-semibold text-green-700">Done: </span>
            {done.length > 0 ? done.map(phaseNumber).join(", ") : "none yet"}
          </span>
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">Still open: </span>
            {open.length > 0 ? open.map(phaseNumber).join(", ") : "nothing"}
          </span>
        </div>
      </div>

      {phases.map((phase) => {
        const state = STATUS[phase.status] || STATUS.planned;
        return (
          <div key={phase.id} className={`border rounded-lg p-5 ${state.card}`}>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <state.Icon
                className={`w-4 h-4 shrink-0 ${state.iconClass}`}
                aria-hidden="true"
              />
              <h3 className={`font-serif text-lg font-semibold ${state.title}`}>
                {phase.label}
              </h3>
              <Badge className={`${state.badge} text-[10px]`}>{state.label}</Badge>
              {phase.signupLift && (
                <Badge className="bg-primary text-primary-foreground text-[10px]">
                  Sign-up growth
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-sans mb-4">
              {phase.goal}
            </p>

            <ul className="space-y-2 mb-4">
              {phase.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm font-sans text-foreground"
                >
                  <CheckCircle2
                    className="w-4 h-4 text-primary mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
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
                    <li
                      key={m}
                      className="text-xs font-sans text-muted-foreground"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-sans font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Link2 className="w-3 h-3" aria-hidden="true" /> Depends on
                </p>
                <ul className="space-y-1">
                  {phase.dependsOn.length === 0 ? (
                    <li className="text-xs font-sans text-muted-foreground">
                      Nothing — can start now
                    </li>
                  ) : (
                    phase.dependsOn.map((d) => (
                      <li
                        key={d}
                        className="text-xs font-sans text-muted-foreground"
                      >
                        {d}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            {phase.tradeoff && (
              <p className="text-xs font-sans text-muted-foreground mt-3 italic">
                Tradeoff: {phase.tradeoff}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}