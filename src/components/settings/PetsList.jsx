import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, PawPrint } from "lucide-react";

export default function PetsList({ pets, onAdd, onUpdate, onDelete }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    breed: "",
    age: "",
    microchip_number: "",
    medical_conditions: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      species: "dog",
      breed: "",
      age: "",
      microchip_number: "",
      medical_conditions: ""
    });
    setEditingPet(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name || "",
      species: pet.species || "dog",
      breed: pet.breed || "",
      age: pet.age?.toString() || "",
      microchip_number: pet.microchip_number || "",
      medical_conditions: pet.medical_conditions || ""
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const data = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : null
    };
    
    if (editingPet) {
      await onUpdate(editingPet.id, data);
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
          <CardTitle className="text-xl font-semibold">Pets</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Pet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPet ? "Edit" : "Add"} Pet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Pet name"
                  />
                </div>
                <div>
                  <Label>Species</Label>
                  <Select
                    value={formData.species}
                    onValueChange={(value) => setFormData({ ...formData, species: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="bird">Bird</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Breed</Label>
                  <Input
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="e.g., Labrador, Siamese"
                  />
                </div>
                <div>
                  <Label>Age (years)</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Microchip Number</Label>
                  <Input
                    value={formData.microchip_number}
                    onChange={(e) => setFormData({ ...formData, microchip_number: e.target.value })}
                    placeholder="MC123456789"
                  />
                </div>
                <div>
                  <Label>Medical Conditions</Label>
                  <Input
                    value={formData.medical_conditions}
                    onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                    placeholder="Any health issues"
                  />
                </div>
                <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
                  {editingPet ? "Update" : "Add"} Pet
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {pets && pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pets.map((pet) => (
              <div key={pet.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <PawPrint className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{pet.species} - {pet.breed || "Unknown breed"}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(pet)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(pet.id)} className="text-red-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Age</span>
                        <span>{pet.age} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Microchip</span>
                        <span className="font-mono text-xs">{pet.microchip_number || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Medical Conditions</span>
                        <span>{pet.medical_conditions || "None"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <PawPrint className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No pets added yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}