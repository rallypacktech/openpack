/* global pendo */
import React from "react";
import { Link } from "react-router-dom";
import { Flame, Wind, CloudRain, Zap, ArrowRight } from "lucide-react";

// Season definitions by month (1-12). Each season has start/end months and a landing page.
const SEASONS = [
  { key: "wildfire", label: "Wildfire Season", icon: Flame, color: "#D64A2E", path: "/wildfire",
    months: [5, 6, 7, 8, 9, 10], desc: "Peak fire danger across the Americas, Mediterranean, and Australia." },
  { key: "hurricane", label: "Hurricane Season", icon: Wind, color: "#8b5cf6", path: "/hurricane",
    months: [6, 7, 8, 9, 10, 11], desc: "Atlantic and Pacific cyclones — know your evacuation zone now." },
  { key: "tornado", label: "Tornado Season", icon: Zap, color: "#f59e0b", path: "/tornado",
    months: [3, 4, 5, 6, 7], desc: "Peak tornado activity in Tornado Alley and Dixie Alley." },
  { key: "flood", label: "Flood Season", icon: CloudRain, color: "#3b82f6", path: "/flood",
    months: [4, 5, 6, 7, 8, 9], desc: "Spring snowmelt and summer storms elevate flash flood risk." },
];

export default function CurrentSeasons() {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const active = SEASONS.filter(s => s.months.includes(currentMonth));

  if (active.length === 0) return null;

  return (
    <section className="bg-white border-b border-[#D8D2C6] py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-shrink-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-1">Active Now</p>
            <p className="font-sans font-semibold text-sm text-[#1C1C1A]">Current disaster seasons</p>
          </div>
          <div className="flex flex-wrap gap-3 flex-1">
            {active.map(s => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.key}
                  to={s.path}
                  className="group flex items-center gap-3 bg-[#F5F0E8] border border-[#D8D2C6] rounded px-4 py-3 hover:border-[#D64A2E] transition-colors flex-1 min-w-[200px]"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" style={{ color: s.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-semibold text-sm text-[#1C1C1A]">{s.label}</p>
                    <p className="text-xs text-[#8A8577] truncate">{s.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8A8577] group-hover:text-[#D64A2E] transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}