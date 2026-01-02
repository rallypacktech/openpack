import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, Pencil, Eye, Package, RefreshCw } from "lucide-react";

export default function AdminProductSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [viewDetails, setViewDetails] = useState(null);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const data = await base44.entities.ProductRecommendationSuggestion.list();
      setSuggestions(data);
    } catch (error) {
      console.error("Error loading suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (suggestionId) => {
    try {
      await base44.functions.invoke('approveSuggestion', { suggestionId });
      await loadSuggestions();
    } catch (error) {
      console.error("Error approving:", error);
      alert("Error approving suggestion");
    }
  };

  const handleReject = async (suggestionId) => {
    try {
      await base44.functions.invoke('rejectSuggestion', { suggestionId });
      await loadSuggestions();
    } catch (error) {
      console.error("Error rejecting:", error);
      alert("Error rejecting suggestion");
    }
  };

  const handleEdit = (suggestion) => {
    setEditingId(suggestion.id);
    setEditForm({
      suggested_item_name: suggestion.suggested_item_name,
      suggested_category: suggestion.suggested_category,
      suggested_cache_type: suggestion.suggested_cache_type,
      suggested_description: suggestion.suggested_description,
      suggested_quantity: suggestion.suggested_quantity,
      suggested_price_cents: suggestion.suggested_price_cents,
      suggested_image_url: suggestion.suggested_image_url,
      suggested_affiliate_link: suggestion.suggested_affiliate_link,
      admin_notes: suggestion.admin_notes || ""
    });
  };

  const handleSaveEdit = async () => {
    try {
      await base44.entities.ProductRecommendationSuggestion.update(editingId, editForm);
      setEditingId(null);
      await loadSuggestions();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving changes");
    }
  };

  const handleConvertExisting = async () => {
    if (!confirm("This will create pending suggestions from all existing product recommendations. Continue?")) {
      return;
    }
    setLoading(true);
    try {
      await base44.functions.invoke('convertExistingToSuggestions');
      await loadSuggestions();
      alert("Existing products converted to pending suggestions!");
    } catch (error) {
      console.error("Error converting:", error);
      alert("Error converting existing products");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlaceholders = async () => {
    if (!confirm("This will create 200+ placeholder suggestions from emergency preparedness organizations. Continue?")) {
      return;
    }
    setLoading(true);
    try {
      await base44.functions.invoke('generatePlaceholderSuggestions');
      await loadSuggestions();
      alert("Placeholder suggestions created!");
    } catch (error) {
      console.error("Error generating placeholders:", error);
      alert("Error generating placeholder suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckLinks = async () => {
    if (!confirm("This will check all affiliate links for changes using the LLM. This may take a while and consume credits. Continue?")) {
      return;
    }
    setLoading(true);
    try {
      const response = await base44.functions.invoke('checkAffiliateLinkChanges');
      await loadSuggestions();
      alert(`Check complete! ${response.data.suggestions_created} new suggestions created.`);
    } catch (error) {
      console.error("Error checking links:", error);
      alert("Error checking affiliate links");
    } finally {
      setLoading(false);
    }
  };

  const filteredSuggestions = suggestions.filter(s => s.status === activeTab);

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
              <h1 className="text-2xl font-bold">Product Suggestions</h1>
              <p className="text-blue-100 mt-1">Review and approve product recommendations</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCheckLinks} variant="outline" className="bg-white text-blue-600">
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Links
              </Button>
              <Button onClick={handleConvertExisting} variant="outline" className="bg-white text-blue-600">
                Import Existing
              </Button>
              <Button onClick={handleGeneratePlaceholders} variant="outline" className="bg-white text-blue-600">
                Generate Placeholders
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({suggestions.filter(s => s.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({suggestions.filter(s => s.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({suggestions.filter(s => s.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardContent className="p-4">
                    {suggestion.suggested_image_url && (
                      <img 
                        src={suggestion.suggested_image_url} 
                        alt={suggestion.suggested_item_name}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                    )}
                    
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {suggestion.suggested_item_name}
                    </h3>

                    <div className="flex gap-1 mb-3 flex-wrap">
                      <Badge className={categoryBadgeColor[suggestion.suggested_category]}>
                        {suggestion.suggested_category}
                      </Badge>
                      <Badge variant="outline">{suggestion.suggested_cache_type}</Badge>
                      {suggestion.source_organization && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {suggestion.source_organization}
                        </Badge>
                      )}
                    </div>

                    {suggestion.suggested_family_member_types?.length > 0 && (
                      <div className="text-xs text-gray-600 mb-2">
                        <strong>For:</strong> {suggestion.suggested_family_member_types.join(", ")}
                      </div>
                    )}

                    {suggestion.suggested_description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {suggestion.suggested_description}
                      </p>
                    )}

                    {suggestion.suggested_price_cents > 0 && (
                      <p className="text-lg font-bold text-green-600 mb-3">
                        ${(suggestion.suggested_price_cents / 100).toFixed(2)}
                      </p>
                    )}

                    <div className="text-xs text-gray-500 mb-3">
                      Qty: {suggestion.suggested_quantity} | By: {suggestion.suggested_by}
                    </div>

                    {activeTab === "pending" && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleApprove(suggestion.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleEdit(suggestion)}
                          variant="outline"
                          size="sm"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => setViewDetails(suggestion)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => handleReject(suggestion.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSuggestions.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600">No {activeTab} suggestions</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editingId !== null} onOpenChange={() => setEditingId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Suggestion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Item Name</Label>
              <Input
                value={editForm.suggested_item_name || ""}
                onChange={(e) => setEditForm({...editForm, suggested_item_name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={editForm.suggested_category || ""}
                  onChange={(e) => setEditForm({...editForm, suggested_category: e.target.value})}
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
                <Label>Cache Type</Label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={editForm.suggested_cache_type || ""}
                  onChange={(e) => setEditForm({...editForm, suggested_cache_type: e.target.value})}
                >
                  <option value="go_bag">Go Bag</option>
                  <option value="automobile">Automobile</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editForm.suggested_description || ""}
                onChange={(e) => setEditForm({...editForm, suggested_description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={editForm.suggested_quantity || 1}
                  onChange={(e) => setEditForm({...editForm, suggested_quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <Label>Price (cents)</Label>
                <Input
                  type="number"
                  value={editForm.suggested_price_cents || 0}
                  onChange={(e) => setEditForm({...editForm, suggested_price_cents: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={editForm.suggested_image_url || ""}
                onChange={(e) => setEditForm({...editForm, suggested_image_url: e.target.value})}
              />
            </div>
            <div>
              <Label>Affiliate Link</Label>
              <Input
                value={editForm.suggested_affiliate_link || ""}
                onChange={(e) => setEditForm({...editForm, suggested_affiliate_link: e.target.value})}
              />
            </div>
            <div>
              <Label>Admin Notes</Label>
              <Textarea
                value={editForm.admin_notes || ""}
                onChange={(e) => setEditForm({...editForm, admin_notes: e.target.value})}
                rows={2}
              />
            </div>
            <Button onClick={handleSaveEdit} className="w-full bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetails !== null} onOpenChange={() => setViewDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Suggestion Details</DialogTitle>
          </DialogHeader>
          {viewDetails && (
            <div className="space-y-3 text-sm">
              <div><strong>Item:</strong> {viewDetails.suggested_item_name}</div>
              <div><strong>Category:</strong> {viewDetails.suggested_category}</div>
              <div><strong>Cache Type:</strong> {viewDetails.suggested_cache_type}</div>
              <div><strong>Quantity:</strong> {viewDetails.suggested_quantity}</div>
              {viewDetails.suggested_price_cents > 0 && (
                <div><strong>Price:</strong> ${(viewDetails.suggested_price_cents / 100).toFixed(2)}</div>
              )}
              {viewDetails.suggested_description && (
                <div><strong>Description:</strong> {viewDetails.suggested_description}</div>
              )}
              {viewDetails.suggested_family_member_types?.length > 0 && (
                <div><strong>For:</strong> {viewDetails.suggested_family_member_types.join(", ")}</div>
              )}
              {viewDetails.suggested_disaster_types?.length > 0 && (
                <div><strong>Disaster Types:</strong> {viewDetails.suggested_disaster_types.join(", ")}</div>
              )}
              {viewDetails.suggested_fema_regions?.length > 0 && (
                <div><strong>FEMA Regions:</strong> {viewDetails.suggested_fema_regions.join(", ")}</div>
              )}
              {viewDetails.source_organization && (
                <div><strong>Source:</strong> {viewDetails.source_organization}</div>
              )}
              {viewDetails.suggested_affiliate_link && (
                <div>
                  <strong>Link:</strong>{" "}
                  <a href={viewDetails.suggested_affiliate_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    View Product
                  </a>
                </div>
              )}
              <div><strong>Suggested By:</strong> {viewDetails.suggested_by}</div>
              <div><strong>Status:</strong> {viewDetails.status}</div>
              {viewDetails.admin_notes && (
                <div><strong>Admin Notes:</strong> {viewDetails.admin_notes}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}