import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle2, Loader2, Plus, Trash2, Edit, ShieldCheck } from "lucide-react";
import ExpiryStatusBadge from "@/components/business/ExpiryStatusBadge";
import LogServiceButton from "@/components/safety/LogServiceButton";
import HomeSafetyDeviceForm from "@/components/safety/HomeSafetyDeviceForm";
import { getExpiryStatus, sortByExpiry } from "@/lib/expiryStatus";
import { deviceLabel } from "@/lib/safetyIntervals";

// Household safety devices — smoke and CO alarms, extinguishers — with the next
// check due. A one-tap log moves each device forward on its own cadence.
export default function HomeSafetyPanel() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    const all = await base44.entities.ComplianceRecord.list();
    setDevices(all.filter((r) => r.record_type === "home_device"));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (d) => { setEditing(d); setShowForm(true); };

  const handleDelete = async (id) => {
    await base44.entities.ComplianceRecord.delete(id);
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const counts = devices.reduce(
    (acc, d) => {
      const { state } = getExpiryStatus(d.expiration_date);
      if (state === "expired") acc.expired++;
      else if (state === "expiring") acc.expiring++;
      else acc.ok++;
      return acc;
    },
    { expired: 0, expiring: 0, ok: 0 }
  );

  const stats = [
    { label: "Overdue", value: counts.expired, icon: AlertTriangle, tone: "text-red-600" },
    { label: "Due within 30 days", value: counts.expiring, icon: Clock, tone: "text-amber-600" },
    { label: "Current", value: counts.ok, icon: CheckCircle2, tone: "text-green-600" },
  ];

  const sorted = sortByExpiry(devices);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-serif text-lg font-bold text-foreground">Home safety devices</h2>
          <p className="text-sm text-muted-foreground font-sans mt-0.5">
            Smoke and carbon monoxide alarms, fire extinguishers — with the next check due.
          </p>
        </div>
        <Button size="sm" onClick={openCreate} className="gap-2">
          <Plus className="w-3.5 h-3.5" /> Add device
        </Button>
      </div>

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

      {devices.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <ShieldCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No devices tracked yet. Add your smoke alarms, CO alarms, and extinguishers to get a
              monthly reminder when a check comes due.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{d.title}</span>
                    <Badge variant="outline" className="text-xs">{deviceLabel(d.equipment_type)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {d.location || "No location set"}
                    {d.interval_months ? ` · every ${d.interval_months} month${d.interval_months === 1 ? "" : "s"}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <ExpiryStatusBadge expiration_date={d.expiration_date} />
                  <LogServiceButton record={d} onLogged={load} />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(d)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(d.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <HomeSafetyDeviceForm
        open={showForm}
        onOpenChange={setShowForm}
        editing={editing}
        onSaved={load}
      />
    </div>
  );
}