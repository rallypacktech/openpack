import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Building2, CreditCard, AlertCircle, Loader2 } from "lucide-react";

// Tier metadata — features/limits defined here; price/amount pulled live from Stripe
const TIER_META = {
  basic: {
    id: "basic",
    name: "Basic",
    kits: 5,
    members: 25,
    features: ["5 first aid kits tracked", "25 team members", "Chain of command alerts", "1 evacuation plan"],
  },
  professional: {
    id: "professional",
    name: "Professional",
    kits: 20,
    members: 100,
    features: ["20 first aid kits tracked", "100 team members", "Chain of command alerts", "Unlimited evacuation plans", "Priority support"],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    kits: 999,
    members: 999,
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

export default function BusinessSubscriptionPanel({ subscription, onRefresh }) {
  const [orgName, setOrgName] = useState(subscription?.organization_name || "");
  const [loading, setLoading] = useState(false);
  const [stripePrices, setStripePrices] = useState([]);
  const [pricesLoading, setPricesLoading] = useState(true);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    setPricesLoading(true);
    const res = await base44.functions.invoke("getStripePrices", {});
    if (res.data?.prices) setStripePrices(res.data.prices);
    setPricesLoading(false);
  };

  // Match a Stripe price to a tier by product metadata.tier or product name
  const getPriceForTier = (tierId) => {
    return stripePrices.find(p =>
      p.product?.metadata?.tier === tierId ||
      p.product?.name?.toLowerCase().includes(tierId)
    ) || null;
  };

  const handleSubscribe = async (tierId, priceId) => {
    if (!priceId) {
      window.open("mailto:business@rallypack.tech?subject=Enterprise Inquiry", "_blank");
      return;
    }
    setLoading(true);
    const response = await base44.functions.invoke("createSubscriptionSession", {
      price_id: priceId,
      success_url: `${window.location.origin}/BusinessDashboard?sub_success=true`,
      cancel_url: `${window.location.origin}/BusinessDashboard`,
      metadata: { tier: tierId, organization_name: orgName },
    });
    if (response.data?.url) {
      window.location.href = response.data.url;
    }
    setLoading(false);
  };

  const handleSaveOrgName = async () => {
    if (subscription) {
      await base44.entities.BusinessSubscription.update(subscription.id, { organization_name: orgName });
    } else {
      const me = await base44.auth.me();
      await base44.entities.BusinessSubscription.create({
        organization_name: orgName,
        owner_email: me.email,
        status: "trialing",
        tier: "basic",
        max_first_aid_kits: 5,
        max_members: 25,
      });
    }
    onRefresh();
  };

  const currentTierId = subscription?.tier;

  return (
    <div className="space-y-6">
      {/* Org settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Organization Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label>Organization Name</Label>
              <Input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Your company or organization name" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSaveOrgName} disabled={!orgName}>Save</Button>
            </div>
          </div>
          {subscription && (
            <div className="flex gap-3 text-sm text-muted-foreground flex-wrap">
              <span>Status: <strong className="text-foreground capitalize">{subscription.status}</strong></span>
              <span>·</span>
              <span>Plan: <strong className="text-foreground capitalize">{subscription.tier}</strong></span>
              {subscription.current_period_end && (
                <><span>·</span><span>Renews: <strong className="text-foreground">{new Date(subscription.current_period_end).toLocaleDateString()}</strong></span></>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier cards */}
      <div>
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Subscription Plans
          {pricesLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(TIER_META).map(tier => {
            const stripePrice = getPriceForTier(tier.id);
            const isCurrent = currentTierId === tier.id && subscription?.status === "active";
            const displayPrice = tier.id === "enterprise"
              ? "Contact us"
              : stripePrice
                ? formatPrice(stripePrice)
                : pricesLoading ? "..." : "—";

            return (
              <Card key={tier.id} className={`relative ${isCurrent ? "ring-2 ring-primary" : ""}`}>
                {isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-0.5 rounded-full">Current Plan</span>
                  </div>
                )}
                <CardContent className="p-5">
                  <h4 className="font-bold text-lg">{tier.name}</h4>
                  <div className="text-2xl font-serif font-bold text-primary mt-1">{displayPrice}</div>
                  <div className="text-xs text-muted-foreground mb-4">
                    {tier.id !== "enterprise" ? (stripePrice?.recurring?.interval === "year" ? "billed annually" : stripePrice?.recurring?.interval === "month" ? "billed monthly" : "") : ""}
                  </div>
                  <ul className="space-y-1.5 mb-5">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : "default"}
                    onClick={() => !isCurrent && handleSubscribe(tier.id, stripePrice?.id || null)}
                    disabled={isCurrent || loading || (pricesLoading && tier.id !== "enterprise")}
                  >
                    {isCurrent ? "Current Plan" : tier.id === "enterprise" ? "Contact Us" : loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded p-3">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Subscriptions are managed via Stripe. Cancel anytime. For invoicing or enterprise pricing, contact <a href="mailto:business@rallypack.tech" className="underline">business@rallypack.tech</a>.</span>
      </div>
    </div>
  );
}