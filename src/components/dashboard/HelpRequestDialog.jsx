import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Building2, Check } from "lucide-react";
import { CATEGORY_OPTIONS } from "@/components/business/NeedsBoardFilters";

const EMPTY_LOCATION = { country_name: "", admin1_name: "", admin2_name: "", postal_code: "" };

export default function HelpRequestDialog({ open, onOpenChange, profile, user, onConfirm }) {
  const [share, setShare] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [urgency, setUrgency] = useState("high");
  const [location, setLocation] = useState(EMPTY_LOCATION);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLocation({
      country_name: profile?.country || "",
      admin1_name: profile?.state_province || "",
      admin2_name: profile?.city || "",
      postal_code: profile?.postal_code || "",
    });
  }, [open, profile]);

  const setField = (key, value) => setLocation((l) => ({ ...l, [key]: value }));
  const canSubmit = !share || (title.trim() && description.trim());

  const submit = async () => {
    setSaving(true);
    try {
      await onConfirm({
        share,
        title: title.trim(),
        description: description.trim(),
        category,
        urgency,
        location,
      });
      setShare(false);
      setTitle("");
      setDescription("");
      setCategory("other");
      setUrgency("high");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Get Help</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Your family and emergency contacts are alerted right away. Choose whether to also
            ask organizations for help.
          </p>

          <div className="space-y-2">
            <button
              type="button"
              aria-pressed={!share}
              onClick={() => setShare(false)}
              className={`w-full text-left px-3 py-2.5 rounded border transition-colors ${
                !share ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Users className="w-4 h-4 text-primary" />
                Family &amp; contacts only
                {!share && <Check className="w-4 h-4 ml-auto text-primary" />}
              </span>
              <span className="block text-xs text-muted-foreground mt-1">
                Alerts the people on your emergency contact list. Nothing is posted publicly.
              </span>
            </button>

            <button
              type="button"
              aria-pressed={share}
              onClick={() => setShare(true)}
              className={`w-full text-left px-3 py-2.5 rounded border transition-colors ${
                share ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Building2 className="w-4 h-4 text-primary" />
                Also share with organizations
                {share && <Check className="w-4 h-4 ml-auto text-primary" />}
              </span>
              <span className="block text-xs text-muted-foreground mt-1">
                Posts your request on the Needs Board so nearby organizations can respond. Your
                email is shared with the organization that takes it.
              </span>
            </button>
          </div>

          {share && (
            <div className="space-y-3 border-t border-border pt-3">
              <div>
                <Label>What do you need? *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Drinking water and blankets"
                />
              </div>
              <div>
                <Label>Details *</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your situation and what would help most"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type of help</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Urgency</Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Country</Label>
                  <Input value={location.country_name} onChange={(e) => setField("country_name", e.target.value)} />
                </div>
                <div>
                  <Label>State / Territory</Label>
                  <Input value={location.admin1_name} onChange={(e) => setField("admin1_name", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>County / District / City</Label>
                  <Input value={location.admin2_name} onChange={(e) => setField("admin2_name", e.target.value)} />
                </div>
                <div>
                  <Label>Postal code</Label>
                  <Input value={location.postal_code} onChange={(e) => setField("postal_code", e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Posting as {profile?.display_name || user?.full_name || "you"}.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button onClick={submit} disabled={!canSubmit || saving} className="flex-1">
              {saving ? "Sending..." : "Send Request"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}