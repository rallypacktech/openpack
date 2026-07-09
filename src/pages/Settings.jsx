import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ProfileForm from "../components/settings/ProfileForm";
import FamilyMembersList from "../components/settings/FamilyMembersList";
import PetsList from "../components/settings/PetsList";
import AccessibilitySettings from "../components/settings/AccessibilitySettings";
import NotificationPreferences from "../components/settings/NotificationPreferences";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Lock, AlertTriangle } from "lucide-react";
import CountryEmergencySettings from "../components/settings/CountryEmergencySettings";
import AddToHomeScreen from "../components/settings/AddToHomeScreen";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Scroll to anchor if present in URL, wait for data to load
    if (!loading) {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
  }, [loading]);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      
      const [profileData, membersData, petsData] = await Promise.all([
        base44.entities.UserProfile.filter({ created_by: userData.email }),
        base44.entities.FamilyMember.filter({ created_by: userData.email }),
        base44.entities.Pet.filter({ created_by: userData.email })
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
    // Check if region changed
    const oldRegion = profile?.fema_region;
    
    // Determine FEMA region if state changed
    if (data.state_province) {
      const regionResponse = await base44.functions.invoke('determineFemaRegion', {
        state: data.state_province
      });
      data.fema_region = regionResponse.data.fema_region;
      
      // Generate notifications if region changed
      if (oldRegion && oldRegion !== data.fema_region) {
        await base44.functions.invoke('generateFamilyNeedsNotifications', {
          type: 'region_change',
          memberName: data.fema_region,
          newRegion: data.fema_region,
          disasterTypes: regionResponse.data.disaster_types
        });
      }
    }
    
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, data);
    } else {
      await base44.entities.UserProfile.create(data);
    }
    loadData();
  };

  const handleAddFamilyMember = async (data) => {
    await base44.entities.FamilyMember.create(data);
    
    // Generate notifications for new family member
    await base44.functions.invoke('generateFamilyNeedsNotifications', {
      type: 'family_member',
      memberName: data.name
    });
    
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
    
    // Generate notifications for new pet
    await base44.functions.invoke('generateFamilyNeedsNotifications', {
      type: 'pet',
      memberName: `${data.name} (${data.species})`
    });
    
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE MY ACCOUNT") {
      return;
    }
    
    setIsDeleting(true);
    try {
      // Call backend function to handle account deletion with pet data retention
      await base44.functions.invoke('deleteAccount');
      
      // Logout and redirect
      base44.auth.logout();
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please contact support.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" role="status" aria-label="Loading settings"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold">Settings & Profile</h1>
          <p className="text-blue-100 mt-1">Manage your account, family members, pets, and preferences</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Accessibility Settings */}
        <AccessibilitySettings />

        {/* Notification Preferences */}
        <NotificationPreferences
          profile={profile}
          onSave={handleProfileSave}
          hasLargeAnimals={pets.some(p => ['equine', 'livestock'].includes(p.species))}
        />

        {/* Profile Section */}
        <ProfileForm user={user} profile={profile} onSave={handleProfileSave} />

        {/* Family Members Section */}
        <div id="family-section">
          <FamilyMembersList
            members={familyMembers}
            onAdd={handleAddFamilyMember}
            onUpdate={handleUpdateFamilyMember}
            onDelete={handleDeleteFamilyMember}
          />
        </div>

        {/* Pets Section */}
        <PetsList
          pets={pets}
          onAdd={handleAddPet}
          onUpdate={handleUpdatePet}
          onDelete={handleDeletePet}
        />

        {/* Emergency Country Preferences */}
        <CountryEmergencySettings
          profile={profile}
          onSave={handleProfileSave}
          isPaidAccount={false}
        />

        {/* Add to Home Screen Instructions */}
        <AddToHomeScreen />

        {/* Security Settings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" aria-hidden="true" />
                <div>
                  <Label htmlFor="cloudflare-security" className="font-medium">Cloudflare Security</Label>
                  <p className="text-sm text-gray-500">Enhanced protection against threats and attacks</p>
                </div>
              </div>
              <Switch id="cloudflare-security" defaultChecked aria-label="Toggle Cloudflare security" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-600" aria-hidden="true" />
                <div>
                  <Label htmlFor="human-auth" className="font-medium">Human Authentication</Label>
                  <p className="text-sm text-gray-500">Verify that users are human before accessing sensitive data</p>
                </div>
              </div>
              <Switch id="human-auth" defaultChecked aria-label="Toggle human authentication" />
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
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" placeholder="Enter your current password" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" placeholder="Enter your new password" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" placeholder="Confirm your new password" className="mt-1" />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader className="pb-4 bg-red-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
              <CardTitle className="text-xl font-semibold text-red-900">Danger Zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" role="note">
              <h3 className="font-semibold text-gray-900 mb-2">Important: Pet Microchip Data Retention</h3>
              <p className="text-sm text-gray-700 mb-2">
                If you delete your account, your personal information will be permanently removed. However, for pet safety and emergency recovery purposes:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                <li>Pet microchip numbers will be retained</li>
                <li>Last known owner name and address will be preserved</li>
                <li>This helps reunite lost pets with owners during emergencies</li>
                <li>Data is anonymized and only accessible to authorized microchip companies</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3 italic">
                This retention complies with animal welfare and ownership laws. If you need complete pet data removal, please contact support.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>
                      This action cannot be undone. This will permanently delete your account and remove your personal data from our servers.
                    </p>
                    <p className="font-semibold text-gray-900">
                      Pet microchip information will be retained for emergency pet recovery purposes.
                    </p>
                    <div className="mt-4">
                      <Label htmlFor="delete-confirm">Type "DELETE MY ACCOUNT" to confirm:</Label>
                      <Input
                        id="delete-confirm"
                        className="mt-2"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE MY ACCOUNT"
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "DELETE MY ACCOUNT" || isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}