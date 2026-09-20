import React from "react";
import { COMPLIANCE_REGIONS } from "@/lib/complianceFrameworks";

// Country switcher for the Global Compliance Portal. The selected region drives
// the framework, inspection schedule and checklist shown below it.
export default function ComplianceRegionSelector({ value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Select a country">
      {COMPLIANCE_REGIONS.map((region) => {
        const isActive = value === region.code;
        return (
          <button
            key={region.code}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(region.code)}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-semibold border transition-colors ${
              isActive
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            {region.label}
          </button>
        );
      })}
    </div>
  );
}