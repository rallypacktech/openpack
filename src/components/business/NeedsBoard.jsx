import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, HandHeart, CheckCircle2, Trash2, AlertCircle, Clock, Mail, Phone, MapPin, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import NeedsBoardFilters, { EMPTY_NEEDS_FILTERS, SPECIES_OPTIONS, countActiveFilters } from "@/components/business/NeedsBoardFilters";

const CATEGORY_LABELS = {
  supplies: "Supplies", volunteers: "Volunteers", equipment: "Equipment",
  space: "Space", transport: "Transport", food: "Food", medical: "Medical", other: "Other",
};

const URGENCY_STYLES = {
  low: "bg-gray-100 text-gray-700 border-gray-300",
  medium: "bg-blue-100 text-blue-700 border-blue-300",
  high: "bg-orange-100 text-orange-700 border-orange-300",
  critical: "bg-red-100 text-red-700 border-red-300",
};

const STATUS_STYLES = {
  open: "bg-green-100 text-green-700 border-green-300",
  claimed: "bg-amber-100 text-amber-700 border-amber-300",
  filled: "bg-gray-100 text-gray-500 border-gray-300",
};

export default function NeedsBoard({ subscription }) {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [filters, setFilters] = useState(EMPTY_NEEDS_FILTERS);
  const [form, setForm] = useState({
    need_title: "", need_description: "", category: "supplies",
    quantity: 1, unit: "", urgency: "medium", species: "general",
    country_name: "", admin1_name: "", admin2_name: "", postal_code: "",
    contact_email: "", contact_phone: "",
  });
  const [claimingId, setClaimingId] = useState(null);
  const [claimedInfo, setClaimedInfo] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try { setUser(await base44.auth.me()); } catch {}
    })();
    loadNeeds();
  }, []);

  const loadNeeds = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.OrganizationNeed.list('-created_date', 200);
      setNeeds(all);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const myEmail = user?.email;

  const handlePost = async () => {
    if (!form.need_title || !form.need_description) {
      toast({ title: "Missing info", description: "Title and description are required.", variant: "destructive" });
      return;
    }
    try {
      const locationLabel = [form.admin2_name, form.admin1_name, form.country_name].filter(Boolean).join(", ");
      await base44.entities.OrganizationNeed.create({
        ...form,
        location: locationLabel,
        organization_name: subscription?.organization_name || "Unknown Organization",
        subscription_id: subscription?.id || "",
        posted_by_email: myEmail,
        contact_email: form.contact_email || myEmail,
        status: "open",
      });
      setShowForm(false);
      setForm({ need_title: "", need_description: "", category: "supplies", quantity: 1, unit: "", urgency: "medium", species: "general", country_name: "", admin1_name: "", admin2_name: "", postal_code: "", contact_email: "", contact_phone: "" });
      toast({ title: "Need posted", description: "Other organizations can now see and claim your need." });
      loadNeeds();
    } catch (e) {
      toast({ title: "Error posting need", description: e.message, variant: "destructive" });
    }
  };

  const handleClaim = async (need) => {
    setClaimingId(need.id);
    try {
      const res = await base44.functions.invoke('claimOrganizationNeed', { need_id: need.id });
      const contact = {
        email: res.data?.contact_email || need.contact_email || need.posted_by_email,
        phone: res.data?.contact_phone || need.contact_phone,
        org: need.organization_name,
        title: need.need_title,
      };
      setClaimedInfo(contact);
      toast({
        title: "Need claimed",
        description: `${need.organization_name} has been notified. Contact them directly to coordinate.`,
      });
      loadNeeds();
    } catch (e) {
      toast({ title: "Error claiming need", description: e.message, variant: "destructive" });
    }
    setClaimingId(null);
  };

  const handleMarkFilled = async (need) => {
    await base44.entities.OrganizationNeed.update(need.id, { status: "filled", filled_at: new Date().toISOString() });
    toast({ title: "Marked as filled", description: "Your need has been marked as fulfilled." });
    loadNeeds();
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this need from the board?")) return;
    await base44.entities.OrganizationNeed.delete(id);
    loadNeeds();
  };

  const filteredNeeds = needs.filter(n => {
    // Location drill-down
    if (filters.country_name && n.country_name !== filters.country_name) return false;
    if (filters.admin1_name && n.admin1_name !== filters.admin1_name) return false;
    if (filters.admin2_name && n.admin2_name !== filters.admin2_name) return false;
    if (filters.postal_code && n.postal_code !== filters.postal_code) return false;
    // Species, request type and urgency
    if (filters.species.length && !filters.species.includes(n.species)) return false;
    if (filters.categories.length && !filters.categories.includes(n.category)) return false;
    if (filters.urgencies.length && !filters.urgencies.includes(n.urgency)) return false;
    // An explicit status filter replaces the quick-view's status logic
    if (filters.statuses.length) {
      if (!filters.statuses.includes(n.status)) return false;
    } else if (filter === "all") {
      if (n.status === "filled") return false;
    } else if (filter === "open") {
      if (n.status !== "open") return false;
    }
    if (filter === "mine" && n.posted_by_email !== myEmail) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <HandHeart className="w-5 h-5 text-primary" /> Needs Board
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Post a need your organization has, or claim a need from another organization.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-3.5 h-3.5" /> Post a Need
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "all", label: "All Open" },
          { key: "open", label: "Available to Claim" },
          { key: "mine", label: "My Needs" },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs px-3 py-1.5 rounded font-sans transition-colors ${
              filter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <NeedsBoardFilters
        needs={needs}
        filters={filters}
        onChange={(patch) => setFilters(f => ({ ...f, ...patch }))}
        onClear={() => setFilters(EMPTY_NEEDS_FILTERS)}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      ) : filteredNeeds.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <HandHeart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              {countActiveFilters(filters) > 0
                ? "No needs match the selected filters."
                : filter === "mine"
                  ? "You haven't posted any needs yet."
                  : "No needs posted yet. Be the first to post or check back later."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredNeeds.map(need => {
            const isMine = need.posted_by_email === myEmail;
            return (
              <Card key={need.id} className={need.status === "claimed" ? "border-amber-300" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-foreground">{need.need_title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{need.organization_name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className={`text-xs ${STATUS_STYLES[need.status] || ""} capitalize`}>{need.status}</Badge>
                      <Badge variant="outline" className={`text-xs ${URGENCY_STYLES[need.urgency] || ""} capitalize`}>{need.urgency}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{need.need_description}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
                    <Badge variant="secondary" className="text-xs">{CATEGORY_LABELS[need.category] || need.category}</Badge>
                    {need.species && (
                      <Badge variant="outline" className="text-xs">
                        {SPECIES_OPTIONS.find(o => o.value === need.species)?.label || need.species}
                      </Badge>
                    )}
                    {need.quantity > 0 && (
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" /> {need.quantity} {need.unit || ""}
                      </span>
                    )}
                    {need.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {need.location}
                      </span>
                    )}
                  </div>

                  {need.status === "claimed" && need.claimed_by_org && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800 mb-3">
                      <strong>Claimed by:</strong> {need.claimed_by_org}
                      {isMine && need.claimed_by_email && (
                        <span> · <a href={`mailto:${need.claimed_by_email}`} className="underline">{need.claimed_by_email}</a></span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!isMine && need.status === "open" && (
                      <Button
                        size="sm"
                        onClick={() => handleClaim(need)}
                        disabled={claimingId === need.id}
                        className="gap-2"
                      >
                        <HandHeart className="w-3.5 h-3.5" />
                        {claimingId === need.id ? "Claiming..." : "Claim This Need"}
                      </Button>
                    )}
                    {isMine && (
                      <>
                        {need.status !== "filled" && (
                          <Button size="sm" variant="outline" onClick={() => handleMarkFilled(need)} className="gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Filled
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(need.id)} className="text-destructive hover:text-destructive gap-2">
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Post Need Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Post a Need</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>What do you need? *</Label><Input value={form.need_title} onChange={e => setForm(f => ({ ...f, need_title: e.target.value }))} placeholder="e.g. 50 blankets for shelter" /></div>
            <div><Label>Details *</Label><Textarea value={form.need_description} onChange={e => setForm(f => ({ ...f, need_description: e.target.value }))} placeholder="Describe what you need, why, and any specifics" rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Urgency</Label>
                <Select value={form.urgency} onValueChange={v => setForm(f => ({ ...f, urgency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} /></div>
              <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="boxes, meals, people" /></div>
            </div>
            <div><Label>Species / Audience</Label>
              <Select value={form.species} onValueChange={v => setForm(f => ({ ...f, species: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SPECIES_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Country</Label><Input value={form.country_name} onChange={e => setForm(f => ({ ...f, country_name: e.target.value }))} placeholder="United States" /></div>
              <div><Label>State / Territory</Label><Input value={form.admin1_name} onChange={e => setForm(f => ({ ...f, admin1_name: e.target.value }))} placeholder="Texas" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>County / District</Label><Input value={form.admin2_name} onChange={e => setForm(f => ({ ...f, admin2_name: e.target.value }))} placeholder="Travis County" /></div>
              <div><Label>Postal code</Label><Input value={form.postal_code} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))} placeholder="78701" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Contact Email</Label><Input type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder={myEmail || "your@email.com"} /></div>
              <div><Label>Contact Phone</Label><Input value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} placeholder="Optional" /></div>
            </div>
            <p className="text-xs text-muted-foreground">Your contact info is shared with the organization that claims your need so you can coordinate directly.</p>
            <div className="flex gap-3 pt-1">
              <Button onClick={handlePost} className="flex-1" disabled={!form.need_title || !form.need_description}>Post Need</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Claimed info dialog */}
      <Dialog open={!!claimedInfo} onOpenChange={(open) => { if (!open) setClaimedInfo(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Need Claimed — Contact Info</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
              <CheckCircle2 className="w-4 h-4 inline mr-1" />
              {claimedInfo?.org} has been notified that you claimed their need.
            </div>
            <p className="text-sm text-muted-foreground">Contact them directly to coordinate delivery or pickup:</p>
            <div className="space-y-2">
              <a href={`mailto:${claimedInfo?.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Mail className="w-4 h-4" /> {claimedInfo?.email}
              </a>
              {claimedInfo?.phone && (
                <a href={`tel:${claimedInfo?.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Phone className="w-4 h-4" /> {claimedInfo?.phone}
                </a>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Need: {claimedInfo?.title}</p>
            <Button onClick={() => setClaimedInfo(null)} className="w-full">Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}