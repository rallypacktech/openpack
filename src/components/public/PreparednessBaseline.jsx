import React from "react";

const ITEMS = [
  {
    key: "72 hours minimum",
    body: "Assume your household is on its own for at least 72 hours — and build toward 7 to 14 days where wildfire, extreme heat, outages or remote access make that realistic. Help may be delayed, shelters may be full or distant, and normal services may be unavailable.",
  },
  {
    key: "Year-round risk",
    body: "Peak months are real, but dangerous conditions recur outside the historic season. Keep supplies, documents, contacts and animal plans current all year, and raise readiness when heat, drought, wind, holidays or utility shutoffs converge.",
  },
  {
    key: "Three departure modes",
    body: "Practise leaving in 15 minutes, leaving in one hour, and preparing for a 72-hour displacement — rather than one generic “pack the car” plan.",
  },
  {
    key: "Water is a dependency",
    body: "Hydrants, wells and municipal supplies can fail or be strained exactly when a fire is unfolding, and drinking-water networks are not built to suppress a wildfire at community scale. Store, protect and conserve water in advance.",
  },
];

/**
 * The preparedness framing shared by the public hazard pages: 72 hours as a
 * minimum rather than a promise of aid, year-round risk, time-based departure
 * modes, and water treated as a preparedness dependency.
 */
export default function PreparednessBaseline({ contextLabel = "Plan for the minimum, not the promise of aid" }) {
  return (
    <section className="bg-[#F5F0E8] border-y border-[#D8D2C6]">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">{contextLabel}</p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1C1A] mb-12 leading-tight max-w-2xl">
          Four things that decide how a disaster goes.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#D8D2C6]">
          {ITEMS.map((item) => (
            <div key={item.key} className="bg-[#F5F0E8] p-8">
              <h3 className="font-serif text-xl font-bold text-[#1C1C1A] mb-2">{item.key}</h3>
              <p className="text-sm text-[#8A8577] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}