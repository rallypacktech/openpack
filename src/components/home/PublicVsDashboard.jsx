import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Globe, Lock, ArrowRight } from "lucide-react";

// Makes the two halves of RallyPack unmistakable: the public, crawlable guidance
// every visitor gets without an account, and the private dashboard where a
// signed-in person tracks their own household or organization.
export default function PublicVsDashboard({ isSignedIn, onSignUp }) {
  return (
    <section className="bg-[#F5F0E8] border-b border-[#D8D2C6] py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Two different places</p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1C1A] mb-10 leading-tight max-w-2xl">
          Public guidance for anyone.<br />A private dashboard for your own plan.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#D8D2C6]">
          {/* Public */}
          <div className="bg-[#F5F0E8] p-7 md:p-9">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-5 h-5 text-[#D64A2E] flex-shrink-0" aria-hidden="true" />
              <h3 className="font-serif text-xl font-bold text-[#1C1C1A]">Public — no account needed</h3>
            </div>
            <p className="text-sm text-[#1C1C1A]/60 leading-relaxed mb-6">
              Open to everyone, including search engines, researchers and press. Nothing here sits behind a login.
            </p>
            <ul className="space-y-2 mb-7">
              {[
                "Hazard guides for wildfire, hurricane, flood and tornado",
                "Species and family preparedness pages",
                "The 10-year wildfire trend report and its sources",
                "Community drill directory and equipment shop",
              ].map((item) => (
                <li key={item} className="text-sm text-[#1C1C1A]/70 font-sans leading-relaxed">{item}</li>
              ))}
            </ul>
            <Link
              to={createPageUrl("ReadinessQuiz")}
              className="inline-flex items-center gap-2 text-sm font-sans font-semibold text-[#D64A2E] underline underline-offset-2 hover:no-underline"
            >
              Score your readiness free <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Private */}
          <div className="bg-[#1C1C1A] p-7 md:p-9 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-5 h-5 text-[#D64A2E] flex-shrink-0" aria-hidden="true" />
              <h3 className="font-serif text-xl font-bold text-white">
                {isSignedIn ? "Private — your dashboard" : "Private — your dashboard (sign in)"}
              </h3>
            </div>
            <p className="text-sm text-white/55 leading-relaxed mb-6">
              {isSignedIn
                ? "You're signed in. Only your own household or organization records appear here."
                : "Your own household or organization records, visible only to you and the people you authorize."}
            </p>
            <ul className="space-y-2 mb-7">
              {[
                "Caches with quantities and expiration reminders",
                "Meeting spots in each direction from home",
                "Family, pet and authorized-handler rosters",
                "Location-based weather and emergency alerts",
              ].map((item) => (
                <li key={item} className="text-sm text-white/60 font-sans leading-relaxed">{item}</li>
              ))}
            </ul>
            {isSignedIn ? (
              <Link
                to={createPageUrl("Dashboard")}
                className="inline-flex items-center gap-2 bg-[#D64A2E] text-white font-sans font-semibold px-6 py-3 hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase"
              >
                Open my dashboard <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            ) : (
              <button
                onClick={onSignUp}
                className="inline-flex items-center gap-2 bg-[#D64A2E] text-white font-sans font-semibold px-6 py-3 hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase"
              >
                Create a free account <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}