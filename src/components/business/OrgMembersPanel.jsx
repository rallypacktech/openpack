import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Send, Users, AlertTriangle } from "lucide-react";

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "safety_officer", label: "Safety Officer" },
  { value: "team_lead", label: "Team Lead" },
  { value: "member", label: "Member" },
];

const BLANK = { full_name: "", email: "", phone: "", role: "member", department: "", chain_of_command_order: 1, notify_on_evacuation: true, notify_on_kit_expiry: false, notification_method: "email" };

export default function OrgMembersPanel({ subscription, members, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [notifying, setNotifying] = useState(false);
  const [alertDialog, setAlertDialog] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertPostalCode, setAlertPostalCode] = useState("");

  const sorted = [...members].sort((a, b) => (a.chain_of_command_order || 99) - (b.chain_of_command_order || 99));

  const openCreate = () => { setForm({ ...BLANK, subscription_id: subscription?.id || "" }); setEditing(null); setShowForm(true); };
  const openEdit = (m) => { setForm(m); setEditing(m); setShowForm(true); };

  const handleSave = async () => {
    if (editing) {
      await base44.entities.OrganizationMember.update(editing.id, form);
    } else {
      await base44.entities.OrganizationMember.create(form);
    }
    setShowForm(false);
    onRefresh();
  };

  const handleDelete = async (id) => {
    await base44.entities.OrganizationMember.delete(id);
    onRefresh();
  };

  const sendIncidentAlert = async () => {
    setNotifying(true);
    const toNotify = sorted.filter(m => m.notify_on_evacuation && m.status !== "inactive");
    const areaNote = alertPostalCode ? `This alert is targeted to the ${alertPostalCode} area and neighboring postal codes.` : "";
    for (const member of toNotify) {
      await base44.integrations.Core.SendEmail({
        to: member.email,
        subject: `⚠️ INCIDENT ALERT — ${subscription?.organization_name || "Your Organization"}`,
        body: `Dear ${member.full_name || member.email},\n\nThis is an incident alert from ${subscription?.organization_name || "your organization"}.\n\n${alertMessage || "Please be aware of an active incident in your area. Follow all instructions from local emergency services."}\n\n${areaNote}\n\nStay safe and monitor official channels for updates.\n\n— ${subscription?.organization_name || "Emergency Response Team"}`,
      });
    }
    setNotifying(false);
    setAlertDialog(false);
    setAlertMessage("");
    setAlertPostalCode("");
    alert(`Incident alert sent to ${toNotify.length} member(s).`);
  };

  const roleColor = { owner: "bg-red-100 text-red-800", safety_officer: "bg-orange-100 text-orange-800", team_lead: "bg-blue-100 text-blue-800", member: "bg-gray-100 text-gray-700" };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Team Members</h2>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={() => setAlertDialog(true)} className="gap-2">
            <AlertTriangle className="w-3.5 h-3.5" /> Send Incident Alert
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-2"><Plus className="w-3.5 h-3.5" /> Add Member</Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No members yet. Add team members to send incident alerts.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((m, idx) => (
            <Card key={m.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  {m.chain_of_command_order || idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{m.full_name || m.email}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[m.role] || ""}`}>{ROLES.find(r => r.value === m.role)?.label}</span>
                    {m.department && <span className="text-xs text-muted-foreground">{m.department}</span>}
                    {m.status === "pending_invite" && <Badge variant="outline" className="text-xs">Pending</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span>{m.email}</span>
                    {m.phone && <span>{m.phone}</span>}
                    <span>Alerts: {m.notify_on_evacuation ? "✓ Incident" : "—"} {m.notify_on_kit_expiry ? "✓ Kit Expiry" : ""}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(m)}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(m.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Member" : "Add Member"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Full Name</Label><Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} /></div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Role</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Notification Order</Label><Input type="number" min="1" value={form.chain_of_command_order} onChange={e => setForm(f => ({ ...f, chain_of_command_order: Number(e.target.value) }))} /></div>
            </div>
            <div>
              <Label>Notification Method</Label>
              <Select value={form.notification_method} onValueChange={v => setForm(f => ({ ...f, notification_method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="in_app">In-App</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.notify_on_evacuation} onChange={e => setForm(f => ({ ...f, notify_on_evacuation: e.target.checked }))} />
                Notify on Incident Alerts
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.notify_on_kit_expiry} onChange={e => setForm(f => ({ ...f, notify_on_kit_expiry: e.target.checked }))} />
                Notify on Kit Expiry
              </label>
            </div>
            <div className="flex gap-3 pt-1">
              <Button onClick={handleSave} className="flex-1" disabled={!form.email}>{editing ? "Save" : "Add Member"}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Incident Alert Dialog */}
      <Dialog open={alertDialog} onOpenChange={setAlertDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" /> Send Incident Alert</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will email all active members opted in to incident alerts.</p>
          <div className="space-y-3 py-2">
            <div>
              <Label>Postal Code (optional)</Label>
              <Input
                placeholder="e.g. 78701"
                value={alertPostalCode}
                onChange={e => setAlertPostalCode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Alert will note it covers this ZIP and neighboring codes.</p>
            </div>
            <div>
              <Label>Incident Message</Label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm mt-1 min-h-[100px] resize-none"
                placeholder="Describe the incident or leave blank for a generic safety alert..."
                value={alertMessage}
                onChange={e => setAlertMessage(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="destructive" onClick={sendIncidentAlert} disabled={notifying} className="flex-1 gap-2">
                <Send className="w-3.5 h-3.5" />{notifying ? "Sending..." : "Send Alert"}
              </Button>
              <Button variant="outline" onClick={() => setAlertDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}