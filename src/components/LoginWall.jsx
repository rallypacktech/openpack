import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Lock, ArrowRight, Star } from "lucide-react";

export default function LoginWall({ context = "recommendations", redirectTo = "/Dashboard" }) {
  const encodedNext = encodeURIComponent(redirectTo);

  return (
    <div className="relative rounded overflow-hidden border border-border">
      {/* Blurred preview content behind */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background pointer-events-none z-10" />

      {/* CTA overlay */}
      <div className="relative z-20 flex flex-col items-center text-center px-8 py-14 bg-cream/80 backdrop-blur-sm">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
          Your personalized {context} are ready.
        </h3>
        <p className="text-muted-foreground font-sans text-sm max-w-sm mb-6 leading-relaxed">
          Create a free account to unlock your tailored plan, save your results, and access county-level FEMA resources — no credit card required.
        </p>

        <Link
          to={`/register?next=${encodedNext}`}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-sans font-medium px-8 py-3 rounded hover:bg-primary/90 transition-colors text-sm tracking-wide"
        >
          Sign up free <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          to={`/login?next=${encodedNext}`}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground underline font-sans transition-colors"
        >
          Already have an account? Sign in
        </Link>

        <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground font-sans">
          <div className="flex items-center gap-1"><Star className="w-3 h-3 text-gold fill-gold" /> Free forever</div>
          <div className="flex items-center gap-1"><Star className="w-3 h-3 text-gold fill-gold" /> No card needed</div>
          <div className="flex items-center gap-1"><Star className="w-3 h-3 text-gold fill-gold" /> Open source</div>
        </div>
      </div>
    </div>
  );
}