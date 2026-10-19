import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { getConsent, setConsent } from "@/lib/consent";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(() => getConsent() === null);

  if (!visible) return null;

  const choose = (value) => {
    setConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Analytics consent"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[9999] bg-card border border-border rounded-lg shadow-lg p-4 font-sans"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Your choice on analytics</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            We use Google Ads and analytics to measure which preparedness resources help people.
            Nothing loads and no tracking runs until you agree. Declining changes nothing about how
            RallyPack works.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button size="sm" onClick={() => choose("granted")} className="text-xs">
              Allow analytics
            </Button>
            <Button size="sm" variant="outline" onClick={() => choose("denied")} className="text-xs">
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}