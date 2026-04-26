import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CheckCircle, Send, Loader2, MessageSquare, Star, Bug, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Feedback() {
  const [form, setForm] = useState({
    type: "general",
    subject: "",
    message: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "beta@rallypack.tech",
        subject: `[RallyPack Feedback – ${form.type.charAt(0).toUpperCase() + form.type.slice(1)}] ${form.subject}`,
        body: `Feedback Type: ${form.type}\nFrom: ${form.email || "Anonymous"}\n\n${form.message}`,
      });
      setSubmitted(true);
      toast.success("Feedback sent! Thank you.");
    } catch {
      toast.error("Failed to send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const types = [
    { value: "general", label: "General", icon: MessageSquare },
    { value: "bug", label: "Bug Report", icon: Bug },
    { value: "feature", label: "Feature Request", icon: Lightbulb },
    { value: "rating", label: "Rating", icon: Star },
  ];

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
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#D64A2E] font-sans mb-3">Beta Program</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-4">Send Feedback</h1>
          <p className="text-muted-foreground font-sans max-w-xl leading-relaxed">
            RallyPack is in active beta. Your feedback directly shapes the product — we read every submission.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Bug, title: "Found a bug?", desc: "Tell us exactly what happened and we'll fix it fast." },
            { icon: Lightbulb, title: "Have an idea?", desc: "Feature requests from real users drive our roadmap." },
            { icon: Star, title: "Love something?", desc: "Let us know what's working — we'll protect it." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="border border-[#D8D2C6] rounded p-5 bg-white">
              <Icon className="w-5 h-5 text-[#D64A2E] mb-3" />
              <h2 className="font-serif text-base font-bold text-[#1C1C1A] mb-1">{title}</h2>
              <p className="text-xs text-[#1C1C1A]/60 leading-relaxed font-sans">{desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-[#1C1C1A] rounded p-8 text-white">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#D64A2E] font-sans mb-2">Your Voice</p>
          <h2 className="font-serif text-2xl font-bold mb-2">Submit Feedback</h2>
          <p className="text-sm text-white/50 font-sans mb-8">
            All feedback goes directly to <span className="text-white/80">beta@rallypack.tech</span>. We respond to most messages within 1–3 business days.
          </p>

          {submitted ? (
            <div className="flex items-center gap-3 bg-green-900/40 border border-green-600/40 rounded p-5">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="font-sans font-semibold text-white">Feedback received!</p>
                <p className="text-sm text-white/60 font-sans mt-0.5">Thank you — we'll review it and may follow up if you provided your email.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type selector */}
              <div>
                <Label className="text-white/70 text-xs uppercase tracking-widest mb-2 block">Feedback Type *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {types.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, type: value })}
                      className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-sans border transition-colors ${
                        form.type === value
                          ? "bg-[#D64A2E] border-[#D64A2E] text-white"
                          : "bg-white/10 border-white/20 text-white/60 hover:bg-white/20"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label className="text-white/70 text-xs uppercase tracking-widest mb-1.5 block">Subject *</Label>
                  <Input
                    required
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="Brief summary of your feedback"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-xs uppercase tracking-widest mb-1.5 block">Your Email (optional)</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="so we can follow up"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white/70 text-xs uppercase tracking-widest mb-1.5 block">Message *</Label>
                <Textarea
                  required
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us as much as you'd like. For bugs, describe what you did, what you expected, and what actually happened."
                  rows={5}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#D64A2E] hover:bg-[#be3f25] text-white font-sans font-semibold tracking-widest uppercase text-xs px-8 py-3"
              >
                {submitting
                  ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Sending…</>
                  : <><Send className="w-3.5 h-3.5 mr-2" /> Send Feedback</>}
              </Button>
            </form>
          )}
        </div>

        <p className="text-xs text-muted-foreground font-sans text-center mt-8">
          Prefer email? Write to <a href="mailto:beta@rallypack.tech" className="underline hover:text-foreground">beta@rallypack.tech</a>
        </p>
      </div>
    </div>
  );
}