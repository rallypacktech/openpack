import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CachesList from "../components/resources/CachesList";
import MeetSpotsList from "../components/resources/MeetSpotsList";
import FirstAidTracker from "../components/resources/FirstAidTracker";
import TrainingClasses from "../components/resources/TrainingClasses";
import VolunteerOpportunities from "../components/resources/VolunteerOpportunities";
import SharePlan from "../components/resources/SharePlan";
import ExternalResourcesTab from "../components/resources/ExternalResourcesTab";
import EmergencyManuals from "../components/manuals/EmergencyManuals";
import LocalShelters from "../components/resources/LocalShelters";
import { Link } from "react-router-dom";

export default function Resources() {
  const navigate = useNavigate();
  const [caches, setCaches] = useState([]);
  const [meetSpots, setMeetSpots] = useState([]);
  const [firstAidItems, setFirstAidItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("caches");
  const [samplesCreated, setSamplesCreated] = useState(false);

  // Get tab from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab && ["caches", "meetspots", "firstaid", "training", "volunteer", "share", "resources", "tracking", "manuals", "shelters"].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();

      // Use secure backend functions for data access
      const [cachesResponse, spotsResponse, firstAidData] = await Promise.all([
        base44.functions.invoke('getCaches'),
        base44.functions.invoke('getMeetSpots'),
        base44.entities.FirstAidItem.filter({ created_by: user.email })
      ]);

      setCaches(cachesResponse.data.caches);
      setMeetSpots(spotsResponse.data.spots);
      setFirstAidItems(firstAidData);
      setLoading(false);

      // Create sample caches in background if user has none (don't block rendering)
      const ownCaches = cachesResponse.data.caches.filter(c => c.created_by === user.email);
      if (!samplesCreated && ownCaches.length === 0) {
        setSamplesCreated(true);
        base44.functions.invoke('generateSampleCaches').then(() => {
          // Silently reload data to show samples
          loadData();
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  // Cache handlers
  const handleAddCache = async (data) => {
    await base44.entities.EmergencyCache.create(data);
    loadData();
  };

  const handleUpdateCache = async (id, data) => {
    await base44.entities.EmergencyCache.update(id, data);
    loadData();
  };

  const handleDeleteCache = async (id) => {
    await base44.entities.EmergencyCache.delete(id);
    loadData();
  };

  // Meet Spots handlers
  const handleAddSpot = async (data) => {
    await base44.entities.MeetSpot.create(data);
    loadData();
  };

  const handleUpdateSpot = async (id, data) => {
    await base44.entities.MeetSpot.update(id, data);
    loadData();
  };

  const handleDeleteSpot = async (id) => {
    await base44.entities.MeetSpot.delete(id);
    loadData();
  };

  // First Aid handlers
  const handleAddFirstAid = async (data) => {
    await base44.entities.FirstAidItem.create(data);
    loadData();
  };

  const handleUpdateFirstAid = async (id, data) => {
    await base44.entities.FirstAidItem.update(id, data);
    loadData();
  };

  const handleDeleteFirstAid = async (id) => {
    await base44.entities.FirstAidItem.delete(id);
    loadData();
  };

  const handleViewCacheItems = (cache) => {
    navigate(createPageUrl("CacheDetail") + "?id=" + cache.id);
  };

  const handleGenerateSampleCaches = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateSampleCaches');
      if (response.data.error) {
        alert(response.data.error);
      }
      await loadData();
    } catch (error) {
      console.error("Error generating sample caches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSampleFirstAid = async () => {
    setLoading(true);
    try {
      await base44.functions.invoke('generateSampleFirstAidItems');
      await loadData();
    } catch (error) {
      console.error("Error generating sample first aid items:", error);
    } finally {
      setLoading(false);
    }
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
      <div style={{ backgroundColor: "hsl(220, 40%, 18%)" }} className="text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-xs uppercase tracking-widest font-sans text-white/50 mb-1">Emergency Planning</p>
          <h1 className="font-serif text-3xl font-semibold text-white">Your Preparedness Hub</h1>
          <p className="font-sans text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            Caches, meeting spots, first aid, training, and volunteering — all in one place.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="caches">Caches</TabsTrigger>
            <TabsTrigger value="meetspots">Meet Spots</TabsTrigger>
            <TabsTrigger value="firstaid">First Aid</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
            <TabsTrigger value="share">Share Plan</TabsTrigger>
            <TabsTrigger value="resources">Ext. Resources</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="shelters">Shelters & Contacts</TabsTrigger>
            <TabsTrigger value="manuals">Manuals</TabsTrigger>
          </TabsList>

          <TabsContent value="caches">
            <CachesList
              caches={caches}
              onAdd={handleAddCache}
              onUpdate={handleUpdateCache}
              onDelete={handleDeleteCache}
              onViewItems={handleViewCacheItems}
              onGenerateSamples={handleGenerateSampleCaches}
            />
          </TabsContent>

          <TabsContent value="meetspots">
            <MeetSpotsList
              spots={meetSpots}
              onAdd={handleAddSpot}
              onUpdate={handleUpdateSpot}
              onDelete={handleDeleteSpot}
            />
          </TabsContent>

          <TabsContent value="firstaid">
            <FirstAidTracker
              items={firstAidItems}
              onAdd={handleAddFirstAid}
              onUpdate={handleUpdateFirstAid}
              onDelete={handleDeleteFirstAid}
              onGenerateSamples={handleGenerateSampleFirstAid}
            />
          </TabsContent>

          <TabsContent value="training">
            <TrainingClasses />
          </TabsContent>

          <TabsContent value="volunteer">
            <VolunteerOpportunities />
          </TabsContent>

          <TabsContent value="share">
            <SharePlan />
          </TabsContent>

          <TabsContent value="resources">
            <ExternalResourcesTab />
          </TabsContent>

          <TabsContent value="shelters">
            <LocalShelters />
          </TabsContent>

          <TabsContent value="manuals">
            <div className="mb-4">
              <h2 className="font-serif text-xl font-bold text-foreground mb-1">Emergency Reference Manuals</h2>
              <p className="text-sm text-muted-foreground font-sans">Expand any manual to read it. Use <strong>Save as PDF / Print</strong> to save it to your device for offline access.</p>
            </div>
            <EmergencyManuals />
          </TabsContent>

          <TabsContent value="tracking">
            <div className="text-center py-16">
              <p className="text-muted-foreground text-sm mb-4">Manage your tracked items — pets, valuables, vehicles, and more.</p>
              <Link
                to="/TrackedItems"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Go to Tracking
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}