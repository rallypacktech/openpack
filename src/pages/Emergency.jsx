import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Building2, ExternalLink, AlertTriangle, Users, PawPrint } from "lucide-react";

// Sample emergency resources data
const sampleResources = [
  {
    id: 1,
    name: "Flood Rescue Team",
    type: "Emergency Response",
    address: "321 Speedy Rd.",
    phone: "(987) 654-3210",
    description: "Fast response in flood-prone areas.",
    available: true
  },
  {
    id: 2,
    name: "Hurricane Safe House",
    type: "Shelter",
    address: "789 Survive St.",
    phone: "(123) 456-7890",
    description: "Equipped with essentials.",
    available: true
  }
];

const sampleShelters = [
  {
    id: 1,
    name: "Animal Haven",
    address: "112 Pet St.",
    capacity: { current: 60, max: 100 },
    contact: "info@animalhaven.com",
    petFriendly: true,
    active: true
  },
  {
    id: 2,
    name: "People's Haven",
    address: "221 Safe Ave.",
    capacity: { current: 180, max: 200 },
    contact: "info@peopleshaven.com",
    petFriendly: true,
    active: true
  }
];

export default function Emergency() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationForm, setLocationForm] = useState({
    street_address: "",
    city: "",
    state_province: "",
    postal_code: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await base44.entities.UserProfile.list();
      if (profileData.length > 0) {
        setProfile(profileData[0]);
        setLocationForm({
          street_address: profileData[0].street_address || "",
          city: profileData[0].city || "",
          state_province: profileData[0].state_province || "",
          postal_code: profileData[0].postal_code || ""
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    try {
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, locationForm);
      } else {
        await base44.entities.UserProfile.create(locationForm);
      }
      loadProfile();
    } catch (error) {
      console.error("Error updating location:", error);
    }
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
          <h1 className="text-2xl font-bold">Emergency Resources & Mapping</h1>
          <p className="text-blue-100 mt-1">
            Find nearby shelters, report lost persons or pets, and access tailored disaster resources based on your location
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Location Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Your Location</CardTitle>
            <p className="text-sm text-gray-500">Update your address to receive tailored disaster resource suggestions</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label>Street Address</Label>
                <Input
                  value={locationForm.street_address}
                  onChange={(e) => setLocationForm({ ...locationForm, street_address: e.target.value })}
                  placeholder="123 Main Street"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={locationForm.city}
                  onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                  placeholder="Toronto"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>State/Province</Label>
                <Input
                  value={locationForm.state_province}
                  onChange={(e) => setLocationForm({ ...locationForm, state_province: e.target.value })}
                  placeholder="ON"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input
                  value={locationForm.postal_code}
                  onChange={(e) => setLocationForm({ ...locationForm, postal_code: e.target.value })}
                  placeholder="M5V 3A8"
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={handleUpdateLocation} className="w-full bg-blue-600 hover:bg-blue-700">
              Update Location
            </Button>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="resources">
          <TabsList className="mb-6">
            <TabsTrigger value="resources">Disaster Resources</TabsTrigger>
            <TabsTrigger value="shelters">Shelters</TabsTrigger>
            <TabsTrigger value="lost-persons">Lost Persons</TabsTrigger>
            <TabsTrigger value="lost-pets">Lost Pets</TabsTrigger>
          </TabsList>

          <TabsContent value="resources">
            <h2 className="text-xl font-semibold mb-4">Nearby Disaster Resources</h2>
            <p className="text-gray-500 mb-4">Emergency resources and support centers near your location</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleResources.map((resource) => (
                <Card key={resource.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                        <p className="text-sm text-gray-500">{resource.type}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">yes</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{resource.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{resource.phone}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">{resource.description}</p>
                    <Button variant="outline" className="w-full mt-4">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Map
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shelters">
            <h2 className="text-xl font-semibold mb-4">Emergency Shelters</h2>
            <p className="text-gray-500 mb-4">Nearby shelters available during emergencies</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleShelters.map((shelter) => (
                <Card key={shelter.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{shelter.name}</h3>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{shelter.address}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Users className="w-4 h-4" />
                          <span>Capacity</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(shelter.capacity.current / shelter.capacity.max) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{shelter.capacity.current}/{shelter.capacity.max}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{shelter.contact}</span>
                      </div>
                      {shelter.petFriendly && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <PawPrint className="w-4 h-4" />
                          <span>Pet Friendly</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lost-persons">
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lost Persons Registry</h3>
              <p className="text-gray-500 mb-4">Report or search for missing persons during emergencies</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Report Missing Person
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="lost-pets">
            <div className="text-center py-12">
              <PawPrint className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lost Pets Registry</h3>
              <p className="text-gray-500 mb-4">Report or search for missing pets during emergencies</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Report Missing Pet
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}