import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, GitCompare } from "lucide-react";
import CauseCleanupPanel from "./CauseCleanupPanel";
import IncidentDiscrepancies from "./IncidentDiscrepancies";

export default function CleanupPanel() {
  const [subTab, setSubTab] = useState("causes");

  return (
    <Tabs value={subTab} onValueChange={setSubTab}>
      <TabsList>
        <TabsTrigger value="causes" className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Causes
        </TabsTrigger>
        <TabsTrigger value="discrepancies" className="flex items-center gap-2">
          <GitCompare className="w-4 h-4" /> Discrepancies
        </TabsTrigger>
      </TabsList>

      <TabsContent value="causes" className="mt-4">
        <CauseCleanupPanel />
      </TabsContent>

      <TabsContent value="discrepancies" className="mt-4">
        <IncidentDiscrepancies />
      </TabsContent>
    </Tabs>
  );
}