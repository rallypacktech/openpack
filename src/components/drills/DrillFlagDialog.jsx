import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FLAG_REASONS } from "@/lib/drillTypes";

// Any viewer can flag a listing that looks wrong; admins review the flags.
export default function DrillFlagDialog({ open, onOpenChange, drill, user, onRequireSignIn }) {
  const [reason, setReason] = useState("wrong_date");
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleOpen = (next) => {
    if (next) {
      setReason("wrong_date");
      setDetails("");
      setDone(false);
      setError("");
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!user) {
      onRequireSignIn();
      return;
    }
    setSaving(true);
    setError("");
    try {
      await base44.entities.DrillFlag.create({
        drill_id: drill.id,
        drill_title: drill.title,
        reason,
        details,
        flagged_by_email: user.email,
      });
      setDone(true);
    } catch (e) {
      setError(e?.message || "Could not send this flag. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Flag an issue</DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="py-4 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Thanks — this listing has been flagged for review. We'll check it against the
              organizer's own information.
            </p>
            <Button onClick={() => handleOpen(false)}>Close</Button>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Flagging <strong className="text-foreground">{drill?.title}</strong>
            </p>
            <div>
              <Label>What's wrong?</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FLAG_REASONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Anything else? (optional)</Label>
              <Textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder="Details that will help us check this listing." />
            </div>
            {!user && (
              <p className="text-xs text-muted-foreground">
                You'll be asked to sign in so we can follow up on your flag.
              </p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3 pt-1">
              <Button onClick={handleSubmit} className="flex-1" disabled={saving}>
                {saving ? "Sending…" : "Send flag"}
              </Button>
              <Button variant="outline" onClick={() => handleOpen(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}