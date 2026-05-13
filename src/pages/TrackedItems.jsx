import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, MapPin, Tag, DollarSign, Edit, Trash2, Shield, Radio } from "lucide-react";

const ITEM_TYPES = [
  { value: "pet_collar", label: "Pet Collar" },
  { value: "pet_microchip", label: "Pet Microchip" },
  { value: "valuable_asset", label: "Valuable Asset" },
  { value: "vehicle", label: "Vehicle" },
  { value: "equipment", label: "Equipment" },
  { value: "luggage", label: "Luggage" },
  { value: "other", label: "Other" },
];

const DEVICES = [
  { value: "airtag", label: "Apple AirTag" },
  { value: "tile", label: "Tile" },
  { value: "microchip", label: "Microchip" },
  { value: "gps_collar", label: "GPS Collar" },
  { value: "other", label: "Other" },
];

const BLANK = {
  item_name: "", item_type: "valuable_asset", description: "", tracking_id: "",
  tracking_device: "airtag", associated_entity_type: "none", associated_entity_id: "",
  last_known_address: "", purchase_date: "", purchase_value: "",
  insurance_policy_number: "", serial_number: "", active: true,
};

export default function TrackedItems() {
  const [items, setItems] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [itemsData, petsData] = await Promise.all([
      base44.entities.TrackedItem.list("-created_date"),
      base44.entities.Pet.list(),
    ]);
    setItems(itemsData);
    setPets(petsData);
    setLoading(false);
  };

  const openCreate = () => { setForm(BLANK); setEditing(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item, purchase_value: item.purchase_value || "" }); setEditing(item); setShowForm(true); };

  const handleSave = async () => {
    const data = { ...form, purchase_value: form.purchase_value ? Number(form.purchase_value) : undefined };
    if (editing) {
      await base44.entities.TrackedItem.update(editing.id, data);
    } else {
      await base44.entities.TrackedItem.create(data);
    }
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id) => {
    await base44.entities.TrackedItem.delete(id);
    loadData();
  };

  const typeLabel = (val) => ITEM_TYPES.find(t => t.value === val)?.label || val;
  const deviceLabel = (val) => DEVICES.find(d => d.value === val)?.label || val;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Tracked Items</h1>
          <p className="text-sm text-muted-foreground mt-1">AirTags, microchips & assets for insurance claims</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Radio className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No tracked items yet. Add your first AirTag or microchip.</p>
            <Button onClick={openCreate} className="mt-4 gap-2"><Plus className="w-4 h-4" /> Add Item</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map(item => (
            <Card key={item.id} className={!item.active ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{item.item_name}</h3>
                      <Badge variant="outline">{typeLabel(item.item_type)}</Badge>
                      {item.tracking_device && <Badge variant="secondary">{deviceLabel(item.tracking_device)}</Badge>}
                      {!item.active && <Badge variant="destructive">Inactive</Badge>}
                    </div>

                    {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm">
                      {item.tracking_id && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Tag className="w-3.5 h-3.5" /> ID: <span className="font-mono text-foreground">{item.tracking_id}</span>
                        </div>
                      )}
                      {item.last_known_address && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" /> {item.last_known_address}
                        </div>
                      )}
                      {item.purchase_value && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="w-3.5 h-3.5" /> ${Number(item.purchase_value).toLocaleString()} value
                        </div>
                      )}
                      {item.insurance_policy_number && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Shield className="w-3.5 h-3.5" /> Policy: {item.insurance_policy_number}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Tracked Item" : "Add Tracked Item"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Item Name *</Label>
              <Input value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} placeholder="e.g. Max's Collar, MacBook Pro" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Item Type *</Label>
                <Select value={form.item_type} onValueChange={v => setForm(f => ({ ...f, item_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ITEM_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tracking Device</Label>
                <Select value={form.tracking_device} onValueChange={v => setForm(f => ({ ...f, tracking_device: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DEVICES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Tracking ID / Microchip Number</Label>
              <Input value={form.tracking_id} onChange={e => setForm(f => ({ ...f, tracking_id: e.target.value }))} placeholder="Serial or chip number" />
            </div>

            <div>
              <Label>Associated Pet</Label>
              <Select value={form.associated_entity_id || "none"} onValueChange={v => setForm(f => ({ ...f, associated_entity_id: v === "none" ? "" : v, associated_entity_type: v === "none" ? "none" : "pet" }))}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {pets.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.species})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>

            <div>
              <Label>Last Known Location</Label>
              <Input value={form.last_known_address} onChange={e => setForm(f => ({ ...f, last_known_address: e.target.value }))} placeholder="Address or description" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Purchase Date</Label>
                <Input type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} />
              </div>
              <div>
                <Label>Purchase Value ($)</Label>
                <Input type="number" value={form.purchase_value} onChange={e => setForm(f => ({ ...f, purchase_value: e.target.value }))} placeholder="0.00" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Insurance Policy #</Label>
                <Input value={form.insurance_policy_number} onChange={e => setForm(f => ({ ...f, insurance_policy_number: e.target.value }))} />
              </div>
              <div>
                <Label>Serial Number</Label>
                <Input value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} className="flex-1" disabled={!form.item_name}>
                {editing ? "Save Changes" : "Add Item"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}