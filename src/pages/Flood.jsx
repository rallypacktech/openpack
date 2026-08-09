import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, Droplets, MapPin, Phone, AlertTriangle, Shield, Home } from "lucide-react";
import { useHeroShot } from "@/hooks/useHeroShot";

const REGIONS = [
  {
    region: "Americas",
    flag: "🌎",
    emergency: "911",
    hotspots: "Gulf Coast · Mississippi Basin · Appalachia · Central America · Brazil",
    note: "Flash floods kill more Americans than tornadoes or hurricanes. NOAA issues flood watches and warnings. Never drive through flooded roads — 15 cm of water can sweep a car away.",
  },
  {
    region: "Europe & Australia",
    flag: "🌏",
    emergency: "112",
    hotspots: "Germany · France · UK · Spain · Australia · New Zealand",
    note: "European Flood Awareness System (EFAS) monitors river flooding. Australia's Bureau of Meteorology issues flood warnings. Turn around — don't drown.",
  },
];

const CHECKLIST = [
  { icon: AlertTriangle, title: "Know Your Flood Zone", desc: "FEMA flood maps, local council data, and river gauge alerts tell you if your home is in a 100-year or 500-year floodplain. Check before storm season." },
  { icon: Home, title: "Elevate Critical Items", desc: "Move valuables, documents, and electrical panels above expected flood level. Keep irreplaceable items on upper floors or in waterproof containers." },
  { icon: Droplets, title: "Water: 4 Liters Per Person/Day", desc: "Floodwater contaminates municipal supply. Store sealed water and know how to purify water by boiling or using tablets. Fill containers before a storm arrives." },
  { icon: Shield, title: "Documents in Waterproof Bag", desc: "Insurance policies, IDs, medical records sealed in a waterproof container. Photograph your home and belongings for insurance claims before flooding occurs." },
  { icon: MapPin, title: "Two Escape Routes on High Ground", desc: "Floods close low-lying roads. Map two routes that stay above the flood line. A 15 cm depth can knock you off your feet; 60 cm can sweep away a vehicle." },
  { icon: AlertTriangle, title: "Never Walk, Swim, or Drive in Floodwater", desc: "Floodwater hides downed power lines, open manholes, and debris. More than half of flood deaths happen in vehicles. Turn around — don't drown." },
];

export default function Flood() {
  useEffect(() => {
    document.title = "Flood Preparedness & Evacuation | RallyPack — Free Checklist";
  }, []);

  const heroUrl = useHeroShot("flood");
  const ctaUrl = useHeroShot("flood_cta");

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">

      <section className="relative min-h-[80vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${heroUrl}')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />
        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 md:pb-28">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-white/60 mb-5">Flood Preparedness · Free · Global</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-none text-white mb-6 max-w-3xl">
            When the water<br />rises fast,<br />it's too late to plan.
          </h1>
          <p className="font-sans text-base md:text-lg text-white/75 max-w-xl mb-10 leading-relaxed">
            Floods are the most common natural disaster worldwide — and the deadliest. Flash floods give you minutes, not hours. RallyPack helps families build a flood plan, track supplies, and stay safe — free and open source.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/ReadinessQuiz">
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-sm tracking-widest uppercase">
                <ClipboardList className="w-4 h-4" /> Take the readiness quiz
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-3 border border-white/50 text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-white/10 transition-colors text-sm tracking-widest uppercase">
                Build your flood plan <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <p className="mt-6 text-xs font-sans text-white/40 tracking-wide">No account required for the quiz · Always free · Open source</p>
        </div>
      </section>

      <section className="bg-[#1C1C1A] text-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { n: "15", unit: "cm", label: "Of moving water can knock an adult off their feet" },
            { n: "60", unit: "cm", label: "Of water can carry away most vehicles — turn around, don't drown" },
            { n: "#1", unit: "", label: "Floods are the most common natural disaster worldwide" },
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
          What your flood plan needs to cover.
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
            Fire departments, shelter operators, and community organizations use RallyPack to send real-time flood evacuation alerts and shelter-open notices to their members — via email, in-app, and Telegram, even when cell towers are overloaded.
          </p>
          <Link to="/BusinessOnboarding">
            <button className="inline-flex items-center gap-3 border border-white/40 text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-white/10 transition-colors text-sm tracking-widest uppercase">
              Explore RallyPack for Business <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#1C1C1A]">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: `url('${ctaUrl}')` }} />
        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-6">Start today — it takes 3 minutes</p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-none mb-8">
            Would you know what to grab<br />
            <em className="not-italic text-[#D64A2E]">if water reached your door?</em>
          </h2>
          <p className="text-base font-sans text-white/55 max-w-md mx-auto mb-12 leading-relaxed">
            Take the free readiness quiz to assess your flood plan, or create your RallyPack account to start building one today.
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
          <span>© 2026 RallyPack · In a flood, call your local emergency number first.</span>
          <Link to="/PrivacyPolicy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}