import React from "react";
import { ShieldCheck } from "lucide-react";
import { usePublicHead } from "@/lib/publicSite";
import ComplianceCheckQuiz from "@/components/business/ComplianceCheckQuiz";
import PageFaq from "@/components/public/PageFaq";
import PublicCtaLadder from "@/components/public/PublicCtaLadder";

/**
 * Public compliance check — the entry point that turns "will we pass inspection?"
 * into a trial start. No account required, and nothing is stored.
 */
export default function ComplianceQuiz() {
  usePublicHead({
    title: "Business Fire & Life-Safety Compliance Check | RallyPack",
    description:
      "Six questions, two minutes: score how inspection-ready your building is on extinguishers, evacuation plans, AEDs, certifications and alarm testing — then get the exact gaps to fix.",
    path: "/compliance-quiz",
  });

  return (
    <div className="bg-cream min-h-screen font-sans">
      <section className="bg-[#1C1C1A] text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ShieldCheck className="w-10 h-10 text-[#D64A2E] mx-auto mb-6" aria-hidden="true" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-sans mb-4">
            Business compliance check
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Would your building pass inspection today?
          </h1>
          <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
            Six questions on the items a fire inspector or insurer asks about first.
            You'll get a readiness score and the exact gaps to close — no account, nothing stored.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-14">
        <ComplianceCheckQuiz />
      </section>

      <PageFaq topic="business" title="Inspection questions" path="/compliance-quiz" />

      <PublicCtaLadder contextLabel="Keep your household ready too" />
    </div>
  );
}