import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ShoppingCart, Package, ExternalLink, Search, Star, CheckCircle2,
  Circle, AlertTriangle, ChevronDown, ChevronUp, Info
} from "lucide-react";

const CATEGORY_COLORS = {
  water: "bg-blue-100 text-blue-800", food: "bg-green-100 text-green-800",
  medical: "bg-red-100 text-red-800", tools: "bg-gray-100 text-gray-800",
  clothing: "bg-purple-100 text-purple-800", documents: "bg-yellow-100 text-yellow-800",
  communication: "bg-indigo-100 text-indigo-800", hygiene: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-800"
};

const getStoreName = (url) => {
  if (!url) return "Buy Now";
  try {
    const domain = new URL(url).hostname.toLowerCase();
    if (domain.includes("amazon") || domain.includes("amzn")) return "Amazon";
    if (domain.includes("target")) return "Target";
    if (domain.includes("walmart")) return "Walmart";
    if (domain.includes("rei")) return "REI";
    if (domain.includes("homedepot")) return "Home Depot";
    if (domain.includes("chewy")) return "Chewy";
    if (domain.includes("petco")) return "Petco";
    return "Buy Now";
  } catch { return "Buy Now"; }
};

export default function Shopping() {
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [userProgress, setUserProgress] = useState([]); // UserCacheProgress records
  const [loading, setLoading] = useState(true);

  // Checklist state
  const [checklistOpen, setChecklistOpen] = useState(true);
  const [selected, setSelected] = useState(new Set()); // rec IDs selected in checklist
  const [markOwnedDialog, setMarkOwnedDialog] = useState(false);
  const [expireDates, setExpireDates] = useState({}); // recId -> date string
  const [saving, setSaving] = useState(false);

  // Browse state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cacheTypeFilter, setCacheTypeFilter] = useState("all");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allRecs = await base44.entities.ProductRecommendation.filter({ active: true });
      allRecs.sort((a, b) => (b.priority || 0) - (a.priority || 0) || (b.click_count || 0) - (a.click_count || 0));

      const isAuthed = await base44.auth.isAuthenticated();
      if (isAuthed) {
        const me = await base44.auth.me();
        setUser(me);

        const [profiles, pets, progress] = await Promise.all([
          base44.entities.UserProfile.filter({ created_by: me.email }),
          base44.entities.Pet.filter({ created_by: me.email }),
          base44.entities.UserCacheProgress.filter({ created_by: me.email })
        ]);

        setUserProgress(progress);

        const userProfile = profiles[0];
        const familyTypes = ["person"];
        const petSizes = new Set();
        pets.forEach(pet => {
          const t = pet.species.toLowerCase();
          if (!familyTypes.includes(t)) familyTypes.push(t);
          if (pet.size) petSizes.add(pet.size);
        });

        const filtered = allRecs.filter(rec => {
          if (rec.fema_regions?.length > 0 && (!userProfile?.fema_region || !rec.fema_regions.includes(userProfile.fema_region))) return false;
          if (rec.family_member_types?.length > 0 && !rec.family_member_types.some(t => familyTypes.includes(t.toLowerCase()))) return false;
          if (rec.pet_sizes?.length > 0 && !rec.pet_sizes.some(s => petSizes.has(s))) return false;
          return true;
        });
        setRecommendations(filtered);
      } else {
        setRecommendations(allRecs);
      }
    } catch (e) {
      console.error("Error loading shopping data:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- helpers ---
  const progressMap = {}; // recId -> UserCacheProgress record
  userProgress.forEach(p => { progressMap[p.recommendation_id] = p; });

  const isOwned = (recId) => {
    const p = progressMap[recId];
    return p && (p.status === "purchased" || p.status === "manually_added");
  };

  const requiredItems = recommendations.filter(r => r.is_required);
  const ownedCount = requiredItems.filter(r => isOwned(r.id)).length;
  const progressPct = requiredItems.length > 0 ? Math.round((ownedCount / requiredItems.length) * 100) : 100;

  const toggleSelected = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const selectAllMissing = () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }
    const missing = requiredItems.filter(r => !isOwned(r.id)).map(r => r.id);
    setSelected(new Set(missing));
  };

  const openMarkOwned = () => {
    const initial = {};
    selected.forEach(id => { initial[id] = ""; });
    setExpireDates(initial);
    setMarkOwnedDialog(true);
  };

  const confirmMarkOwned = async () => {
    setSaving(true);
    try {
      for (const recId of Array.from(selected)) {
        const existing = progressMap[recId];
        const data = {
          recommendation_id: recId,
          status: "manually_added",
          purchased_at: new Date().toISOString(),
          ...(expireDates[recId] ? { expiration_date: expireDates[recId] } : {})
        };
        if (existing) {
          await base44.entities.UserCacheProgress.update(existing.id, data);
        } else {
          await base44.entities.UserCacheProgress.create(data);
        }
      }
      setMarkOwnedDialog(false);
      setSelected(new Set());
      await loadData();
    } catch (e) {
      console.error("Error marking owned:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleAffiliateClick = async (rec) => {
    try {
      await base44.functions.invoke("trackAffiliateClick", {
        recommendationId: rec.id,
        productName: rec.item_name,
        affiliateLink: rec.affiliate_link
      });
    } catch { /* best-effort */ }
    window.open(rec.affiliate_link, "_blank");
  };

  // Browse filters
  const browsed = recommendations.filter(rec => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || rec.item_name.toLowerCase().includes(q) || rec.description?.toLowerCase().includes(q);
    const matchCat = categoryFilter === "all" || rec.category === categoryFilter;
    const matchType = cacheTypeFilter === "all" || rec.cache_type === cacheTypeFilter;
    return matchSearch && matchCat && matchType;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Emergency Supply Checklist</h1>
          <p className="text-blue-200 mt-1">Build your go-bag one step at a time</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">

        {/* ── Required Items Checklist ─────────────────────────────────── */}
        {requiredItems.length > 0 && (
          <section>
            {/* Progress */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                  <span className="font-semibold text-gray-900">Essential Items ({ownedCount}/{requiredItems.length} covered)</span>
                </div>
                <button
                  onClick={() => setChecklistOpen(o => !o)}
                  className="text-sm text-blue-600 flex items-center gap-1"
                >
                  {checklistOpen ? <><ChevronUp className="w-4 h-4" /> Collapse</> : <><ChevronDown className="w-4 h-4" /> Expand</>}
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${progressPct === 100 ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {progressPct === 100 && (
                <p className="text-green-700 text-sm mt-2 font-medium">✓ All essential items covered — great work!</p>
              )}
            </div>

            {/* Checklist rows */}
            {checklistOpen && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllMissing}>Select all missing</Button>
                    {selected.size > 0 && (
                      <Button size="sm" onClick={openMarkOwned} className="bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> I have {selected.size} item{selected.size !== 1 ? "s" : ""}
                      </Button>
                    )}
                  </div>
                  {selected.size > 0 && (
                    <button onClick={() => setSelected(new Set())} className="text-sm text-gray-400 hover:text-gray-600">Clear</button>
                  )}
                </div>

                {requiredItems.map((rec, i) => {
                  const owned = isOwned(rec.id);
                  const progress = progressMap[rec.id];
                  const isChecked = selected.has(rec.id);
                  const isExpired = progress?.expiration_date && new Date(progress.expiration_date) < new Date();
                  const isExpiringSoon = progress?.expiration_date && !isExpired &&
                    new Date(progress.expiration_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                  return (
                    <div
                      key={rec.id}
                      className={`flex items-center gap-3 px-4 py-3 border-b last:border-b-0 ${
                        owned ? "bg-green-50" : "hover:bg-gray-50"
                      } ${i % 2 === 0 && !owned ? "bg-white" : ""}`}
                    >
                      {/* Checkbox */}
                      {!owned && (
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleSelected(rec.id)}
                          className="flex-shrink-0"
                        />
                      )}
                      {owned && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}

                      {/* Item info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium ${owned ? "text-gray-500 line-through" : "text-gray-900"}`}>
                            {rec.item_name}
                          </span>
                          <Badge className={`text-xs ${CATEGORY_COLORS[rec.category]}`}>{rec.category}</Badge>
                          <Badge variant="outline" className="text-xs">{rec.cache_type}</Badge>
                          {isExpired && (
                            <Badge className="text-xs bg-red-100 text-red-700">
                              <AlertTriangle className="w-3 h-3 mr-1" />Expired
                            </Badge>
                          )}
                          {isExpiringSoon && !isExpired && (
                            <Badge className="text-xs bg-orange-100 text-orange-700">Expiring soon</Badge>
                          )}
                        </div>
                        {progress?.expiration_date && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Expires: {new Date(progress.expiration_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {rec.affiliate_link && !owned && (
                          <button
                            onClick={() => handleAffiliateClick(rec)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{getStoreName(rec.affiliate_link)}</span>
                          </button>
                        )}
                        {rec.price_cents > 0 && (
                          <span className="text-sm font-semibold text-gray-700">
                            ${(rec.price_cents / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── Browse All Products ──────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Browse All Products</h2>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {["water","food","medical","tools","clothing","documents","communication","hygiene","other"].map(c => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={cacheTypeFilter} onValueChange={setCacheTypeFilter}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="go_bag">Go Bag</SelectItem>
                  <SelectItem value="automobile">Automobile</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="first_aid_kit">First Aid Kit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {browsed.map(rec => {
              const owned = isOwned(rec.id);
              return (
                <Card key={rec.id} className={`relative ${owned ? "ring-2 ring-green-400" : ""}`}>
                  {rec.is_required && (
                    <div className="absolute top-2 left-2 z-10">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                    </div>
                  )}
                  {owned && (
                    <div className="absolute top-2 right-2 z-10">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    {rec.image_url && (
                      <div className="aspect-square w-full mb-3 overflow-hidden rounded-lg">
                        <img src={rec.image_url} alt={rec.item_name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-900 mb-2 pr-6">{rec.item_name}</h3>
                    <div className="flex gap-1 mb-2 flex-wrap">
                      <Badge className={`text-xs ${CATEGORY_COLORS[rec.category]}`}>{rec.category}</Badge>
                      <Badge variant="outline" className="text-xs">{rec.cache_type}</Badge>
                    </div>
                    {rec.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{rec.description}</p>
                    )}
                    {rec.price_cents > 0 && (
                      <p className="text-xl font-bold text-gray-900 mb-3">${(rec.price_cents / 100).toFixed(2)}</p>
                    )}
                    <div className="space-y-2">
                      {!owned && user && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-green-700 border-green-300 hover:bg-green-50"
                          onClick={() => {
                            setSelected(new Set([rec.id]));
                            setExpireDates({ [rec.id]: "" });
                            setMarkOwnedDialog(true);
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> I already have this
                        </Button>
                      )}
                      {rec.affiliate_link && (
                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleAffiliateClick(rec)}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          {getStoreName(rec.affiliate_link)}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {browsed.length === 0 && (
            <Card><CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No products match your filters</p>
            </CardContent></Card>
          )}
        </section>
      </div>

      {/* ── Mark Owned Dialog ──────────────────────────────────────────── */}
      <Dialog open={markOwnedDialog} onOpenChange={setMarkOwnedDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mark items as owned</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 mb-4">
            Optionally add an expiration date for perishable items so we can remind you before they expire.
          </p>
          <div className="space-y-4">
            {Array.from(selected).map(recId => {
              const rec = recommendations.find(r => r.id === recId);
              if (!rec) return null;
              return (
                <div key={recId} className="border rounded-lg p-3">
                  <p className="font-medium text-sm text-gray-900 mb-2">{rec.item_name}</p>
                  <Label className="text-xs text-gray-500">Expiration date (optional)</Label>
                  <Input
                    type="date"
                    value={expireDates[recId] || ""}
                    onChange={e => setExpireDates(p => ({ ...p, [recId]: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setMarkOwnedDialog(false)} className="flex-1">Cancel</Button>
            <Button onClick={confirmMarkOwned} disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700">
              {saving ? "Saving..." : "Confirm — I have these"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}