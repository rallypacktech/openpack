import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Shield, AlertTriangle, CheckCircle2, Package, Trash2, Edit } from "lucide-react";

export default function BusinessKitsPanel({ subscription, kits, onRefresh }) {
  const [kitItems, setKitItems] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", location: "", cache_type: "general", description: "", organization_id: "" });
  const maxKits = subscription?.max_first_aid_kits || 5;

  useEffect(() => {
    loadItems();
  }, [kits]);

  const loadItems = async () => {
    const allItems = await base44.entities.FirstAidItem.list();
    const byKit = {};
    allItems.forEach(item => {
      // Group items that might be associated with a cache via name matching
    });
    setKitItems(byKit);
  };

  const openCreate = () => {
    if (kits.length >= maxKits) { alert(`Your plan allows up to ${maxKits} kits. Upgrade to add more.`); return; }
    setForm({ name: "", location: "", cache_type: "general", description: "" });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (k) => { setForm(k); setEditing(k); setShowForm(true); };

  const handleSave = async () => {
    if (editing) {
      await base44.entities.EmergencyCache.update(editing.id, form);
    } else {
      await base44.entities.EmergencyCache.create(form);
    }
    setShowForm(false);
    onRefresh();
  };

  const handleDelete = async (id) => {
    await base44.entities.EmergencyCache.delete(id);
    onRefresh();
  };

  const usagePercent = Math.round((kits.length / maxKits) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-foreground">First Aid Kits</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{kits.length} of {maxKits} kits used</p>
        </div>
        <Button size="sm" onClick={openCreate} className="gap-2" disabled={kits.length >= maxKits}><Plus className="w-3.5 h-3.5" /> Add Kit</Button>
      </div>

      {/* Usage bar */}
      <div className="mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
        </div>
      </div>

      {kits.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No kits tracked yet. Add your first aid kits.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {kits.map(kit => (
            <Card key={kit.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      <h3 className="font-medium text-sm">{kit.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{kit.location}</p>
                    <Badge variant="outline" className="text-xs mt-2 capitalize">{kit.cache_type?.replace("_", " ")}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(kit)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(kit.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Kit" : "Add First Aid Kit"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Kit Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Reception Area Kit" /></div>
            <div><Label>Location *</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Building A, Floor 2" /></div>
            <div>
              <Label>Kit Type</Label>
              <Select value={form.cache_type} onValueChange={v => setForm(f => ({ ...f, cache_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="go_bag">Go Bag</SelectItem>
                  <SelectItem value="automobile">Vehicle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Notes</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional notes" /></div>
            <div className="flex gap-3 pt-1">
              <Button onClick={handleSave} className="flex-1" disabled={!form.name || !form.location}>{editing ? "Save" : "Add Kit"}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}