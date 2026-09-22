import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ReadinessQuizCta() {
  return (
    <section className="mt-10 bg-white border border-border rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
      <div className="flex-1">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-2 leading-tight">
          Find out how you compare
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          Take the readiness quiz to get your own score and add it to the map.
          Every response makes these averages sharper — so your neighbors can
          see where the gaps really are.
        </p>
        <p className="text-xs text-muted-foreground/70 font-sans mt-3">
          Free · No account needed
        </p>
      </div>
      <Link
        to="/ReadinessQuiz"
        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-sans font-semibold px-8 py-4 rounded hover:bg-primary/90 transition-colors text-sm whitespace-nowrap"
      >
        Take the readiness quiz
        <ArrowRight className="w-4 h-4" />
      </Link>
    </section>
  );
}