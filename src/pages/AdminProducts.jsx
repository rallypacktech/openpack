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

const CATEGORIES = ["water","food","medical","tools","clothing","documents","communication","hygiene","other"];
const CACHE_TYPES = ["go_bag","automobile","general"];
const FAMILY_TYPES = [
  { value: 'person', label: '👤 Person', color: 'bg-blue-50 border-blue-300 text-blue-700' },
  { value: 'dog',    label: '🐕 Dog',    color: 'bg-green-50 border-green-300 text-green-700' },
  { value: 'cat',    label: '🐈 Cat',    color: 'bg-green-50 border-green-300 text-green-700' },
  { value: 'bird',   label: '🐦 Bird',   color: 'bg-green-50 border-green-300 text-green-700' },
  { value: 'other',  label: '🐾 Other',  color: 'bg-green-50 border-green-300 text-green-700' },
];
const CATEGORY_COLORS = {
  water: "bg-blue-100 text-blue-800", food: "bg-green-100 text-green-800",
  medical: "bg-red-100 text-red-800", tools: "bg-gray-100 text-gray-800",
  clothing: "bg-purple-100 text-purple-800", documents: "bg-yellow-100 text-yellow-800",
  communication: "bg-indigo-100 text-indigo-800", hygiene: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-800"
};

