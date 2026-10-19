import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FIT_GROUPS } from "@/lib/expoContacts";

const PRIORITIES = ["high", "medium", "low"];
const STATUSES = ["identified", "contacted", "in_conversation", "partnered", "declined"];

export default function ExpoProspectDialog({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    priority: "medium",
    status: "identified",
    partnership_fit: "other",
    ...initial,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit prospect" : "Add prospect"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label htmlFor="org">Organization</Label>
            <Input id="org" value={form.organization_name || ""} onChange={(e) => set("organization_name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cname">Contact name</Label>
              <Input id="cname" value={form.contact_name || ""} onChange={(e) => set("contact_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="crole">Role / title</Label>
              <Input id="crole" value={form.contact_role || ""} onChange={(e) => set("contact_role", e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="cemail">Email (verify before use)</Label>
            <Input id="cemail" type="email" value={form.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Partnership fit</Label>
              <Select value={form.partnership_fit} onValueChange={(v) => set("partnership_fit", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FIT_GROUPS.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="goal">Conversation goal</Label>
            <Textarea id="goal" rows={2} value={form.conversation_goal || ""} onChange={(e) => set("conversation_goal", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="need">RallyPack need</Label>
            <Textarea id="need" rows={2} value={form.rallypack_need || ""} onChange={(e) => set("rallypack_need", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={!form.organization_name}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}