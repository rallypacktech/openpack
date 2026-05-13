import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Trash2, Edit, Calendar, MapPinned } from "lucide-react";

const BLANK = { plan_name: "", description: "", assembly_point_name: "", assembly_point_address: "", secondary_assembly_point_name: "", secondary_assembly_point_address: "", evacuation_routes: "", trigger_conditions: "", last_drill_date: "", next_drill_date: "", active: true };

export default function EvacuationPlanPanel({ subscription, plans, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);

  const openCreate = () => { setForm({ ...BLANK, subscription_id: subscription?.id || "" }); setEditing(null); setShowForm(true); };
  const openEdit = (p) => { setForm(p); setEditing(p); setShowForm(true); };

  const handleSave = async () => {
    if (editing) {
      await base44.entities.EvacuationPlan.update(editing.id, form);
    } else {
      await base44.entities.EvacuationPlan.create(form);
    }
    setShowForm(false);
    onRefresh();
  };

  const handleDelete = async (id) => {
    await base44.entities.EvacuationPlan.delete(id);
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Evacuation Plans</h2>
        <Button size="sm" onClick={openCreate} className="gap-2"><Plus className="w-3.5 h-3.5" /> Add Plan</Button>
      </div>

      {plans.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No evacuation plans yet. Create your first plan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {plans.map(plan => (
            <Card key={plan.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{plan.plan_name}</h3>
                      {!plan.active && <Badge variant="destructive">Inactive</Badge>}
                    </div>
                    {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {plan.assembly_point_name && (
                        <div className="flex items-start gap-1">
                          <MapPinned className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                          <div><div className="font-medium">{plan.assembly_point_name}</div><div className="text-muted-foreground text-xs">{plan.assembly_point_address}</div></div>
                        </div>
                      )}
                      {plan.secondary_assembly_point_name && (
                        <div className="flex items-start gap-1">
                          <MapPinned className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                          <div><div className="font-medium text-muted-foreground">Backup: {plan.secondary_assembly_point_name}</div><div className="text-muted-foreground text-xs">{plan.secondary_assembly_point_address}</div></div>
                        </div>
                      )}
                    </div>

                    {plan.trigger_conditions && (
                      <div className="mt-2 text-sm"><span className="text-muted-foreground">Triggers: </span>{plan.trigger_conditions}</div>
                    )}

                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      {plan.last_drill_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Last drill: {plan.last_drill_date}</span>}
                      {plan.next_drill_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Next drill: {plan.next_drill_date}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(plan)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(plan.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Plan" : "Add Evacuation Plan"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Plan Name *</Label><Input value={form.plan_name} onChange={e => setForm(f => ({ ...f, plan_name: e.target.value }))} placeholder="e.g. Fire Evacuation Plan" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Primary Assembly Point</Label><Input value={form.assembly_point_name} onChange={e => setForm(f => ({ ...f, assembly_point_name: e.target.value }))} placeholder="Name" /></div>
              <div><Label>Address</Label><Input value={form.assembly_point_address} onChange={e => setForm(f => ({ ...f, assembly_point_address: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Secondary Assembly Point</Label><Input value={form.secondary_assembly_point_name} onChange={e => setForm(f => ({ ...f, secondary_assembly_point_name: e.target.value }))} placeholder="Name (optional)" /></div>
              <div><Label>Address</Label><Input value={form.secondary_assembly_point_address} onChange={e => setForm(f => ({ ...f, secondary_assembly_point_address: e.target.value }))} /></div>
            </div>
            <div><Label>Evacuation Routes</Label><Textarea value={form.evacuation_routes} onChange={e => setForm(f => ({ ...f, evacuation_routes: e.target.value }))} rows={2} placeholder="Describe primary and alternate routes..." /></div>
            <div><Label>Trigger Conditions</Label><Input value={form.trigger_conditions} onChange={e => setForm(f => ({ ...f, trigger_conditions: e.target.value }))} placeholder="e.g. fire, earthquake, active threat" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Last Drill Date</Label><Input type="date" value={form.last_drill_date} onChange={e => setForm(f => ({ ...f, last_drill_date: e.target.value }))} /></div>
              <div><Label>Next Drill Date</Label><Input type="date" value={form.next_drill_date} onChange={e => setForm(f => ({ ...f, next_drill_date: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button onClick={handleSave} className="flex-1" disabled={!form.plan_name}>{editing ? "Save" : "Add Plan"}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}