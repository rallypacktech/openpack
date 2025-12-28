import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";

export default function CheckoutCancel() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardContent className="pt-6 text-center">
                    <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Checkout Cancelled</h2>
                    <p className="text-gray-600 mb-6">
                        Your payment was cancelled. No charges were made.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => {
                                const urlParams = new URLSearchParams(window.location.search);
                                const cacheId = urlParams.get("cache_id");
                                if (cacheId) {
                                    navigate(createPageUrl("CacheDetail") + "?id=" + cacheId);
                                } else {
                                    navigate(createPageUrl("Resources"));
                                }
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Return to Cache
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}