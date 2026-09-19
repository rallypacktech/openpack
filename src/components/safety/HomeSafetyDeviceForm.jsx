import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEVICE_TYPES, deviceHint, defaultInterval, addMonthsIso, todayIso } from "@/lib/safetyIntervals";

const emptyDevice = {
  title: "",
  equipment_type: "smoke_alarm",
  location: "",
  issued_date: "",
  expiration_date: "",
  interval_months: 12,
  notes: "",
};

// Add / edit a household safety device (smoke alarm, CO alarm, extinguisher…).
export default function HomeSafetyDeviceForm({ open, onOpenChange, editing, onSaved }) {
  const [form, setForm] = useState(emptyDevice);

  useEffect(() => {
    if (!open) return;
    setForm(editing ? { ...emptyDevice, ...editing } : {
      ...emptyDevice,
      expiration_date: addMonthsIso(todayIso(), defaultInterval(emptyDevice.equipment_type)),
    });
  }, [open, editing]);

  const handleDeviceChange = (value) => {
    setForm((f) => ({
      ...f,
      equipment_type: value,
      interval_months: defaultInterval(value),
      // Keep a sensible next-due date unless the user already picked one.
      expiration_date: f.expiration_date || addMonthsIso(todayIso(), defaultInterval(value)),
    }));
  };

  const handleSave = async () => {
    const payload = {
      record_type: "home_device",
      title: form.title || DEVICE_TYPES.find((d) => d.value === form.equipment_type)?.label || "Device",
      equipment_type: form.equipment_type,
      location: form.location || "",
      expiration_date: form.expiration_date,
      interval_months: Number(form.interval_months) || defaultInterval(form.equipment_type),
      notes: form.notes || "",
      ...(form.issued_date ? { issued_date: form.issued_date } : {}),
    };
    if (editing) await base44.entities.ComplianceRecord.update(editing.id, payload);
    else await base44.entities.ComplianceRecord.create(payload);
    onOpenChange(false);
    onSaved();
  };

  const hint = deviceHint(form.equipment_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit device" : "Add a safety device"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label>Device</Label>
            <Select value={form.equipment_type} onValueChange={handleDeviceChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEVICE_TYPES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hint && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
          </div>

          <div>
            <Label>Name</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Smoke alarm — Hallway"
            />
          </div>

          <div>
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Upstairs hallway"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Last checked</Label>
              <Input
                type="date"
                value={form.issued_date || ""}
                onChange={(e) => setForm((f) => ({ ...f, issued_date: e.target.value }))}
              />
            </div>
            <div>
              <Label>Next due *</Label>
              <Input
                type="date"
                value={form.expiration_date || ""}
                onChange={(e) => setForm((f) => ({ ...f, expiration_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Check every (months)</Label>
            <Input
              type="number"
              min="1"
              value={form.interval_months}
              onChange={(e) => setForm((f) => ({ ...f, interval_months: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Used when you tap “Log check” — the next due date moves forward this many months.
            </p>
          </div>

          <div>
            <Label>Notes</Label>
            <Input
              value={form.notes || ""}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Optional"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button onClick={handleSave} className="flex-1" disabled={!form.expiration_date}>
              {editing ? "Save" : "Add device"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}