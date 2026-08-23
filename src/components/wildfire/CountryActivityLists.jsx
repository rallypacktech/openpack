import React, { useState } from "react";
import { Sparkles, Globe, ChevronDown, ChevronUp } from "lucide-react";

// Countries whose first recorded activity falls in 2024 or 2025 only, and
// countries in the master list with zero recorded incidents.
export default function CountryActivityLists({ newlyActive, zeroActivity }) {
  const [showZero, setShowZero] = useState(false);
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-sans font-semibold text-foreground flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-gold" /> Newly active in 2024–2025
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          These countries recorded their first fires in 2024, after none on record since 2014 or
          earlier — likely a sign of expanded data coverage rather than a sudden emergence of fire.
        </p>
        {newlyActive?.length ? (
          <div className="flex flex-wrap gap-2">
            {newlyActive.map((c) => (
              <span key={c.code} className="px-3 py-1 rounded-full bg-gold/15 text-foreground text-xs font-medium border border-gold/30">
                {c.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">None recorded.</p>
        )}
      </div>

      <div>
        <button
          onClick={() => setShowZero((s) => !s)}
          className="text-base font-sans font-semibold text-foreground flex items-center gap-2 mb-2 hover:text-crimson transition-colors"
        >
          <Globe className="w-4 h-4 text-muted-foreground" />
          Zero recorded fire activity
          <span className="text-xs font-normal text-muted-foreground">({zeroActivity?.length || 0} countries)</span>
          {showZero ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <p className="text-xs text-muted-foreground mb-3">
          Countries in RallyPack's master list with no incidents on record — may reflect data-source gaps, not absence of fires.
        </p>
        {showZero && zeroActivity?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {zeroActivity.map((c) => (
              <span key={c.code} className="px-2.5 py-0.5 rounded text-xs text-muted-foreground bg-secondary border border-border">
                {c.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}