import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, Users, Info, PawPrint } from "lucide-react";

export default function FamilyMemberForm({ onComplete, onSkip }) {
  const [members, setMembers] = useState([]);
  const [pets, setPets] = useState([]);
  const [currentMember, setCurrentMember] = useState({
    name: "",
    relationship: "spouse",
    age: "",
    medical_conditions: "",
    emergency_contact: ""
  });
  const [currentPet, setCurrentPet] = useState({
    name: "",
    species: "dog",
    breed: "",
    age: "",
    medical_conditions: "",
    microchip_number: ""
  });
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState(""); // "member" or "pet"

  const handleAddMember = () => {
    if (currentMember.name) {
      setMembers([...members, currentMember]);
      setCurrentMember({
        name: "",
        relationship: "spouse",
        age: "",
        medical_conditions: "",
        emergency_contact: ""
      });
      setShowForm(false);
    }
  };

  const handleRemoveMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleAddPet = () => {
    if (currentPet.name) {
      setPets([...pets, currentPet]);
      setCurrentPet({
        name: "",
        species: "dog",
        breed: "",
        age: "",
        medical_conditions: "",
        microchip_number: ""
      });
      setShowForm(false);
      setFormType("");
    }
  };

  const handleRemovePet = (index) => {
    setPets(pets.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    onComplete({ members, pets });
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">What happens when you add family members:</p>
            <ul className="space-y-1">
              <li>✓ <strong>If you provide an email:</strong> They'll receive an invitation to join RallyPack and can see your emergency caches, meet spots, and coordinate with you during disasters</li>
              <li>✓ <strong>Without an email:</strong> Their info is stored for your reference and used for personalized recommendations</li>
              <li>✓ All family members can access shared emergency plans and communicate through the app</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Added Members List */}
      {members.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Added Family Members ({members.length})</h3>
          {members.map((member, index) => (
            <Card key={index} className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-700" />
                      <span className="font-semibold text-gray-900">{member.name}</span>
                      <span className="text-sm text-gray-600">({member.relationship})</span>
                    </div>
                    {member.age && (
                      <p className="text-sm text-gray-600 mt-1">Age: {member.age}</p>
                    )}
                    {member.emergency_contact && (
                      <p className="text-sm text-gray-600">Contact: {member.emergency_contact}</p>
                    )}
                    {member.medical_conditions && (
                      <p className="text-sm text-gray-600">Medical: {member.medical_conditions}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Added Pets List */}
      {pets.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Added Pets ({pets.length})</h3>
          {pets.map((pet, index) => (
            <Card key={index} className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <PawPrint className="w-4 h-4 text-blue-700" />
                      <span className="font-semibold text-gray-900">{pet.name}</span>
                      <span className="text-sm text-gray-600">({pet.species})</span>
                    </div>
                    {pet.breed && (
                      <p className="text-sm text-gray-600 mt-1">Breed: {pet.breed}</p>
                    )}
                    {pet.age && (
                      <p className="text-sm text-gray-600">Age: {pet.age}</p>
                    )}
                    {pet.microchip_number && (
                      <p className="text-sm text-gray-600">Microchip: {pet.microchip_number}</p>
                    )}
                    {pet.medical_conditions && (
                      <p className="text-sm text-gray-600">Medical: {pet.medical_conditions}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePet(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Member/Pet Buttons / Form */}
      {!showForm ? (
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => {
              setShowForm(true);
              setFormType("member");
            }}
            variant="outline"
            className="border-2 border-dashed border-gray-300 hover:border-purple-500 py-8"
          >
            <Users className="w-5 h-5 mr-2" />
            Add Family Member
          </Button>
          <Button
            onClick={() => {
              setShowForm(true);
              setFormType("pet");
            }}
            variant="outline"
            className="border-2 border-dashed border-gray-300 hover:border-blue-500 py-8"
          >
            <PawPrint className="w-5 h-5 mr-2" />
            Add Pet
          </Button>
        </div>
      ) : formType === "member" ? (
        <Card className="border-2 border-purple-500">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Add Family Member</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={currentMember.name}
                  onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                  placeholder="e.g., Sarah Smith"
                />
              </div>

              <div>
                <Label htmlFor="relationship">Relationship *</Label>
                <Select
                  value={currentMember.relationship}
                  onValueChange={(value) => setCurrentMember({ ...currentMember, relationship: value })}
                >
                  <SelectTrigger id="relationship">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse / Partner</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="age">Age (optional)</Label>
                <Input
                  id="age"
                  type="number"
                  value={currentMember.age}
                  onChange={(e) => setCurrentMember({ ...currentMember, age: e.target.value })}
                  placeholder="e.g., 42"
                />
              </div>

              <div>
                <Label htmlFor="emergency_contact">Email or Phone (optional)</Label>
                <Input
                  id="emergency_contact"
                  value={currentMember.emergency_contact}
                  onChange={(e) => setCurrentMember({ ...currentMember, emergency_contact: e.target.value })}
                  placeholder="e.g., sarah@email.com or (555) 123-4567"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If you provide an email, they'll be invited to join and can access your shared emergency plans
                </p>
              </div>

              <div>
                <Label htmlFor="medical">Medical Conditions (optional)</Label>
                <Textarea
                  id="medical"
                  value={currentMember.medical_conditions}
                  onChange={(e) => setCurrentMember({ ...currentMember, medical_conditions: e.target.value })}
                  placeholder="e.g., Diabetes (insulin required), peanut allergy"
                  rows={2}
                />
              </div>

              <Button
                onClick={handleAddMember}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={!currentMember.name}
              >
                Add This Family Member
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-blue-500">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Add Pet</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowForm(false);
                  setFormType("");
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="pet-name">Pet Name *</Label>
                <Input
                  id="pet-name"
                  value={currentPet.name}
                  onChange={(e) => setCurrentPet({ ...currentPet, name: e.target.value })}
                  placeholder="e.g., Max"
                />
              </div>

              <div>
                <Label htmlFor="species">Species *</Label>
                <Select
                  value={currentPet.species}
                  onValueChange={(value) => setCurrentPet({ ...currentPet, species: value })}
                >
                  <SelectTrigger id="species">
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
                <Label htmlFor="breed">Breed (optional)</Label>
                <Input
                  id="breed"
                  value={currentPet.breed}
                  onChange={(e) => setCurrentPet({ ...currentPet, breed: e.target.value })}
                  placeholder="e.g., Golden Retriever"
                />
              </div>

              <div>
                <Label htmlFor="pet-age">Age (optional)</Label>
                <Input
                  id="pet-age"
                  type="number"
                  value={currentPet.age}
                  onChange={(e) => setCurrentPet({ ...currentPet, age: e.target.value })}
                  placeholder="e.g., 5"
                />
              </div>

              <div>
                <Label htmlFor="microchip">Microchip Number (optional)</Label>
                <Input
                  id="microchip"
                  value={currentPet.microchip_number}
                  onChange={(e) => setCurrentPet({ ...currentPet, microchip_number: e.target.value })}
                  placeholder="e.g., 982000123456789"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Critical for reuniting with your pet if separated during emergencies
                </p>
              </div>

              <div>
                <Label htmlFor="pet-medical">Medical Conditions (optional)</Label>
                <Textarea
                  id="pet-medical"
                  value={currentPet.medical_conditions}
                  onChange={(e) => setCurrentPet({ ...currentPet, medical_conditions: e.target.value })}
                  placeholder="e.g., Requires heart medication daily"
                  rows={2}
                />
              </div>

              <Button
                onClick={handleAddPet}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!currentPet.name}
              >
                Add This Pet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons - Always visible */}
      {!showForm && (
        <div className="flex gap-3 pt-4 border-t">
          {members.length > 0 || pets.length > 0 ? (
            <>
              <Button
                variant="outline"
                onClick={onSkip}
                className="flex-1"
              >
                Add More Later
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Continue with {members.length + pets.length} {members.length + pets.length === 1 ? 'Member' : 'Members'}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={onSkip}
              className="w-full"
            >
              Skip for Now (Add Later in Settings)
            </Button>
          )}
        </div>
      )}
    </div>
  );
}