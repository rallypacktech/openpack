import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DRILL_TYPES } from "@/lib/drillTypes";

const emptyDrill = {
  title: "",
  organization_name: "",
  drill_type: "fire_evacuation",
  date: "",
  start_time: "",
  end_time: "",
  country_code: "US",
  admin1_name: "",
  city: "",
  postal_code: "",
  venue: "",
  description: "",
  registration_url: "",
  contact_email: "",
  open_to_public: true,
};

// Organizations submit their own drill listings; the same form edits an existing one.
export default function DrillFormDialog({ open, onOpenChange, drill, user, onSaved }) {
  const [form, setForm] = useState(emptyDrill);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // Reload the form whenever the dialog opens for a different drill.
  React.useEffect(() => {
    if (open) {
      setForm(drill ? { ...emptyDrill, ...drill } : emptyDrill);
      setError("");
    }
  }, [open, drill]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        country_code: (form.country_code || "").toUpperCase(),
        submitted_by_email: user?.email || "",
      };
      if (drill?.id) await base44.entities.CommunityDrill.update(drill.id, payload);
      else await base44.entities.CommunityDrill.create(payload);
      onOpenChange(false);
      onSaved();
    } catch (e) {
      setError(e?.message || "Could not save this drill. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{drill?.id ? "Edit drill listing" : "Submit a drill"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <Label>Drill name *</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Great ShakeOut Earthquake Drill" />
          </div>
          <div>
            <Label>Organization running it *</Label>
            <Input value={form.organization_name} onChange={(e) => set("organization_name", e.target.value)} placeholder="e.g. Riverside County Office of Emergency Services" />
          </div>
          <div>
            <Label>Drill type *</Label>
            <Select value={form.drill_type} onValueChange={(v) => set("drill_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DRILL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Label>Date *</Label>
              <Input type="date" value={form.date || ""} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <Label>Start</Label>
              <Input value={form.start_time} onChange={(e) => set("start_time", e.target.value)} placeholder="10:00 AM" />
            </div>
            <div>
              <Label>End</Label>
              <Input value={form.end_time} onChange={(e) => set("end_time", e.target.value)} placeholder="11:30 AM" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Country code</Label>
              <Input value={form.country_code} onChange={(e) => set("country_code", e.target.value)} maxLength={2} placeholder="US" />
            </div>
            <div>
              <Label>State / province</Label>
              <Input value={form.admin1_name} onChange={(e) => set("admin1_name", e.target.value)} placeholder="e.g. California" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Riverside" />
            </div>
            <div>
              <Label>Postal code</Label>
              <Input value={form.postal_code} onChange={(e) => set("postal_code", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Meeting point</Label>
            <Input value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. City Hall forecourt, 3900 Main St" />
          </div>
          <div>
            <Label>What participants will do</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="A short description of the drill and who can take part." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Registration link</Label>
              <Input value={form.registration_url} onChange={(e) => set("registration_url", e.target.value)} placeholder="https://" />
            </div>
            <div>
              <Label>Contact email</Label>
              <Input value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} placeholder="drills@example.org" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground pt-1">
            <input
              type="checkbox"
              checked={!!form.open_to_public}
              onChange={(e) => set("open_to_public", e.target.checked)}
              className="w-4 h-4"
            />
            Open to the public
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button onClick={handleSave} className="flex-1" disabled={saving || !form.title || !form.organization_name || !form.date}>
              {saving ? "Saving…" : drill?.id ? "Save changes" : "Submit drill"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}