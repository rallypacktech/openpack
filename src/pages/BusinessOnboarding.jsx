import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, CheckCircle2, Users, Shield, MapPin, ArrowRight } from "lucide-react";
import PricingSection from "@/components/business/PricingSection";

export default function BusinessOnboarding() {
  const [form, setForm] = useState({
    referee_email: "",
    referee_name: "",
    organization_name: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.referee_email) return;
    setSending(true);
    setError(null);
    try {
      const me = await base44.auth.me().catch(() => null);
      await base44.functions.invoke("sendBusinessReferral", {
        referee_email: form.referee_email,
        referee_name: form.referee_name,
        organization_name: form.organization_name,
        message: form.message,
        referrer_name: me?.full_name || "",
        referrer_email: me?.email || "",
      });
      setSent({ email: form.referee_email, name: form.referee_name, org: form.organization_name, message: form.message });
      setForm({ referee_email: "", referee_name: "", organization_name: "", message: "" });
    } catch (err) {
      setError(err.message || "Failed to send referral");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream font-sans">
      {/* Hero */}
      <section className="bg-[#1C1C1A] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Building2 className="w-12 h-12 text-[#D64A2E] mx-auto mb-6" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Fire Marshal Compliance, Simplified
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
            Track every first aid kit across every floor, keep supplies in date, and document your evacuation plan — all in one place. Show the fire marshal you're ready.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "Multi-Kit Inventory", desc: "Track first aid kits across every floor, wing, and building. Get expiry alerts before supplies go out of date." },
            { icon: MapPin, title: "Evacuation Plans", desc: "Document evacuation routes, assembly points, and procedures — ready to show the fire marshal." },
            { icon: Users, title: "Compliance Roster", desc: "Maintain your chain of command and assigned floor wardens. Prove your team is trained and accounted for." },
          ].map((f) => (
            <Card key={f.title} className="text-center border-border">
              <CardContent className="pt-8 pb-6 px-6">
                <f.icon className="w-8 h-8 text-[#D64A2E] mx-auto mb-4" />
                <h3 className="font-sans font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works — Compliance Workflow */}
      <section className="py-16 max-w-5xl mx-auto px-6 bg-amber-50/50">
        <div className="text-center mb-8">
          <CheckCircle2 className="w-10 h-10 text-[#D64A2E] mx-auto mb-4" />
          <h2 className="font-serif text-3xl font-bold text-foreground mb-3">Audit-Ready in Four Steps</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Whether the fire marshal walks in tomorrow or next quarter, your kit inventory, expiry dates, and evacuation plan are all in one place and up to date.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { step: "1", title: "Add Your Kits", desc: "Log every first aid kit by building, floor, or room. Record contents and expiry dates." },
            { step: "2", title: "Document Your Plan", desc: "Map evacuation routes, assembly points, and floor wardens. Assign chain-of-command." },
            { step: "3", title: "Stay Compliant", desc: "Automatic expiry alerts keep supplies current. No more expired kits during an inspection." },
            { step: "4", title: "Show the Marshal", desc: "Pull up your dashboard — kits, plans, and trained personnel, all in one view." },
          ].map(s => (
            <Card key={s.step} className="text-center border-border">
              <CardContent className="pt-6 pb-4 px-4">
                <div className="w-8 h-8 rounded-full bg-[#D64A2E] text-white flex items-center justify-center font-bold text-sm mx-auto mb-3">{s.step}</div>
                <h3 className="font-sans font-semibold text-foreground text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* Referral Form */}
      <section className="py-12 max-w-2xl mx-auto px-6 pb-24">
        <Card className="border-border shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-[#D64A2E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-[#D64A2E]" />
            </div>
            <CardTitle className="font-serif text-2xl font-bold text-foreground">
              Refer a Business Team
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Know an organization that could benefit from RallyPack? Send them an invite — we'll handle the rest.
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">Referral Submitted!</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  We've logged the referral and notified the RallyPack team. Want to send a personal note too?
                </p>
                <div className="flex flex-col gap-3 items-center">
                  <a
                    href={`mailto:${sent.email}?subject=${encodeURIComponent(
                      (sent.org ? sent.org + ' — ' : '') + 'Check out RallyPack for Business'
                    )}&body=${encodeURIComponent(
                      `Hi${sent.name ? ' ' + sent.name : ''},\n\n` +
                      `I thought your organization${sent.org ? ' (' + sent.org + ')' : ''} would benefit from RallyPack — it tracks first aid kit inventory, expiry dates, and evacuation plans so you're always fire marshal ready.\n\n` +
                      `Features include:\n• Multi-location first aid kit tracking with expiry alerts\n• Evacuation plan documentation\n• Floor warden & chain-of-command roster\n\n` +
                      (sent.message ? `My note: ${sent.message}\n\n` : '') +
                      `Check it out: https://rallypack.tech/BusinessOnboarding\n\nThanks!`
                    )}`}
                    className="inline-flex items-center gap-2 bg-[#D64A2E] text-white font-semibold text-sm px-6 py-2.5 rounded hover:bg-[#be3f25] transition-colors"
                  >
                    <Mail className="w-4 h-4" /> Email them directly
                  </a>
                  <Button
                    onClick={() => setSent(false)}
                    variant="outline"
                    className="text-sm"
                  >
                    Send Another Referral
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="referee_email">Business Email *</Label>
                  <Input
                    id="referee_email"
                    type="email"
                    required
                    value={form.referee_email}
                    onChange={handleChange("referee_email")}
                    placeholder="team@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="referee_name">Contact Name</Label>
                  <Input
                    id="referee_name"
                    value={form.referee_name}
                    onChange={handleChange("referee_name")}
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="organization_name">Organization Name</Label>
                  <Input
                    id="organization_name"
                    value={form.organization_name}
                    onChange={handleChange("organization_name")}
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Personal Message (optional)</Label>
                  <Textarea
                    id="message"
                    rows={3}
                    value={form.message}
                    onChange={handleChange("message")}
                    placeholder="We think RallyPack would help your team stay prepared for emergencies..."
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
                )}
                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-[#D64A2E] hover:bg-[#be3f25] text-white font-semibold"
                >
                  {sending ? "Sending..." : "Send Referral"}
                  {!sending && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Want to set up your own business account?{" "}
          <Link to={createPageUrl("BusinessDashboard")} className="text-[#D64A2E] hover:underline font-medium">
            Get started here
          </Link>
        </p>
      </section>
    </div>
  );
}