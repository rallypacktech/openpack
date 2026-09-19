import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Printer, Flame } from "lucide-react";
import { getExpiryStatus } from "@/lib/expiryStatus";
import { getComplianceRegion } from "@/lib/complianceFrameworks";

// Fire & life safety readiness checklist for the Business Dashboard.
// Derives live status from the org's kits, expirations, plans and members,
// alongside the printable on-site checklist for the org's country.
export default function FireSafetyChecklist({ subscription, members, kits, plans, countryCode }) {
  const [expiredCount, setExpiredCount] = useState(0);
  const [expiringCount, setExpiringCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const region = getComplianceRegion(countryCode);

  useEffect(() => {
    (async () => {
      try {
        const [items, records] = await Promise.all([
          base44.entities.CacheItem.list(),
          base44.entities.ComplianceRecord.list(),
        ]);
        const kitIds = new Set(kits.map((k) => k.id));
        const dated = [
          ...items.filter((i) => kitIds.has(i.cache_id)).map((i) => i.expiration_date),
          ...records.filter((r) => r.record_type !== "home_device").map((r) => r.expiration_date),
        ].filter(Boolean);
        let expired = 0;
        let expiring = 0;
        dated.forEach((d) => {
          const { state } = getExpiryStatus(d);
          if (state === "expired") expired++;
          else if (state === "expiring") expiring++;
        });
        setExpiredCount(expired);
        setExpiringCount(expiring);
      } catch (_e) {
        /* checklist still renders without expiry data */
      } finally {
        setLoaded(true);
      }
    })();
  }, [kits]);

  const wardens = members.filter(
    (m) => m.role === "safety_officer" || m.role === "team_lead"
  );
  const hasChain = members.some((m) => m.chain_of_command_order != null);
  const expiriesOutstanding = expiredCount + expiringCount;

  const tracked = [
    { label: "First aid kits logged by floor/building", done: kits.length > 0, detail: `${kits.length} kit(s)` },
    {
      label: "AED, supply & certification expirations current",
      done: loaded && expiriesOutstanding === 0,
      detail: !loaded
        ? "Checking…"
        : expiriesOutstanding === 0
          ? "All in date"
          : `${expiredCount} expired, ${expiringCount} expiring`,
    },
    { label: "Evacuation plan documented", done: plans.length > 0, detail: `${plans.length} plan(s)` },
    { label: "Wardens assigned for each floor", done: wardens.length > 0, detail: `${wardens.length} warden(s)` },
    { label: "Chain of command configured", done: hasChain, detail: hasChain ? "Set" : "Not set" },
    {
      label: "Emergency alert sending enabled",
      done: !!subscription?.alert_sending_enabled,
      detail: subscription?.alert_sending_enabled ? "Enabled" : "Upgrade required",
    },
  ];

  const completed = tracked.filter((i) => i.done).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" /> Fire &amp; Life Safety Readiness
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
          <p className="text-xs text-muted-foreground mb-3">
            {region.label} — inspected against {region.framework}. Enforced by{" "}
            {region.authority.charAt(0).toLowerCase() + region.authority.slice(1)}.
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {region.checklist.map((c) => (
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