import React, { useState } from "react";
import { ChevronDown, ChevronUp, Snowflake, Globe, ExternalLink } from "lucide-react";
import { EL_NINO_OUTLOOK } from "@/lib/hazardOutlooks";

// Seasonal El Niño / winter outlook. Shown to all users as standard reference
// data — the U.S. regional detail comes from NOAA CPC, and the global
// teleconnections matter just as much for users outside North America.
export default function WinterOutlookCard({ defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  const RegionRow = ({ r, global }) => (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      {global && <Globe className="w-3.5 h-3.5 text-primary mt-1 shrink-0" aria-hidden="true" />}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <p className="font-sans font-semibold text-foreground text-sm">{r.label}</p>
          <span className="text-xs font-sans font-semibold text-primary shrink-0">{r.outlook}</span>
        </div>
        <p className="text-xs text-muted-foreground font-sans leading-relaxed mt-0.5">{r.note}</p>
      </div>
    </div>
  );

  return (
    <div className="border border-sky-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-sky-50 border-b border-sky-200"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Snowflake className="w-5 h-5 text-sky-700 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <span className="font-sans font-semibold text-sky-900 text-sm block">
              Winter outlook: a historically strong El Niño is developing
            </span>
            <span className="text-xs text-sky-700 font-sans">
              {EL_NINO_OUTLOOK.season} · {EL_NINO_OUTLOOK.strength}
            </span>
          </div>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-sky-700 shrink-0 ml-2" aria-hidden="true" />
          : <ChevronDown className="w-4 h-4 text-sky-700 shrink-0 ml-2" aria-hidden="true" />}
      </button>

      {open && (
        <div className="p-5">
          <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-5">
            {EL_NINO_OUTLOOK.summary}
          </p>

          <p className="text-xs font-sans font-semibold uppercase tracking-widest text-foreground mb-1">
            United States — regional winter signal
          </p>
          <div className="mb-6">
            {EL_NINO_OUTLOOK.us_regions.map((r) => (
              <RegionRow key={r.id} r={r} />
            ))}
          </div>

          <p className="text-xs font-sans font-semibold uppercase tracking-widest text-foreground mb-1">
            Global — El Niño teleconnections
          </p>
          <div className="mb-4">
            {EL_NINO_OUTLOOK.global_regions.map((r) => (
              <RegionRow key={r.id} r={r} global />
            ))}
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded p-3 mb-4">
            <p className="text-xs text-sky-900 font-sans leading-relaxed">
              <strong>Why it matters:</strong> a strong El Niño winter generally means fewer wildfire-driven
              deployments in the Pacific Northwest, but more flood and severe-storm deployments across California,
              the Southwest, and the Gulf Coast. Where 2026 wildfires have already burned, a wet winter raises the
              odds of debris flows and flash flooding well past fire season.
            </p>
          </div>

          <a
            href={EL_NINO_OUTLOOK.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-primary hover:underline"
          >
            Source: {EL_NINO_OUTLOOK.source}
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}