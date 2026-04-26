import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  WifiOff,
  Wifi,
  CheckCircle,
  Phone,
  MapPin,
  Package,
  Heart,
  Home,
  PawPrint,
  AlertTriangle,
  Navigation,
  Users,
  RefreshCw,
  Clock,
  Shield,
  Download
} from "lucide-react";
import { format } from "date-fns";

const CACHE_KEY = "rallypack_offline_data";
const CACHE_VERSION_KEY = "rallypack_offline_version";

function saveToLocalCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  localStorage.setItem(CACHE_VERSION_KEY, new Date().toISOString());
}

function loadFromLocalCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getLastSyncTime() {
  return localStorage.getItem(CACHE_VERSION_KEY);
}

export default function Offline() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(getLastSyncTime());
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    // Always load from cache first (instant)
    const cached = loadFromLocalCache();
    if (cached) {
      setData(cached);
      setLoading(false);
    }

    // If online, fetch fresh data and update cache
    if (navigator.onLine) {
      await syncData(cached === null);
    } else {
      setLoading(false);
    }
  };

  const syncData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setSyncing(true);
    try {
      const [familyMembers, meetSpots, caches, firstAidItems, pets, cacheItems] = await Promise.all([
        base44.entities.FamilyMember.list(),
        base44.entities.MeetSpot.list(),
        base44.entities.EmergencyCache.list(),
        base44.entities.FirstAidItem.list(),
        base44.entities.Pet.list(),
        base44.entities.CacheItem.list()
      ]);

      const fresh = { familyMembers, meetSpots, caches, firstAidItems, pets, cacheItems };
      saveToLocalCache(fresh);
      setData(fresh);
      setLastSync(getLastSyncTime());
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-sans text-sm">Loading offline data...</p>
        </div>
      </div>
    );
  }

  const { familyMembers = [], meetSpots = [], caches = [], firstAidItems = [], pets = [], cacheItems = [] } = data || {};

  const ownedFirstAid = firstAidItems.filter(i => i.owned);
  const expiredFirstAid = firstAidItems.filter(i => i.expiration_date && new Date(i.expiration_date) < new Date());
  const primarySpot = meetSpots.find(s => s.is_primary);

  const navSections = [
    { id: "overview", label: "Overview", icon: Shield },
    { id: "contacts", label: "Contacts", icon: Phone },
    { id: "meetspots", label: "Meet Spots", icon: MapPin },
    { id: "caches", label: "Caches", icon: Package },
    { id: "firstaid", label: "First Aid", icon: Heart },
    { id: "pets", label: "Pets", icon: PawPrint },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Status Bar */}
      <div className={`sticky top-0 z-50 px-4 py-2.5 flex items-center justify-between text-sm font-sans ${isOnline ? "bg-emerald-700 text-white" : "bg-foreground text-background"}`}>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span className="font-medium">{isOnline ? "Online — data synced" : "Offline Mode — showing cached data"}</span>
        </div>
        <div className="flex items-center gap-3">
          {lastSync && (
            <span className="opacity-75 hidden sm:block">
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              {format(new Date(lastSync), "MMM d, h:mm a")}
            </span>
          )}
          {isOnline && (
            <button
              onClick={() => syncData()}
              disabled={syncing}
              className="flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Syncing..." : "Sync"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="bg-accent text-accent-foreground px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-2xl font-bold mb-1">Offline Emergency Guide</h1>
          <p className="text-sm opacity-80 font-sans">All critical data below is saved on this device and available without internet.</p>
        </div>
      </div>

      {/* Section Nav */}
      <div className="bg-white border-b border-border sticky top-10 z-40 overflow-x-auto">
        <div className="max-w-4xl mx-auto flex gap-0 px-2">
          {navSections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-sans font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* OVERVIEW */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Family Members", value: familyMembers.length, icon: Users, color: "text-blue-600 bg-blue-50" },
                { label: "Meet Spots", value: meetSpots.length, icon: MapPin, color: "text-emerald-600 bg-emerald-50" },
                { label: "Supply Caches", value: caches.length, icon: Package, color: "text-amber-600 bg-amber-50" },
                { label: "First Aid Items", value: ownedFirstAid.length, icon: Heart, color: "text-red-600 bg-red-50" },
                { label: "Pets", value: pets.length, icon: PawPrint, color: "text-purple-600 bg-purple-50" },
                { label: "Expired Items", value: expiredFirstAid.length, icon: AlertTriangle, color: expiredFirstAid.length > 0 ? "text-red-600 bg-red-50" : "text-muted-foreground bg-muted" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xl font-bold font-sans text-foreground">{value}</p>
                      <p className="text-xs text-muted-foreground font-sans">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Primary Meet Spot highlight */}
            {primarySpot && (
              <Card className="border-emerald-300 bg-emerald-50">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-1 font-sans">Primary Rally Point</p>
                      <p className="font-serif text-lg font-bold text-emerald-900">{primarySpot.name}</p>
                      {primarySpot.address && <p className="text-sm text-emerald-800 font-sans mt-1">{primarySpot.address}</p>}
                      {primarySpot.description && <p className="text-sm text-emerald-700 mt-1 font-sans">{primarySpot.description}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Emergency numbers */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-sans font-semibold">Emergency Numbers</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {[
                  { label: "Emergency Services", number: "911" },
                  { label: "FEMA Helpline", number: "1-800-621-3362" },
                  { label: "Red Cross", number: "1-800-733-2767" },
                  { label: "Poison Control", number: "1-800-222-1222" },
                  { label: "Crisis Hotline", number: "988" },
                ].map(({ label, number }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm font-sans text-foreground">{label}</span>
                    <a href={`tel:${number}`} className="font-mono text-sm font-semibold text-primary hover:underline">{number}</a>
                  </div>
                ))}
              </CardContent>
            </Card>

            {!isOnline && (
              <Card className="bg-muted border-border">
                <CardContent className="p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold font-sans">Data saved on this device</p>
                    <p className="text-sm text-muted-foreground font-sans mt-1">All your emergency information below was saved during your last sync and is accessible without internet. Reconnect to refresh.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* CONTACTS */}
        {activeSection === "contacts" && (
          <div className="space-y-4">
            <SectionHeader icon={Phone} title="Family Contacts" subtitle="Emergency contact information for your household" />
            {familyMembers.length === 0 ? (
              <EmptyState message="No family members added yet. Add them in Settings." />
            ) : (
              familyMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold font-sans text-foreground">{member.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize font-sans">{member.relationship}{member.age ? ` · ${member.age} yrs` : ""}</p>
                      </div>
                      {member.emergency_contact && (
                        <a href={`tel:${member.emergency_contact}`} className="text-primary hover:underline text-sm font-mono font-semibold">{member.emergency_contact}</a>
                      )}
                    </div>
                    {member.medical_conditions && (
                      <div className="bg-orange-50 border border-orange-200 rounded-md px-3 py-2 flex items-start gap-2 mt-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-orange-800 font-sans">{member.medical_conditions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* MEET SPOTS */}
        {activeSection === "meetspots" && (
          <div className="space-y-4">
            <SectionHeader icon={MapPin} title="Meet Spots" subtitle="Your designated family rally points" />
            {meetSpots.length === 0 ? (
              <EmptyState message="No meet spots added yet. Add them in Resources." />
            ) : (
              meetSpots.map((spot) => (
                <Card key={spot.id} className={spot.is_primary ? "border-emerald-400 ring-1 ring-emerald-300" : ""}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold font-sans text-foreground">{spot.name}</h3>
                      {spot.is_primary && <Badge className="bg-emerald-100 text-emerald-800 text-xs">Primary</Badge>}
                    </div>
                    {spot.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground font-sans mb-2">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{spot.address}</span>
                      </div>
                    )}
                    {spot.latitude && spot.longitude && (
                      <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground mb-2">
                        <Navigation className="w-4 h-4 shrink-0" />
                        <a
                          href={`https://maps.google.com/?q=${spot.latitude},${spot.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {spot.latitude.toFixed(5)}, {spot.longitude.toFixed(5)}
                        </a>
                      </div>
                    )}
                    {spot.description && <p className="text-sm text-muted-foreground font-sans">{spot.description}</p>}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* CACHES */}
        {activeSection === "caches" && (
          <div className="space-y-4">
            <SectionHeader icon={Package} title="Emergency Caches" subtitle="Your supply locations and key inventory" />
            {caches.length === 0 ? (
              <EmptyState message="No caches added yet. Add them in Resources." />
            ) : (
              caches.map((cache) => {
                const items = cacheItems.filter(i => i.cache_id === cache.id);
                const byCategory = items.reduce((acc, item) => {
                  acc[item.category] = acc[item.category] || [];
                  acc[item.category].push(item);
                  return acc;
                }, {});
                return (
                  <Card key={cache.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold font-sans text-foreground">{cache.name}</h3>
                        <Badge variant="outline" className="capitalize text-xs">{cache.cache_type?.replace("_", " ")}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground font-sans mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        {cache.location}
                      </div>
                      {items.length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(byCategory).map(([cat, catItems]) => (
                            <div key={cat}>
                              <p className="text-xs uppercase tracking-widest font-semibold font-sans text-muted-foreground mb-1 capitalize">{cat}</p>
                              <ul className="space-y-1">
                                {catItems.map(item => (
                                  <li key={item.id} className="text-sm font-sans text-foreground flex items-center justify-between">
                                    <span>• {item.item_name}</span>
                                    {item.quantity && <span className="text-muted-foreground text-xs">x{item.quantity}</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground font-sans italic">No items recorded in this cache.</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* FIRST AID */}
        {activeSection === "firstaid" && (
          <div className="space-y-4">
            <SectionHeader icon={Heart} title="First Aid Supplies" subtitle="Your tracked first aid items by category" />

            {expiredFirstAid.length > 0 && (
              <Card className="border-red-300 bg-red-50">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 font-sans">{expiredFirstAid.length} item{expiredFirstAid.length > 1 ? "s" : ""} expired</p>
                    <ul className="mt-1 space-y-0.5">
                      {expiredFirstAid.map(item => (
                        <li key={item.id} className="text-sm text-red-700 font-sans">• {item.name}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {firstAidItems.length === 0 ? (
              <EmptyState message="No first aid items tracked yet. Add them in Resources." />
            ) : (
              ["adults", "youth", "pets"].map(cat => {
                const catItems = firstAidItems.filter(i => i.category === cat);
                if (catItems.length === 0) return null;
                return (
                  <div key={cat}>
                    <h3 className="text-sm font-semibold uppercase tracking-widest font-sans text-muted-foreground mb-2 capitalize">{cat}</h3>
                    <div className="space-y-2">
                      {catItems.map(item => {
                        const isExpired = item.expiration_date && new Date(item.expiration_date) < new Date();
                        return (
                          <Card key={item.id} className={isExpired ? "border-red-200" : ""}>
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${item.owned ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                                <div>
                                  <p className={`text-sm font-sans font-medium ${item.owned ? "text-foreground" : "text-muted-foreground"}`}>{item.name}</p>
                                  {item.expiration_date && (
                                    <p className={`text-xs font-sans ${isExpired ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                                      {isExpired ? "Expired " : "Expires "}{format(new Date(item.expiration_date), "MMM d, yyyy")}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.quantity > 1 && <span className="text-xs text-muted-foreground font-sans">x{item.quantity}</span>}
                                <Badge variant={item.owned ? "default" : "outline"} className={`text-xs ${item.owned ? "bg-emerald-100 text-emerald-800" : ""}`}>
                                  {item.owned ? "Owned" : "Needed"}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* PETS */}
        {activeSection === "pets" && (
          <div className="space-y-4">
            <SectionHeader icon={PawPrint} title="Pet Information" subtitle="Your pet details and medical info" />
            {pets.length === 0 ? (
              <EmptyState message="No pets added yet. Add them in Settings." />
            ) : (
              pets.map((pet) => (
                <Card key={pet.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                        <PawPrint className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold font-sans text-foreground">{pet.name}</h3>
                            <p className="text-sm text-muted-foreground font-sans capitalize">{pet.species}{pet.breed ? ` · ${pet.breed}` : ""}{pet.age ? ` · ${pet.age} yrs` : ""}</p>
                          </div>
                          <Badge variant="outline" className="capitalize text-xs">{pet.size || "unknown size"}</Badge>
                        </div>
                        {pet.microchip_number && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground font-sans uppercase tracking-widest">Microchip</p>
                            <p className="font-mono text-sm font-semibold text-foreground">{pet.microchip_number}</p>
                          </div>
                        )}
                        {pet.medical_conditions && (
                          <div className="bg-orange-50 border border-orange-200 rounded-md px-3 py-2 flex items-start gap-2 mt-3">
                            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-orange-800 font-sans">{pet.medical_conditions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-2">
      <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-accent-foreground" />
      </div>
      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground font-sans">{subtitle}</p>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <Card>
      <CardContent className="py-10 text-center text-muted-foreground font-sans text-sm">
        {message}
      </CardContent>
    </Card>
  );
}