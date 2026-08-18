import React from "react";
import { Flame, Wind, Zap, Droplets, CloudRain, CloudSun, Mountain, Lock } from "lucide-react";

// Full alert-settings hazard set. Only wildfire is unlocked; the rest render
// as intentionally-disabled "Coming soon" tabs (no data loaded for them).
const HAZARDS = [
  { key: "wildfire", label: "Wildfire", icon: Flame, unlocked: true },
  { key: "hurricane", label: "Hurricane", icon: Wind, unlocked: false },
  { key: "tornado", label: "Tornado", icon: Zap, unlocked: false },
  { key: "flood", label: "Flood", icon: Droplets, unlocked: false },
  { key: "severe_weather", label: "Severe Weather", icon: CloudRain, unlocked: false },
  { key: "precipitation", label: "Precipitation", icon: CloudSun, unlocked: false },
  { key: "earthquake", label: "Earthquake", icon: Mountain, unlocked: false },
];

export default function HazardTypeRail({ active = "wildfire" }) {
  return (
    <div className="flex flex-wrap gap-2">
      {HAZARDS.map((h) => {
        const Icon = h.icon;
        const isActive = h.key === active;
        if (h.unlocked) {
          return (
            <span
              key={h.key}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-sans border transition-colors ${
                isActive
                  ? "bg-[#D64A2E] text-white border-[#D64A2E]"
                  : "bg-white text-foreground border-border"
              }`}
            >
              <Icon className="w-4 h-4" /> {h.label}
            </span>
          );
        }
        return (
          <span
            key={h.key}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-sans border border-dashed border-border bg-muted/40 text-muted-foreground/60 cursor-not-allowed"
            title={`${h.label} incident history — coming soon`}
          >
            <Icon className="w-4 h-4 opacity-60" /> {h.label}
            <Lock className="w-3 h-3 opacity-50" />
            <span className="text-[10px] uppercase tracking-wide opacity-70">Soon</span>
          </span>
        );
      })}
    </div>
  );
}