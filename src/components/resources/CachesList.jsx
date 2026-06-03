import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, MapPin, List, Package, Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CachesList({ caches, onAdd, onUpdate, onDelete, onViewItems, onGenerateSamples }) {
  const [firstAidKitLocationId, setFirstAidKitLocationId] = useState(null);
  const [firstAidKitLocation, setFirstAidKitLocation] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCache, setEditingCache] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    cache_type: "general",
    description: ""
  });

  useEffect(() => {
    loadFirstAidKitLocation();
    loadCurrentUser();
  }, [caches]);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUserEmail(user.email);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadFirstAidKitLocation = async () => {
    try {
      const locations = await base44.entities.FirstAidKitLocation.list();
      if (locations.length > 0) {
        setFirstAidKitLocation(locations[0]);
        setFirstAidKitLocationId(locations[0].emergency_cache_id);
      }
    } catch (error) {
      console.error("Error loading first aid kit location:", error);
    }
  };

  const handleDesignateFirstAidKit = async (cacheId) => {
    try {
      if (firstAidKitLocation) {
        // Update existing location
        await base44.entities.FirstAidKitLocation.update(firstAidKitLocation.id, {
          emergency_cache_id: cacheId
        });
      } else {
        // Create new location
        await base44.entities.FirstAidKitLocation.create({
          emergency_cache_id: cacheId
        });
      }
      await loadFirstAidKitLocation();
    } catch (error) {
      console.error("Error designating first aid kit location:", error);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", location: "", cache_type: "general", description: "" });
    setEditingCache(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (cache) => {
    setEditingCache(cache);
    setFormData({
      name: cache.name || "",
      location: cache.location || "",
      cache_type: cache.cache_type || "general",
      description: cache.description || ""
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingCache) {
      await onUpdate(editingCache.id, formData);
    } else {
      await onAdd(formData);
    }
    setDialogOpen(false);
    resetForm();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Emergency Caches</h2>
        <div className="flex gap-2">
          <Button onClick={onGenerateSamples} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            <Package className="w-4 h-4 mr-2" />
            Generate Sample Caches
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Cache
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCache ? "Edit" : "Add"} Emergency Cache</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Cache Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Emergency Rations"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Garage, Basement"
                />
              </div>
              <div>
                <Label>Cache Type</Label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={formData.cache_type}
                  onChange={(e) => setFormData({ ...formData, cache_type: e.target.value })}
                >
                  <option value="general">General / Home Cache</option>
                  <option value="go_bag">Go Bag / Bug Out Bag</option>
                  <option value="automobile">Automobile / Car Kit</option>
                  <option value="barn">Barn / Equine & Livestock Kit</option>
                </select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What's in this cache?"
                />
              </div>
              <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
                {editingCache ? "Update" : "Add"} Cache
              </Button>
            </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {caches && caches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {caches.map((cache) => {
            const isOwner = cache.created_by === currentUserEmail;
            return (
            <Card key={cache.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cache.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {cache.cache_type === 'go_bag' ? 'Go Bag' : 
                         cache.cache_type === 'automobile' ? 'Automobile' :
                         cache.cache_type === 'barn' ? '🐴 Barn / Livestock' : 'General'}
                      </Badge>
                      {!isOwner && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Pack Member
                        </Badge>
                      )}
                      {firstAidKitLocationId === cache.id && (
                        <Badge className="bg-red-100 text-red-700">
                          <Heart className="w-3 h-3 mr-1" />
                          First Aid Kit
                        </Badge>
                      )}
                    </div>
                  </div>
                  {isOwner && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(cache)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(cache.id)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{cache.location}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{cache.description}</p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onViewItems(cache)}
                  >
                    <List className="w-4 h-4 mr-2" />
                    View Items
                  </Button>
                  {isOwner && (
                    firstAidKitLocationId === cache.id ? (
                      <Button
                        variant="outline"
                        className="w-full border-red-300 text-red-700 hover:bg-red-50"
                        disabled
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Contains First Aid Kit
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleDesignateFirstAidKit(cache.id)}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Set as First Aid Kit Location
                      </Button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No caches yet. Add your first emergency cache!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}