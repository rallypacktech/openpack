import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye, Users } from "lucide-react";
import SharedPlanView from "./SharedPlanView";

// Two directions of plan sharing in one place:
//  - invitations other people offered this account, which can be accepted or
//    declined without touching the caller's own plan;
//  - plans this account already has access to, opened read-only.
//
// Nothing is duplicated: accepting links the account to the owner's live record,
// so revoking the share ends the access immediately.

export default function SharedAccessPanel({ user, onChanged }) {
  const [invitations, setInvitations] = useState([]);
  const [shared, setShared] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState("");

  const load = async () => {
    if (!user?.email) return;
    const myEmail = user.email.toLowerCase();

    const [invited, linked] = await Promise.all([
      base44.entities.FamilyMember.filter({ emergency_contact: user.email }),
      base44.entities.FamilyMember.filter({ linked_user_id: user.id }),
    ]);

    setInvitations(
      invited.filter(
        (m) =>
          (m.created_by || "").toLowerCase() !== myEmail &&
          m.link_status === "pending"
      )
    );
    setShared(linked.filter((m) => m.link_status === "accepted"));
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.email]);

  const respond = async (member, action) => {
    setBusyId(member.id);
    try {
      await base44.functions.invoke("respondToPlanShare", {
        family_member_id: member.id,
        action,
      });
      await load();
      if (onChanged) onChanged();
    } catch (_e) {
      // Leave the card in place so the answer can be retried.
    } finally {
      setBusyId(null);
    }
  };

  const viewPlan = async (member) => {
    setPlan(null);
    setPlanError("");
    setPlanOpen(true);
    setPlanLoading(true);
    try {
      const res = await base44.functions.invoke("getSharedPlan", {
        family_member_id: member.id,
      });
      setPlan(res.data.plan);
    } catch (_e) {
      setPlanError("This plan could not be opened. It may have been unshared.");
    } finally {
      setPlanLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" role="status" aria-label="Loading shared access" />
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0 && shared.length === 0) return null;

  return (
    <Card id="shared-access-section">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" aria-hidden="true" /> Shared Access
        </CardTitle>
        <p className="text-sm text-muted-foreground font-sans mt-1">
          Plans family members have shared with you. Accepting never changes or copies your own plan.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground">
              Waiting for your answer
            </h3>
            {invitations.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-3 border border-border rounded-lg px-4 py-3">
                <div className="flex-1 min-w-[160px]">
                  <p className="font-sans font-semibold text-sm text-foreground">
                    {m.created_by}
                  </p>
                  <p className="text-xs text-muted-foreground font-sans">
                    Listed you as their {m.relationship || "family member"} and offered you access to their plan.
                  </p>
                </div>
                <Button size="sm" disabled={busyId === m.id} onClick={() => respond(m, "accept")} className="gap-1">
                  <Check className="w-3.5 h-3.5" aria-hidden="true" /> Accept
                </Button>
                <Button size="sm" variant="outline" disabled={busyId === m.id} onClick={() => respond(m, "decline")} className="gap-1">
                  <X className="w-3.5 h-3.5" aria-hidden="true" /> Decline
                </Button>
              </div>
            ))}
          </div>
        )}

        {shared.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground">
              You have access to
            </h3>
            {shared.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-3 border border-border rounded-lg px-4 py-3">
                <div className="flex-1 min-w-[160px]">
                  <p className="font-sans font-semibold text-sm text-foreground">
                    {m.name || m.created_by}
                  </p>
                  <p className="text-xs text-muted-foreground font-sans">{m.created_by}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">shared</Badge>
                <Button size="sm" variant="outline" onClick={() => viewPlan(m)} className="gap-1">
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" /> View plan
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <SharedPlanView
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        plan={plan}
        loading={planLoading}
        error={planError}
      />
    </Card>
  );
}