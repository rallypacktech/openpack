import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, AlertTriangle, Clock, CalendarClock } from "lucide-react";
import ExpiryStatusBadge from "@/components/business/ExpiryStatusBadge";
import { getExpiryStatus, formatExpiryDate } from "@/lib/expiryStatus";

// What is overdue now, what comes due next, and when the organization was last
// emailed about it. The monthly summary email itself is sent by the existing
// scheduled automation; this panel shows the same picture in-app.
export default function ComplianceRemindersPanel({ records, subscription }) {
  const overdue = [];
  const soon = [];
  const upcoming = [];

  records.forEach((r) => {
    const status = getExpiryStatus(r.expiration_date);
    if (status.state === "expired") overdue.push(r);
    else if (status.state === "expiring") soon.push(r);
    else if (status.days !== null && status.days <= 90) upcoming.push(r);
  });

  const lastSent = subscription?.last_expiry_reminder_at;

  const buckets = [
    { key: "overdue", title: "Overdue", items: overdue, icon: AlertTriangle, tone: "text-red-600", empty: "Nothing overdue." },
    { key: "soon", title: "Due within 30 days", items: soon, icon: Clock, tone: "text-amber-600", empty: "Nothing due in the next 30 days." },
    { key: "upcoming", title: "Due in 31–90 days", items: upcoming, icon: CalendarClock, tone: "text-muted-foreground", empty: "Nothing due in the next three months." },
  ];

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-4 flex items-start gap-3">
          <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">Automatic monthly reminder</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Your organization's owner receives an automatic email summary of everything
              expiring, so nothing lapses between inspections.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {lastSent
                ? `Last summary sent ${formatExpiryDate(lastSent)}.`
                : "No summary has been sent yet — it goes out with the next monthly run."}
            </p>
          </div>
        </CardContent>
      </Card>

      {buckets.map((bucket) => (
        <div key={bucket.key}>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
            <bucket.icon className={`w-4 h-4 ${bucket.tone}`} aria-hidden="true" />
            {bucket.title}
            <span className="text-muted-foreground font-normal">({bucket.items.length})</span>
          </h3>
          {bucket.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{bucket.empty}</p>
          ) : (
            <div className="space-y-2">
              {bucket.items.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground">{record.title}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {record.record_type === "staff_certification"
                          ? record.holder_name || "Unassigned"
                          : record.location || "No location set"}
                      </p>
                    </div>
                    <ExpiryStatusBadge expiration_date={record.expiration_date} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}