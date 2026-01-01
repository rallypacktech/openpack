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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Family Meeting Spots</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-blue-600 hover:text-blue-800">
                  <Info className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-md p-4">
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">FEMA Recommendations for Meet Spots:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Near Home:</strong> A spot close to your home for quick exits (e.g., house fire) - like a neighbor's yard or street corner</li>
                    <li><strong>Out-of-Town:</strong> A location outside your immediate area for evacuations (e.g., natural disaster)</li>
                    <li><strong>Directional Coverage:</strong> Aim for at least 4 spots in different directions (N, S, E, W) from your address</li>
                    <li><strong>Accessibility:</strong> Choose places reachable by foot, car, or public transport</li>
                    <li><strong>Safety & Familiarity:</strong> Select well-known, safe locations like community centers, schools, or places of worship</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">Source: FEMA Basic Preparedness Guidelines</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Meet Spot
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
                {editingSpot ? "Update" : "Add"} Meet Spot
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {spots.length < 4 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium text-yellow-800">Recommended: At least 4 Meet Spots</p>
              <p className="text-sm text-yellow-700">FEMA recommends establishing meet spots for different scenarios: one near home (for fires) and an out-of-town location (for evacuations). Click the info icon above for detailed guidance.</p>
            </div>
          </div>
        </div>
      )}

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
                    <span>{spot.latitude.toFixed(4)}° N, {spot.longitude.toFixed(4)}° W</span>
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
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No meeting spots yet. Add a location for your family to meet!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}