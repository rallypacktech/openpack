import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// One entry on the Trend Reports index. Shows a live headline figure when the
// report endpoint has numbers, and stays honest when it does not yet.
export default function ReportCard({ to, kicker, title, summary, stat, statLabel, loading }) {
  return (
    <Link
      to={to}
      className="group block bg-card border border-border p-6 sm:p-8 hover:border-foreground/30 transition-colors"
    >
      <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-sans mb-2">{kicker}</p>
      <h2 className="font-serif text-2xl font-bold text-foreground leading-tight">{title}</h2>
      <p className="text-sm text-foreground/70 font-sans mt-3 leading-relaxed">{summary}</p>

      <div className="mt-6 pt-4 border-t border-border flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-serif font-bold text-foreground leading-none">
            {loading ? "…" : stat ?? "—"}
          </div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-sans mt-1">{statLabel}</div>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-primary group-hover:gap-2 transition-all">
          Open report <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}