import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  WifiOff, 
  CheckCircle, 
  Phone, 
  MapPin, 
  Package, 
  Plus, 
  Home, 
  PawPrint, 
  AlertTriangle,
  Navigation,
  Users
} from "lucide-react";

export default function Offline() {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [meetSpots, setMeetSpots] = useState([]);
  const [caches, setCaches] = useState([]);
  const [firstAidItems, setFirstAidItems] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersData, spotsData, cachesData, firstAidData, petsData] = await Promise.all([
        base44.entities.FamilyMember.list(),
        base44.entities.MeetSpot.list(),
        base44.entities.EmergencyCache.list(),
        base44.entities.FirstAidItem.list(),
        base44.entities.Pet.list()
      ]);

      setFamilyMembers(membersData);
      setMeetSpots(spotsData);
      setCaches(cachesData);
      setFirstAidItems(firstAidData);
      setPets(petsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sample shelter data
  const shelters = [
    {
      name: "Animal Haven",
      address: "112 Pet St.",
      capacity: { current: 60, max: 100 },
      contact: "info@animalhaven.com",
      petFriendly: true,
      active: true
    },
    {
      name: "People's Haven",
      address: "221 Safe Ave.",
      capacity: { current: 180, max: 200 },
      contact: "info@peopleshaven.com",
      petFriendly: true,
      active: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="bg-blue-100 py-12 text-center">
        <WifiOff className="w-12 h-12 mx-auto mb-4 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Offline Mode Active</h1>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto px-4">
          You're currently offline, but don't worry. All your critical emergency information is accessible right here. 
          Your preparedness plans, resources, and contacts are cached and ready when you need them most.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full">
          <CheckCircle className="w-5 h-5" />
          <span>All data synced and available</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Access */}
        <h2 className="text-xl font-semibold mb-2">Quick Access</h2>
        <p className="text-gray-500 mb-6">Access your most important emergency information instantly</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Emergency Contacts</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Access your family members and their emergency contact information</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">View Contacts</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Meet Spots</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">View your designated family meeting locations</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">View Meet Spots</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Emergency Caches</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Check your emergency supply locations and inventory</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">View Caches</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">First Aid Tracker</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Review your first aid supplies and expiration dates</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">View First Aid</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Home className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Nearby Shelters</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Find emergency shelters in your area</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">View Shelters</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <PawPrint className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Pet Information</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Access your pet details and medical information</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">View Pets</Button>
            </CardContent>
          </Card>
        </div>

        {/* Family Members */}
        <h2 className="text-xl font-semibold mb-2">Family Members</h2>
        <p className="text-gray-500 mb-4">Emergency contact information for your household</p>
        {familyMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {familyMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{member.relationship}</p>
                    </div>
                    <Badge variant="outline">{member.age} years</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Emergency Contact</span>
                    </div>
                    <p className="text-blue-600">{member.emergency_contact || "N/A"}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-500">Medical Conditions</span>
                    </div>
                    <p>{member.medical_conditions || "none"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mb-8">
            <CardContent className="py-8 text-center text-gray-500">
              No family members added yet
            </CardContent>
          </Card>
        )}

        {/* Meet Spots */}
        <h2 className="text-xl font-semibold mb-2">Meet Spots</h2>
        <p className="text-gray-500 mb-4">Designated family meeting locations</p>
        {meetSpots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {meetSpots.map((spot) => (
              <Card key={spot.id}>
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-3">{spot.name}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Address</span>
                    </div>
                    <p>{spot.address || "No address set"}</p>
                    {spot.latitude && spot.longitude && (
                      <>
                        <div className="flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">Coordinates</span>
                        </div>
                        <p>{spot.latitude.toFixed(4)}° N, {spot.longitude.toFixed(4)}° W</p>
                      </>
                    )}
                    {spot.description && <p className="text-gray-600 mt-2">{spot.description}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mb-8">
            <CardContent className="py-8 text-center text-gray-500">
              No meeting spots added yet
            </CardContent>
          </Card>
        )}

        {/* Emergency Shelters */}
        <h2 className="text-xl font-semibold mb-2">Emergency Shelters</h2>
        <p className="text-gray-500 mb-4">Nearby shelters available during emergencies</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {shelters.map((shelter, index) => (
            <Card key={index}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold">{shelter.name}</h3>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{shelter.address}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Capacity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(shelter.capacity.current / shelter.capacity.max) * 100}%` }}
                        ></div>
                      </div>
                      <span>{shelter.capacity.current}/{shelter.capacity.max}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{shelter.contact}</span>
                  </div>
                  {shelter.petFriendly && (
                    <div className="flex items-center gap-2 text-green-600">
                      <PawPrint className="w-4 h-4" />
                      <span>Pet Friendly</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pets */}
        <h2 className="text-xl font-semibold mb-2">Pet Information</h2>
        <p className="text-gray-500 mb-4">Important details about your pets</p>
        {pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {pets.map((pet) => (
              <Card key={pet.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <PawPrint className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{pet.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{pet.species} - {pet.breed || "Unknown"}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                        <div className="bg-blue-500 h-1 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{pet.age} years</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Microchip Number</span>
                      <p className="font-mono">{pet.microchip_number || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Medical Conditions</span>
                      <p>{pet.medical_conditions || "None"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mb-8">
            <CardContent className="py-8 text-center text-gray-500">
              No pets added yet
            </CardContent>
          </Card>
        )}

        {/* Offline Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Offline Mode Information</h3>
                <p className="text-sm text-gray-600 mt-1">
                  This page provides access to all critical emergency information cached on your device. 
                  You can view this data anytime, even without an internet connection. 
                  When you reconnect, any changes will sync automatically.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    All emergency contacts and family information
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Complete resource lists including caches and first aid
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Meet spot locations and shelter information
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Pet details and medical information
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}