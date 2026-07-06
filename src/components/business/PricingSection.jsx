import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

const TIER_META = {
  basic: {
    id: "basic",
    name: "Basic",
    features: ["5 first aid kits tracked", "25 team members", "Chain of command alerts", "1 evacuation plan"],
  },
  professional: {
    id: "professional",
    name: "Professional",
    features: ["20 first aid kits tracked", "100 team members", "Chain of command alerts", "Unlimited evacuation plans", "Priority support"],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    features: ["Unlimited kits", "Unlimited members", "Custom integrations", "Dedicated support", "SLA guarantee"],
  },
};

function formatPrice(price) {
  if (!price) return null;
  const amount = (price.unit_amount / 100).toLocaleString("en-US", { style: "currency", currency: price.currency.toUpperCase() });
  if (price.recurring?.interval === "year") return `${amount}/yr`;
  if (price.recurring?.interval === "month") return `${amount}/mo`;
  return amount;
}

export default function PricingSection() {
  const [stripePrices, setStripePrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("getStripePrices", {});
        if (mounted && res.data?.prices) setStripePrices(res.data.prices);
      } catch {
        /* pricing will fall back to static display */
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const getPriceForTier = (tierId) =>
    stripePrices.find(p => p.product?.metadata?.tier === tierId || p.product?.name?.toLowerCase().includes(tierId)) || null;

  return (
    <section className="py-16 max-w-5xl mx-auto px-6">
      <div className="text-center mb-10">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">Simple, Transparent Pricing</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Plans scale with your team. Cancel anytime. All prices billed monthly.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(TIER_META).map(tier => {
          const stripePrice = getPriceForTier(tier.id);
          const displayPrice = tier.id === "enterprise"
            ? "Contact us"
            : stripePrice
              ? formatPrice(stripePrice)
              : loading ? "..." : "—";
          return (
            <Card key={tier.id} className="text-center border-border">
              <CardContent className="p-6">
                <h4 className="font-sans font-bold text-lg text-foreground">{tier.name}</h4>
                <div className="text-3xl font-serif font-bold text-[#D64A2E] mt-2 mb-1">{displayPrice}</div>
                <div className="text-xs text-muted-foreground mb-5">
                  {tier.id === "enterprise"
                    ? "Custom pricing for large orgs"
                    : stripePrice?.recurring?.interval === "month" ? "billed monthly" : stripePrice?.recurring?.interval === "year" ? "billed annually" : ""}
                </div>
                <ul className="space-y-2 mb-6 text-left">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full bg-[#D64A2E] hover:bg-[#be3f25] text-white">
                  <Link to={createPageUrl("BusinessDashboard")}>Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {loading && (
        <div className="flex justify-center mt-6">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </section>
  );
}