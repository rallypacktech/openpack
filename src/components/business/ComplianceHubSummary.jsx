import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle2, Paperclip } from "lucide-react";
import { getExpiryStatus } from "@/lib/expiryStatus";

// At-a-glance inspection posture for the organization's workplace records.
export default function ComplianceHubSummary({ records }) {
  const counts = records.reduce(
    (acc, r) => {
      const { state } = getExpiryStatus(r.expiration_date);
      if (state === "expired") acc.expired++;
      else if (state === "expiring") acc.expiring++;
      else acc.current++;
      if (r.document_uri) acc.documented++;
      return acc;
    },
    { expired: 0, expiring: 0, current: 0, documented: 0 }
  );

  const stats = [
    { label: "Overdue", value: counts.expired, icon: AlertTriangle, tone: "text-red-600" },
    { label: "Due within 30 days", value: counts.expiring, icon: Clock, tone: "text-amber-600" },
    { label: "Current", value: counts.current, icon: CheckCircle2, tone: "text-green-600" },
    { label: "Documents on file", value: counts.documented, icon: Paperclip, tone: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <s.icon className={`w-7 h-7 shrink-0 ${s.tone}`} aria-hidden="true" />
            <div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}