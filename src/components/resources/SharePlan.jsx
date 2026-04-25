import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Copy, Mail, Users, Link, CheckCircle, Download, FileText } from "lucide-react";

export default function SharePlan() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [caches, setCaches] = useState([]);
  const [meetSpots, setMeetSpots] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [pets, setPets] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [planText, setPlanText] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [profileData, cachesResp, spotsResp, membersData, petsData] = await Promise.all([
          base44.entities.UserProfile.filter({ created_by: u.email }),
          base44.functions.invoke("getCaches"),
          base44.functions.invoke("getMeetSpots"),
          base44.entities.FamilyMember.filter({ created_by: u.email }),
          base44.entities.Pet.filter({ created_by: u.email }),
        ]);
        const p = profileData[0] || null;
        setProfile(p);
        setCaches(cachesResp.data.caches || []);
        setMeetSpots(spotsResp.data.spots || []);
        setFamilyMembers(membersData);
        setPets(petsData);

        // Build plain-text plan summary
        const lines = [];
        lines.push("===== RALLYPACK EMERGENCY PLAN =====");
        lines.push(`Prepared by: ${u.full_name || u.email}`);
        if (p?.city) lines.push(`Location: ${p.city}, ${p.state_province}`);
        lines.push("");

        if (spotsResp.data.spots?.length) {
          lines.push("--- MEETING SPOTS ---");
          spotsResp.data.spots.forEach((s) => {
            lines.push(`• ${s.is_primary ? "[PRIMARY] " : ""}${s.name}${s.address ? " — " + s.address : ""}`);
            if (s.description) lines.push(`  ${s.description}`);
          });
          lines.push("");
        }

        if (cachesResp.data.caches?.length) {
          lines.push("--- EMERGENCY CACHES ---");
          cachesResp.data.caches.forEach((c) => {
            lines.push(`• ${c.name} (${c.cache_type?.replace("_", " ")}) — Location: ${c.location}`);
          });
          lines.push("");
        }

        if (membersData.length) {
          lines.push("--- HOUSEHOLD MEMBERS ---");
          membersData.forEach((m) => {
            lines.push(`• ${m.name} (${m.relationship})${m.emergency_contact ? " — Contact: " + m.emergency_contact : ""}`);
            if (m.medical_conditions) lines.push(`  Medical: ${m.medical_conditions}`);
          });
          lines.push("");
        }

        if (petsData.length) {
          lines.push("--- PETS ---");
          petsData.forEach((pet) => {
            lines.push(`• ${pet.name} (${pet.species}${pet.breed ? ", " + pet.breed : ""})${pet.microchip_number ? " — Chip: " + pet.microchip_number : ""}`);
            if (pet.medical_conditions) lines.push(`  Medical: ${pet.medical_conditions}`);
          });
          lines.push("");
        }

        lines.push("In an emergency, always call 911 first.");
        lines.push("FEMA Helpline: 1-800-621-3362");
        lines.push("=====================================");
        setPlanText(lines.join("\n"));
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + "/Dashboard");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyPlan = () => {
    navigator.clipboard.writeText(planText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([planText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rallypack-emergency-plan.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEmailShare = async () => {
    if (!emailInput.trim()) return;
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: emailInput.trim(),
        subject: `${user?.full_name || "Someone"} shared their RallyPack Emergency Plan with you`,
        body: `Hi,\n\n${user?.full_name || "A RallyPack user"} has shared their emergency preparedness plan with you.\n\n${planText}\n\nYou can create your own free plan at ${window.location.origin}\n\nStay safe,\nRallyPack`,
      });
      setEmailSent(true);
      setEmailInput("");
      setTimeout(() => setEmailSent(false), 4000);
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Share Your Emergency Plan</h2>
        <p className="text-muted-foreground font-sans text-sm">
          Share your plan with family, friends, or neighbors — whether they have a RallyPack account or not.
        </p>
      </div>

      {/* Email to anyone */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Mail className="w-4 h-4 text-primary" /> Email Your Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground font-sans">
            Send a full copy of your emergency plan — meet spots, caches, and household info — to anyone. No account required to receive it.
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="email@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailShare()}
              className="flex-1"
            />
            <Button onClick={handleEmailShare} disabled={sending || !emailInput.trim()} className="bg-foreground text-background hover:bg-foreground/90">
              {sending ? "Sending…" : "Send"}
            </Button>
          </div>
          {emailSent && (
            <p className="flex items-center gap-2 text-sm text-green-600 font-sans">
              <CheckCircle className="w-4 h-4" /> Plan sent successfully!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Copy / Download plan text */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="w-4 h-4 text-primary" /> Copy or Download Your Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground font-sans">
            Great for printing and posting at home, in a go-bag, or sharing via text message.
          </p>
          <pre className="bg-secondary/50 rounded p-4 text-xs font-mono text-foreground whitespace-pre-wrap max-h-52 overflow-y-auto border border-border">
            {planText || "Loading plan…"}
          </pre>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleCopyPlan} className="flex items-center gap-2 text-sm">
              {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Plan"}
            </Button>
            <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Download .txt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invite to RallyPack */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Users className="w-4 h-4 text-primary" /> Invite to RallyPack
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground font-sans">
            Invite family members or neighbors to create their own free RallyPack account so they can build their own plan.
          </p>
          <div className="flex gap-2">
            <Input readOnly value={`${window.location.origin}`} className="flex-1 bg-secondary/40 text-sm" />
            <Button variant="outline" onClick={handleCopyLink} className="flex items-center gap-2 text-sm">
              {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Link className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground font-sans">
        <strong>Tip:</strong> Print a copy and keep it in your go-bag, car, and somewhere at home — cell service fails during most major emergencies.
      </p>
    </div>
  );
}