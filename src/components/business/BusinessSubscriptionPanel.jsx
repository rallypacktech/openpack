import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Building2, CreditCard, AlertCircle } from "lucide-react";

const TIERS = [
  {
    id: "basic",
    name: "Basic",
    price: "$99/yr",
    kits: 5,
    members: 25,
    features: ["5 first aid kits tracked", "25 team members", "Chain of command alerts", "1 evacuation plan"],
    stripe_price_id: "price_basic_annual",
  },
  {
    id: "professional",
    name: "Professional",
    price: "$249/yr",
    kits: 20,
    members: 100,
    features: ["20 first aid kits tracked", "100 team members", "Chain of command alerts", "Unlimited evacuation plans", "Priority support"],
    stripe_price_id: "price_professional_annual",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Contact us",
    kits: 999,
    members: 999,
    features: ["Unlimited kits", "Unlimited members", "Custom integrations", "Dedicated support", "SLA guarantee"],
    stripe_price_id: null,
  },
];

export default function BusinessSubscriptionPanel({ subscription, onRefresh }) {
  const [orgName, setOrgName] = useState(subscription?.organization_name || "");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (tier) => {
    if (!tier.stripe_price_id) {
      window.open("mailto:business@rallypack.tech?subject=Enterprise Inquiry", "_blank");
      return;
    }
    setLoading(true);
    const response = await base44.functions.invoke("createCheckoutSession", {
      price_id: tier.stripe_price_id,
      mode: "subscription",
      success_url: `${window.location.origin}/BusinessDashboard?success=true`,
      cancel_url: `${window.location.origin}/BusinessDashboard`,
      metadata: { tier: tier.id, organization_name: orgName },
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
      await base44.entities.BusinessSubscription.create({ organization_name: orgName, owner_email: me.email, status: "trialing", tier: "basic", max_first_aid_kits: 5, max_members: 25 });
    }
    onRefresh();
  };

  const currentTierId = subscription?.tier;

  return (
    <div className="space-y-6">
      {/* Org settings */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4" /> Organization Settings</CardTitle></CardHeader>
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
            <div className="flex gap-3 text-sm text-muted-foreground">
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
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Subscription Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map(tier => {
            const isCurrent = currentTierId === tier.id;
            return (
              <Card key={tier.id} className={`relative ${isCurrent ? "ring-2 ring-primary" : ""}`}>
                {isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-0.5 rounded-full">Current Plan</span>
                  </div>
                )}
                <CardContent className="p-5">
                  <h4 className="font-bold text-lg">{tier.name}</h4>
                  <div className="text-2xl font-serif font-bold text-primary mt-1">{tier.price}</div>
                  <div className="text-xs text-muted-foreground mb-4">{tier.id !== "enterprise" ? "billed annually" : ""}</div>
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
                    onClick={() => !isCurrent && handleSubscribe(tier)}
                    disabled={isCurrent || loading}
                  >
                    {isCurrent ? "Current Plan" : tier.id === "enterprise" ? "Contact Us" : "Subscribe"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded p-3">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Subscriptions are managed via Stripe. Annual billing. Cancel anytime. For invoicing or enterprise pricing, contact <a href="mailto:business@rallypack.tech" className="underline">business@rallypack.tech</a>.</span>
      </div>
    </div>
  );
}