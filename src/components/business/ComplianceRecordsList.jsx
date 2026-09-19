import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, GraduationCap, Flame } from "lucide-react";
import ExpiryStatusBadge from "@/components/business/ExpiryStatusBadge";
import LogServiceButton from "@/components/safety/LogServiceButton";
import { sortByExpiry } from "@/lib/expiryStatus";
import { DEVICE_TYPES, defaultInterval, deviceHint } from "@/lib/safetyIntervals";

const CERT_TYPES = [
  { value: "cpr", label: "CPR" },
  { value: "first_aid", label: "First aid" },
  { value: "aed", label: "AED" },
  { value: "cpr_aed", label: "CPR + AED" },
  { value: "first_aid_cpr_aed", label: "First aid + CPR + AED" },
  { value: "fire_safety", label: "Fire safety" },
  { value: "other", label: "Other" },
];

const emptyRecord = {
  record_type: "staff_certification",
  title: "",
  holder_name: "",
  certification_type: "cpr_aed",
  equipment_type: "fire_extinguisher",
  location: "",
  issued_date: "",
  expiration_date: "",
  interval_months: 12,
  notes: "",
};

// Staff certifications and fire/life-safety equipment inspections with expiry dates.
export default function ComplianceRecordsList({ records, subscriptionId, onChanged }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyRecord);

  const openCreate = (type) => {
    setForm({ ...emptyRecord, record_type: type, interval_months: defaultInterval(emptyRecord.equipment_type) });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (rec) => {
    setForm({ ...emptyRecord, ...rec });
    setEditing(rec);
    setShowForm(true);
  };

  const handleSave = async () => {
    const payload = {
      record_type: form.record_type,
      title: form.title,
      holder_name: form.holder_name || "",
      location: form.location || "",
      expiration_date: form.expiration_date,
      notes: form.notes || "",
      subscription_id: subscriptionId || "",
      ...(isCert
        ? { certification_type: form.certification_type }
        : {
            equipment_type: form.equipment_type,
            interval_months: Number(form.interval_months) || defaultInterval(form.equipment_type),
          }),
      ...(form.issued_date ? { issued_date: form.issued_date } : {}),
    };
    if (editing) await base44.entities.ComplianceRecord.update(editing.id, payload);
    else await base44.entities.ComplianceRecord.create(payload);
    setShowForm(false);
    onChanged();
  };

  const handleDelete = async (id) => {
    await base44.entities.ComplianceRecord.delete(id);
    onChanged();
  };

  const sorted = sortByExpiry(records);
  const isCert = form.record_type === "staff_certification";

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-foreground text-sm">Certifications &amp; inspections</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Staff CPR / first aid / AED certifications and fire equipment service dates.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openCreate("fire_equipment")} className="gap-2">
            <Flame className="w-3.5 h-3.5" /> Add inspection
          </Button>
          <Button size="sm" onClick={() => openCreate("staff_certification")} className="gap-2">
            <Plus className="w-3.5 h-3.5" /> Add certification
          </Button>
        </div>
      </div>

      {records.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <GraduationCap className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nothing tracked yet. Add your team's certifications and your fire equipment inspections.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((rec) => (
            <Card key={rec.id}>
              <CardContent className="p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{rec.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {rec.record_type === "staff_certification" ? "Certification" : "Inspection"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {rec.record_type === "staff_certification"
                      ? rec.holder_name || "Unassigned"
                      : rec.location || "No location set"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ExpiryStatusBadge expiration_date={rec.expiration_date} />
                  {rec.record_type !== "staff_certification" && (
                    <LogServiceButton record={rec} onLogged={onChanged} />
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(rec)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(rec.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit record" : isCert ? "Add certification" : "Add inspection"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Type</Label>
              <Select value={form.record_type} onValueChange={(v) => setForm((f) => ({ ...f, record_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff_certification">Staff certification</SelectItem>
                  <SelectItem value="fire_equipment">Fire equipment inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isCert ? (
              <>
                <div>
                  <Label>Staff member</Label>
                  <Input value={form.holder_name} onChange={(e) => setForm((f) => ({ ...f, holder_name: e.target.value }))} placeholder="e.g. Jane Smith" />
                </div>
                <div>
                  <Label>Certification</Label>
                  <Select value={form.certification_type} onValueChange={(v) => setForm((f) => ({ ...f, certification_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CERT_TYPES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Equipment</Label>
                  <Select
                    value={form.equipment_type}
                    onValueChange={(v) => setForm((f) => ({ ...f, equipment_type: v, interval_months: defaultInterval(v) }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DEVICE_TYPES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {deviceHint(form.equipment_type) && (
                    <p className="text-xs text-muted-foreground mt-1.5">{deviceHint(form.equipment_type)}</p>
                  )}
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Building A, Kitchen" />
                </div>
              </>
            )}

            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder={isCert ? "e.g. CPR / AED Certification" : "e.g. Fire extinguisher — Kitchen"} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Issued / last serviced</Label>
                <Input type="date" value={form.issued_date || ""} onChange={(e) => setForm((f) => ({ ...f, issued_date: e.target.value }))} />
              </div>
              <div>
                <Label>Expires / next due *</Label>
                <Input type="date" value={form.expiration_date || ""} onChange={(e) => setForm((f) => ({ ...f, expiration_date: e.target.value }))} />
              </div>
            </div>
            {!isCert && (
              <div>
                <Label>Check every (months)</Label>
                <Input type="number" min="1" value={form.interval_months} onChange={(e) => setForm((f) => ({ ...f, interval_months: e.target.value }))} />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Used when you tap “Log check” — the next due date moves forward this many months.
                </p>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <Button onClick={handleSave} className="flex-1" disabled={!form.title || !form.expiration_date}>
                {editing ? "Save" : "Add"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}