import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import HolidayProximity from "@/components/wildfire/HolidayProximity";

// Rewired to the server-side aggregate (getPublicWildfireReport) so the
// firework-holiday correlation reflects ALL records, not the latest 500.
export default function HolidayFireworkCorrelation() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("getPublicWildfireReport", {});
        setReport(res.data);
      } catch (e) {
        console.error("Firework correlation load failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-5 flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const hp = report?.holiday_proximity;
  if (!hp || !hp.total_scoped) {
    return (
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col items-center justify-center text-gray-400 text-sm py-12">
            <Sparkles className="w-8 h-8 mb-2 opacity-30" />
            No firework-holiday correlation data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" /> Firework Holiday — Wildfire Correlation
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Fires matched only to firework holidays celebrated in the same country — fires in countries without firework traditions aren't counted. Computed across the full dataset.
        </p>
      </div>
      <HolidayProximity hp={hp} />
    </div>
  );
}