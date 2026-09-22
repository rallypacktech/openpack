import React from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function ReadinessMapCta() {
  return (
    <section className="bg-[#F0EBE0] border-b border-[#D8D2C6]">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-4">Neighborhood readiness map</p>
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#1C1C1A] mb-4 leading-tight">
          How prepared is your community?
        </h2>
        <p className="text-sm md:text-base font-sans text-[#1C1C1A]/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          Find out how you compare — average readiness by country, state, county and postal code. Add your own score and help map where the gaps really are.
        </p>
        <Link to="/readiness-map">
          <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase">
            <MapPin className="w-4 h-4" /> See how you compare
          </button>
        </Link>
        <p className="mt-6 text-xs font-sans text-[#1C1C1A]/40 tracking-wide">Free · No account needed</p>
      </div>
    </section>
  );
}