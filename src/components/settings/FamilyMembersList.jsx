import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, AlertTriangle, Phone } from "lucide-react";

export default function FamilyMembersList({ members, onAdd, onUpdate, onDelete }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    relationship: "child",
    age: "",
    medical_conditions: "",
    emergency_contact: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      relationship: "child",
      age: "",
      medical_conditions: "",
      emergency_contact: ""
    });
    setEditingMember(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || "",
      relationship: member.relationship || "child",
      age: member.age?.toString() || "",
      medical_conditions: member.medical_conditions || "",
      emergency_contact: member.emergency_contact || ""
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const data = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : null
    };
    
    if (editingMember) {
      await onUpdate(editingMember.id, data);
    } else {
      await onAdd(data);
    }
    setDialogOpen(false);
    resetForm();
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Family Members</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Add emergency contacts with their email to invite them. They'll see your meet spots & caches.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Family Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMember ? "Edit" : "Add"} Family Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <Label>Medical Conditions</Label>
                  <Input
                    value={formData.medical_conditions}
                    onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                    placeholder="e.g., asthma, diabetes"
                  />
                </div>
                <div>
                  <Label>Emergency Contact (Email)</Label>
                  <Input
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    placeholder="their@email.com (they'll get access to your resources)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 If they use this email to sign up, they'll automatically see your meet spots and caches
                  </p>
                </div>
                <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
                  {editingMember ? "Update" : "Add"} Member
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {members && members.length > 0 ? (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{member.relationship}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(member.id)} className="text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Age</p>
                    <p className="font-medium">{member.age || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Medical Conditions</p>
                    <p className="font-medium">{member.medical_conditions || "none"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Emergency Contact</p>
                    <p className="font-medium text-blue-600 flex items-center gap-1">
                      {member.emergency_contact ? (
                        <>
                          <Phone className="w-3 h-3" />
                          {member.emergency_contact}
                        </>
                      ) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No family members added yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}