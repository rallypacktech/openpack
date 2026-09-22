import React from "react";
import { getSources } from "@/lib/publicSources";

/**
 * Compact inline attribution placed beside a statistic — agency names only,
 * linked back to the primary source. Deliberately quiet so it never competes
 * with the figure it supports.
 */
export default function SourceNote({ topics = [], label = "Sources", tone = "light", className = "" }) {
  const sources = getSources(topics);
  if (sources.length === 0) return null;

  const base = tone === "dark" ? "text-white/40" : "text-muted-foreground";
  const link =
    tone === "dark" ? "text-white/60 hover:text-white" : "hover:text-foreground";

  return (
    <p className={`text-xs font-sans ${base} ${className}`}>
      <span className="uppercase tracking-widest text-[10px]">{label}:</span>{" "}
      {sources.map((s, i) => (
        <React.Fragment key={s.name}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline decoration-dotted underline-offset-2 transition-colors ${link}`}
          >
            {s.name}
          </a>
        </React.Fragment>
      ))}
    </p>
  );
}