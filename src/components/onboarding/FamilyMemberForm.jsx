import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, Users, Info } from "lucide-react";

export default function FamilyMemberForm({ onComplete, onSkip }) {
  const [members, setMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState({
    name: "",
    relationship: "spouse",
    age: "",
    medical_conditions: "",
    emergency_contact: ""
  });
  const [showForm, setShowForm] = useState(false);

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

  const handleComplete = () => {
    onComplete(members);
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

      {/* Add Member Button / Form */}
      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="w-full border-2 border-dashed border-gray-300 hover:border-purple-500 py-8"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Family Member
        </Button>
      ) : (
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
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {members.length > 0 ? (
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
              Continue with {members.length} Member{members.length !== 1 ? 's' : ''}
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
    </div>
  );
}