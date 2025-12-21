import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Save, X } from "lucide-react";
import AddressAutocomplete from "./AddressAutocomplete";

export default function ProfileForm({ user, profile, onSave }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    street_address: profile?.street_address || "",
    city: profile?.city || "",
    state_province: profile?.state_province || "",
    postal_code: profile?.postal_code || "",
    country: profile?.country || "",
    latitude: profile?.latitude,
    longitude: profile?.longitude
  });
  const [saving, setSaving] = useState(false);

  const handleAddressSelect = (addressData) => {
    setFormData({
      ...formData,
      ...addressData
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(formData);
    setSaving(false);
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Your Profile</CardTitle>
          {!editing ? (
            <Button variant="default" size="sm" onClick={() => setEditing(true)} className="bg-blue-600 hover:bg-blue-700">
              <Pencil className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label className="text-gray-500 text-sm">Full Name</Label>
            <p className="font-medium mt-1">{user?.full_name || "Not set"}</p>
          </div>
          <div>
            <Label className="text-gray-500 text-sm">Email</Label>
            <p className="font-medium mt-1">{user?.email || "Not set"}</p>
          </div>
          
          {editing ? (
            <>
              <div className="md:col-span-2">
                <AddressAutocomplete 
                  onAddressSelect={handleAddressSelect}
                  initialValue={formData.display_name || [
                    formData.street_address,
                    formData.city,
                    formData.state_province,
                    formData.postal_code,
                    formData.country
                  ].filter(Boolean).join(', ')}
                />
              </div>
              <div>
                <Label htmlFor="street_address" className="text-gray-500 text-sm">Street Address</Label>
                <Input
                  id="street_address"
                  value={formData.street_address}
                  onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="city" className="text-gray-500 text-sm">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state_province" className="text-gray-500 text-sm">Province/State</Label>
                <Input
                  id="state_province"
                  value={formData.state_province}
                  onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="postal_code" className="text-gray-500 text-sm">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="country" className="text-gray-500 text-sm">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="mt-1"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label className="text-gray-500 text-sm">Address</Label>
                <p className="font-medium mt-1">{profile?.street_address || "Not set"}</p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">City</Label>
                <p className="font-medium mt-1">{profile?.city || "Not set"}</p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">Province</Label>
                <p className="font-medium mt-1">{profile?.state_province || "Not set"}</p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">Postal Code</Label>
                <p className="font-medium mt-1">{profile?.postal_code || "Not set"}</p>
              </div>
              <div>
                <Label className="text-gray-500 text-sm">Country</Label>
                <p className="font-medium mt-1">{profile?.country || "Not set"}</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}