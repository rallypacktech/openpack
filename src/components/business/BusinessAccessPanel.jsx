import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Mail, ShieldCheck, ArrowRightLeft, UserRound, CheckCircle2, XCircle, Clock, Loader2, Unlink,
} from "lucide-react";

// Business access lives alongside a person's personal account. Connecting a
// business email alias never moves their personal plans, caches or meet spots —
// it only links them to the organization's business side. When someone leaves,
// the owner or an org admin offers the business side to a replacement, and
// nothing changes hands until the replacement accepts.
export default function BusinessAccessPanel({ subscription, locations, context, onRefresh }) {
  const { toast } = useToast();
  const [alias, setAlias] = useState("");
  const [code, setCode] = useState("");
  const [pendingAlias, setPendingAlias] = useState("");
  const [busy, setBusy] = useState("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [form, setForm] = useState({ scope: "organization", location_id: "", to_email: "", to_name: "", note: "" });

  const businessEmail = context?.business_email || "";
  const personalEmail = context?.personal_email || "";
  const orgContext = (context?.organizations || []).find((o) => o.subscription?.id === subscription?.id);
  const canManage = orgContext?.is_org_admin === true;
  const incoming = context?.incoming_transfers || [];
  const outgoing = context?.outgoing_transfers || [];

  const call = async (payload, key) => {
    setBusy(key);
    try {
      const res = await base44.functions.invoke("manageBusinessTransfer", payload);
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    } finally {
      setBusy("");
    }
  };

  const handleLink = async () => {
    try {
      const data = await call({ action: "link_alias", business_email: alias }, "link");
      if (data.verified) {
        toast({
          title: "Business email already confirmed",
          description: "Your personal data is untouched.",
        });
        setAlias("");
        setPendingAlias("");
        onRefresh();
        return;
      }
      setPendingAlias(data.business_email || alias);
      setCode("");
      toast({
        title: "Confirmation code sent",
        description: `Enter the code we sent to ${data.business_email || alias} to finish connecting it.`,
      });
    } catch (e) {
      toast({ title: "Could not connect", description: e.message, variant: "destructive" });
    }
  };

  const handleConfirm = async () => {
    try {
      await call({ action: "confirm_alias", business_email: pendingAlias, code }, "confirm");
      toast({
        title: "Business email confirmed",
        description: "It is now linked to the organization's business side. Your personal data is untouched.",
      });
      setPendingAlias("");
      setCode("");
      setAlias("");
      onRefresh();
    } catch (e) {
      toast({ title: "Could not confirm", description: e.message, variant: "destructive" });
    }
  };

  const handleUnlink = async () => {
    if (!confirm("Disconnect your business email? Your personal account and data stay exactly as they are.")) return;
    try {
      await call({ action: "unlink_alias" }, "unlink");
      toast({ title: "Business email disconnected" });
      onRefresh();
    } catch (e) {
      toast({ title: "Could not disconnect", description: e.message, variant: "destructive" });
    }
  };

  const handleInitiate = async () => {
    try {
      await call(
        {
          action: "initiate",
          subscription_id: subscription?.id,
          scope: form.scope,
          location_id: form.location_id,
          to_email: form.to_email,
          to_name: form.to_name,
          note: form.note,
        },
        "initiate",
      );
      toast({
        title: "Transfer offered",
        description: "It takes effect once the replacement accepts.",
      });
      setShowTransfer(false);
      setForm({ scope: "organization", location_id: "", to_email: "", to_name: "", note: "" });
      onRefresh();
    } catch (e) {
      toast({ title: "Could not start transfer", description: e.message, variant: "destructive" });
    }
  };

  const respond = async (transfer, decision) => {
    try {
      await call({ action: decision, transfer_id: transfer.id }, `${decision}-${transfer.id}`);
      toast({
        title: decision === "accept" ? "Access accepted" : decision === "decline" ? "Transfer declined" : "Transfer cancelled",
        description:
          decision === "accept"
            ? "The business side is yours. Your personal plans, caches and meet spots are unchanged."
            : undefined,
      });
      onRefresh();
    } catch (e) {
      toast({ title: "Something went wrong", description: e.message, variant: "destructive" });
    }
  };

  const TransferCard = ({ transfer, incoming: isIncoming }) => (
    <Card className={isIncoming ? "border-primary/40" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <ArrowRightLeft className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium text-sm">
                {transfer.scope === "location"
                  ? `${transfer.location_name || "Location"} — location management`
                  : `${transfer.organization_name || "Organization"} — organization ownership`}
              </span>
              <Badge variant="outline" className="text-xs capitalize">{transfer.scope}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isIncoming ? "From" : "To"}: <strong>{isIncoming ? transfer.from_email : transfer.to_email}</strong>
              {transfer.initiated_by_email && ` · started by ${transfer.initiated_by_email}`}
            </p>
            {transfer.note && (
              <p className="text-xs text-muted-foreground mt-1 italic">"{transfer.note}"</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {isIncoming ? (
              <>
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={busy === `accept-${transfer.id}`}
                  onClick={() => respond(transfer, "accept")}
                >
                  {busy === `accept-${transfer.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  disabled={busy === `decline-${transfer.id}`}
                  onClick={() => respond(transfer, "decline")}
                >
                  <XCircle className="w-3.5 h-3.5" /> Decline
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={busy === `cancel-${transfer.id}`}
                onClick={() => respond(transfer, "cancel")}
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Personal vs business */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <UserRound className="w-4 h-4 text-primary" /> Your personal and business identities
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Your personal account keeps your own plans, caches, meet spots and family details. The
            business email below is just a contact identity that links you to this organization's
            business side — connecting or disconnecting it never moves your personal data. We email
            a code to that address first, so only its owner can attach it to an account.
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <UserRound className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Personal sign-in:</span>
              <strong className="text-foreground">{personalEmail || "—"}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Business email:</span>
              {businessEmail ? (
                <strong className="text-foreground">{businessEmail}</strong>
              ) : (
                <span className="text-muted-foreground italic">not connected</span>
              )}
            </div>
          </div>

          <div className="flex items-end gap-2 mt-4 flex-wrap">
            <div className="flex-1 min-w-[220px]">
              <Label>{businessEmail ? "Replace business email" : "Connect your business email"}</Label>
              <Input
                type="email"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <Button onClick={handleLink} disabled={!alias || busy === "link"} className="gap-2">
              {busy === "link" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Connect
            </Button>
            {businessEmail && (
              <Button variant="outline" onClick={handleUnlink} disabled={busy === "unlink"} className="gap-2">
                <Unlink className="w-3.5 h-3.5" /> Disconnect
              </Button>
            )}
          </div>

          {pendingAlias && (
            <div className="mt-4 rounded border border-primary/30 bg-primary/5 p-3">
              <p className="text-xs text-muted-foreground">
                We sent a 6-digit code to <strong className="text-foreground">{pendingAlias}</strong>.
                Enter it to prove the address is yours.
              </p>
              <div className="flex items-end gap-2 mt-2 flex-wrap">
                <div className="flex-1 min-w-[160px]">
                  <Label>Confirmation code</Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                  />
                </div>
                <Button
                  onClick={handleConfirm}
                  disabled={code.trim().length < 6 || busy === "confirm"}
                  className="gap-2"
                >
                  {busy === "confirm" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Confirm
                </Button>
                <Button variant="ghost" onClick={() => setPendingAlias("")}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Waiting on you */}
      {incoming.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Waiting on your response
          </h3>
          <div className="space-y-2">
            {incoming.map((t) => <TransferCard key={t.id} transfer={t} incoming />)}
          </div>
        </div>
      )}

      {/* Handoff */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-primary" /> Hand off business access
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                When someone leaves, the owner or an organization admin can offer the organization's
                ownership — or a single location's management — to a replacement. The replacement
                keeps their own personal account; the departing person keeps theirs.
              </p>
            </div>
            <Button size="sm" onClick={() => setShowTransfer(true)} disabled={!canManage} className="gap-2">
              <ArrowRightLeft className="w-3.5 h-3.5" /> Start a Transfer
            </Button>
          </div>
          {!canManage && (
            <p className="text-xs text-muted-foreground mt-3">
              Only the current owner or an organization admin can start a transfer.
            </p>
          )}

          {outgoing.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                Offered, awaiting acceptance
              </p>
              {outgoing.map((t) => <TransferCard key={t.id} transfer={t} incoming={false} />)}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer business access</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>What is moving?</Label>
              <Select
                value={form.scope}
                onValueChange={(v) => setForm((f) => ({ ...f, scope: v, location_id: "" }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="organization">Whole organization ownership</SelectItem>
                  <SelectItem value="location">One location's management</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.scope === "location" && (
              <div>
                <Label>Location</Label>
                <Select
                  value={form.location_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, location_id: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Choose a location" /></SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Replacement Name</Label>
                <Input
                  value={form.to_name}
                  onChange={(e) => setForm((f) => ({ ...f, to_name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Replacement Business Email *</Label>
                <Input
                  type="email"
                  value={form.to_email}
                  onChange={(e) => setForm((f) => ({ ...f, to_email: e.target.value }))}
                  placeholder="newowner@company.com"
                />
              </div>
            </div>
            <div>
              <Label>Note to the replacement</Label>
              <Textarea
                rows={2}
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Optional context about this handoff"
              />
            </div>
            <div className="bg-muted/50 rounded p-3 text-xs text-muted-foreground">
              The replacement must connect this same business email to their own RallyPack account and
              accept before anything changes hands. Personal data is never transferred.
            </div>
            <div className="flex gap-3 pt-1">
              <Button
                onClick={handleInitiate}
                className="flex-1"
                disabled={!form.to_email || busy === "initiate"}
              >
                {busy === "initiate" ? "Offering…" : "Offer Transfer"}
              </Button>
              <Button variant="outline" onClick={() => setShowTransfer(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}