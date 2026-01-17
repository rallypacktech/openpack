import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Building2, ExternalLink, AlertTriangle, Users, PawPrint, Globe, Heart } from "lucide-react";

export default function Emergency() {
  const [profile, setProfile] = useState(null);
  const [disasterResources, setDisasterResources] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheltersLoading, setSheltersLoading] = useState(false);
  const [locationForm, setLocationForm] = useState({
    street_address: "",
    city: "",
    state_province: "",
    postal_code: ""
  });

  useEffect(() => {
    loadProfile();
    loadDisasterResources();
    loadShelters();
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

  const loadDisasterResources = async () => {
    try {
      const resources = await base44.entities.DisasterResource.list();
      setDisasterResources(resources);
    } catch (error) {
      console.error("Error loading disaster resources:", error);
    }
  };

  const loadShelters = async () => {
    setSheltersLoading(true);
    try {
      const response = await base44.functions.invoke('getShelters');
      setShelters(response.data.shelters || []);
    } catch (error) {
      console.error("Error loading shelters:", error);
    } finally {
      setSheltersLoading(false);
    }
  };

  const getResourceTypeLabel = (type) => {
    const labels = {
      federal_agency: "Federal Agency",
      insurance: "Insurance",
      relief_organization: "Relief Organization",
      local_emergency: "Emergency Services",
      mental_health: "Mental Health",
      financial_assistance: "Financial Aid"
    };
    return labels[type] || type;
  };

  const getResourceTypeColor = (type) => {
    const colors = {
      federal_agency: "bg-blue-100 text-blue-800",
      insurance: "bg-purple-100 text-purple-800",
      relief_organization: "bg-green-100 text-green-800",
      local_emergency: "bg-red-100 text-red-800",
      mental_health: "bg-pink-100 text-pink-800",
      financial_assistance: "bg-yellow-100 text-yellow-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">National Disaster Resources</h2>
                <p className="text-gray-500 mt-1">Federal agencies, insurance, relief organizations, and support services across America</p>
              </div>
            </div>

            {disasterResources.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 mb-4">No resources loaded yet</p>
                  <p className="text-sm text-gray-400">Admin can seed resources from the backend function</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {disasterResources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{resource.name}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getResourceTypeColor(resource.type)}>
                              {getResourceTypeLabel(resource.type)}
                            </Badge>
                            {resource.available_24_7 && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                24/7
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <a href={`tel:${resource.phone}`} className="hover:text-blue-600 underline">
                            {resource.phone}
                          </a>
                        </div>
                        
                        {resource.website && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Globe className="w-4 h-4 flex-shrink-0" />
                            <a 
                              href={resource.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 underline truncate"
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs">{resource.service_area}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shelters">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Emergency Shelters</h2>
                <p className="text-gray-500 mt-1">
                  {profile?.fema_region 
                    ? `Shelters in your FEMA region (${profile.fema_region}) and nearby areas` 
                    : "Emergency shelters in your area"}
                </p>
              </div>
            </div>

            {sheltersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : shelters.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 mb-2">No shelters available yet</p>
                  <p className="text-sm text-gray-400">Shelters will appear here during active emergencies</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shelters.map((shelter) => (
                  <Card key={shelter.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{shelter.name}</h3>
                        <div className="flex items-center gap-2">
                          {shelter.is_open ? (
                            <Badge className="bg-green-100 text-green-700">Open</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-700">Closed</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <div>{shelter.address}</div>
                            <div>{shelter.city}, {shelter.state} {shelter.zip_code}</div>
                            {shelter.distance && (
                              <div className="text-xs text-blue-600 mt-1">{shelter.distance} miles away</div>
                            )}
                          </div>
                        </div>

                        {shelter.capacity && (
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Users className="w-4 h-4" />
                              <span>Capacity: {shelter.capacity} people</span>
                            </div>
                            {shelter.current_occupancy !== undefined && (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${Math.min((shelter.current_occupancy / shelter.capacity) * 100, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">{shelter.current_occupancy}/{shelter.capacity}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {shelter.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <a href={`tel:${shelter.phone}`} className="hover:text-blue-600 underline">
                              {shelter.phone}
                            </a>
                          </div>
                        )}

                        <div className="flex items-center gap-3 flex-wrap">
                          {shelter.pets_allowed && (
                            <div className="flex items-center gap-1 text-sm text-green-600">
                              <PawPrint className="w-4 h-4" />
                              <span>Pets OK</span>
                            </div>
                          )}
                          {shelter.medical_services && (
                            <div className="flex items-center gap-1 text-sm text-red-600">
                              <Heart className="w-4 h-4" />
                              <span>Medical</span>
                            </div>
                          )}
                        </div>

                        {shelter.disaster_type && (
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">For:</span> {shelter.disaster_type}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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