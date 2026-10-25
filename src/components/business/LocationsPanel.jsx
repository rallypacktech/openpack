import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MapPin, Trash2, Edit, Building2 } from "lucide-react";

const BLANK = {
  name: "",
  manager_name: "",
  location_manager_email: "",
  phone: "",
  street_address: "",
  city: "",
  state_province: "",
  postal_code: "",
  country: "",
  notes: "",
  status: "active",
};

// One shared organization profile, many independently managed locations. Each
// location keeps its own manager, plan, supplies and records; the organization
// name, public contact details and Needs Board identity stay shared.
export default function LocationsPanel({ subscription, locations, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);

  const openCreate = () => {
    setForm({ ...BLANK, subscription_id: subscription?.id || "", country: subscription?.country || "" });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (loc) => {
    setForm(loc);
    setEditing(loc);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (editing) {
      await base44.entities.OrganizationLocation.update(editing.id, form);
    } else {
      await base44.entities.OrganizationLocation.create(form);
    }
    setShowForm(false);
    onRefresh();
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this location? Its records stay in the organization.")) return;
    await base44.entities.OrganizationLocation.delete(id);
    onRefresh();
  };

  const addressLine = (loc) =>
    [loc.street_address, loc.city, loc.state_province, loc.postal_code].filter(Boolean).join(", ");

  return (
    <div>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Locations
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-lg">
            Add each site your organization operates. Every location manages its own plan, kits and
            records, while public messaging and the Needs Board stay under one shared organization
            profile: {subscription?.organization_name || "your organization"}.
          </p>
        </div>
        <Button size="sm" onClick={openCreate} className="gap-2">
          <Plus className="w-3.5 h-3.5" /> Add Location
        </Button>
      </div>

      {locations.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              No locations yet. Add one for each site so plans, kits and records stay separate.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {locations.map((loc) => (
            <Card key={loc.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-sm text-foreground">{loc.name}</h3>
                      {loc.status === "inactive" && (
                        <Badge variant="outline" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    {(loc.manager_name || loc.location_manager_email) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Managed by {loc.manager_name || loc.location_manager_email}
                      </p>
                    )}
                    {addressLine(loc) && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" /> {addressLine(loc)}
                      </p>
                    )}
                    {loc.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{loc.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(loc)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(loc.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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
            <DialogTitle>{editing ? "Edit Location" : "Add Location"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Location Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. North Branch"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Manager Name</Label>
                <Input
                  value={form.manager_name}
                  onChange={(e) => setForm((f) => ({ ...f, manager_name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Manager Business Email</Label>
                <Input
                  type="email"
                  value={form.location_manager_email}
                  onChange={(e) => setForm((f) => ({ ...f, location_manager_email: e.target.value }))}
                  placeholder="manager@company.com"
                />
              </div>
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label>Street Address</Label>
              <Input
                value={form.street_address}
                onChange={(e) => setForm((f) => ({ ...f, street_address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div>
                <Label>State / Province</Label>
                <Input
                  value={form.state_province}
                  onChange={(e) => setForm((f) => ({ ...f, state_province: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Postal Code</Label>
                <Input
                  value={form.postal_code}
                  onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  placeholder="US"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button onClick={handleSave} className="flex-1" disabled={!form.name}>
                {editing ? "Save" : "Add Location"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}