/* global pendo */
import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Package,
  ExternalLink,
  Search,
  Star,
  CheckCircle2,
} from "lucide-react";
import {
  DownloadResourceButton,
  getPrintableResource,
} from "@/components/manuals/PrintableResources";

const CATEGORY_COLORS = {
  water: "bg-blue-100 text-blue-800",
  food: "bg-green-100 text-green-800",
  medical: "bg-red-100 text-red-800",
  tools: "bg-gray-100 text-gray-800",
  clothing: "bg-purple-100 text-purple-800",
  documents: "bg-yellow-100 text-yellow-800",
  communication: "bg-indigo-100 text-indigo-800",
  hygiene: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-800",
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
  } catch {
    return "Buy Now";
  }
};

export default function Shopping() {
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const [markOwnedDialog, setMarkOwnedDialog] = useState(false);
  const [singleMarkId, setSingleMarkId] = useState(null);
  const [expireDates, setExpireDates] = useState({});
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cacheTypeFilter, setCacheTypeFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allRecs = await base44.entities.ProductRecommendation.filter({
        active: true,
      });
      allRecs.sort(
        (a, b) =>
          (b.priority || 0) - (a.priority || 0) ||
          (b.click_count || 0) - (a.click_count || 0),
      );

      const isAuthed = await base44.auth.isAuthenticated();
      if (isAuthed) {
        const me = await base44.auth.me();
        setUser(me);

        const [profiles, pets, progress] = await Promise.all([
          base44.entities.UserProfile.filter({ created_by: me.email }),
          base44.entities.Pet.filter({ created_by: me.email }),
          base44.entities.UserCacheProgress.filter({ created_by: me.email }),
        ]);

        setUserProgress(progress);

        const userProfile = profiles[0];
        const familyTypes = ["person"];
        const petSizes = new Set();
        pets.forEach((pet) => {
          const t = pet.species.toLowerCase();
          if (!familyTypes.includes(t)) familyTypes.push(t);
          if (pet.size) petSizes.add(pet.size);
        });

        const filtered = allRecs.filter((rec) => {
          if (
            rec.fema_regions?.length > 0 &&
            (!userProfile?.fema_region ||
              !rec.fema_regions.includes(userProfile.fema_region))
          )
            return false;
          if (
            rec.family_member_types?.length > 0 &&
            !rec.family_member_types.some((t) =>
              familyTypes.includes(t.toLowerCase()),
            )
          )
            return false;
          if (
            rec.pet_sizes?.length > 0 &&
            !rec.pet_sizes.some((s) => petSizes.has(s))
          )
            return false;
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

  const progressMap = useMemo(() => {
    const map = {};
    userProgress.forEach((p) => {
      map[p.recommendation_id] = p;
    });
    return map;
  }, [userProgress]);

  const isOwned = (recId) => {
    const p = progressMap[recId];
    return p && (p.status === "purchased" || p.status === "manually_added");
  };

  const requiredItems = recommendations.filter((r) => r.is_required);
  const ownedCount = requiredItems.filter((r) => isOwned(r.id)).length;
  const progressPct =
    requiredItems.length > 0
      ? Math.round((ownedCount / requiredItems.length) * 100)
      : 100;

  const isExpired = (recId) => {
    const p = progressMap[recId];
    return p?.expiration_date && new Date(p.expiration_date) < new Date();
  };

  const handleAffiliateClick = async (rec) => {
    try {
      await base44.functions.invoke("trackAffiliateClick", {
        recommendationId: rec.id,
        productName: rec.item_name,
        affiliateLink: rec.affiliate_link,
      });
    } catch {
      /* best-effort */
    }
    if (typeof pendo !== "undefined") {
      pendo.track("affiliate_link_clicked", {
        product_name: rec.item_name,
        category: rec.category || "",
        cache_type: rec.cache_type || "",
        store_name: getStoreName(rec.affiliate_link),
        price_cents: rec.price_cents || 0,
        is_required_item: !!rec.is_required,
      });
    }
    window.open(rec.affiliate_link, "_blank");
  };

  const openMarkOwned = (recId) => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }
    setSingleMarkId(recId);
    setExpireDates({ [recId]: "" });
    setMarkOwnedDialog(true);
  };

  const confirmMarkOwned = async () => {
    setSaving(true);
    try {
      const recId = singleMarkId;
      const existing = progressMap[recId];
      const data = {
        recommendation_id: recId,
        status: "manually_added",
        purchased_at: new Date().toISOString(),
        ...(expireDates[recId]
          ? { expiration_date: expireDates[recId] }
          : {}),
      };
      if (existing) {
        await base44.entities.UserCacheProgress.update(existing.id, data);
      } else {
        await base44.entities.UserCacheProgress.create(data);
      }
      if (typeof pendo !== "undefined") {
        pendo.track("supply_items_marked_owned", {
          item_count: 1,
          items_with_expiry_count: expireDates[recId] ? 1 : 0,
        });
      }
      setMarkOwnedDialog(false);
      setSingleMarkId(null);
      await loadData();
    } catch (e) {
      console.error("Error marking owned:", e);
    } finally {
      setSaving(false);
    }
  };

  // Single gallery: essential items first, then by priority, then click_count
  const gallery = useMemo(() => {
    const filtered = recommendations.filter((rec) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        rec.item_name.toLowerCase().includes(q) ||
        rec.description?.toLowerCase().includes(q);
      const matchCat =
        categoryFilter === "all" || rec.category === categoryFilter;
      const matchType =
        cacheTypeFilter === "all" || rec.cache_type === cacheTypeFilter;
      return matchSearch && matchCat && matchType;
    });

    filtered.sort((a, b) => {
      if (a.is_required !== b.is_required) return b.is_required ? 1 : -1;
      return (
        (b.priority || 0) - (a.priority || 0) ||
        (b.click_count || 0) - (a.click_count || 0)
      );
    });
    return filtered;
  }, [recommendations, searchTerm, categoryFilter, cacheTypeFilter]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" role="status" aria-label="Loading"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-cream font-sans">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Emergency Supplies</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Essential items shown first — tap any card to buy or mark as owned.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Sign-in CTA for non-authed users */}
        {!user && (
          <div className="bg-white border border-border rounded-lg p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground mb-1">Track your inventory</h2>
              <p className="text-sm text-muted-foreground font-sans">Sign in to mark items as owned, track expiration dates, and monitor your readiness progress over time.</p>
            </div>
            <Button onClick={() => base44.auth.redirectToLogin(window.location.pathname)} className="bg-crimson hover:bg-crimson/90 text-white flex-shrink-0">
              Sign in to track
            </Button>
          </div>
        )}

        {/* Slim essentials progress */}
        {user && requiredItems.length > 0 && (
          <div className="bg-white border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                <span className="text-sm font-semibold text-foreground">
                  Essentials coverage
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {ownedCount}/{requiredItems.length}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${progressPct === 100 ? "bg-green-500" : "bg-crimson"}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search supplies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {[
                  "water", "food", "medical", "tools", "clothing",
                  "documents", "communication", "hygiene", "other",
                ].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={cacheTypeFilter} onValueChange={setCacheTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
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

        {/* Single gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gallery.map((rec) => {
            const owned = isOwned(rec.id);
            const expired = isExpired(rec.id);
            return (
              <Card
                key={rec.id}
                className={`relative ${owned ? "ring-2 ring-green-400" : ""}`}
              >
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
                    <div className="aspect-square w-full mb-3 overflow-hidden rounded-lg bg-secondary">
                      <img
                        src={rec.image_url}
                        alt={rec.item_name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-foreground mb-2 pr-6">
                    {rec.item_name}
                  </h3>
                  <div className="flex gap-1 mb-2 flex-wrap">
                    <Badge className={`text-xs ${CATEGORY_COLORS[rec.category]}`}>
                      {rec.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {rec.cache_type}
                    </Badge>
                    {expired && (
                      <Badge className="text-xs bg-red-100 text-red-700">
                        Expired
                      </Badge>
                    )}
                  </div>
                  {rec.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {rec.description}
                    </p>
                  )}
                  {rec.price_cents > 0 && (
                    <p className="text-xl font-bold text-foreground mb-3">
                      ${(rec.price_cents / 100).toFixed(2)}
                    </p>
                  )}
                  <div className="space-y-2">
                    {getPrintableResource(rec.item_name) && (
                      <DownloadResourceButton
                        itemName={rec.item_name}
                        fullWidth
                      />
                    )}
                    {!owned && user && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-green-700 border-green-300 hover:bg-green-50"
                        onClick={() => openMarkOwned(rec.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" /> I already have this
                      </Button>
                    )}
                    {rec.affiliate_link && (
                      <Button
                        size="sm"
                        className="w-full bg-crimson hover:bg-crimson/90 text-white"
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

        {gallery.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">No products match your filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Mark Owned Dialog ──────────────────────────────────────────── */}
      <Dialog open={markOwnedDialog} onOpenChange={setMarkOwnedDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mark as owned</DialogTitle>
          </DialogHeader>
          {singleMarkId && (() => {
            const rec = recommendations.find((r) => r.id === singleMarkId);
            return rec ? (
              <>
                <p className="text-sm text-muted-foreground mb-4 font-sans">
                  <span className="font-semibold text-foreground">{rec.item_name}</span>
                  <br />
                  Optionally add an expiration date so we can remind you before it expires.
                </p>
                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-3">
                    <Label className="text-xs text-muted-foreground">
                      Expiration date (optional)
                    </Label>
                    <Input
                      type="date"
                      value={expireDates[singleMarkId] || ""}
                      onChange={(e) =>
                        setExpireDates((p) => ({ ...p, [singleMarkId]: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setMarkOwnedDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmMarkOwned}
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {saving ? "Saving..." : "Confirm — I have this"}
                  </Button>
                </div>
              </>
            ) : null;
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}