import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, Wind, MapPin, Phone, AlertTriangle, Droplets, Shield, Home } from "lucide-react";

const REGIONS = [
  {
    region: "Americas",
    flag: "🌎",
    emergency: "911",
    hotspots: "Gulf Coast (Texas, Louisiana, Florida) · East Coast · Caribbean · Mexico · Central America",
    note: "NOAA's National Hurricane Center tracks Atlantic and Eastern Pacific storms. Know your evacuation zone before storm season begins.",
  },
  {
    region: "Australia & Oceania",
    flag: "🌏",
    emergency: "000",
    hotspots: "Queensland · Northern Territory · Western Australia · Pacific Islands",
    note: "Tropical cyclones form November–April. The Bureau of Meteorology issues cyclone warnings and storm surge alerts.",
  },
];

const CHECKLIST = [
  { icon: AlertTriangle, title: "Know Your Evacuation Zone", desc: "Hurricane evacuation zones are pre-assigned by local government. Find yours now — when a storm approaches, officials issue orders by zone letter or number." },
  { icon: Home, title: "Protect Windows & Doors", desc: "Install storm shutters or board up with 5/8″ plywood. Tape does not prevent glass from breaking. Reinforce garage doors — wind entering the garage can lift the roof." },
  { icon: Droplets, title: "Water: 4 Liters Per Person/Day", desc: "Store at least 7 days of water per person and pet. Hurricanes can knock out water and power for a week or more. Fill bathtubs for sanitation." },
  { icon: Shield, title: "Documents in Waterproof Bag", desc: "Insurance policies, IDs, medical records, and property deeds sealed in a waterproof container. Photograph your home before the storm for insurance claims." },
  { icon: MapPin, title: "Two Evacuation Routes Planned", desc: "Storm surge can flood coastal roads within hours. Map two inland routes — one may be underwater or blocked by debris." },
  { icon: Wind, title: "Don't Ride It Out Unnecessarily", desc: "Storm surge is the deadliest part of a hurricane — water can rise 6 meters in minutes. If officials order evacuation, leave. A 72-hour window shrinks fast." },
];

export default function Hurricane() {
  useEffect(() => {
    document.title = "Hurricane Evacuation Preparedness | RallyPack — Free Checklist";
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">

      <section className="relative min-h-[80vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1527482797697-8795b05a13b4?w=1800&q=85')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />
        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 md:pb-28">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-white/60 mb-5">Hurricane Evacuation Preparedness · Free · Global</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-none text-white mb-6 max-w-3xl">
            When the wind<br />starts howling,<br />it's too late to plan.
          </h1>
          <p className="font-sans text-base md:text-lg text-white/75 max-w-xl mb-10 leading-relaxed">
            Hurricanes give you days of warning — but storm surge gives you hours to leave. RallyPack helps families build an evacuation plan, track supplies, and coordinate before the season starts — free and open source.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/ReadinessQuiz">
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-sm tracking-widest uppercase">
                <ClipboardList className="w-4 h-4" /> Take the readiness quiz
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-3 border border-white/50 text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-white/10 transition-colors text-sm tracking-widest uppercase">
                Build your hurricane plan <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <p className="mt-6 text-xs font-sans text-white/40 tracking-wide">No account required for the quiz · Always free · Open source</p>
        </div>
      </section>

      <section className="bg-[#1C1C1A] text-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { n: "6m", unit: "", label: "Storm surge can reach in minutes — the deadliest part of a hurricane" },
            { n: "7", unit: "days", label: "Of supplies recommended — power and water can be out for over a week" },
            { n: "40km", unit: "", label: "Inland, hurricane-force winds can still destroy homes and power lines" },
          ].map((s) => (
            <div key={s.label} className="py-10 md:py-0 md:px-14 first:pl-0 last:pr-0">
              <div className="font-serif text-6xl md:text-7xl font-bold text-[#D64A2E] leading-none mb-3">
                {s.n}<span className="text-3xl">{s.unit}</span>
              </div>
              <p className="text-sm font-sans text-white/50 leading-snug max-w-[220px]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 max-w-6xl mx-auto px-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Emergency numbers by region</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-14 leading-tight max-w-2xl">
          Know the number before you need it.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#D8D2C6]">
          {REGIONS.map((r) => (
            <div key={r.region} className="bg-[#F5F0E8] p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{r.flag}</span>
                <h3 className="font-sans font-semibold text-sm tracking-widest uppercase text-[#1C1C1A]">{r.region}</h3>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-[#D64A2E]" />
                <span className="font-serif text-3xl font-bold text-[#1C1C1A]">{r.emergency}</span>
              </div>
              <p className="text-xs font-sans font-semibold text-[#1C1C1A] mb-1 mt-2">High-risk areas:</p>
              <p className="text-xs text-[#8A8577] mb-4">{r.hotspots}</p>
              <p className="text-xs text-[#8A8577] leading-relaxed border-t border-[#D8D2C6] pt-3 mt-auto">{r.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 max-w-6xl mx-auto px-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">The six things that save lives</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-14 leading-tight max-w-xl">
          What your hurricane plan needs to cover.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#D8D2C6]">
          {CHECKLIST.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#F5F0E8] p-8 flex items-start gap-5">
              <Icon className="w-5 h-5 text-[#D64A2E] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-sans font-semibold text-[#1C1C1A] text-sm tracking-wide mb-1">{title}</h3>
                <p className="text-sm text-[#8A8577] leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#1C1C1A] text-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">RallyPack for organizations</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Send emergency alerts to your community.
          </h2>
          <p className="text-white/55 max-w-xl mb-8 leading-relaxed text-sm">
            Fire departments, shelter operators, and community organizations use RallyPack to send real-time evacuation alerts and shelter-open notices to their members — via email, in-app, and Telegram, even when cell towers are overloaded.
          </p>
          <Link to="/BusinessOnboarding">
            <button className="inline-flex items-center gap-3 border border-white/40 text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-white/10 transition-colors text-sm tracking-widest uppercase">
              Explore RallyPack for Business <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#1C1C1A]">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1527482797697-8795b05a13b4?w=1600&q=80')" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-6">Start today — it takes 3 minutes</p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-none mb-8">
            Where would your family go<br />
            <em className="not-italic text-[#D64A2E]">if the surge came?</em>
          </h2>
          <p className="text-base font-sans text-white/55 max-w-md mx-auto mb-12 leading-relaxed">
            Take the free readiness quiz to assess your hurricane plan, or create your RallyPack account to start building one today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ReadinessQuiz">
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase w-full sm:w-auto justify-center">
                <ClipboardList className="w-4 h-4" /> Take the quiz free
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-3 border border-white/30 text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-white/5 transition-colors text-xs tracking-widest uppercase w-full sm:w-auto justify-center">
                Create a free account <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <p className="mt-8 text-xs font-sans text-white/30 tracking-wide">✓ Free forever · ✓ No credit card · ✓ Open source</p>
        </div>
      </section>

      <footer className="bg-[#141412] text-white/50">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-sans text-white/25">
          <Link to="/" className="font-serif text-lg font-bold text-white/60 hover:text-white transition-colors">RallyPack</Link>
          <span>© 2026 RallyPack · In a hurricane, call your local emergency number first.</span>
          <Link to="/PrivacyPolicy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}