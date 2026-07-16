import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Zap, AlertCircle } from "lucide-react";

const PROFESSIONAL_FEATURES = [
  "20 first aid kits tracked",
  "100 team members",
  "Chain-of-command emergency alerts",
  "Unlimited evacuation plans",
  "Emergency alert sending (3/month)",
  "Shelter provider verification",
  "Dual email + Telegram delivery",
  "Priority support",
];

function formatPrice(price) {
  if (!price) return null;
  const amount = (price.unit_amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: price.currency.toUpperCase(),
  });
  if (price.recurring?.interval === "year") return `${amount}/yr`;
  if (price.recurring?.interval === "month") return `${amount}/mo`;
  return amount;
}

export default function ProfessionalUpgradeCard({ organizationName, onSubscribed }) {
  const [stripePrice, setStripePrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("getStripePrices", {});
        if (mounted && res.data?.prices) {
          const price = res.data.prices.find(
            (p) =>
              p.product?.metadata?.tier === "professional" ||
              p.product?.name?.toLowerCase().includes("professional")
          );
          setStripePrice(price || null);
        }
      } catch {
        /* price will fall back to static display */
      } finally {
        if (mounted) setPriceLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCheckout = async () => {
    setError(null);
    if (!stripePrice?.id) {
      setError("Pricing is not available yet. Please try again in a moment.");
      return;
    }
    setLoading(true);
    try {
      const response = await base44.functions.invoke("createSubscriptionSession", {
        price_id: stripePrice.id,
        success_url: `${window.location.origin}/BusinessDashboard?sub_success=true`,
        cancel_url: `${window.location.origin}/BusinessDashboard`,
        metadata: {
          tier: "professional",
          organization_name: organizationName || "",
        },
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setError("Unable to start checkout. Please try again.");
      }
    } catch (e) {
      setError(e.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const displayPrice = priceLoading
    ? "..."
    : stripePrice
      ? formatPrice(stripePrice)
      : null;

  return (
    <Card className="relative border-primary/30 shadow-md max-w-md mx-auto">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <Zap className="w-3 h-3" /> Recommended
        </span>
      </div>
      <CardContent className="p-6">
        <h3 className="font-serif text-xl font-bold text-foreground">Professional Plan</h3>
        <div className="flex items-baseline gap-1 mt-1 mb-1">
          {displayPrice ? (
            <span className="text-3xl font-serif font-bold text-primary">{displayPrice}</span>
          ) : !priceLoading ? (
            <span className="text-lg font-semibold text-muted-foreground">Contact for pricing</span>
          ) : (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          )}
          {stripePrice?.recurring?.interval && (
            <span className="text-xs text-muted-foreground">
              billed {stripePrice.recurring.interval === "year" ? "annually" : "monthly"}
            </span>
          )}
        </div>

        <ul className="space-y-2 my-5 text-left">
          {PROFESSIONAL_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {error && (
          <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded p-2.5 mb-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={loading || priceLoading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Redirecting to checkout…
            </>
          ) : (
            "Upgrade to Professional"
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Secure checkout via Stripe. Cancel anytime.
        </p>
      </CardContent>
    </Card>
  );
}