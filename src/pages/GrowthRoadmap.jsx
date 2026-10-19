import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, Handshake, Library, ServerCog, Lock } from "lucide-react";
import RoadmapPhases from "@/components/growth/RoadmapPhases";
import ExpoOutreachPanel from "@/components/growth/ExpoOutreachPanel";
import ContentAdditionsPanel from "@/components/growth/ContentAdditionsPanel";
import BackendAccessComparison from "@/components/growth/BackendAccessComparison";
import { ROADMAP_PHASES } from "@/lib/growthRoadmap";

export default function GrowthRoadmap() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        setStatus(user?.role === "admin" ? "admin" : "denied");
      } catch (_e) {
        setStatus("denied");
      }
    })();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="max-w-sm text-center">
          <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
          <h1 className="font-serif text-xl font-semibold text-foreground mb-1">Admin access required</h1>
          <p className="text-sm text-muted-foreground font-sans">
            The growth roadmap and Expo outreach tools are available to administrators only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-foreground text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold font-heading">Growth Roadmap</h1>
          <p className="text-white/60 mt-1 text-sm font-sans">
            Sign-up growth first, then community depth and retention — with dependencies, metrics and tradeoffs.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="roadmap">
          <TabsList className="mb-6 h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <Map className="w-4 h-4" aria-hidden="true" /> Roadmap
            </TabsTrigger>
            <TabsTrigger value="expo" className="flex items-center gap-2">
              <Handshake className="w-4 h-4" aria-hidden="true" /> Expo Outreach
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Library className="w-4 h-4" aria-hidden="true" /> Content Additions
            </TabsTrigger>
            <TabsTrigger value="backend" className="flex items-center gap-2">
              <ServerCog className="w-4 h-4" aria-hidden="true" /> Backend Access
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roadmap">
            <RoadmapPhases phases={ROADMAP_PHASES} />
          </TabsContent>

          <TabsContent value="expo">
            <ExpoOutreachPanel />
          </TabsContent>

          <TabsContent value="content">
            <ContentAdditionsPanel />
          </TabsContent>

          <TabsContent value="backend">
            <BackendAccessComparison />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}