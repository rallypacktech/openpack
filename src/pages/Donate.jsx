import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, Loader2, CheckCircle, Server, User, Globe, Mail, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const AMOUNTS = [5, 10, 25, 50, 100];

const COST_ICONS = {
  "Founder & Developer Salary": User,
  "Base44 Builder Subscription": Server,
  "Domain Registration (Name.com)": Globe,
  "Email & Communication Tools": Mail,
  "Payment Processing & Buffer": CreditCard,
};

export default function Donate() {
  const [selected, setSelected] = useState(10);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const donated = urlParams.get("donated") === "true";

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setProgressLoading(true);
    try {
      const res = await base44.functions.invoke("getDonationProgress", {});
      if (res.data) setProgress(res.data);
    } catch (e) {}
    setProgressLoading(false);
  };

  const handleDonate = async () => {
    const amount = custom ? parseFloat(custom) : selected;
    if (!amount || amount < 1) return;
    setLoading(true);

    const payload = {
      items: [{
        item_name: `Support RallyPack — $${amount}`,
        description: "One-time donation to support free emergency preparedness",
        price_cents: Math.round(amount * 100),
        quantity: 1,
      }],
      metadata: { donation: "true" },
      success_url: `${window.location.origin}/Donate?donated=true`,
      cancel_url: `${window.location.origin}/Donate`,
    };

    const res = await base44.functions.invoke("createCheckoutSession", payload);
    if (res.data?.url) window.location.href = res.data.url;
    setLoading(false);
  };

  if (donated) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="font-serif text-4xl font-bold text-[#1C1C1A] mb-3">Thank you.</h1>
          <p className="text-[#1C1C1A]/60 font-sans leading-relaxed mb-8">
            Your contribution directly funds the tools and infrastructure that keep RallyPack free for families who need it most.
          </p>
          <a href="/" className="inline-flex items-center gap-2 bg-[#D64A2E] text-white font-sans font-semibold px-8 py-3 hover:bg-[#be3f25] transition-colors text-sm tracking-widest uppercase">
            Back to RallyPack
          </a>
        </div>
      </div>
    );
  }

  const progressPct = progress?.progress_pct || 0;
  const goalReached = progressPct >= 100;

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Hero */}
      <div className="bg-[#1C1C1A] text-white py-20 px-4 text-center">
        <Heart className="w-10 h-10 text-[#D64A2E] mx-auto mb-5" />
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-sans mb-3">Support the mission</p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-none">
          Keep RallyPack<br /><span className="text-[#D64A2E]">free for everyone.</span>
        </h1>
        <p className="text-white/60 font-sans max-w-xl mx-auto leading-relaxed text-base">
          No venture funding. No ads on your safety data. No paywalled features. RallyPack is sustained by people who believe every family deserves to be prepared.
        </p>
      </div>

      {/* Progress bar */}
      <div className="max-w-3xl mx-auto px-4 -mt-8 mb-12">
        <div className="bg-white border border-[#D8D2C6] p-8 shadow-sm">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8A8577] font-sans mb-1">2026 Operating Goal</p>
              <p className="font-serif text-3xl font-bold text-[#1C1C1A]">
                {progressLoading ? "—" : progress?.total_raised_display || "$0"}
                <span className="text-base text-[#1C1C1A]/40 font-sans font-normal"> / {progress?.goal_display || "$125,000"}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-3xl font-bold text-[#D64A2E]">{progressLoading ? "—" : `${progressPct}%`}</p>
              <p className="text-xs text-[#8A8577] font-sans">{progress?.donor_count || 0} donors</p>
            </div>
          </div>
          <div className="w-full h-3 bg-[#F5F0E8] rounded-full overflow-hidden">
            <div className="h-full bg-[#D64A2E] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          {goalReached && (
            <p className="text-center text-sm text-green-700 font-sans font-medium mt-4">
              🎉 We've hit our 2026 goal! Thank you. Additional donations go toward 2027 operations.
            </p>
          )}
        </div>
      </div>

      {/* Operating costs breakdown */}
      <div className="max-w-3xl mx-auto px-4 mb-12">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3 text-center">Where your money goes</p>
        <h2 className="font-serif text-2xl font-bold text-[#1C1C1A] mb-6 text-center">Transparent operating costs</h2>
        <div className="space-y-px bg-[#D8D2C6]">
          {(progress?.operating_costs || []).map(cost => {
            const Icon = COST_ICONS[cost.label] || Server;
            return (
              <div key={cost.label} className="bg-white p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F5F0E8] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#D64A2E]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-sans font-semibold text-sm text-[#1C1C1A]">{cost.label}</h3>
                    <span className="font-serif text-lg font-bold text-[#1C1C1A]">${cost.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#1C1C1A]/50 font-sans mt-1">{cost.description}</p>
                </div>
              </div>
            );
          })}
          <div className="bg-[#1C1C1A] p-5 flex items-center justify-between">
            <span className="font-sans font-semibold text-sm text-white uppercase tracking-widest">Total Annual Goal</span>
            <span className="font-serif text-2xl font-bold text-[#D64A2E]">${(progress?.total_costs || 125000).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Donation box */}
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white border border-[#D8D2C6] p-8">
          <h2 className="font-serif text-2xl font-bold text-[#1C1C1A] mb-2">Make a contribution</h2>
          <p className="text-sm text-[#1C1C1A]/50 font-sans mb-6">Every dollar goes toward keeping RallyPack free and operational.</p>

          <div className="grid grid-cols-5 gap-2 mb-4">
            {AMOUNTS.map(amt => (
              <button
                key={amt}
                onClick={() => { setSelected(amt); setCustom(""); }}
                className={`py-3 font-sans font-semibold text-sm border transition-colors ${
                  selected === amt && !custom
                    ? "bg-[#1C1C1A] text-white border-[#1C1C1A]"
                    : "bg-white text-[#1C1C1A] border-[#D8D2C6] hover:border-[#1C1C1A]"
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1C1C1A]/40 font-sans text-sm">$</span>
              <input
                type="number"
                min="1"
                placeholder="Other amount"
                value={custom}
                onChange={e => { setCustom(e.target.value); setSelected(null); }}
                className="w-full border border-[#D8D2C6] pl-7 pr-3 py-3 font-sans text-sm focus:outline-none focus:border-[#1C1C1A] placeholder:text-[#1C1C1A]/30"
              />
            </div>
          </div>

          <Button
            onClick={handleDonate}
            disabled={loading || (!selected && !custom)}
            className="w-full bg-[#D64A2E] hover:bg-[#be3f25] text-white font-sans font-semibold py-3 h-auto rounded-none text-sm tracking-widest uppercase"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Contribute $${custom || selected || "—"}`}
          </Button>

          <p className="text-xs text-[#1C1C1A]/40 font-sans text-center mt-4">
            Secure payment via Stripe · No account required
          </p>
        </div>
      </div>
    </div>
  );
}