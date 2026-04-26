import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { ExternalLink, CheckCircle, AlertTriangle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AffiliatePartnerPolicy() {
  const [form, setForm] = useState({
    item_name: "",
    category: "other",
    cache_type: "general",
    affiliate_link: "",
    description: "",
    suggested_price_cents: "",
    source_organization: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.entities.ProductRecommendationSuggestion.create({
        suggested_item_name: form.item_name,
        suggested_category: form.category,
        suggested_cache_type: form.cache_type,
        suggested_affiliate_link: form.affiliate_link,
        suggested_description: form.description,
        suggested_price_cents: form.suggested_price_cents ? Math.round(parseFloat(form.suggested_price_cents) * 100) : null,
        source_organization: form.source_organization,
        suggested_by: "Public Submission",
        status: "pending",
      });
      setSubmitted(true);
      toast.success("Suggestion submitted! We'll review it shortly.");
    } catch (e) {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">
      {/* Header */}
      <header className="bg-[#1C1C1A] text-white py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-serif text-xl font-bold text-white">RallyPack</Link>
          <Link to="/" className="text-xs text-white/50 hover:text-white transition-colors font-sans">← Back</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#D64A2E] font-sans mb-3">Partners & Affiliates</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-4">Affiliate & Partner Policy</h1>
          <p className="text-muted-foreground font-sans max-w-xl leading-relaxed">
            RallyPack is free and open-source. We partner with retailers and nonprofits whose products genuinely help families prepare.
          </p>
        </div>

        {/* Policy sections */}
        <div className="space-y-8 mb-16">
          {[
            {
              title: "Our Standard",
              icon: CheckCircle,
              color: "text-green-600",
              content: "Every affiliate link in RallyPack is manually reviewed by our team before it appears to users. We only approve products that are genuinely useful for emergency preparedness, fairly priced, and come from reputable retailers or organizations.",
            },
            {
              title: "What We Accept",
              icon: CheckCircle,
              color: "text-blue-600",
              content: "Emergency supplies, first aid equipment, communication tools, go-bag essentials, pet emergency supplies, and safety equipment. Products must be available nationally, clearly described, and not predatory in pricing.",
            },
            {
              title: "What We Reject",
              icon: AlertTriangle,
              color: "text-red-600",
              content: "Products with unreasonable markups, dubious effectiveness, or that exploit disaster anxiety. We also reject submissions from companies we cannot verify, and any products targeting vulnerable populations unfairly.",
            },
            {
              title: "Revenue & Transparency",
              icon: CheckCircle,
              color: "text-amber-600",
              content: "RallyPack may earn a small commission on affiliate purchases. This helps keep the platform free. We disclose affiliate relationships, and commissions never influence which products are approved — our standard is always user benefit first.",
            },
          ].map((s) => (
            <div key={s.title} className="border border-[#D8D2C6] rounded p-6 bg-white">
              <div className="flex items-center gap-3 mb-3">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <h2 className="font-serif text-xl font-bold text-[#1C1C1A]">{s.title}</h2>
              </div>
              <p className="font-sans text-sm text-[#1C1C1A]/70 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>

        {/* Submission Form */}
        <div className="bg-[#1C1C1A] rounded p-8 text-white">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#D64A2E] font-sans mb-2">Submit a Product</p>
          <h2 className="font-serif text-2xl font-bold mb-2">Suggest an Affiliate Product</h2>
          <p className="text-sm text-white/50 font-sans mb-8">
            Submissions are reviewed by our team within 5–10 business days. Approved products appear in user recommendations with your attribution.
          </p>

          {submitted ? (
            <div className="flex items-center gap-3 bg-green-900/40 border border-green-600/40 rounded p-5">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="font-sans font-semibold text-white">Submission received!</p>
                <p className="text-sm text-white/60 font-sans mt-0.5">We'll review it and get back to you within 5–10 business days.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label className="text-white/70 text-xs uppercase tracking-widest mb-1.5 block">Product Name *</Label>
                  <Input
                    required
                    value={form.item_name}
                    onChange={e => setForm({ ...form, item_name: e.target.value })}
                    placeholder="e.g., 72-Hour Emergency Food Kit"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-xs uppercase tracking-widest mb-1.5 block">Your Organization (optional)</Label>
                  <Input
                    value={form.source_organization}
                    onChange={e => setForm({ ...form, source_organization: e.target.value })}
                    placeholder="e.g., Red Cross, Amazon Seller"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <Label className="text-white/70 text-xs uppercase tracking-widest mb-1.5 block">Category *</Label>
                  <select
                    required
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded px-3 py-2 text-sm"
                  >
                    {["water","food","medical","tools","clothing","documents","communication","hygiene","other"].map(c => (
                      <option key={c} value={c} className="text-black">{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-white/70 text-xs uppercase tracking-widest mb-1.5 block">Cache Type *</Label>
                  <select
                    required
                    value={form.cache_type}
                    onChange={e => setForm({ ...form, cache_type: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded px-3 py-2 text-sm"
                  >
                    <option value="general" className="text-black">General / Home</option>
                    <option value="go_bag" className="text-black">Go Bag</option>
                    <option value="automobile" className="text-black">Automobile</option>
                  </select>
                </div>
                <div>
                  <Label className="text-white/70 text-xs uppercase tracking-widest mb-1.5 block">Price (USD, optional)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.suggested_price_cents}
                    onChange={e => setForm({ ...form, suggested_price_cents: e.target.value })}
                    placeholder="e.g., 29.99"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white/70 text-xs uppercase tracking-widest mb-1.5 block">Affiliate / Product Link *</Label>
                <Input
                  required
                  type="url"
                  value={form.affiliate_link}
                  onChange={e => setForm({ ...form, affiliate_link: e.target.value })}
                  placeholder="https://amazon.com/..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                />
              </div>

              <div>
                <Label className="text-white/70 text-xs uppercase tracking-widest mb-1.5 block">Why is this essential for emergency preparedness? *</Label>
                <Textarea
                  required
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the product and why it helps families prepare..."
                  rows={4}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#D64A2E] hover:bg-[#be3f25] text-white font-sans font-semibold tracking-widest uppercase text-xs px-8 py-3"
              >
                {submitting
                  ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Submitting…</>
                  : <><Send className="w-3.5 h-3.5 mr-2" /> Submit for Review</>}
              </Button>
            </form>
          )}
        </div>

        <p className="text-xs text-muted-foreground font-sans text-center mt-8">
          Questions? Email <a href="mailto:partners@rallypack.org" className="underline hover:text-foreground">partners@rallypack.org</a>
        </p>
      </div>
    </div>
  );
}