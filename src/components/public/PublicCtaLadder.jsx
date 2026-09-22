import React from "react";
import { Link } from "react-router-dom";
import { ClipboardList, MapPin, ArrowRight, Heart } from "lucide-react";

/**
 * The closing call-to-action ladder shared by every public page, so the next
 * step is identical everywhere: the readiness quiz leads, the readiness map
 * follows, and account creation and donation sit quietly beneath.
 */
export default function PublicCtaLadder({ contextLabel = "Your next step" }) {
  return (
    <section className="bg-cream border-t border-border">
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-20 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-sans mb-4">{contextLabel}</p>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
          Find out how ready you really are.
        </h2>
        <p className="text-sm sm:text-base text-foreground/70 font-sans max-w-xl mx-auto mb-10 leading-relaxed">
          The free readiness quiz scores your plan in three minutes — no account required. Then see how
          your neighborhood compares on the RallyPack readiness map.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link
            to="/ReadinessQuiz"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-sans font-semibold px-8 py-4 text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
          >
            <ClipboardList className="w-4 h-4" /> Take the readiness quiz
          </Link>
          <Link
            to="/readiness-map"
            className="inline-flex items-center justify-center gap-2 border border-foreground/25 text-foreground font-sans font-semibold px-8 py-4 text-xs tracking-widest uppercase hover:bg-foreground/5 transition-colors"
          >
            <MapPin className="w-4 h-4" /> See your area on the map
          </Link>
        </div>

        <p className="text-xs font-sans text-muted-foreground">
          <Link to="/register" className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-2 hover:text-foreground transition-colors">
            Create a free account <ArrowRight className="w-3 h-3" />
          </Link>
          <span aria-hidden="true" className="mx-2">·</span>
          <Link to="/Donate" className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-2 hover:text-foreground transition-colors">
            <Heart className="w-3 h-3" /> Support RallyPack
          </Link>
        </p>
        <p className="mt-6 text-[11px] font-sans text-muted-foreground/80 tracking-wide">
          Free forever · No credit card · Open source
        </p>
      </div>
    </section>
  );
}