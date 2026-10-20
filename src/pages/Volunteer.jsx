import React from "react";
import { Link } from "react-router-dom";
import { Heart, ExternalLink } from "lucide-react";
import { usePublicHead } from "@/lib/publicSite";
import VolunteerOpportunities from "@/components/resources/VolunteerOpportunities";
import PageFaq from "@/components/public/PageFaq";
import PublicCtaLadder from "@/components/public/PublicCtaLadder";

/**
 * Public, search-optimised home for volunteer preparedness content — the Level 1
 * volunteer goal. It reuses the same verified organization list the signed-in
 * Resources tab shows, so there is one source of truth for the contacts.
 */
export default function Volunteer() {
  usePublicHead({
    title: "Volunteer for Disaster Preparedness | RallyPack",
    description:
      "Train with the organizations that deploy volunteers when disasters strike — Red Cross, Team Rubicon, animal response teams, COADs and more. The best time to volunteer is before the disaster.",
    path: "/volunteer",
  });

  return (
    <div className="bg-cream min-h-screen font-sans">
      <section className="bg-[#1C1C1A] text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Heart className="w-10 h-10 text-[#D64A2E] mx-auto mb-6" aria-hidden="true" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-sans mb-4">
            Volunteer preparedness
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Volunteer to help your community get ready
          </h1>
          <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
            Disaster response runs on trained volunteers who signed up months earlier.
            Most organizations train you for free, and the need is year-round — not just
            when a fire, flood or storm is on the news.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-14">
        <VolunteerOpportunities />
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-4">
        <div className="border border-border rounded-lg bg-white p-6">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
            Volunteer in your own neighborhood first
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            National organizations deploy you elsewhere; local groups need you where you live.
            RallyPack's{" "}
            <Link to="/readiness-map" className="text-[#D64A2E] underline decoration-dotted underline-offset-2">
              neighborhood readiness map
            </Link>{" "}
            shows where preparedness gaps are largest, so you can point a local effort at
            the streets that need it most.
          </p>
        </div>
      </section>

      <PageFaq topic="volunteer" title="Volunteering questions" path="/volunteer" />

      <PublicCtaLadder contextLabel="Volunteer readiness" />

      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <a
          href="https://www.nvoad.org/get-involved/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
        >
          Browse every National VOAD member organization <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}