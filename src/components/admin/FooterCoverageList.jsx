import React from "react";
import { localeLabel } from "@/lib/translationLocales";

function stateFor(row) {
  if (row.queued > 0) {
    return {
      tone: "text-amber-700",
      text: `${row.queued.toLocaleString()} still queued · ${row.drafts.toLocaleString()} drafts`,
    };
  }
  if (row.drafts > 0) {
    return { tone: "text-emerald-700", text: `${row.drafts.toLocaleString()} drafts ready` };
  }
  return { tone: "text-muted-foreground", text: "nothing collected yet" };
}

/** What is queued and what already has a DeepL draft, per footer language. */
export default function FooterCoverageList({ coverage }) {
  if (!coverage) return null;
  return (
    <div className="rounded-md border border-border divide-y divide-border">
      {coverage.map((row) => {
        const state = stateFor(row);
        return (
          <div key={row.code} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
            <span className="text-foreground truncate">{localeLabel(row.code)}</span>
            <span className={`${state.tone} tabular-nums flex-shrink-0`}>{state.text}</span>
          </div>
        );
      })}
    </div>
  );
}