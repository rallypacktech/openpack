import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle, Loader2 } from "lucide-react";

export default function FooterContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "beta@rallypack.org",
        subject: `RallyPack Contact: ${form.name}`,
        body: `From: ${form.name} <${form.email}>\n\n${form.message}`,
      });
      setSent(true);
    } catch (err) {
      alert("Failed to send. Please email us directly at beta@rallypack.org");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center gap-3 py-4">
        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
        <p className="text-sm font-sans text-white/60">Message sent! We'll reply within 2 business days.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          required
          placeholder="Your name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm"
        />
        <Input
          required
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm"
        />
      </div>
      <Textarea
        required
        placeholder="How can we help?"
        value={form.message}
        onChange={e => setForm({ ...form, message: e.target.value })}
        rows={3}
        className="bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm resize-none"
      />
      <Button
        type="submit"
        disabled={submitting}
        className="bg-[#D64A2E] hover:bg-[#be3f25] text-white text-xs font-sans font-semibold tracking-widest uppercase px-6 py-2"
      >
        {submitting
          ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Sending…</>
          : <><Send className="w-3 h-3 mr-1.5" /> Send Message</>}
      </Button>
    </form>
  );
}