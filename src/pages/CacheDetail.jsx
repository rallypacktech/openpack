import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, Package, MapPin, ShoppingCart, ExternalLink, X, Camera, Barcode } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CacheDetail() {
  const navigate = useNavigate();
  const [cache, setCache] = useState(null);
  const [items, setItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [formData, setFormData] = useState({
    item_name: "",
    quantity: 1,
    category: "other",
    expiration_date: "",
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const cacheId = urlParams.get("id");
      
      if (!cacheId) {
        navigate(createPageUrl("Resources"));
        return;
      }

      const [cachesData, itemsData, recsData, progressData] = await Promise.all([
        base44.entities.EmergencyCache.list(),
        base44.entities.CacheItem.filter({ cache_id: cacheId }),
        base44.entities.ProductRecommendation.filter({ active: true }, "-priority"),
        base44.entities.UserCacheProgress.filter({ cache_id: cacheId })
      ]);

      const foundCache = cachesData.find(c => c.id === cacheId);
      if (!foundCache) {
        navigate(createPageUrl("Resources"));
        return;
      }

      setCache(foundCache);
      setItems(itemsData);

      // Determine cache type from name (case insensitive matching)
      const cacheName = foundCache.name.toLowerCase();
      const cacheType = cacheName.includes("go bag") || cacheName.includes("gobag") ? "go_bag" :
                       cacheName.includes("automobile") || cacheName.includes("auto") || cacheName.includes("car") ? "automobile" : 
                       "general";
      
      // Filter recommendations for this cache type
      const filteredRecs = recsData.filter(rec => 
        rec.cache_type === cacheType || rec.cache_type === "general"
      );
      setRecommendations(filteredRecs);

      // Build progress map
      const progressMap = {};
      progressData.forEach(p => {
        progressMap[p.recommendation_id] = p;
      });
      setUserProgress(progressMap);
    } catch (error) {
      console.error("Error loading cache details:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      item_name: "",
      quantity: 1,
      category: "other",
      expiration_date: "",
      notes: ""
    });
    setEditingItem(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name || "",
      quantity: item.quantity || 1,
      category: item.category || "other",
      expiration_date: item.expiration_date || "",
      notes: item.notes || ""
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const data = { ...formData, cache_id: cache.id };
    
    if (editingItem) {
      await base44.entities.CacheItem.update(editingItem.id, data);
    } else {
      await base44.entities.CacheItem.create(data);
    }
    
    setDialogOpen(false);
    resetForm();
    loadData();
  };

  const handleDelete = async (id) => {
    await base44.entities.CacheItem.delete(id);
    loadData();
  };

  const handleDismissRecommendation = async (recId) => {
    await base44.entities.UserCacheProgress.create({
      cache_id: cache.id,
      recommendation_id: recId,
      status: "dismissed"
    });
    loadData();
  };

  const handleAddRecommendationToCart = (rec) => {
    setCartItems([...cartItems, rec]);
  };

  const handleRemoveFromCart = (recId) => {
    setCartItems(cartItems.filter(item => item.id !== recId));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    // Mark items as purchased
    for (const item of cartItems) {
      await base44.entities.UserCacheProgress.create({
        cache_id: cache.id,
        recommendation_id: item.id,
        status: "purchased",
        purchased_at: new Date().toISOString()
      });
      
      // Add to cache items
      await base44.entities.CacheItem.create({
        cache_id: cache.id,
        item_name: item.item_name,
        quantity: item.quantity,
        category: item.category,
        notes: "Purchased via recommendation"
      });
    }
    
    setCartItems([]);
    loadData();
    alert("Items purchased and added to your cache!");
  };

  const handleBarcodeSubmit = async () => {
    if (!barcode.trim()) return;
    
    // Add item with barcode
    await base44.entities.CacheItem.create({
      cache_id: cache.id,
      item_name: `Product (Barcode: ${barcode})`,
      quantity: 1,
      category: "other",
      notes: `Scanned barcode: ${barcode}`
    });
    
    setBarcode("");
    setScannerOpen(false);
    loadData();
  };

  const handleCheckoffRecommendation = async (rec) => {
    // Mark as manually added
    await base44.entities.UserCacheProgress.create({
      cache_id: cache.id,
      recommendation_id: rec.id,
      status: "manually_added"
    });
    
    // Add to cache
    await base44.entities.CacheItem.create({
      cache_id: cache.id,
      item_name: rec.item_name,
      quantity: rec.quantity,
      category: rec.category,
      notes: "Added from recommendation"
    });
    
    loadData();
  };

  const shouldShowRecommendation = (rec) => {
    const progress = userProgress[rec.id];
    
    // Don't show if dismissed
    if (progress && progress.status === "dismissed") return false;
    
    // Don't show if purchased
    if (progress && progress.status === "purchased") return false;
    
    // Don't show if manually added
    if (progress && progress.status === "manually_added") return false;
    
    // Check if item exists in cache
    const existingItem = items.find(item => 
      item.item_name.toLowerCase().includes(rec.item_name.toLowerCase()) ||
      rec.item_name.toLowerCase().includes(item.item_name.toLowerCase())
    );
    
    // Show if not exists OR if exists but has no/expired expiration
    if (existingItem) {
      if (!existingItem.expiration_date) return true;
      const expDate = new Date(existingItem.expiration_date);
      if (expDate < new Date()) return true;
      return false;
    }
    
    return true;
  };

  const visibleRecommendations = recommendations.filter(shouldShowRecommendation);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cache) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Resources"))}
            className="text-white hover:bg-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resources
          </Button>
          <h1 className="text-2xl font-bold">{cache.name}</h1>
          <div className="flex items-center gap-2 text-blue-100 mt-2">
            <MapPin className="w-4 h-4" />
            <span>{cache.location}</span>
          </div>
          {cache.description && (
            <p className="text-blue-100 mt-2">{cache.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Shopping Cart */}
        {cartItems.length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Shopping Cart ({cartItems.length} items)
                </h3>
                <Button onClick={handleCheckout} className="bg-green-600 hover:bg-green-700">
                  Checkout ${(cartItems.reduce((sum, item) => sum + item.price_cents, 0) / 100).toFixed(2)}
                </Button>
              </div>
              <div className="space-y-2">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded">
                    <span className="text-sm">{item.item_name} - ${(item.price_cents / 100).toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Items</h2>
          <div className="flex gap-2">
            <Button onClick={() => setScannerOpen(true)} variant="outline">
              <Barcode className="w-4 h-4 mr-2" />
              Scan Barcode
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit" : "Add"} Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Item Name</Label>
                  <Input
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    placeholder="e.g., Water bottles"
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label>Category</Label>
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
                  <Label>Expiration Date (optional)</Label>
                  <Input
                    type="date"
                    value={formData.expiration_date}
                    onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional details"
                  />
                </div>
                <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
                  {editingItem ? "Update" : "Add"} Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Barcode Scanner Dialog */}
        <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Scan or Enter Barcode</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Barcode Number</Label>
                <Input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Enter barcode manually or use camera"
                  onKeyPress={(e) => e.key === "Enter" && handleBarcodeSubmit()}
                />
              </div>
              <div className="text-sm text-gray-500 text-center">
                <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Camera scanning available on mobile devices</p>
                <p className="text-xs mt-1">Or enter the barcode number manually above</p>
              </div>
              <Button onClick={handleBarcodeSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
                Add Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {items && items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{item.item_name}</h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Quantity:</strong> {item.quantity}</p>
                    <p><strong>Category:</strong> {item.category}</p>
                    {item.expiration_date && (
                      <p><strong>Expires:</strong> {new Date(item.expiration_date).toLocaleDateString()}</p>
                    )}
                    {item.notes && (
                      <p className="text-gray-500 italic">{item.notes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No items yet. Add your first item to this cache!</p>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Section */}
        {visibleRecommendations.length > 0 && (
          <>
            <Separator className="my-8" />
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Recommended Items</h2>
              <p className="text-sm text-gray-600">
                Complete your cache with these recommended supplies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleRecommendations.map((rec) => (
                <Card key={rec.id} className="border-orange-200">
                  <CardContent className="p-4">
                    {rec.image_url && (
                      <img 
                        src={rec.image_url} 
                        alt={rec.item_name}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-gray-900 mb-1">{rec.item_name}</h3>
                    {rec.description && (
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    )}
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <div><strong>Qty:</strong> {rec.quantity}</div>
                      <div><strong>Category:</strong> {rec.category}</div>
                      {rec.price_cents > 0 && (
                        <div className="text-lg font-bold text-green-600">
                          ${(rec.price_cents / 100).toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {rec.stripe_product_id && (
                        <Button
                          onClick={() => handleAddRecommendationToCart(rec)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={cartItems.some(item => item.id === rec.id)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {cartItems.some(item => item.id === rec.id) ? "In Cart" : "Add to Cart"}
                        </Button>
                      )}
                      {rec.affiliate_link && !rec.stripe_product_id && (
                        <Button
                          onClick={() => window.open(rec.affiliate_link, "_blank")}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Buy External
                        </Button>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCheckoffRecommendation(rec)}
                          variant="outline"
                          className="flex-1"
                        >
                          I Have This
                        </Button>
                        <Button
                          onClick={() => handleDismissRecommendation(rec.id)}
                          variant="ghost"
                          size="icon"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}