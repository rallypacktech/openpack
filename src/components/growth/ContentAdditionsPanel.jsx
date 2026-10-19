import React from "react";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShieldAlert, Eye } from "lucide-react";
import { CONTENT_ADDITIONS } from "@/lib/growthRoadmap";

export default function ContentAdditionsPanel() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground font-sans">
        Named additions from the approved roadmap. Items marked with the eye are already live on the public
        Resources page; the rest stay internal until verified.
      </p>
      {CONTENT_ADDITIONS.map((item) => (
        <div key={item.name} className="border border-border rounded-lg bg-card p-4">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-sans font-semibold text-sm text-foreground">{item.name}</span>
            <Badge variant="outline" className="text-[10px]">{item.kind}</Badge>
            <Badge variant="outline" className="text-[10px]">{item.audience}</Badge>
            {item.showPublicly && (
              <Badge className="bg-green-100 text-green-800 text-[10px] gap-1">
                <Eye className="w-3 h-3" aria-hidden="true" /> Live
              </Badge>
            )}
            {item.verify && (
              <Badge className="bg-amber-100 text-amber-900 text-[10px] gap-1">
                <ShieldAlert className="w-3 h-3" aria-hidden="true" /> Verify first
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-sans leading-relaxed">{item.desc}</p>
          {item.disclaimer && (
            <p className="text-xs font-sans text-amber-900 bg-amber-50 border border-amber-200 rounded px-3 py-2 mt-2">
              {item.disclaimer}
            </p>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline break-all"
            >
              {item.url} <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}