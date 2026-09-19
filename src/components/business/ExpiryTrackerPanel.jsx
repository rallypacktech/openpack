import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle2, Loader2 } from "lucide-react";
import KitItemExpiryList from "@/components/business/KitItemExpiryList";
import ComplianceRecordsList from "@/components/business/ComplianceRecordsList";
import { getExpiryStatus } from "@/lib/expiryStatus";

// Business expiration tracking: kit items (incl. AEDs) plus staff certifications
// and fire equipment inspections, with expired / expiring-soon counts.
export default function ExpiryTrackerPanel({ subscription, kits }) {
  const [items, setItems] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const [allItems, allRecords] = await Promise.all([
      base44.entities.CacheItem.list(),
      base44.entities.ComplianceRecord.list(),
    ]);
    const kitIds = new Set(kits.map((k) => k.id));
    setItems(allItems.filter((i) => kitIds.has(i.cache_id)));
    // Household safety devices live in the same entity but belong to the Home Safety tab.
    setRecords(allRecords.filter((r) => r.record_type !== "home_device"));
    setLoading(false);
  }, [kits]);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const all = [
    ...items.map((i) => ({ date: i.expiration_date })),
    ...records.map((r) => ({ date: r.expiration_date })),
  ].filter((x) => x.date);

  const counts = all.reduce(
    (acc, x) => {
      const { state } = getExpiryStatus(x.date);
      if (state === "expired") acc.expired++;
      else if (state === "expiring") acc.expiring++;
      else acc.ok++;
      return acc;
    },
    { expired: 0, expiring: 0, ok: 0 }
  );

  const stats = [
    { label: "Expired", value: counts.expired, icon: AlertTriangle, tone: "text-red-600" },
    { label: "Expiring within 30 days", value: counts.expiring, icon: Clock, tone: "text-amber-600" },
    { label: "Current", value: counts.ok, icon: CheckCircle2, tone: "text-green-600" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-7 h-7 ${s.tone}`} />
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(counts.expired > 0 || counts.expiring > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <strong>{counts.expired + counts.expiring} item(s) need attention</strong> before your next
            inspection. Your organization also gets a monthly email summary of these.
          </p>
        </div>
      )}

      <KitItemExpiryList kits={kits} items={items} onChanged={loadAll} />
      <ComplianceRecordsList
        records={records}
        subscriptionId={subscription?.id}
        onChanged={loadAll}
      />
    </div>
  );
}