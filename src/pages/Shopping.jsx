import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Package, ExternalLink, Search, Filter, Info } from "lucide-react";

export default function Shopping() {
  const [recommendations, setRecommendations] = useState([]);
  const [caches, setCaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cacheTypeFilter, setCacheTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [cart, setCart] = useState({});
  const [showDescriptions, setShowDescriptions] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const isAuthed = await base44.auth.isAuthenticated();

      // Always load all active recommendations (public)
      const allRecs = await base44.entities.ProductRecommendation.filter({ active: true });
      allRecs.sort((a, b) => (b.click_count || 0) - (a.click_count || 0) || (b.view_count || 0) - (a.view_count || 0));

      if (isAuthed) {
        const user = await base44.auth.me();
        const [cachesResponse, profiles, pets] = await Promise.all([
          base44.functions.invoke('getCaches'),
          base44.entities.UserProfile.filter({ created_by: user.email }),
          base44.entities.Pet.filter({ created_by: user.email })
        ]);

        const userProfile = profiles[0];
        const familyTypes = ['person'];
        const petSizes = new Set();
        pets.forEach(pet => {
          const petType = pet.species.toLowerCase();
          if (!familyTypes.includes(petType)) familyTypes.push(petType);
          if (pet.size) petSizes.add(pet.size);
        });

        const filteredRecs = allRecs.filter(rec => {
          if (rec.fema_regions && rec.fema_regions.length > 0) {
            if (!userProfile || !userProfile.fema_region || !rec.fema_regions.includes(userProfile.fema_region)) return false;
          }
          if (rec.family_member_types && rec.family_member_types.length > 0) {
            const hasMatch = rec.family_member_types.some(type => familyTypes.includes(type.toLowerCase()));
            if (!hasMatch) return false;
          }
          if (rec.pet_sizes && rec.pet_sizes.length > 0) {
            const hasSizeMatch = rec.pet_sizes.some(size => petSizes.has(size));
            if (!hasSizeMatch) return false;
          }
          return true;
        });

        setRecommendations(filteredRecs);
        setCaches(cachesResponse.data.caches);
      } else {
        // Show all recommendations to unauthenticated users
        setRecommendations(allRecs);
        setCaches([]);
      }
    } catch (error) {
      console.error("Error loading shopping data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (rec, cacheId) => {
    setCart(prev => ({
      ...prev,
      [rec.id]: { recommendation: rec, cacheId }
    }));
  };

  const removeFromCart = (recId) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[recId];
      return newCart;
    });
  };

  const handleCheckout = async () => {
    const items = Object.values(cart);
    if (items.length === 0) return;

    const cacheId = items[0].cacheId;
    const recIds = items.map(item => item.recommendation.id);

    const response = await base44.functions.invoke('createCheckoutSession', {
      cache_id: cacheId,
      recommendation_ids: recIds
    });

    if (response.data.url) {
      window.location.href = response.data.url;
    }
  };

  const sourceOrgs = [...new Set(recommendations.map(r => r.source_organization).filter(Boolean))].sort();

  const normalizeOrg = (val) => {
    if (!val) return "";
    if (val.toLowerCase().includes("red cross")) return "Red Cross";
    return val;
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesSearch = rec.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || rec.category === categoryFilter;
    const matchesCacheType = cacheTypeFilter === "all" || rec.cache_type === cacheTypeFilter;
    const matchesSource = sourceFilter === "all" || normalizeOrg(rec.source_organization) === sourceFilter;
    return matchesSearch && matchesCategory && matchesCacheType && matchesSource;
  });

  const categoryColors = {
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

  const getStoreName = (url) => {
    if (!url) return "Partner Site";
    try {
      const domain = new URL(url).hostname.toLowerCase();
      if (domain.includes('amazon') || domain.includes('amzn')) return "Amazon";
      if (domain.includes('target')) return "Target";
      if (domain.includes('walmart')) return "Walmart";
      if (domain.includes('rei')) return "REI";
      if (domain.includes('homedepot')) return "Home Depot";
      if (domain.includes('lowes')) return "Lowe's";
      if (domain.includes('costco')) return "Costco";
      if (domain.includes('chewy')) return "Chewy";
      if (domain.includes('petco')) return "Petco";
      if (domain.includes('petsmart')) return "PetSmart";
      return "Partner Site";
    } catch {
      return "Partner Site";
    }
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Shop Emergency Supplies</h1>
              <p className="text-blue-100 mt-1">Browse and purchase recommended items for your emergency caches</p>
            </div>
            {Object.keys(cart).length > 0 && (
              <Button onClick={handleCheckout} className="bg-white text-blue-600 hover:bg-blue-50">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Checkout ({Object.keys(cart).length})
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2 lg:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="tools">Tools</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="documents">Documents</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="hygiene">Hygiene</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cacheTypeFilter} onValueChange={setCacheTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Cache Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="go_bag">Go Bag</SelectItem>
                <SelectItem value="automobile">Automobile</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            {sourceOrgs.length > 0 && (
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Source Org" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {[...new Set(sourceOrgs.map(normalizeOrg))].map(org => (
                    <SelectItem key={org} value={org}>{org}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((rec) => (
            <Card key={rec.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {rec.image_url && (
                  <div className="aspect-square w-full mb-4 overflow-hidden rounded-lg">
                    <img 
                      src={rec.image_url} 
                      alt={rec.item_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg flex-1">{rec.item_name}</h3>
                  {rec.description && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => setShowDescriptions({...showDescriptions, [rec.id]: !showDescriptions[rec.id]})}
                    >
                      <Info className="w-4 h-4 text-gray-400" />
                    </Button>
                  )}
                </div>
                
                {showDescriptions[rec.id] && rec.description && (
                  <p className="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded">{rec.description}</p>
                )}
                
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Badge className={categoryColors[rec.category]}>
                    {rec.category}
                  </Badge>
                  <Badge variant="outline">{rec.cache_type}</Badge>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-green-600">
                    ${(rec.price_cents / 100).toFixed(2)}
                  </span>
                  {rec.quantity > 1 && (
                    <span className="text-sm text-gray-500">Qty: {rec.quantity}</span>
                  )}
                </div>

                <div className="space-y-2">
                  {caches.length > 0 && (
                    cart[rec.id] ? (
                      <div className="space-y-2">
                        <Select value={cart[rec.id].cacheId} onValueChange={(val) => addToCart(rec, val)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cache" />
                          </SelectTrigger>
                          <SelectContent>
                            {caches.map(cache => (
                              <SelectItem key={cache.id} value={cache.id}>
                                {cache.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={() => removeFromCart(rec.id)} variant="outline" className="w-full">
                          Remove from Cache
                        </Button>
                      </div>
                    ) : (
                      <Select onValueChange={(cacheId) => addToCart(rec, cacheId)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add to cache..." />
                        </SelectTrigger>
                        <SelectContent>
                          {caches.map(cache => (
                            <SelectItem key={cache.id} value={cache.id}>
                              {cache.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  )}
                  {rec.affiliate_link && (
                    <Button
                      onClick={async () => {
                        try {
                          await base44.functions.invoke('trackAffiliateClick', {
                            recommendationId: rec.id,
                            productName: rec.item_name,
                            affiliateLink: rec.affiliate_link
                          });
                        } catch {
                          // tracking is best-effort for unauthenticated users
                        }
                        window.open(rec.affiliate_link, '_blank');
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on {getStoreName(rec.affiliate_link)}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecommendations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600">No products found matching your filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}