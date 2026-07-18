import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Flame } from "lucide-react";
import IncidentMap from "./IncidentMap";
import IncidentDataDashboard from "./IncidentDataDashboard";

export default function IncidentsPanel() {
  const [subTab, setSubTab] = useState("live");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" /> Incidents
        </h2>
        <p className="text-sm text-gray-500">Live active alerts, historical wildfire data, and cross-source discrepancy checks.</p>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Live Map
          </TabsTrigger>
          <TabsTrigger value="historical" className="flex items-center gap-2">
            <Flame className="w-4 h-4" /> Historical
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-4">
          <IncidentMap />
        </TabsContent>

        <TabsContent value="historical" className="mt-4">
          <IncidentDataDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}