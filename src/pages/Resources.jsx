import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CachesList from "../components/resources/CachesList";
import MeetSpotsList from "../components/resources/MeetSpotsList";
import TrainingClasses from "../components/resources/TrainingClasses";
import VolunteerOpportunities from "../components/resources/VolunteerOpportunities";
import SharePlan from "../components/resources/SharePlan";
import ExternalResourcesTab from "../components/resources/ExternalResourcesTab";
import EmergencyManuals from "../components/manuals/EmergencyManuals";
import LocalShelters from "../components/resources/LocalShelters";
import EvacuationAlertInfo from "../components/resources/EvacuationAlertInfo";
import { Link } from "react-router-dom";
import { Package, MapPin, Users, Share2, ChevronRight } from "lucide-react";

export default function Resources() {
  const navigate = useNavigate();
  const [caches, setCaches] = useState([]);
  const [meetSpots, setMeetSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("supplies");
  const [samplesCreated, setSamplesCreated] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    const validTabs = ["supplies", "meetspots", "share", "help", "community"];
    const legacyMap = {
      caches: "supplies", firstaid: "supplies",
      training: "community", volunteer: "community", tracking: "community",
      resources: "help", manuals: "help", shelters: "help",
    };
    if (tab && validTabs.includes(tab)) setActiveTab(tab);
    else if (tab && legacyMap[tab]) setActiveTab(legacyMap[tab]);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      const [cachesResponse, spotsResponse] = await Promise.all([
        base44.functions.invoke('getCaches'),
        base44.functions.invoke('getMeetSpots'),
      ]);

      setCaches(cachesResponse.data.caches);
      setMeetSpots(spotsResponse.data.spots);
      setLoading(false);

      const ownCaches = cachesResponse.data.caches.filter(c => c.created_by === user.email);
      if (!samplesCreated && ownCaches.length === 0) {
        setSamplesCreated(true);
        base44.functions.invoke('generateSampleCaches').then(() => {
          loadData();
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  const handleAddCache = async (data) => { await base44.entities.EmergencyCache.create(data); loadData(); };
  const handleUpdateCache = async (id, data) => { await base44.entities.EmergencyCache.update(id, data); loadData(); };
  const handleDeleteCache = async (id) => { await base44.entities.EmergencyCache.delete(id); loadData(); };
  const handleAddSpot = async (data) => { await base44.entities.MeetSpot.create(data); loadData(); };
  const handleUpdateSpot = async (id, data) => { await base44.entities.MeetSpot.update(id, data); loadData(); };
  const handleDeleteSpot = async (id) => { await base44.entities.MeetSpot.delete(id); loadData(); };

  const handleViewCacheItems = (cache) => {
    navigate(createPageUrl("CacheDetail") + "?id=" + cache.id);
  };

  const handleGenerateSampleCaches = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateSampleCaches');
      if (response.data.error) alert(response.data.error);
      await loadData();
    } catch (error) { console.error("Error generating sample caches:", error); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream font-sans">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-xs uppercase tracking-widest font-sans text-muted-foreground mb-1">Emergency Planning</p>
          <h1 className="font-serif text-3xl font-bold text-foreground">Your Preparedness Hub</h1>
          <p className="font-sans text-sm mt-1 text-muted-foreground">
            Supplies, meeting spots, help, and community — all in one place.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="supplies">
              <Package className="w-4 h-4 mr-1.5" /> My Supplies
            </TabsTrigger>
            <TabsTrigger value="meetspots">
              <MapPin className="w-4 h-4 mr-1.5" /> Meet Spots
            </TabsTrigger>
            <TabsTrigger value="share">
              <Share2 className="w-4 h-4 mr-1.5" /> Share Plan
            </TabsTrigger>
            <TabsTrigger value="help">
              <Users className="w-4 h-4 mr-1.5" /> Find Help
            </TabsTrigger>
            <TabsTrigger value="community">
              <Users className="w-4 h-4 mr-1.5" /> Community
            </TabsTrigger>
          </TabsList>

          {/* ── My Supplies ── */}
          <TabsContent value="supplies">
            <CachesList
              caches={caches}
              onAdd={handleAddCache}
              onUpdate={handleUpdateCache}
              onDelete={handleDeleteCache}
              onViewItems={handleViewCacheItems}
              onGenerateSamples={handleGenerateSampleCaches}
            />
          </TabsContent>

          {/* ── Meet Spots ── */}
          <TabsContent value="meetspots">
            <MeetSpotsList
              spots={meetSpots}
              onAdd={handleAddSpot}
              onUpdate={handleUpdateSpot}
              onDelete={handleDeleteSpot}
            />
          </TabsContent>

          {/* ── Share Plan ── */}
          <TabsContent value="share">
            <SharePlan />
          </TabsContent>

          {/* ── Find Help ── */}
          <TabsContent value="help" className="space-y-6">
            <EvacuationAlertInfo />
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground mb-3">External Resources</h2>
              <ExternalResourcesTab />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground mb-3">Shelters & Local Contacts</h2>
              <LocalShelters />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground mb-1">Emergency Reference Manuals</h2>
              <p className="text-sm text-muted-foreground font-sans mb-3">Expand any manual to read it. Use <strong>Save as PDF / Print</strong> to save it to your device for offline access.</p>
              <EmergencyManuals />
            </div>
          </TabsContent>

          {/* ── Community ── */}
          <TabsContent value="community" className="space-y-6">
            <TrainingClasses />
            <VolunteerOpportunities />
            <div className="text-center py-8 border border-border rounded-lg bg-white">
              <p className="text-muted-foreground text-sm mb-4">Manage your tracked items — pets, valuables, vehicles, and more.</p>
              <Link
                to="/TrackedItems"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Go to Tracking <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}