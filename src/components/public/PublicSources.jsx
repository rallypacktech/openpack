import React from "react";
import { getSources } from "@/lib/publicSources";

/**
 * Full Sources section — agency name, what it provided, and a link to the
 * primary source. Used at the foot of public data and hazard pages so every
 * claim on the page can be traced back to the agency that produced it.
 */
export default function PublicSources({ topics = [], title = "Sources", intro }) {
  const sources = getSources(topics);
  if (sources.length === 0) return null;

  return (
    <section className="border-t border-border pt-8 mt-4">
      <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2">{title}</h2>
      {intro && <p className="text-sm text-muted-foreground font-sans mb-5 max-w-3xl">{intro}</p>}
      <ul className="space-y-3 max-w-3xl">
        {sources.map((s) => (
          <li key={s.name} className="text-sm font-sans leading-relaxed">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground underline decoration-dotted underline-offset-2 hover:text-primary transition-colors"
            >
              {s.name}
            </a>
            <span className="text-muted-foreground"> — {s.provided}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}