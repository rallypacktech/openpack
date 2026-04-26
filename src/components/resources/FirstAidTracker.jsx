import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, AlertCircle, Check, FileDown, Heart } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import AiRecommendationsPanel from "../cache/AiRecommendationsPanel";

export default function FirstAidTracker({ items, onAdd, onUpdate, onDelete, onGenerateSamples }) {
  const [firstAidKitLocation, setFirstAidKitLocation] = useState(null);
  const [cacheName, setCacheName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "adults",
    quantity: 1,
    location: "",
    expiration_date: "",
    owned: false,
    notes: ""
  });

  useEffect(() => {
    loadFirstAidKitLocation();
  }, []);

  const loadFirstAidKitLocation = async () => {
    try {
      const locations = await base44.entities.FirstAidKitLocation.list();
      if (locations.length > 0) {
        setFirstAidKitLocation(locations[0]);
        
        // Load cache name
        const caches = await base44.entities.EmergencyCache.list();
        const cache = caches.find(c => c.id === locations[0].emergency_cache_id);
        if (cache) {
          setCacheName(cache.name);
        }
      }
    } catch (error) {
      console.error("Error loading first aid kit location:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "adults",
      quantity: 1,
      location: "",
      expiration_date: "",
      owned: false,
      notes: ""
    });
  };

  const handleSave = async () => {
    await onAdd(formData);
    setDialogOpen(false);
    resetForm();
  };

  const handleToggleOwned = async (item) => {
    await onUpdate(item.id, { ...item, owned: !item.owned });
  };

  const ownedCount = items.filter(i => i.owned).length;
  const neededCount = items.filter(i => !i.owned).length;
  const expiredCount = items.filter(i => {
    if (!i.expiration_date) return false;
    return new Date(i.expiration_date) < new Date();
  }).length;

  const adultsItems = items.filter(i => i.category === "adults");
  const youthItems = items.filter(i => i.category === "youth");
  const petsItems = items.filter(i => i.category === "pets");

  const renderItem = (item) => (
    <div key={item.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={item.owned}
          onCheckedChange={() => handleToggleOwned(item)}
          className="mt-1"
        />
        <div>
          <p className="font-medium">{item.name}</p>
          {item.expiration_date && (
            <p className="text-sm text-gray-500">
              Expires: {format(new Date(item.expiration_date), "MMM d, yyyy")}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {item.owned && (
          <Button variant="outline" size="sm">Update Expiration</Button>
        )}
        <Button variant="ghost" size="sm">Details</Button>
      </div>
    </div>
  );

  return (
    <div>
      {/* First Aid Kit Location Badge */}
      {firstAidKitLocation && cacheName && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-900">First Aid Kit Location</p>
                <p className="text-sm text-red-700">Currently in: <strong>{cacheName}</strong></p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {!firstAidKitLocation && (
        <Card className="mb-6 bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-orange-700">
                No cache designated for First Aid Kit yet. Go to Caches tab to set a location.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">Owned</p>
          <p className="text-2xl font-bold text-gray-900">{ownedCount}</p>
        </div>
        <div className="bg-orange-100 rounded-lg p-4 text-center">
          <p className="text-sm text-orange-600">Needed</p>
          <p className="text-2xl font-bold text-orange-700">{neededCount}</p>
        </div>
        <div className="bg-red-100 rounded-lg p-4 text-center">
          <p className="text-sm text-red-600">Expired</p>
          <p className="text-2xl font-bold text-red-700">{expiredCount}</p>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="adults" className="mb-6">
        <TabsList>
          <TabsTrigger value="adults">Adults</TabsTrigger>
          <TabsTrigger value="youth">Youth</TabsTrigger>
          <TabsTrigger value="pets">Pets</TabsTrigger>
        </TabsList>

        <div className="flex justify-end gap-2 mt-4 mb-4">
          <Button onClick={onGenerateSamples} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            <Plus className="w-4 h-4 mr-2" />
            Generate Sample Items
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add First Aid Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Item Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Sterile Gauze Pads"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adults">Adults</SelectItem>
                      <SelectItem value="youth">Youth</SelectItem>
                      <SelectItem value="pets">Pets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Medicine Cabinet"
                  />
                </div>
                <div>
                  <Label>Expiration Date</Label>
                  <Input
                    type="date"
                    value={formData.expiration_date}
                    onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.owned}
                    onCheckedChange={(checked) => setFormData({ ...formData, owned: checked })}
                  />
                  <Label>I already have this item</Label>
                </div>
                <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="adults">
          <div className="space-y-3">
            {adultsItems.length > 0 ? (
              adultsItems.map(renderItem)
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No adult first aid items yet
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="youth">
          <div className="space-y-3">
            {youthItems.length > 0 ? (
              youthItems.map(renderItem)
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No youth first aid items yet
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pets">
          <div className="space-y-3">
            {petsItems.length > 0 ? (
              petsItems.map(renderItem)
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No pet first aid items yet
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* AI First Aid Recommendations */}
      <div className="mb-6">
        <AiRecommendationsPanel
          mode="firstaid"
          onAddItem={(rec) => {
            setFormData({
              name: rec.item_name,
              category: rec.for_whom?.toLowerCase().includes("pet") ? "pets" : rec.for_whom?.toLowerCase().includes("child") ? "youth" : "adults",
              quantity: rec.quantity || 1,
              location: "",
              expiration_date: "",
              owned: false,
              notes: rec.why || "",
            });
            setDialogOpen(true);
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="default" className="bg-red-600 hover:bg-red-700 flex-1">
          <FileDown className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="outline" className="flex-1">
          Update All Expirations
        </Button>
      </div>
    </div>
  );
}