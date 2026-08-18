import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, GitCompare, Unlink, Database, MailX, History } from "lucide-react";
import CauseCleanupPanel from "./CauseCleanupPanel";
import IncidentDiscrepancies from "./IncidentDiscrepancies";
import OrphanedDataPanel from "./OrphanedDataPanel";
import DeletionQueuePanel from "./DeletionQueuePanel";
import BouncedReferralsPanel from "./BouncedReferralsPanel";
import MergeAuditPanel from "./MergeAuditPanel";

export default function CleanupPanel() {
  const [subTab, setSubTab] = useState("causes");

  return (
    <Tabs value={subTab} onValueChange={setSubTab}>
      <TabsList className="flex-wrap">
        <TabsTrigger value="causes" className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Causes
        </TabsTrigger>
        <TabsTrigger value="discrepancies" className="flex items-center gap-2">
          <GitCompare className="w-4 h-4" /> Discrepancies
        </TabsTrigger>
        <TabsTrigger value="orphaned" className="flex items-center gap-2">
          <Unlink className="w-4 h-4" /> Orphaned Data
        </TabsTrigger>
        <TabsTrigger value="deletion-queue" className="flex items-center gap-2">
          <Database className="w-4 h-4" /> Deletion Queue
        </TabsTrigger>
        <TabsTrigger value="bounced" className="flex items-center gap-2">
          <MailX className="w-4 h-4" /> Bounced Referrals
        </TabsTrigger>
        <TabsTrigger value="merge-audit" className="flex items-center gap-2">
          <History className="w-4 h-4" /> Merge Audit
        </TabsTrigger>
      </TabsList>

      <TabsContent value="causes" className="mt-4">
        <CauseCleanupPanel />
      </TabsContent>

      <TabsContent value="discrepancies" className="mt-4">
        <IncidentDiscrepancies />
      </TabsContent>

      <TabsContent value="orphaned" className="mt-4">
        <OrphanedDataPanel />
      </TabsContent>

      <TabsContent value="deletion-queue" className="mt-4">
        <DeletionQueuePanel />
      </TabsContent>

      <TabsContent value="bounced" className="mt-4">
        <BouncedReferralsPanel />
      </TabsContent>

      <TabsContent value="merge-audit" className="mt-4">
        <MergeAuditPanel />
      </TabsContent>
    </Tabs>
  );
}