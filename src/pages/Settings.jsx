import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ProfileForm from "../components/settings/ProfileForm";
import FamilyMembersList from "../components/settings/FamilyMembersList";
import PetsList from "../components/settings/PetsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Lock } from "lucide-react";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, profileData, membersData, petsData] = await Promise.all([
        base44.auth.me(),
        base44.entities.UserProfile.list(),
        base44.entities.FamilyMember.list(),
        base44.entities.Pet.list()
      ]);

      setUser(userData);
      setProfile(profileData.length > 0 ? profileData[0] : null);
      setFamilyMembers(membersData);
      setPets(petsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (data) => {
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, data);
    } else {
      await base44.entities.UserProfile.create(data);
    }
    loadData();
  };

  const handleAddFamilyMember = async (data) => {
    await base44.entities.FamilyMember.create(data);
    loadData();
  };

  const handleUpdateFamilyMember = async (id, data) => {
    await base44.entities.FamilyMember.update(id, data);
    loadData();
  };

  const handleDeleteFamilyMember = async (id) => {
    await base44.entities.FamilyMember.delete(id);
    loadData();
  };

  const handleAddPet = async (data) => {
    await base44.entities.Pet.create(data);
    loadData();
  };

  const handleUpdatePet = async (id, data) => {
    await base44.entities.Pet.update(id, data);
    loadData();
  };

  const handleDeletePet = async (id) => {
    await base44.entities.Pet.delete(id);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold">Settings & Profile</h1>
          <p className="text-blue-100 mt-1">Manage your account, family members, pets, and security preferences</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Profile Section */}
        <ProfileForm user={user} profile={profile} onSave={handleProfileSave} />

        {/* Family Members Section */}
        <FamilyMembersList
          members={familyMembers}
          onAdd={handleAddFamilyMember}
          onUpdate={handleUpdateFamilyMember}
          onDelete={handleDeleteFamilyMember}
        />

        {/* Pets Section */}
        <PetsList
          pets={pets}
          onAdd={handleAddPet}
          onUpdate={handleUpdatePet}
          onDelete={handleDeletePet}
        />

        {/* Security Settings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Cloudflare Security</p>
                  <p className="text-sm text-gray-500">Enhanced protection against threats and attacks</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Human Authentication</p>
                  <p className="text-sm text-gray-500">Verify that users are human before accessing sensitive data</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Save Security Settings
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input type="password" placeholder="Enter your current password" className="mt-1" />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" placeholder="Enter your new password" className="mt-1" />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input type="password" placeholder="Confirm your new password" className="mt-1" />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}