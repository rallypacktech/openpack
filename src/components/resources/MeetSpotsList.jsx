import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, MapPin, Navigation, Star, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { base44 } from "@/api/base44Client";

export default function MeetSpotsList({ spots, onAdd, onUpdate, onDelete }) {
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [userHomeCoords, setUserHomeCoords] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    description: "",
    is_primary: false
  });
  
  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUserEmail(user.email);
      
      // Get user's home coordinates
      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length > 0 && profiles[0].latitude && profiles[0].longitude) {
        setUserHomeCoords({
          lat: profiles[0].latitude,
          lon: profiles[0].longitude
        });
      }
    };
    loadUser();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      latitude: "",
      longitude: "",
      description: "",
      is_primary: false
    });
    setEditingSpot(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (spot) => {
    setEditingSpot(spot);
    setFormData({
      name: spot.name || "",
      address: spot.address || "",
      latitude: spot.latitude?.toString() || "",
      longitude: spot.longitude?.toString() || "",
      description: spot.description || "",
      is_primary: spot.is_primary || false
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const data = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null
    };
    
    if (editingSpot) {
      await onUpdate(editingSpot.id, data);
    } else {
      await onAdd(data);
    }
    setDialogOpen(false);
    resetForm();
  };

  // Calculate cardinal direction from home to a spot
  const getDirection = (spotLat, spotLon) => {
    if (!userHomeCoords || !spotLat || !spotLon) return null;
    
    const lat1 = userHomeCoords.lat * Math.PI / 180;
    const lat2 = spotLat * Math.PI / 180;
    const lon1 = userHomeCoords.lon * Math.PI / 180;
    const lon2 = spotLon * Math.PI / 180;
    
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    const normalizedBearing = (bearing + 360) % 360;
    
    if (normalizedBearing >= 315 || normalizedBearing < 45) return "North";
    if (normalizedBearing >= 45 && normalizedBearing < 135) return "East";
    if (normalizedBearing >= 135 && normalizedBearing < 225) return "South";
    return "West";
  };

  // Get covered directions
  const getCoveredDirections = () => {
    const directions = new Set();
    spots.forEach(spot => {
      const dir = getDirection(spot.latitude, spot.longitude);
      if (dir) directions.add(dir);
    });
    return directions;
  };

  const coveredDirections = getCoveredDirections();
  const allDirections = ["North", "East", "South", "West"];
  const missingDirections = allDirections.filter(dir => !coveredDirections.has(dir));

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-semibold">Meeting Spots</h2>
          <TooltipProvider>
            <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  onClick={() => setTooltipOpen(!tooltipOpen)}
                  className="text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  <Info className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-lg p-4">
                <div className="space-y-3 text-sm">
                  <p className="font-semibold text-base">FEMA Recommendations:</p>
                  
                  <div>
                    <p className="font-medium mb-1">Set waypoints in each direction (N, S, E, W)</p>
                    <p className="text-gray-600">Establish at least 4 spots in different cardinal directions from your home to ensure options regardless of the emergency's origin.</p>
                  </div>

                  <div>
                    <p className="font-medium mb-1">Near Home (for quick exits):</p>
                    <p className="text-gray-600">• Neighbor's yard, street corner, nearby park</p>
                    <p className="text-gray-600">• Parking lot, gas station, convenience store</p>
                  </div>

                  <div>
                    <p className="font-medium mb-1">Out-of-Town (for evacuations):</p>
                    <p className="text-gray-600">• Friend/relative's home, hotel, rest area</p>
                    <p className="text-gray-600">• Community center, library, place of worship</p>
                  </div>

                  <div>
                    <p className="font-medium mb-1">Pet-Friendly Options:</p>
                    <p className="text-gray-600">• Pet-friendly hotels, veterinary clinics</p>
                    <p className="text-gray-600">• Friends/family who welcome pets, outdoor areas</p>
                  </div>

                  <p className="text-xs text-gray-500 mt-3 pt-2 border-t">Source: FEMA Basic Preparedness Guidelines</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Designate meeting locations in each cardinal direction from your home. Choose accessible, safe spots that all family members know.
        </p>

        {userHomeCoords && spots.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-medium text-gray-700">Covered Directions:</span>
            <div className="flex gap-2">
              {allDirections.map(dir => (
                <Badge 
                  key={dir} 
                  variant={coveredDirections.has(dir) ? "default" : "outline"}
                  className={coveredDirections.has(dir) ? "bg-green-600" : "bg-gray-100 text-gray-400"}
                >
                  {dir}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700 mt-2">
              <Plus className="w-4 h-4 mr-2" />
              Add Meeting Spot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSpot ? "Edit" : "Add"} Meeting Spot</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Community Center"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="40.7128"
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="-74.0060"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes about this location"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Primary Location</Label>
                <Switch
                  checked={formData.is_primary}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                />
              </div>
              <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
                {editingSpot ? "Update" : "Add"} Meeting Spot
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {(spots.length < 4 || missingDirections.length > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 mt-6">
            <div className="flex items-start gap-3">
              <Navigation className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900 mb-1">Set waypoints in each direction</p>
                <p className="text-sm text-blue-700">
                  {missingDirections.length > 0 ? (
                    <>Missing directions: <strong>{missingDirections.join(", ")}</strong>. </>
                  ) : (
                    <>Establish at least 4 meeting spots: <strong>North, South, East, and West</strong> from your home. </>
                  )}
                  Include both near-home locations (quick exits) and out-of-town spots (evacuations). 
                  <button 
                    type="button"
                    onClick={() => setTooltipOpen(true)}
                    className="text-blue-600 underline hover:text-blue-800 ml-1"
                  >
                    View examples
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {spots && spots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spots.map((spot) => {
            const isOwner = spot.created_by === currentUserEmail;
            return (
            <Card key={spot.id} className={`hover:shadow-md transition-shadow ${spot.is_primary ? 'ring-2 ring-blue-500' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{spot.name}</h3>
                    {spot.is_primary && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    {!isOwner && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Pack Member
                      </Badge>
                    )}
                  </div>
                  {isOwner && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(spot)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(spot.id)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {spot.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{spot.address}</span>
                  </div>
                )}
                {spot.latitude && spot.longitude && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Navigation className="w-4 h-4" />
                    <span>{spot.latitude.toFixed(4)}°, {spot.longitude.toFixed(4)}°</span>
                    {userHomeCoords && (
                      <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                        {getDirection(spot.latitude, spot.longitude)}
                      </Badge>
                    )}
                  </div>
                )}
                {spot.description && (
                  <p className="text-sm text-gray-600">{spot.description}</p>
                )}
              </CardContent>
            </Card>
          );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Navigation className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600 font-medium mb-2">No meeting spots yet</p>
            <p className="text-gray-500 text-sm">Add locations in each direction (N, S, E, W) from your home</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}