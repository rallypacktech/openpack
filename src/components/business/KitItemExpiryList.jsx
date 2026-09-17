import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Package, HeartPulse } from "lucide-react";
import ExpiryStatusBadge from "@/components/business/ExpiryStatusBadge";
import { sortByExpiry } from "@/lib/expiryStatus";

const CATEGORIES = [
  { value: "medical", label: "Medical" },
  { value: "safety_equipment", label: "Safety equipment (AED, etc.)" },
  { value: "tools", label: "Tools" },
  { value: "documents", label: "Documents" },
  { value: "other", label: "Other" },
];

const emptyItem = { item_name: "", category: "medical", quantity: 1, expiration_date: "", notes: "", cache_id: "" };

// Kit items (including AED units, batteries, and pads) with their expiry dates.
export default function KitItemExpiryList({ kits, items, onChanged }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyItem);
  const [showAed, setShowAed] = useState(false);
  const [aedForm, setAedForm] = useState({ cache_id: "", installed: new Date().toISOString().slice(0, 10) });

  const kitName = (id) => kits.find((k) => k.id === id)?.name || "Kit";

  const openCreate = () => {
    setForm({ ...emptyItem, cache_id: kits[0]?.id || "" });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({ ...item });
    setEditing(item);
    setShowForm(true);
  };

  const handleSave = async () => {
    const payload = {
      cache_id: form.cache_id,
      item_name: form.item_name,
      category: form.category,
      quantity: Number(form.quantity) || 1,
      ...(form.expiration_date ? { expiration_date: form.expiration_date } : {}),
      notes: form.notes || "",
    };
    if (editing) await base44.entities.CacheItem.update(editing.id, payload);
    else await base44.entities.CacheItem.create(payload);
    setShowForm(false);
    onChanged();
  };

  const handleDelete = async (id) => {
    await base44.entities.CacheItem.delete(id);
    onChanged();
  };

  const handleAddAedSet = async () => {
    const install = new Date(aedForm.installed || Date.now());
    const plusYears = (y) => {
      const d = new Date(install);
      d.setFullYear(d.getFullYear() + y);
      return d.toISOString().slice(0, 10);
    };
    await base44.entities.CacheItem.bulkCreate([
      { cache_id: aedForm.cache_id, item_name: "AED unit", category: "safety_equipment", quantity: 1, expiration_date: plusYears(5), notes: "Manufacturer service life — check the unit label" },
      { cache_id: aedForm.cache_id, item_name: "AED replacement battery", category: "safety_equipment", quantity: 1, expiration_date: plusYears(2), notes: "Replace before the printed battery date" },
      { cache_id: aedForm.cache_id, item_name: "AED replacement pads", category: "safety_equipment", quantity: 2, expiration_date: plusYears(2), notes: "Pads expire — check the sealed pouch date" },
    ]);
    setShowAed(false);
    onChanged();
  };

  const sorted = sortByExpiry(items);

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-foreground text-sm">Kit items &amp; equipment</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Supplies, AED units, batteries, and pads tracked inside your kits.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setAedForm({ cache_id: kits[0]?.id || "", installed: new Date().toISOString().slice(0, 10) }); setShowAed(true); }} disabled={kits.length === 0} className="gap-2">
            <HeartPulse className="w-3.5 h-3.5" /> Add AED set
          </Button>
          <Button size="sm" onClick={openCreate} disabled={kits.length === 0} className="gap-2">
            <Plus className="w-3.5 h-3.5" /> Add item
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <Package className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {kits.length === 0 ? "Add a first aid kit first, then log its items." : "No items logged yet. Add the supplies and AEDs your kits hold."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{item.item_name}</span>
                    {item.category === "safety_equipment" && (
                      <Badge variant="outline" className="text-xs">AED / safety</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {kitName(item.cache_id)}{item.quantity ? ` · qty ${item.quantity}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ExpiryStatusBadge expiration_date={item.expiration_date} />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / edit item */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit item" : "Add kit item"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Kit</Label>
              <Select value={form.cache_id} onValueChange={(v) => setForm((f) => ({ ...f, cache_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a kit" /></SelectTrigger>
                <SelectContent>
                  {kits.map((k) => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Item name *</Label>
              <Input value={form.item_name} onChange={(e) => setForm((f) => ({ ...f, item_name: e.target.value }))} placeholder="e.g. AED replacement battery" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quantity</Label>
                <Input type="number" min="1" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
              </div>
              <div>
                <Label>Expiration date</Label>
                <Input type="date" value={form.expiration_date || ""} onChange={(e) => setForm((f) => ({ ...f, expiration_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={form.notes || ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional" />
            </div>
            <div className="flex gap-3 pt-1">
              <Button onClick={handleSave} className="flex-1" disabled={!form.item_name || !form.cache_id}>
                {editing ? "Save" : "Add item"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add AED set */}
      <Dialog open={showAed} onOpenChange={setShowAed}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add an AED set</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              Adds the AED unit, replacement battery, and replacement pads with typical expiry dates — adjust them to match your equipment labels.
            </p>
            <div>
              <Label>Kit</Label>
              <Select value={aedForm.cache_id} onValueChange={(v) => setAedForm((f) => ({ ...f, cache_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a kit" /></SelectTrigger>
                <SelectContent>
                  {kits.map((k) => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Installed / in-service date</Label>
              <Input type="date" value={aedForm.installed} onChange={(e) => setAedForm((f) => ({ ...f, installed: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-1">
              <Button onClick={handleAddAedSet} className="flex-1" disabled={!aedForm.cache_id}>Add AED set</Button>
              <Button variant="outline" onClick={() => setShowAed(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}