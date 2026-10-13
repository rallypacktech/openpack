import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StructuredAddressInput from "../settings/StructuredAddressInput";

export default function MeetSpotFormDialog({
  open,
  onOpenChange,
  editingSpot,
  formData,
  setFormData,
  onSave,
}) {
  const handleAddressSelect = (addressData) => {
    const fullAddress = [
      addressData.street_address,
      addressData.city,
      addressData.state_province,
      addressData.postal_code,
      addressData.country,
    ]
      .filter(Boolean)
      .join(", ");
    setFormData((prev) => ({
      ...prev,
      address: fullAddress,
      street_address: addressData.street_address || "",
      city: addressData.city || "",
      state_province: addressData.state_province || "",
      postal_code: addressData.postal_code || "",
      country: addressData.country || "",
      latitude: addressData.latitude?.toString() || "",
      longitude: addressData.longitude?.toString() || "",
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingSpot ? "Edit meeting spot" : "Add meeting spot"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Riverside Park"
            />
          </div>

          <div className="space-y-4 p-4 bg-secondary/40 rounded">
            <StructuredAddressInput
              formData={{
                street_address: formData.street_address || "",
                city: formData.city || "",
                state_province: formData.state_province || "",
                postal_code: formData.postal_code || "",
                country: formData.country || "",
              }}
              onFieldChange={(field, value) => {
                setFormData((prev) => ({
                  ...prev,
                  [field]: value,
                  address: [
                    field === "street_address" ? value : prev.street_address,
                    field === "city" ? value : prev.city,
                    field === "state_province" ? value : prev.state_province,
                    field === "postal_code" ? value : prev.postal_code,
                  ]
                    .filter(Boolean)
                    .join(", "),
                }));
              }}
              onAddressSelect={handleAddressSelect}
            />

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
              <div>
                <Label className="text-xs text-muted-foreground">Latitude</Label>
                <Input
                  type="text"
                  value={formData.latitude}
                  disabled
                  className="bg-secondary/60 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Longitude
                </Label>
                <Input
                  type="text"
                  value={formData.longitude}
                  disabled
                  className="bg-secondary/60 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Notes about this location"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Primary location</Label>
            <Switch
              checked={formData.is_primary}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_primary: checked })
              }
            />
          </div>

          <Button
            onClick={onSave}
            disabled={!formData.name}
            className="w-full bg-foreground text-background hover:bg-foreground/90 font-sans"
          >
            {editingSpot ? "Save changes" : "Save meeting spot"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}