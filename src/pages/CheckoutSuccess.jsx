import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package } from "lucide-react";

export default function CheckoutSuccess() {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("session_id");
        const cacheId = urlParams.get("cache_id");
        const recIds = urlParams.get("rec_ids");

        if (sessionId && cacheId && recIds) {
            processOrder(cacheId, recIds.split(","));
        } else {
            setProcessing(false);
        }
    }, []);

    const processOrder = async (cacheId, recIds) => {
        try {
            // Get recommendations
            const recs = await base44.entities.ProductRecommendation.list();
            
            for (const recId of recIds) {
                const rec = recs.find(r => r.id === recId);
                if (!rec) continue;

                // Mark as purchased
                await base44.entities.UserCacheProgress.create({
                    cache_id: cacheId,
                    recommendation_id: recId,
                    status: "purchased",
                    purchased_at: new Date().toISOString()
                });

                // Add to cache
                await base44.entities.CacheItem.create({
                    cache_id: cacheId,
                    item_name: rec.item_name,
                    quantity: rec.quantity,
                    category: rec.category,
                    notes: "Purchased via Stripe checkout"
                });
            }
        } catch (error) {
            console.error("Error processing order:", error);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardContent className="pt-6 text-center">
                    {processing ? (
                        <>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <h2 className="text-xl font-semibold mb-2">Processing your order...</h2>
                            <p className="text-gray-600">Adding items to your cache</p>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                            <p className="text-gray-600 mb-6">
                                Your emergency supplies have been purchased and added to your cache.
                            </p>
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={() => {
                                        const urlParams = new URLSearchParams(window.location.search);
                                        const cacheId = urlParams.get("cache_id");
                                        navigate(createPageUrl("CacheDetail") + "?id=" + cacheId);
                                    }}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    <Package className="w-4 h-4 mr-2" />
                                    View Cache
                                </Button>
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