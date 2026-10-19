import React from "react";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { CONTENT_ADDITIONS } from "@/lib/growthRoadmap";

const PROGRAM_NAMES = [
  "Buoyant Foundation Project",
  "American Red Cross — Sound the Alarm",
  "Barnstable County Emergency Management (Cape Cod)",
  "Ouray County, Colorado — Flood resources",
  "American Red Cross skills for Alexa",
];

export default function CommunityPreparednessPrograms() {
  const programs = CONTENT_ADDITIONS.filter(
    (item) => item.showPublicly && PROGRAM_NAMES.includes(item.name)
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="px-5 py-3.5 bg-secondary/50 border-b border-border">
        <p className="font-sans font-semibold text-sm text-foreground">Community & Flood Resilience Programs</p>
        <p className="text-xs text-muted-foreground font-sans">
          Mitigation programs, home-fire visits and real community-drill examples you can take part in.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
        {programs.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 bg-background border border-border rounded p-4 hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <span className="font-sans font-semibold text-foreground text-sm">{p.name}</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary shrink-0" aria-hidden="true" />
              </div>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">{p.desc}</p>
              {p.verify && (
                <p className="text-[11px] font-sans text-amber-900 mt-1.5 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 shrink-0" aria-hidden="true" /> Availability may change — check the provider page.
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}