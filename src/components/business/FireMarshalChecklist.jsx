import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Printer, Flame } from "lucide-react";

// Fire marshal readiness checklist for the Business Dashboard.
// Derives live status from the org's kits, plans, members, and subscription,
// alongside a printable static compliance checklist.
export default function FireMarshalChecklist({ subscription, members, kits, plans }) {
  const wardens = members.filter(
    (m) => m.role === "safety_officer" || m.role === "team_lead"
  );
  const hasChain = members.some((m) => m.chain_of_command_order != null);

  const tracked = [
    { label: "First aid kits logged by floor/building", done: kits.length > 0, detail: `${kits.length} kit(s)` },
    { label: "Evacuation plan documented", done: plans.length > 0, detail: `${plans.length} plan(s)` },
    { label: "Floor wardens assigned", done: wardens.length > 0, detail: `${wardens.length} warden(s)` },
    { label: "Chain of command configured", done: hasChain, detail: hasChain ? "Set" : "Not set" },
    {
      label: "Emergency alert sending enabled",
      done: !!subscription?.alert_sending_enabled,
      detail: subscription?.alert_sending_enabled ? "Enabled" : "Upgrade required",
    },
  ];

  const compliance = [
    "Fire extinguishers inspected and tagged (annual)",
    "Exit signs lit and emergency lighting tested monthly",
    "Egress paths clear and unobstructed at all times",
    "Posted evacuation maps on every floor",
    "Annual fire drill conducted and logged",
    "Hazardous materials stored per fire code",
    "Sprinkler/alarm system inspection current",
    "Trained floor wardens on each occupied floor",
  ];

  const completed = tracked.filter((i) => i.done).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" /> Fire Marshal Readiness
            </span>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5 mr-1" /> Print
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">
            {completed}/{tracked.length} tracked items ready.
          </p>
          {tracked.map((i) => (
            <div key={i.label} className="flex items-center gap-2 text-sm">
              {i.done ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              )}
              <span className="flex-1 text-foreground">{i.label}</span>
              <span className="text-xs text-muted-foreground">{i.detail}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">On-Site Compliance Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {compliance.map((c) => (
              <li key={c} className="flex items-start gap-2">
                <Circle className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}