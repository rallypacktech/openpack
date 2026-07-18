import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Trash2, AlertTriangle, Link2 } from "lucide-react";

const ENTITY_LABELS = {
  orphaned_cache_items: { label: "Cache Items (no parent cache)", entity: "CacheItem", icon: "📦" },
  orphaned_first_aid_locations: { label: "First Aid Locations (no parent cache)", entity: "FirstAidKitLocation", icon: "🩹" },
  orphaned_notifications: { label: "Notifications (no valid user)", entity: "Notification", icon: "🔔" },
  orphaned_family_members: { label: "Family Members (no valid user)", entity: "FamilyMember", icon: "👨‍👩‍👧" },
  orphaned_pets: { label: "Pets (no valid user)", entity: "Pet", icon: "🐾" },
  orphaned_meet_spots: { label: "Meet Spots (no valid user)", entity: "MeetSpot", icon: "📍" },
  orphaned_evacuation_destinations: { label: "Evacuation Destinations (no valid user)", entity: "EvacuationDestination", icon: "🏠" },
};

export default function OrphanedDataPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const scan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("scanOrphanedData", {});
      if (res.data) setData(res.data);
    } catch (e) {
      console.error("Scan error:", e);
    }
    setLoading(false);
  }, []);

  const handleDelete = async (entityName, recordId) => {
    if (!window.confirm("Permanently delete this orphaned record?")) return;
    setDeleting(recordId);
    try {
      await base44.asServiceRole.entities[entityName].delete(recordId);
      // Re-scan after deletion
      await scan();
    } catch (e) {
      console.error("Delete error:", e);
    }
    setDeleting(null);
  };

  const hasResults = data && data.summary && data.summary.total > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Orphaned Data Scanner
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Finds records not connected to a valid user or parent record. Safe to delete or re-associate.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={scan} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Scan Now
        </Button>
      </div>

      {loading && !data && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(ENTITY_LABELS).map(([key, config]) => (
              <Card key={key} className={data.summary[key.replace('orphaned_', '').replace('orphaned_', '')] > 0 ? "border-amber-300" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{config.icon}</span>
                    <div>
                      <p className="text-2xl font-bold">{data.summary[key.replace('orphaned_', '')] || 0}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{config.label.split("(")[0].trim()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!hasResults && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-green-600 font-medium">✓ No orphaned records found</p>
                <p className="text-sm text-muted-foreground mt-1">All data is properly connected.</p>
              </CardContent>
            </Card>
          )}

          {/* Detail lists */}
          {hasResults && (
            <div className="space-y-4">
              {Object.entries(ENTITY_LABELS).map(([key, config]) => {
                const records = data[key];
                if (!records || records.length === 0) return null;
                return (
                  <Card key={key}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <span>{config.icon}</span> {config.label}
                        <Badge variant="secondary">{records.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {records.map((r) => (
                          <div key={r.id} className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {r.item_name || r.name || r.title || r.recipient_email || "Unnamed record"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                ID: {r.id} · Created: {r.created_date ? new Date(r.created_date).toLocaleDateString() : "unknown"}
                                {r.created_by_id && ` · User: ${r.created_by_id.substring(0, 8)}...`}
                                {r.cache_id && ` · Cache: ${r.cache_id.substring(0, 8)}...`}
                                {r.emergency_cache_id && ` · Cache: ${r.emergency_cache_id.substring(0, 8)}...`}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(config.entity, r.id)}
                              disabled={deleting === r.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {deleting === r.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}