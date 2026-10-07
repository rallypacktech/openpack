/* global pendo */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, AlertCircle } from "lucide-react";

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id",
    );

    if (!sessionId) {
      setProcessing(false);
      setError("We couldn't find a checkout session for this page.");
      return;
    }

    // Fulfillment is confirmed server-side against Stripe. The URL parameters alone
    // never mark anything as purchased.
    (async () => {
      try {
        const res = await base44.functions.invoke("verifyCheckoutSession", {
          session_id: sessionId,
        });
        const data = res.data || {};

        if (!data.success) {
          setError(data.error || "We couldn't verify this payment.");
          return;
        }

        setOrder(data);

        if (typeof pendo !== "undefined") {
          pendo.track("checkout_completed", {
            item_count: data.item_count || 0,
            cache_id: data.cache_id || "",
          });
        }
        // Google Ads PURCHASE — only after the server has confirmed the payment.
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "conversion", {
            send_to: "AW-18405445520/mfsYCOvFl-YcEJCfs8hE",
            value: (data.total_cents || 0) / 100,
            currency: "USD",
            transaction_id: sessionId,
          });
        }
      } catch (e) {
        console.error("Error verifying order:", e);
        setError(
          "We couldn't verify this payment. If you were charged, please contact support.",
        );
      } finally {
        setProcessing(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">
                Confirming your payment...
              </h2>
              <p className="text-gray-600">Verifying with our payment provider</p>
            </>
          ) : error ? (
            <>
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                We couldn't confirm this order
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate(createPageUrl("Resources"))}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Back to Resources
                </Button>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your emergency supplies have been purchased and added to your
                cache.
              </p>
              <div className="flex flex-col gap-3">
                {order?.cache_id && (
                  <Button
                    onClick={() =>
                      navigate(
                        createPageUrl("CacheDetail") + "?id=" + order.cache_id,
                      )
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    View Cache
                  </Button>
                )}
                <Button
                  onClick={() => navigate(createPageUrl("Resources"))}
                  variant="outline"
                  className="w-full"
                >
                  Back to Resources
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}