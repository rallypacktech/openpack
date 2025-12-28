import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ShoppingCart, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function AdminRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    item_name: "",
    category: "other",
    cache_type: "general",
    description: "",
    quantity: 1,
    price_cents: 0,
    stripe_product_id: "",
    affiliate_link: "",
    image_url: "",
    priority: 0,
    active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await base44.entities.ProductRecommendation.list("-priority");
      setRecommendations(data);
      
      // Auto-seed if empty
      if (data.length === 0) {
        await base44.functions.invoke('seedRecommendations');
        const newData = await base44.entities.ProductRecommendation.list("-priority");
        setRecommendations(newData);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      item_name: "",
      category: "other",
      cache_type: "general",
      description: "",
      quantity: 1,
      price_cents: 0,
      stripe_product_id: "",
      affiliate_link: "",
      image_url: "",
      priority: 0,
      active: true
    });
    setEditing(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (rec) => {
    setEditing(rec);
    setFormData({
      item_name: rec.item_name || "",
      category: rec.category || "other",
      cache_type: rec.cache_type || "general",
      description: rec.description || "",
      quantity: rec.quantity || 1,
      price_cents: rec.price_cents || 0,
      stripe_product_id: rec.stripe_product_id || "",
      affiliate_link: rec.affiliate_link || "",
      image_url: rec.image_url || "",
      priority: rec.priority || 0,
      active: rec.active !== false
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) {
      await base44.entities.ProductRecommendation.update(editing.id, formData);
    } else {
      await base44.entities.ProductRecommendation.create(formData);
    }
    setDialogOpen(false);
    resetForm();
    loadData();
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this recommendation?")) {
      await base44.entities.ProductRecommendation.delete(id);
      loadData();
    }
  };

  const toggleActive = async (rec) => {
    await base44.entities.ProductRecommendation.update(rec.id, {
      active: !rec.active
    });
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
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold">Product Recommendations Admin</h1>
          <p className="text-blue-100 mt-1">Manage recommended products for emergency caches</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Recommendations</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Recommendation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit" : "Add"} Product Recommendation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Item Name *</Label>
                  <Input
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    placeholder="e.g., Premium First Aid Kit"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="water">Water</option>
                      <option value="food">Food</option>
                      <option value="medical">Medical</option>
                      <option value="tools">Tools</option>
                      <option value="clothing">Clothing</option>
                      <option value="documents">Documents</option>
                      <option value="communication">Communication</option>
                      <option value="hygiene">Hygiene</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label>Cache Type *</Label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={formData.cache_type}
                      onChange={(e) => setFormData({ ...formData, cache_type: e.target.value })}
                    >
                      <option value="general">General (All Caches)</option>
                      <option value="go_bag">Go Bag Only</option>
                      <option value="automobile">Automobile Only</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label>Price (cents)</Label>
                    <Input
                      type="number"
                      value={formData.price_cents}
                      onChange={(e) => setFormData({ ...formData, price_cents: parseInt(e.target.value) || 0 })}
                      placeholder="e.g., 2999 for $29.99"
                    />
                  </div>
                </div>
                <div>
                  <Label>Stripe Product ID</Label>
                  <Input
                    value={formData.stripe_product_id}
                    onChange={(e) => setFormData({ ...formData, stripe_product_id: e.target.value })}
                    placeholder="prod_..."
                  />
                </div>
                <div>
                  <Label>Affiliate Link</Label>
                  <Input
                    value={formData.affiliate_link}
                    onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Priority (higher = shown first)</Label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label>Active</Label>
                </div>
                <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
                  {editing ? "Update" : "Add"} Recommendation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className={rec.active ? "" : "opacity-50"}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{rec.item_name}</h3>
                    <div className="text-xs text-gray-500 space-y-1 mt-1">
                      <div>Category: {rec.category}</div>
                      <div>Cache: {rec.cache_type}</div>
                      <div>Priority: {rec.priority}</div>
                      {rec.price_cents > 0 && (
                        <div className="font-semibold text-green-600">
                          ${(rec.price_cents / 100).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(rec)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(rec.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {rec.description && (
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs">
                  {rec.stripe_product_id && (
                    <div className="flex items-center gap-1 text-purple-600">
                      <ShoppingCart className="w-3 h-3" />
                      Stripe
                    </div>
                  )}
                  {rec.affiliate_link && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <ExternalLink className="w-3 h-3" />
                      Affiliate
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Switch
                    checked={rec.active}
                    onCheckedChange={() => toggleActive(rec)}
                  />
                  <span className="text-xs text-gray-600">
                    {rec.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {recommendations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No recommendations yet. Add your first product!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}