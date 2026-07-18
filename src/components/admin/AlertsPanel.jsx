import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, ClipboardList } from "lucide-react";
import AlertDelegationsPanel from "./AlertDelegationsPanel";
import AlertSubmissionsPanel from "./AlertSubmissionsPanel";

export default function AlertsPanel() {
  const [subTab, setSubTab] = useState("delegations");

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Alert Management
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage delegated alert senders and review submitted emergency alerts.
        </p>
      </div>
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value="delegations" className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Delegations
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Submissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="delegations" className="mt-4">
          <AlertDelegationsPanel />
        </TabsContent>

        <TabsContent value="submissions" className="mt-4">
          <AlertSubmissionsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}