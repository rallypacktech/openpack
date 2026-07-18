import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, Trash2, RotateCcw, Clock, Database } from "lucide-react";

function getDaysUntilPurge(purgeAfter) {
  if (!purgeAfter) return 0;
  const diff = new Date(purgeAfter).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function DeletionQueuePanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.asServiceRole.entities.DeletionQueue.list("-deleted_at");
      setEntries(data);
    } catch (e) {
      console.error("Error loading deletion queue:", e);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleRestore = async (entryId) => {
    const targetId = restoreTarget[entryId];
    if (!window.confirm(targetId
      ? "Restore records from this snapshot and associate with the target user? The user must be re-invited first."
      : "Restore records from this snapshot? Records will be re-created with service role — you'll need to manually associate them with the user.")) return;

    setActionId(entryId);
    try {
      const payload = { queue_entry_id: entryId };
      if (targetId) payload.target_user_id = targetId;
      await base44.functions.invoke("restoreFromDeletionQueue", payload);
      await load();
    } catch (e) {
      window.alert("Restore failed: " + (e.message || "Unknown error"));
    }
    setActionId(null);
  };

  const handlePurgeNow = async (entryId) => {
    if (!window.confirm("Permanently purge this deletion snapshot NOW? This cannot be undone.")) return;
    setActionId(entryId);
    try {
      await base44.asServiceRole.entities.DeletionQueue.delete(entryId);
      await load();
    } catch (e) {
      console.error("Purge error:", e);
    }
    setActionId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Database className="w-5 h-5" /> Deletion Queue (90-Day Retention)
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            When users delete their accounts, a data snapshot is retained for 90 days. Expired snapshots are purged automatically.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No deletion queue entries.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const daysLeft = getDaysUntilPurge(entry.purge_after);
            const isExpired = daysLeft <= 0;
            const snapshot = entry.data_snapshot || {};
            const snapshotCounts = Object.entries(snapshot).map(([k, v]) => ({
              key: k,
              count: Array.isArray(v) ? v.length : (v ? 1 : 0)
            })).filter(s => s.count > 0);

            return (
              <Card key={entry.id} className={entry.restored ? "border-green-300" : isExpired ? "border-red-300" : "border-amber-200"}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2">
                        {entry.deleted_user_name || entry.deleted_user_email}
                        {entry.restored && <Badge className="bg-green-100 text-green-800">Restored</Badge>}
                        {!entry.restored && isExpired && <Badge variant="destructive">Expired — pending purge</Badge>}
                        {!entry.restored && !isExpired && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                            <Clock className="w-3 h-3 mr-1" /> {daysLeft} days left
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.deleted_user_email} · Deleted: {entry.deleted_at ? new Date(entry.deleted_at).toLocaleDateString() : "unknown"}
                        {entry.restored && entry.restored_at && ` · Restored: ${new Date(entry.restored_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Snapshot summary */}
                  <div className="flex flex-wrap gap-2">
                    {snapshotCounts.map(s => (
                      <Badge key={s.key} variant="secondary" className="text-xs">
                        {s.key.replace(/_/g, " ")}: {s.count}
                      </Badge>
                    ))}
                    {snapshotCounts.length === 0 && (
                      <span className="text-xs text-muted-foreground">Empty snapshot</span>
                    )}
                  </div>

                  {/* Restore controls */}
                  {!entry.restored && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2 pt-2 border-t">
                      <div className="flex-1 min-w-[200px]">
                        <Label className="text-xs">Target User ID (for re-association, optional)</Label>
                        <Input
                          value={restoreTarget[entry.id] || ""}
                          onChange={(e) => setRestoreTarget(prev => ({ ...prev, [entry.id]: e.target.value }))}
                          placeholder="Paste re-invited user's ID"
                          className="mt-1 h-8 text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(entry.id)}
                          disabled={actionId === entry.id}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          {actionId === entry.id ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 mr-1" />}
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePurgeNow(entry.id)}
                          disabled={actionId === entry.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Purge Now
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}