const BLANK_FORM = {
  item_name: "", category: "other", cache_type: "general", description: "",
  quantity: 1, price_cents: 0, image_url: "", affiliate_link: "",
  family_member_types: ["person"], fema_regions: [], disaster_types: [],
  priority: 0, active: true, source_organization: "", admin_notes: "",
  stripe_product_id: "", pet_sizes: []
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cacheFilter, setCacheFilter] = useState("all");
  const [showMissingData, setShowMissingData] = useState(false);

  // Edit/create dialog
  const [editDialog, setEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // { record, isSuggestion }
  const [editForm, setEditForm] = useState({ ...BLANK_FORM });

  // View details dialog (suggestions)
  const [viewDetails, setViewDetails] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        base44.entities.ProductRecommendation.list(),
        base44.entities.ProductRecommendationSuggestion.list()
      ]);
      setProducts(p);
      setSuggestions(s);
    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  };

  // ── Dialog helpers ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingItem(null);
    setEditForm({ ...BLANK_FORM });
    setEditDialog(true);
  };

  const openEditProduct = (product) => {
    setEditingItem({ record: product, isSuggestion: false });
    setEditForm({
      item_name: product.item_name || "",
      category: product.category || "other",
      cache_type: product.cache_type || "general",
      description: product.description || "",
      quantity: product.quantity || 1,
      price_cents: product.price_cents || 0,
      image_url: product.image_url || "",
      affiliate_link: product.affiliate_link || "",
      family_member_types: product.family_member_types || [],
      fema_regions: product.fema_regions || [],
      disaster_types: product.disaster_types || [],
      priority: product.priority || 0,
      active: product.active ?? true,
      source_organization: "",
      admin_notes: "",
      stripe_product_id: product.stripe_product_id || "",
      pet_sizes: product.pet_sizes || []
    });
    setEditDialog(true);
  };

  const openEditSuggestion = (suggestion) => {
    setEditingItem({ record: suggestion, isSuggestion: true });
    setEditForm({
      item_name: suggestion.suggested_item_name || "",
      category: suggestion.suggested_category || "other",
      cache_type: suggestion.suggested_cache_type || "general",
      description: suggestion.suggested_description || "",
      quantity: suggestion.suggested_quantity || 1,
      price_cents: suggestion.suggested_price_cents || 0,
      image_url: suggestion.suggested_image_url || "",
      affiliate_link: suggestion.suggested_affiliate_link || "",
      family_member_types: suggestion.suggested_family_member_types || [],
      fema_regions: suggestion.suggested_fema_regions || [],
      disaster_types: suggestion.suggested_disaster_types || [],
      priority: 0,
      active: true,
      source_organization: suggestion.source_organization || "",
      admin_notes: suggestion.admin_notes || "",
      stripe_product_id: "",
      pet_sizes: []
    });
    setEditDialog(true);
  };

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    try {
      if (!editingItem) {
        // Create new product directly
        await base44.entities.ProductRecommendation.create({
          item_name: editForm.item_name,
          category: editForm.category,
          cache_type: editForm.cache_type,
          description: editForm.description,
          quantity: editForm.quantity,
          price_cents: editForm.price_cents,
          image_url: editForm.image_url,
          affiliate_link: editForm.affiliate_link,
          family_member_types: editForm.family_member_types,
          fema_regions: editForm.fema_regions,
          disaster_types: editForm.disaster_types,
          priority: editForm.priority,
          active: editForm.active,
          stripe_product_id: editForm.stripe_product_id,
          pet_sizes: editForm.pet_sizes
        });
      } else if (editingItem.isSuggestion) {
        // Update suggestion fields first, then approve it
        await base44.entities.ProductRecommendationSuggestion.update(editingItem.record.id, {
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
        await base44.functions.invoke('approveSuggestion', { suggestionId: editingItem.record.id });
      } else {
        // Update existing product
        await base44.entities.ProductRecommendation.update(editingItem.record.id, {
          item_name: editForm.item_name,
          category: editForm.category,
          cache_type: editForm.cache_type,
          description: editForm.description,
          quantity: editForm.quantity,
          price_cents: editForm.price_cents,
          image_url: editForm.image_url,
          affiliate_link: editForm.affiliate_link,
          family_member_types: editForm.family_member_types,
          fema_regions: editForm.fema_regions,
          disaster_types: editForm.disaster_types,
          priority: editForm.priority,
          active: editForm.active,
          stripe_product_id: editForm.stripe_product_id,
          pet_sizes: editForm.pet_sizes
        });
      }
      setEditDialog(false);
      await loadData();
    } catch (e) {
      console.error("Error saving:", e);
      alert("Error saving");
    }
  };

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleApproveSuggestion = async (id) => {
    try {
      await base44.functions.invoke('approveSuggestion', { suggestionId: id });
      await loadData();
    } catch (e) { console.error(e); alert("Error approving"); }
  };

  const handleRejectSuggestion = async (id) => {
    try {
      await base44.functions.invoke('rejectSuggestion', { suggestionId: id });
      await loadData();
    } catch (e) { console.error(e); }
  };

  const handleToggleActive = async (product) => {
    try {
      await base44.entities.ProductRecommendation.update(product.id, { active: !product.active });
      await loadData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await base44.entities.ProductRecommendation.delete(id);
      await loadData();
    } catch (e) { console.error(e); alert("Error deleting"); }
  };

  const handleCheckLinks = async () => {
    if (!confirm("Check all affiliate links for changes? This may take a while.")) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('checkAffiliateLinkChanges');
      await loadData();
      alert(`${res.data.suggestions_created} suggestions created from link changes.`);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleConvertExisting = async () => {
    if (!confirm("Convert all existing products to pending suggestions?")) return;
    setLoading(true);
    try {
      await base44.functions.invoke('convertExistingToSuggestions');
      await loadData();
      alert("Products converted to suggestions!");
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleGeneratePlaceholders = async () => {
    if (!confirm("Generate 200+ placeholder suggestions?")) return;
    setLoading(true);
    try {
      await base44.functions.invoke('generatePlaceholderSuggestions');
      await loadData();
      alert("Placeholders created!");
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const toggleFamilyType = (type) => {
    const cur = editForm.family_member_types || [];
    setEditForm({
      ...editForm,
      family_member_types: cur.includes(type) ? cur.filter(t => t !== type) : [...cur, type]
    });
  };

  // ── Filtering ────────────────────────────────────────────────────────────────

  const applyFilters = (items, isSuggestion = false) =>
    items.filter(item => {
      const name     = isSuggestion ? item.suggested_item_name : item.item_name;
      const category = isSuggestion ? item.suggested_category  : item.category;
      const cache    = isSuggestion ? item.suggested_cache_type : item.cache_type;
      const link     = isSuggestion ? item.suggested_affiliate_link : item.affiliate_link;
      const price    = isSuggestion ? item.suggested_price_cents    : item.price_cents;
      return (
        name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter === "all" || category === categoryFilter) &&
        (cacheFilter === "all"    || cache    === cacheFilter) &&
        (!showMissingData || !link || !price || price === 0)
      );
    });

  const pendingSuggestions  = applyFilters(suggestions.filter(s => s.status === "pending"),  true);
  const rejectedSuggestions = applyFilters(suggestions.filter(s => s.status === "rejected"), true);
  const activeProducts      = applyFilters(products.filter(p => p.active));
  const inactiveProducts    = applyFilters(products.filter(p => !p.active));

  // ── Sub-components ──────────────────────────────────────────────────────────

  const MissingBadges = ({ link, price, image, description }) => {
    const missing = [];
    if (!link) missing.push("Link");
    if (!price || price === 0) missing.push("Price");
    if (!image) missing.push("Image");
    if (!description) missing.push("Description");
    if (!missing.length) return null;
    return (
      <div className="bg-orange-50 border border-orange-200 rounded px-2 py-1 mb-3">
        <p className="text-xs text-orange-700">Missing: {missing.join(", ")}</p>
      </div>
    );
  };

  const SuggestionCard = ({ item }) => {
    const missing = [];
    if (!item.suggested_affiliate_link) missing.push("Link");
    if (!item.suggested_price_cents || item.suggested_price_cents === 0) missing.push("Price");
    if (!item.suggested_image_url) missing.push("Image");
    if (!item.suggested_description) missing.push("Description");

    return (
      <Card className={missing.length > 0 ? "border-orange-300" : ""}>
        <CardContent className="p-4">
          {item.suggested_image_url && (
            <img src={item.suggested_image_url} alt={item.suggested_item_name} className="w-full h-32 object-cover rounded mb-3" />
          )}
          <h3 className="font-semibold text-gray-900 mb-2">{item.suggested_item_name}</h3>
          <div className="flex gap-1 mb-2 flex-wrap">
            <Badge className={CATEGORY_COLORS[item.suggested_category]}>{item.suggested_category}</Badge>
            <Badge variant="outline">{item.suggested_cache_type}</Badge>
            {item.source_organization && <Badge variant="outline" className="bg-blue-50 text-blue-700">{item.source_organization}</Badge>}
          </div>
          {item.suggested_family_member_types?.length > 0 && (
            <div className="flex gap-1 mb-2 flex-wrap">
              {item.suggested_family_member_types.map(t => (
                <Badge key={t} variant="outline" className="text-xs">
                  {t === 'person' ? '👤' : t === 'dog' ? '🐕' : t === 'cat' ? '🐈' : t === 'bird' ? '🐦' : '🐾'} {t}
                </Badge>
              ))}
            </div>
          )}
          {item.suggested_description && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.suggested_description}</p>}
          <div className="flex items-center gap-2 mb-3 text-sm">
            {item.suggested_price_cents > 0
              ? <span className="flex items-center gap-1 text-green-600 font-bold"><DollarSign className="w-4 h-4" />{(item.suggested_price_cents / 100).toFixed(2)}</span>
              : <span className="flex items-center gap-1 text-orange-500"><AlertCircle className="w-4 h-4" />No price</span>}
            {item.suggested_affiliate_link
              ? <span className="flex items-center gap-1 text-blue-600"><LinkIcon className="w-4 h-4" /><span className="text-xs">Has link</span></span>
              : <span className="flex items-center gap-1 text-orange-500"><AlertCircle className="w-4 h-4" /><span className="text-xs">No link</span></span>}
          </div>
          {missing.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded px-2 py-1 mb-3">
              <p className="text-xs text-orange-700">Missing: {missing.join(", ")}</p>
            </div>
          )}
          <div className="text-xs text-gray-400 mb-3">By: {item.suggested_by} · Qty: {item.suggested_quantity}</div>
          {item.status === "pending" && (
            <div className="flex gap-2">
              <Button onClick={() => handleApproveSuggestion(item.id)} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                <Check className="w-3 h-3 mr-1" /> Approve
              </Button>
              <Button onClick={() => openEditSuggestion(item)} variant="outline" size="sm">
                <Pencil className="w-3 h-3" />
              </Button>
              <Button onClick={() => setViewDetails(item)} variant="outline" size="sm">
                <Eye className="w-3 h-3" />
              </Button>
              <Button onClick={() => handleRejectSuggestion(item.id)} variant="outline" size="sm" className="text-red-600">
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          {item.status === "rejected" && (
            <div className="flex gap-2">
              <Button onClick={() => handleApproveSuggestion(item.id)} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                <Check className="w-3 h-3 mr-1" /> Approve Anyway
              </Button>
              <Button onClick={() => setViewDetails(item)} variant="outline" size="sm">
                <Eye className="w-3 h-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const ProductCard = ({ item }) => (
    <Card className={(!item.affiliate_link || !item.price_cents || item.price_cents === 0) ? "border-orange-300" : ""}>
      <CardContent className="p-4">
        {item.image_url && <img src={item.image_url} alt={item.item_name} className="w-full h-32 object-cover rounded mb-3" />}
        <h3 className="font-semibold text-gray-900 mb-2">{item.item_name}</h3>
        <div className="flex gap-1 mb-2 flex-wrap">
          <Badge className={CATEGORY_COLORS[item.category]}>{item.category}</Badge>
          <Badge variant="outline">{item.cache_type}</Badge>
        </div>
        {item.family_member_types?.length > 0 && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {item.family_member_types.map(t => (
              <Badge key={t} variant="outline" className="text-xs">
                {t === 'person' ? '👤' : t === 'dog' ? '🐕' : t === 'cat' ? '🐈' : t === 'bird' ? '🐦' : '🐾'} {t}
              </Badge>
            ))}
          </div>
        )}
        {item.description && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>}
        <div className="flex items-center gap-2 mb-3 text-sm">
          {item.price_cents > 0
            ? <span className="flex items-center gap-1 text-green-600 font-bold"><DollarSign className="w-4 h-4" />{(item.price_cents / 100).toFixed(2)}</span>
            : <span className="flex items-center gap-1 text-orange-500"><AlertCircle className="w-4 h-4" />No price</span>}
          {item.affiliate_link
            ? <span className="flex items-center gap-1 text-blue-600"><LinkIcon className="w-4 h-4" /><span className="text-xs">Has link</span></span>
            : <span className="flex items-center gap-1 text-orange-500"><AlertCircle className="w-4 h-4" /><span className="text-xs">No link</span></span>}
        </div>
        <MissingBadges link={item.affiliate_link} price={item.price_cents} image={item.image_url} description={item.description} />
        <div className="flex gap-2">
          <Button onClick={() => openEditProduct(item)} size="sm" className="flex-1">
            <Pencil className="w-3 h-3 mr-1" /> Edit
          </Button>
          <Button onClick={() => handleToggleActive(item)} variant="outline" size="sm" title={item.active ? "Deactivate" : "Activate"}>
            {item.active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Button>
          <Button onClick={() => handleDeleteProduct(item.id)} variant="outline" size="sm" className="text-red-600">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ label }) => (
    <Card><CardContent className="py-12 text-center">
      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p className="text-gray-600">No {label}</p>
    </CardContent></Card>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Product Management</h1>
              <p className="text-blue-100 mt-1">Pending suggestions → Approve to publish · Active/Inactive = live catalog</p>
            </div>
            <Button onClick={openCreate} className="bg-white text-blue-600 hover:bg-blue-50">
              <Plus className="w-4 h-4 mr-2" /> New Product
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-blue-500 border-blue-400 text-white placeholder:text-blue-200"
              />
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-md bg-blue-500 border-blue-400 text-white">
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <select value={cacheFilter} onChange={e => setCacheFilter(e.target.value)}
              className="px-3 py-2 rounded-md bg-blue-500 border-blue-400 text-white">
              <option value="all">All Cache Types</option>
              <option value="go_bag">Go Bag</option>
              <option value="automobile">Automobile</option>
              <option value="general">General</option>
            </select>
            <Button
              onClick={() => setShowMissingData(!showMissingData)}
              className={showMissingData ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-500 border border-blue-400 text-white hover:bg-blue-400"}
            >
              <AlertCircle className="w-4 h-4 mr-2" /> Missing Data
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <Button onClick={handleCheckLinks} variant="outline" size="sm" className="bg-blue-500 border-blue-400 text-white hover:bg-blue-400">
              <RefreshCw className="w-3 h-3 mr-1" /> Check Links
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

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingSuggestions.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeProducts.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive ({inactiveProducts.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedSuggestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingSuggestions.map(s => <SuggestionCard key={s.id} item={s} />)}
            </div>
            {pendingSuggestions.length === 0 && <EmptyState label="pending suggestions" />}
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProducts.map(p => <ProductCard key={p.id} item={p} />)}
            </div>
            {activeProducts.length === 0 && <EmptyState label="active products" />}
          </TabsContent>

          <TabsContent value="inactive" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveProducts.map(p => <ProductCard key={p.id} item={p} />)}
            </div>
            {inactiveProducts.length === 0 && <EmptyState label="inactive products" />}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rejectedSuggestions.map(s => <SuggestionCard key={s.id} item={s} />)}
            </div>
            {rejectedSuggestions.length === 0 && <EmptyState label="rejected suggestions" />}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit / Create Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {!editingItem ? "Create Product" :
               editingItem.isSuggestion ? "Approve & Edit Suggestion" : "Edit Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="col-span-2">
              <Label>Product Name *</Label>
              <Input value={editForm.item_name} onChange={e => setEditForm({...editForm, item_name: e.target.value})} placeholder="e.g., Emergency Water Bottles" />
            </div>
            <div>
              <Label>Category *</Label>
              <select className="w-full border rounded-md px-3 py-2" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <Label>Cache Type *</Label>
              <select className="w-full border rounded-md px-3 py-2" value={editForm.cache_type} onChange={e => setEditForm({...editForm, cache_type: e.target.value})}>
                <option value="go_bag">Go Bag</option>
                <option value="automobile">Automobile</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={editForm.quantity} onChange={e => setEditForm({...editForm, quantity: parseInt(e.target.value) || 1})} />
            </div>
            <div>
              <Label>Price (cents)</Label>
              <Input type="number" value={editForm.price_cents} onChange={e => setEditForm({...editForm, price_cents: parseInt(e.target.value) || 0})} placeholder="e.g., 1999 = $19.99" />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea rows={3} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
            </div>
            <div className="col-span-2">
              <Label>Image URL</Label>
              <Input value={editForm.image_url} onChange={e => setEditForm({...editForm, image_url: e.target.value})} placeholder="https://..." />
            </div>
            <div className="col-span-2">
              <Label>Affiliate Link</Label>
              <Input value={editForm.affiliate_link} onChange={e => setEditForm({...editForm, affiliate_link: e.target.value})} placeholder="https://amazon.com/..." />
            </div>
            {!editingItem?.isSuggestion && (
              <div className="col-span-2">
                <Label>Stripe Product ID</Label>
                <Input value={editForm.stripe_product_id} onChange={e => setEditForm({...editForm, stripe_product_id: e.target.value})} placeholder="prod_..." />
              </div>
            )}
            <div className="col-span-2">
              <Label>Recommended For *</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {FAMILY_TYPES.map(({ value, label, color }) => (
                  <button key={value} type="button" onClick={() => toggleFamilyType(value)}
                    className={`px-3 py-2 rounded border-2 text-sm transition-all ${editForm.family_member_types?.includes(value) ? `${color} border-current font-medium` : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {label}
                    {editForm.family_member_types?.includes(value) && <div className="text-center mt-1">✓</div>}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Pet products only show to users with those pets</p>
            </div>
            {!editingItem?.isSuggestion && (
              <>
                <div>
                  <Label>Priority (0–100)</Label>
                  <Input type="number" value={editForm.priority} onChange={e => setEditForm({...editForm, priority: parseInt(e.target.value) || 0})} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={editForm.active} onChange={e => setEditForm({...editForm, active: e.target.checked})} className="w-5 h-5" />
                  <Label>Active</Label>
                </div>
              </>
            )}
            {editingItem?.isSuggestion && (
              <>
                <div>
                  <Label>Source Organization</Label>
                  <Input value={editForm.source_organization} onChange={e => setEditForm({...editForm, source_organization: e.target.value})} placeholder="e.g., American Red Cross" />
                </div>
                <div>
                  <Label>Admin Notes</Label>
                  <Input value={editForm.admin_notes} onChange={e => setEditForm({...editForm, admin_notes: e.target.value})} />
                </div>
              </>
            )}
          </div>
          <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
            {!editingItem ? "Create Product" : editingItem.isSuggestion ? "Approve & Save as Product" : "Update Product"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewDetails} onOpenChange={() => setViewDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Suggestion Details</DialogTitle></DialogHeader>
          {viewDetails && (
            <div className="space-y-2 text-sm mt-2">
              <div><strong>Item:</strong> {viewDetails.suggested_item_name}</div>
              <div><strong>Category:</strong> {viewDetails.suggested_category}</div>
              <div><strong>Cache Type:</strong> {viewDetails.suggested_cache_type}</div>
              <div><strong>Quantity:</strong> {viewDetails.suggested_quantity}</div>
              {viewDetails.suggested_price_cents > 0 && <div><strong>Price:</strong> ${(viewDetails.suggested_price_cents / 100).toFixed(2)}</div>}
              {viewDetails.suggested_description && <div><strong>Description:</strong> {viewDetails.suggested_description}</div>}
              {viewDetails.suggested_family_member_types?.length > 0 && <div><strong>For:</strong> {viewDetails.suggested_family_member_types.join(", ")}</div>}
              {viewDetails.suggested_disaster_types?.length > 0 && <div><strong>Disaster Types:</strong> {viewDetails.suggested_disaster_types.join(", ")}</div>}
              {viewDetails.suggested_fema_regions?.length > 0 && <div><strong>FEMA Regions:</strong> {viewDetails.suggested_fema_regions.join(", ")}</div>}
              {viewDetails.source_organization && <div><strong>Source:</strong> {viewDetails.source_organization}</div>}
              {viewDetails.suggested_affiliate_link && (
                <div><strong>Link:</strong> <a href={viewDetails.suggested_affiliate_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Product</a></div>
              )}
              <div><strong>Suggested By:</strong> {viewDetails.suggested_by}</div>
              <div><strong>Status:</strong> {viewDetails.status}</div>
              {viewDetails.admin_notes && <div><strong>Admin Notes:</strong> {viewDetails.admin_notes}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}