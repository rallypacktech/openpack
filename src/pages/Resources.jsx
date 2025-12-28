import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CachesList from "../components/resources/CachesList";
import MeetSpotsList from "../components/resources/MeetSpotsList";
import FirstAidTracker from "../components/resources/FirstAidTracker";

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
    if (tab === "firstaid") {
      setActiveTab("firstaid");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cachesData, spotsData, firstAidData] = await Promise.all([
        base44.entities.EmergencyCache.list(),
        base44.entities.MeetSpot.list(),
        base44.entities.FirstAidItem.list()
      ]);

      setCaches(cachesData);
      setMeetSpots(spotsData);
      setFirstAidItems(firstAidData);

      // Create sample caches if user has none
      if (!samplesCreated && cachesData.length === 0) {
        await base44.functions.invoke('createSampleCaches');
        setSamplesCreated(true);
        // Reload data to show samples
        const updatedCaches = await base44.entities.EmergencyCache.list();
        setCaches(updatedCaches);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold">Your Caches</h1>
          <p className="text-blue-100 mt-1">
            Manage your emergency caches, meet spots, and first aid supplies to keep your family prepared and safe.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="caches">Caches</TabsTrigger>
            <TabsTrigger value="meetspots">Meet Spots</TabsTrigger>
            <TabsTrigger value="firstaid">First Aid Tracker</TabsTrigger>
          </TabsList>

          <TabsContent value="caches">
            <CachesList
              caches={caches}
              onAdd={handleAddCache}
              onUpdate={handleUpdateCache}
              onDelete={handleDeleteCache}
              onViewItems={handleViewCacheItems}
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
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}