import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, MailX, RefreshCw } from "lucide-react";

export default function BouncedReferralsPanel() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.BusinessReferral.filter({ bounced: true }, "-created_date", 500);
      setReferrals(data);
    } catch (e) {
      console.error("Error loading bounced referrals", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bounced referral? It will no longer receive messages.")) return;
    setDeletingId(id);
    try {
      await base44.entities.BusinessReferral.delete(id);
      setReferrals((p) => p.filter((r) => r.id !== id));
    } catch (e) {
      console.error("Error deleting referral", e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (referrals.length === 0) return;
    if (!window.confirm(`Delete all ${referrals.length} bounced referrals? This cannot be undone.`)) return;
    setClearing(true);
    try {
      await base44.entities.BusinessReferral.deleteMany({ bounced: true });
      setReferrals([]);
    } catch (e) {
      console.error("Error clearing bounced referrals", e);
      load();
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading bounced referrals…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <MailX className="w-4 h-4" /> Bounced Referrals
          </h3>
          <p className="text-sm text-muted-foreground">
            Emails to these addresses bounced. Delete them so they no longer trigger follow-up messages.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          {referrals.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleClearAll} disabled={clearing}>
              {clearing ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              Delete all ({referrals.length})
            </Button>
          )}
        </div>
      </div>

      {referrals.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <MailX className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No bounced referrals.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {referrals.map((r) => (
            <Card key={r.id}>
              <CardContent className="py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {r.organization_name || r.referee_email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{r.referee_email}</p>
                  {r.referee_name && (
                    <p className="text-xs text-muted-foreground">Contact: {r.referee_name}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(r.id)}
                  disabled={deletingId === r.id}
                >
                  {deletingId === r.id ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                  )}
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}