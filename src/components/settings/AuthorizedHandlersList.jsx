import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, ShieldCheck, Mail, Clock, CheckCircle2, PawPrint } from "lucide-react";
import { base44 } from "@/api/base44Client";

const RELATIONSHIP_LABELS = {
  vet: "Veterinarian",
  boarding: "Boarding / Shelter",
  trainer: "Trainer",
  neighbor: "Neighbor",
  family: "Family",
  other: "Other",
};

const STATUS_CONFIG = {
  pending: { label: "Invite Pending", icon: Clock, className: "bg-amber-100 text-amber-800" },
  accepted: { label: "Connected", icon: CheckCircle2, className: "bg-green-100 text-green-800" },
  none: { label: "Registered", icon: CheckCircle2, className: "bg-blue-100 text-blue-800" },
};

export default function AuthorizedHandlersList({ handlers, pets, user, onAdd, onUpdate, onDelete }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHandler, setEditingHandler] = useState(null);
  const [inviteSending, setInviteSending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    relationship_type: "vet",
    pet_scope: "all_pets",
    pet_ids: [],
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      relationship_type: "vet",
      pet_scope: "all_pets",
      pet_ids: [],
    });
    setEditingHandler(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (handler) => {
    setEditingHandler(handler);
    setFormData({
      name: handler.name || "",
      email: handler.email || "",
      relationship_type: handler.relationship_type || "other",
      pet_scope: handler.pet_scope || "all_pets",
      pet_ids: handler.pet_ids || [],
    });
    setDialogOpen(true);
  };

  const togglePet = (petId) => {
    setFormData((prev) => ({
      ...prev,
      pet_ids: prev.pet_ids.includes(petId)
        ? prev.pet_ids.filter((id) => id !== petId)
        : [...prev.pet_ids, petId],
    }));
  };

  const getPetNames = (scope, ids) => {
    if (scope === "all_pets") {
      return pets.map((p) => p.name).join(", ");
    }
    return pets
      .filter((p) => ids?.includes(p.id))
      .map((p) => p.name)
      .join(", ");
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) return;

    const petNames = getPetNames(formData.pet_scope, formData.pet_ids);
    const isNew = !editingHandler;

    const data = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
      invited_at: isNew ? new Date().toISOString() : formData.invited_at,
    };

    setInviteSending(true);
    try {
      if (editingHandler) {
        await onUpdate(editingHandler.id, data);
      } else {
        await onAdd(data);
        // Send invite email + create platform invite for new handlers
        try {
          await base44.users.inviteUser(data.email, "user");
        } catch (e) {
          /* user may already exist — that's fine */
        }
        try {
          await base44.functions.invoke("inviteAuthorizedHandler", {
            handler_name: data.name,
            handler_email: data.email,
            pet_names: petNames || "your animals",
            owner_name: user?.full_name || "",
          });
        } catch (e) {
          /* email failure shouldn't block the save */
          console.error("Invite email failed:", e);
        }
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving handler:", error);
    } finally {
      setInviteSending(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.className} gap-1`} variant="outline">
        <Icon className="w-3 h-3" aria-hidden="true" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" aria-hidden="true" />
              Authorized Animal Handlers
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              People approved to handle or care for your animals at a shelter or during an emergency. We'll invite them by email.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Handler
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingHandler ? "Edit" : "Add"} Authorized Handler</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="handler-name">Name</Label>
                  <Input
                    id="handler-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="handler-email">Email</Label>
                  <Input
                    id="handler-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="their@email.com"
                  />
                  {!editingHandler && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 They'll get an email inviting them to sign up and access your pet's emergency plan.
                    </p>
                  )}
                </div>
                <div>
                  <Label>Relationship / Role</Label>
                  <Select
                    value={formData.relationship_type}
                    onValueChange={(value) => setFormData({ ...formData, relationship_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Authorized For</Label>
                  <Select
                    value={formData.pet_scope}
                    onValueChange={(value) => setFormData({ ...formData, pet_scope: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_pets">All my pets</SelectItem>
                      <SelectItem value="specific">Specific pets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.pet_scope === "specific" && (
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <Label className="text-xs">Select pets</Label>
                    {pets && pets.length > 0 ? (
                      pets.map((pet) => (
                        <div key={pet.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`pet-${pet.id}`}
                            checked={formData.pet_ids.includes(pet.id)}
                            onCheckedChange={() => togglePet(pet.id)}
                          />
                          <Label htmlFor={`pet-${pet.id}`} className="text-sm font-normal cursor-pointer">
                            {pet.name} <span className="text-gray-400 capitalize">({pet.species})</span>
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No pets added yet. Add pets first or choose "All my pets."</p>
                    )}
                  </div>
                )}
                <Button
                  onClick={handleSave}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.name.trim() || !formData.email.trim() || inviteSending}
                >
                  {inviteSending ? "Sending invite..." : editingHandler ? "Update" : "Add"} Handler
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {handlers && handlers.length > 0 ? (
          <div className="space-y-3">
            {handlers.map((handler) => {
              const petNames = getPetNames(handler.pet_scope, handler.pet_ids);
              return (
                <div key={handler.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <PawPrint className="w-5 h-5 text-blue-600" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{handler.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" aria-hidden="true" />
                          {handler.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(handler)} aria-label="Edit handler">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(handler.id)}
                        className="text-red-500 hover:text-red-600"
                        aria-label="Delete handler"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-12">
                    <Badge variant="outline" className="capitalize">
                      {RELATIONSHIP_LABELS[handler.relationship_type] || handler.relationship_type}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      {handler.pet_scope === "all_pets" ? "All pets" : "Specific pets"}
                    </Badge>
                    {getStatusBadge(handler.invite_status)}
                  </div>
                  {handler.pet_scope === "specific" && petNames && (
                    <p className="text-xs text-gray-500 mt-2 ml-12">
                      Authorized for: {petNames}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden="true" />
            <p>No authorized handlers yet</p>
            <p className="text-sm mt-1">Add people approved to care for your animals</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}