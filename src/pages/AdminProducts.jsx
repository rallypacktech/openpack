import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, Pencil, Trash2, Package, AlertCircle, DollarSign, Link as LinkIcon, 
  Check, X, Filter, Search, RefreshCw, Eye, EyeOff
} from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [editDialog, setEditDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cacheFilter, setCacheFilter] = useState("all");
  const [showMissingData, setShowMissingData] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, suggestionsData] = await Promise.all([
        base44.entities.ProductRecommendation.list(),
        base44.entities.ProductRecommendationSuggestion.list()
      ]);
      setProducts(productsData);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (product, isSuggestion = false) => {
    setEditingProduct({ ...product, isSuggestion });
    setEditForm({
      item_name: isSuggestion ? product.suggested_item_name : product.item_name,
      category: isSuggestion ? product.suggested_category : product.category,
      cache_type: isSuggestion ? product.suggested_cache_type : product.cache_type,
      description: isSuggestion ? product.suggested_description : product.description,
      quantity: isSuggestion ? product.suggested_quantity : product.quantity,
      price_cents: isSuggestion ? product.suggested_price_cents : product.price_cents,
      image_url: isSuggestion ? product.suggested_image_url : product.image_url,
      affiliate_link: isSuggestion ? product.suggested_affiliate_link : product.affiliate_link,
      family_member_types: isSuggestion ? (product.suggested_family_member_types || []) : (product.family_member_types || []),
      fema_regions: isSuggestion ? (product.suggested_fema_regions || []) : (product.fema_regions || []),
      disaster_types: isSuggestion ? (product.suggested_disaster_types || []) : (product.disaster_types || []),
      priority: isSuggestion ? 0 : product.priority,
      active: isSuggestion ? true : product.active,
      source_organization: isSuggestion ? product.source_organization : "",
      admin_notes: isSuggestion ? product.admin_notes : ""
    });
    setEditDialog(true);
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setEditForm({
      item_name: "",
      category: "other",
      cache_type: "general",
      description: "",
      quantity: 1,
      price_cents: 0,
      image_url: "",
      affiliate_link: "",
      family_member_types: ["person"],
      fema_regions: [],
      disaster_types: [],
      priority: 0,
      active: true,
      source_organization: "",
      admin_notes: ""
    });
    setEditDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingProduct?.isSuggestion) {
        // Approve suggestion (creates/updates product)
        await base44.functions.invoke('approveSuggestion', { suggestionId: editingProduct.id });
        // Update the suggestion with edited values
        await base44.entities.ProductRecommendationSuggestion.update(editingProduct.id, {
          suggested_item_name: editForm.item_name,
          suggested_category: editForm.category,
          suggested_cache_type: editForm.cache_type,
          suggested_description: editForm.description,
          suggested_quantity: editForm.quantity,
          suggested_price_cents: editForm.price_cents,
          suggested_image_url: editForm.image_url,
          suggested_affiliate_link: editForm.affiliate_link,
          suggested_family_member_types: editForm.family_member_types,
          suggested_fema_regions: editForm.fema_regions,
          suggested_disaster_types: editForm.disaster_types,
          source_organization: editForm.source_organization,
          admin_notes: editForm.admin_notes
        });
      } else if (editingProduct) {
        // Update existing product
        await base44.entities.ProductRecommendation.update(editingProduct.id, editForm);
      } else {
        // Create new product
        await base44.entities.ProductRecommendation.create(editForm);
      }
      setEditDialog(false);
      await loadData();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving product");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product recommendation?")) return;
    try {
      await base44.entities.ProductRecommendation.delete(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Error deleting product");
    }
  };

  const handleRejectSuggestion = async (id) => {
    try {
      await base44.functions.invoke('rejectSuggestion', { suggestionId: id });
      await loadData();
    } catch (error) {
      console.error("Error rejecting:", error);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await base44.entities.ProductRecommendation.update(product.id, {
        active: !product.active
      });
      await loadData();
    } catch (error) {
      console.error("Error toggling:", error);
    }
  };

  const toggleFamilyMemberType = (type) => {
    const current = editForm.family_member_types || [];
    setEditForm({
      ...editForm,
      family_member_types: current.includes(type) 
        ? current.filter(t => t !== type)
        : [...current, type]
    });
  };

  const handleConvertExisting = async () => {
    if (!confirm("Convert all existing products to pending suggestions?")) return;
    setLoading(true);
    try {
      await base44.functions.invoke('convertExistingToSuggestions');
      await loadData();
      alert("Products converted to suggestions!");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlaceholders = async () => {
    if (!confirm("Generate 200+ placeholder suggestions?")) return;
    setLoading(true);
    try {
      await base44.functions.invoke('generatePlaceholderSuggestions');
      await loadData();
      alert("Placeholders created!");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckLinks = async () => {
    if (!confirm("Check all affiliate links for changes?")) return;
    setLoading(true);
    try {
      const response = await base44.functions.invoke('checkAffiliateLinkChanges');
      await loadData();
      alert(`${response.data.suggestions_created} suggestions created from link changes.`);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filterProducts = (items, isPending = false) => {
    return items.filter(item => {
      const name = isPending ? item.suggested_item_name : item.item_name;
      const category = isPending ? item.suggested_category : item.category;
      const cache = isPending ? item.suggested_cache_type : item.cache_type;
      const link = isPending ? item.suggested_affiliate_link : item.affiliate_link;
      const price = isPending ? item.suggested_price_cents : item.price_cents;

      const matchesSearch = name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || category === categoryFilter;
      const matchesCache = cacheFilter === "all" || cache === cacheFilter;
      const matchesMissing = !showMissingData || (!link || !price || price === 0);

      return matchesSearch && matchesCategory && matchesCache && matchesMissing;
    });
  };

  const activeProducts = filterProducts(products.filter(p => p.active));
  const inactiveProducts = filterProducts(products.filter(p => !p.active));
  const pendingSuggestions = filterProducts(suggestions.filter(s => s.status === 'pending'), true);

  const categoryBadgeColor = {
    water: "bg-blue-100 text-blue-800",
    food: "bg-green-100 text-green-800",
    medical: "bg-red-100 text-red-800",
    tools: "bg-gray-100 text-gray-800",
    clothing: "bg-purple-100 text-purple-800",
    documents: "bg-yellow-100 text-yellow-800",
    communication: "bg-indigo-100 text-indigo-800",
    hygiene: "bg-pink-100 text-pink-800",
    other: "bg-gray-100 text-gray-800"
  };

  const ProductCard = ({ item, isPending = false }) => {
    const name = isPending ? item.suggested_item_name : item.item_name;
    const category = isPending ? item.suggested_category : item.category;
    const cache = isPending ? item.suggested_cache_type : item.cache_type;
    const description = isPending ? item.suggested_description : item.description;
    const price = isPending ? item.suggested_price_cents : item.price_cents;
    const image = isPending ? item.suggested_image_url : item.image_url;
    const link = isPending ? item.suggested_affiliate_link : item.affiliate_link;
    const family = isPending ? item.suggested_family_member_types : item.family_member_types;

    const missingData = [];
    if (!link) missingData.push("Link");
    if (!price || price === 0) missingData.push("Price");
    if (!image) missingData.push("Image");
    if (!description) missingData.push("Description");

    return (
      <Card className={missingData.length > 0 ? "border-orange-300" : ""}>
        <CardContent className="p-4">
          {image && (
            <img src={image} alt={name} className="w-full h-32 object-cover rounded mb-3" />
          )}
          
          <h3 className="font-semibold text-gray-900 mb-2">{name}</h3>

          <div className="flex gap-1 mb-2 flex-wrap">
            <Badge className={categoryBadgeColor[category]}>{category}</Badge>
            <Badge variant="outline">{cache}</Badge>
            {isPending && item.source_organization && (
              <Badge variant="outline" className="bg-blue-50">{item.source_organization}</Badge>
            )}
          </div>

          {family?.length > 0 && (
            <div className="flex gap-1 mb-2 flex-wrap">
              {family.map(type => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type === 'person' ? '👤' : type === 'dog' ? '🐕' : type === 'cat' ? '🐈' : type === 'bird' ? '🐦' : '🐾'} {type}
                </Badge>
              ))}
            </div>
          )}

          {description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{description}</p>
          )}

          <div className="flex items-center gap-2 mb-3 text-sm">
            {price > 0 ? (
              <div className="flex items-center gap-1 text-green-600 font-bold">
                <DollarSign className="w-4 h-4" />
                {(price / 100).toFixed(2)}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-500">
                <AlertCircle className="w-4 h-4" />
                No price
              </div>
            )}
            {link ? (
              <div className="flex items-center gap-1 text-blue-600">
                <LinkIcon className="w-4 h-4" />
                <span className="text-xs">Has link</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">No link</span>
              </div>
            )}
          </div>

          {missingData.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded px-2 py-1 mb-3">
              <p className="text-xs text-orange-700">Missing: {missingData.join(", ")}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={() => openEditDialog(item, isPending)} size="sm" className="flex-1">
              <Pencil className="w-3 h-3 mr-1" />
              Edit
            </Button>
            {isPending ? (
              <Button onClick={() => handleRejectSuggestion(item.id)} variant="outline" size="sm">
                <X className="w-3 h-3" />
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => handleToggleActive(item)} 
                  variant="outline" 
                  size="sm"
                  title={item.active ? "Deactivate" : "Activate"}
                >
                  {item.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </Button>
                <Button onClick={() => handleDelete(item.id)} variant="outline" size="sm" className="text-red-600">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Product Management</h1>
              <p className="text-blue-100 mt-1">Manage product recommendations and suggestions</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={openCreateDialog} className="bg-white text-blue-600 hover:bg-blue-50">
                <Plus className="w-4 h-4 mr-2" />
                New Product
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-blue-500 border-blue-400 text-white placeholder:text-blue-200"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-md bg-blue-500 border-blue-400 text-white"
            >
              <option value="all">All Categories</option>
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
            <select
              value={cacheFilter}
              onChange={(e) => setCacheFilter(e.target.value)}
              className="px-3 py-2 rounded-md bg-blue-500 border-blue-400 text-white"
            >
              <option value="all">All Cache Types</option>
              <option value="go_bag">Go Bag</option>
              <option value="automobile">Automobile</option>
              <option value="general">General</option>
            </select>
            <Button
              onClick={() => setShowMissingData(!showMissingData)}
              variant={showMissingData ? "default" : "outline"}
              className={showMissingData ? "bg-orange-500" : "bg-blue-500 border-blue-400 text-white hover:bg-blue-400"}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Missing Data
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <Button onClick={handleCheckLinks} variant="outline" size="sm" className="bg-blue-500 border-blue-400 text-white hover:bg-blue-400">
              <RefreshCw className="w-3 h-3 mr-1" />
              Check Links
            </Button>
            <Button onClick={handleConvertExisting} variant="outline" size="sm" className="bg-blue-500 border-blue-400 text-white hover:bg-blue-400">
              Import Existing
            </Button>
            <Button onClick={handleGeneratePlaceholders} variant="outline" size="sm" className="bg-blue-500 border-blue-400 text-white hover:bg-blue-400">
              Generate Placeholders
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">Active ({activeProducts.length})</TabsTrigger>
            <TabsTrigger value="inactive">Inactive ({inactiveProducts.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Suggestions ({pendingSuggestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProducts.map(product => (
                <ProductCard key={product.id} item={product} />
              ))}
            </div>
            {activeProducts.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600">No active products found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="inactive" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveProducts.map(product => (
                <ProductCard key={product.id} item={product} />
              ))}
            </div>
            {inactiveProducts.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600">No inactive products</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingSuggestions.map(suggestion => (
                <ProductCard key={suggestion.id} item={suggestion} isPending />
              ))}
            </div>
            {pendingSuggestions.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600">No pending suggestions</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? (editingProduct.isSuggestion ? "Approve & Edit Suggestion" : "Edit Product") : "Create Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="col-span-2">
              <Label>Product Name *</Label>
              <Input
                value={editForm.item_name || ""}
                onChange={(e) => setEditForm({...editForm, item_name: e.target.value})}
                placeholder="e.g., Emergency Water Bottles (24-pack)"
              />
            </div>
            <div>
              <Label>Category *</Label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={editForm.category || ""}
                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
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
                value={editForm.cache_type || ""}
                onChange={(e) => setEditForm({...editForm, cache_type: e.target.value})}
              >
                <option value="go_bag">Go Bag</option>
                <option value="automobile">Automobile</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={editForm.quantity || 1}
                onChange={(e) => setEditForm({...editForm, quantity: parseInt(e.target.value) || 1})}
              />
            </div>
            <div>
              <Label>Price (cents)</Label>
              <Input
                type="number"
                value={editForm.price_cents || 0}
                onChange={(e) => setEditForm({...editForm, price_cents: parseInt(e.target.value) || 0})}
                placeholder="e.g., 1999 for $19.99"
              />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description || ""}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                rows={3}
                placeholder="Detailed product description"
              />
            </div>
            <div className="col-span-2">
              <Label>Image URL</Label>
              <Input
                value={editForm.image_url || ""}
                onChange={(e) => setEditForm({...editForm, image_url: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div className="col-span-2">
              <Label>Affiliate Link</Label>
              <Input
                value={editForm.affiliate_link || ""}
                onChange={(e) => setEditForm({...editForm, affiliate_link: e.target.value})}
                placeholder="https://amazon.com/..."
              />
            </div>
            <div className="col-span-2">
              <Label>Recommended For (Multi-select) *</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {[
                  { value: 'person', label: '👤 Person', color: 'bg-blue-50 border-blue-300 text-blue-700' },
                  { value: 'dog', label: '🐕 Dog', color: 'bg-green-50 border-green-300 text-green-700' },
                  { value: 'cat', label: '🐈 Cat', color: 'bg-green-50 border-green-300 text-green-700' },
                  { value: 'bird', label: '🐦 Bird', color: 'bg-green-50 border-green-300 text-green-700' },
                  { value: 'other', label: '🐾 Other', color: 'bg-green-50 border-green-300 text-green-700' }
                ].map(({ value, label, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleFamilyMemberType(value)}
                    className={`px-3 py-2 rounded border-2 text-sm transition-all ${
                      editForm.family_member_types?.includes(value)
                        ? `${color} border-current font-medium`
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                    {editForm.family_member_types?.includes(value) && (
                      <div className="text-center mt-1">✓</div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pet products only show to users with those pets
              </p>
            </div>
            <div>
              <Label>Priority (0-100)</Label>
              <Input
                type="number"
                value={editForm.priority || 0}
                onChange={(e) => setEditForm({...editForm, priority: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label>Active</Label>
              <input
                type="checkbox"
                checked={editForm.active || false}
                onChange={(e) => setEditForm({...editForm, active: e.target.checked})}
                className="w-5 h-5"
              />
            </div>
            {editingProduct?.isSuggestion && (
              <>
                <div>
                  <Label>Source Organization</Label>
                  <Input
                    value={editForm.source_organization || ""}
                    onChange={(e) => setEditForm({...editForm, source_organization: e.target.value})}
                    placeholder="e.g., American Red Cross"
                  />
                </div>
                <div>
                  <Label>Admin Notes</Label>
                  <Input
                    value={editForm.admin_notes || ""}
                    onChange={(e) => setEditForm({...editForm, admin_notes: e.target.value})}
                  />
                </div>
              </>
            )}
          </div>
          <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
            {editingProduct ? (editingProduct.isSuggestion ? "Approve & Save" : "Update Product") : "Create Product"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}