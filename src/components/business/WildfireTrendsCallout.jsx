import React from "react";
import { Link } from "react-router-dom";
import { Flame, ArrowRight } from "lucide-react";

/**
 * Wildfire drives more business-continuity planning than any other hazard, so the
 * trend report sits high on the business page rather than buried in a footer link.
 */
export default function WildfireTrendsCallout() {
  return (
    <section className="bg-[#D64A2E] text-white">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center gap-6">
        <Flame className="w-10 h-10 shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-sans mb-2">
            Wildfire trend report
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold leading-tight mb-2">
            Wildfire is the hazard that closes buildings and interrupts operations.
          </h2>
          <p className="text-sm text-white/80 leading-relaxed max-w-2xl">
            Ten years of open wildfire data — burned area, causes, and where ignitions
            cluster around holidays, dry spells and wind events. Use it to justify your
            preparedness spend and time your inspection checks.
          </p>
        </div>
        <Link
          to="/wildfire-trends"
          className="shrink-0 inline-flex items-center justify-center gap-2 bg-white text-[#D64A2E] font-sans font-semibold text-xs tracking-widest uppercase px-6 py-4 hover:bg-white/90 transition-colors"
        >
          See the trends <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}