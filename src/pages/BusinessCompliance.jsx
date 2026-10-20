import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import ComplianceHubSummary from "@/components/business/ComplianceHubSummary";
import ComplianceRecordsList from "@/components/business/ComplianceRecordsList";
import ComplianceDocumentsPanel from "@/components/business/ComplianceDocumentsPanel";
import ComplianceRemindersPanel from "@/components/business/ComplianceRemindersPanel";

// The organization's fire & life-safety compliance hub: inspection status,
// the documents behind each item, and what is expiring next.
export default function BusinessCompliance() {
  const [records, setRecords] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const [allRecords, subs] = await Promise.all([
      base44.entities.ComplianceRecord.list(),
      base44.entities.BusinessSubscription.list(),
    ]);
    // Household safety devices share this entity but belong to the Home Safety tab.
    setRecords(allRecords.filter((r) => r.record_type !== "home_device"));
    setSubscription(
      subs.find((s) => s.status === "active" || s.status === "trialing") || subs[0] || null
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" aria-label="Loading compliance hub" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        to="/BusinessDashboard"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Back to business dashboard
      </Link>

      <div className="flex items-start gap-3 mb-6">
        <ShieldCheck className="w-7 h-7 text-primary shrink-0 mt-1" aria-hidden="true" />
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Compliance Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {subscription?.organization_name ? `${subscription.organization_name} · ` : ""}
            Track inspection status, keep your certificates on file, and see what's expiring next.
          </p>
        </div>
      </div>

      <ComplianceHubSummary records={records} />

      <Tabs defaultValue="status" className="mt-8">
        <TabsList className="mb-4">
          <TabsTrigger value="status">Inspection status</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <ComplianceRecordsList
            records={records}
            subscriptionId={subscription?.id}
            onChanged={loadAll}
          />
        </TabsContent>

        <TabsContent value="documents">
          <ComplianceDocumentsPanel records={records} onChanged={loadAll} />
        </TabsContent>

        <TabsContent value="reminders">
          <ComplianceRemindersPanel records={records} subscription={subscription} />
        </TabsContent>
      </Tabs>
    </div>
  );
}