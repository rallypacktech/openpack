import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const AMOUNTS = [5, 10, 25, 50];

export default function Donate() {
  const [selected, setSelected] = useState(10);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [stripePrices, setStripePrices] = useState([]);
  const [pricesLoading, setPricesLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const donated = urlParams.get("donated") === "true";

  useEffect(() => {
    loadDonationPrice();
  }, []);

  const loadDonationPrice = async () => {
    setPricesLoading(true);
    const res = await base44.functions.invoke("getStripePrices", {});
    if (res.data?.prices) setStripePrices(res.data.prices);
    setPricesLoading(false);
  };

  // Find the donation/support product in Stripe
  const donationPrice = stripePrices.find(p =>
    p.product?.metadata?.type === "donation" ||
    p.product?.name?.toLowerCase().includes("support") ||
    p.product?.name?.toLowerCase().includes("donat")
  );

  const handleDonate = async () => {
    const amount = custom ? parseFloat(custom) : selected;
    if (!amount || amount < 1) return;
    setLoading(true);

    // If there's a Stripe donation product, use its price_id; otherwise use price_data
    const payload = donationPrice
      ? {
          items: [{
            item_name: `Support RallyPack — $${amount}`,
            description: "One-time donation to support free emergency preparedness",
            price_cents: Math.round(amount * 100),
            quantity: 1,
          }],
          success_url: `${window.location.origin}/Donate?donated=true`,
          cancel_url: `${window.location.origin}/Donate`,
        }
      : {
          items: [{
            item_name: `Support RallyPack — $${amount}`,
            description: "One-time donation to support free emergency preparedness",
            price_cents: Math.round(amount * 100),
            quantity: 1,
          }],
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
            Your support directly covers hosting, development, and keeping RallyPack free for families who need it most.
          </p>
          <a href="/" className="inline-flex items-center gap-2 bg-[#D64A2E] text-white font-sans font-semibold px-8 py-3 hover:bg-[#be3f25] transition-colors text-sm tracking-widest uppercase">
            Back to RallyPack
          </a>
        </div>
      </div>
    );
  }

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
          RallyPack has no venture funding, no ads for personal data, and no paywalled safety features. We're sustained by people who believe every family deserves to be prepared — regardless of income.
        </p>
      </div>

      {/* Donation box */}
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white border border-[#D8D2C6] p-8">
          <h2 className="font-serif text-2xl font-bold text-[#1C1C1A] mb-2">Make a one-time contribution</h2>
          <p className="text-sm text-[#1C1C1A]/50 font-sans mb-6">Every dollar goes toward hosting, development, and keeping the lights on.</p>

          {/* Amount selector */}
          <div className="grid grid-cols-4 gap-2 mb-4">
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

          {/* Custom amount */}
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

        {/* What it covers */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#D8D2C6]">
          {[
            { amt: "$5", label: "Covers a month of data storage" },
            { amt: "$10", label: "Funds one day of server costs" },
            { amt: "$25", label: "Supports a week of development" },
          ].map(item => (
            <div key={item.amt} className="bg-[#F5F0E8] p-5 text-center">
              <div className="font-serif text-3xl font-bold text-[#D64A2E] mb-1">{item.amt}</div>
              <p className="text-xs text-[#1C1C1A]/50 font-sans">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}