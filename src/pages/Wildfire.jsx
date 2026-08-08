import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, Flame, MapPin, Phone, AlertTriangle, Wind, Droplets, Shield, CheckCircle } from "lucide-react";

const REGIONS = [
  {
    region: "United States & Canada",
    flag: "🇺🇸",
    emergency: "911",
    fire_specific: "Fire emergencies: 911",
    hotspots: "California · Oregon · Washington · Utah · British Columbia · Alberta",
    note: "Western US and Canadian provinces face record-breaking wildfire seasons. CalFire and Natural Resources Canada track thousands of incidents annually.",
  },
  {
    region: "Australia",
    flag: "🇦🇺",
    emergency: "000",
    fire_specific: "Bushfire info: 1800 679 737",
    hotspots: "New South Wales · Victoria · Queensland · Western Australia",
    note: "Bushfire seasons intensify during Southern Hemisphere summer. The Rural Fire Service issues warnings and Total Fire Bans.",
  },
  {
    region: "Spain",
    flag: "🇪🇸",
    emergency: "112",
    fire_specific: "Emergencias 112 · INFO INCENDIOS",
    hotspots: "Andalucía · Castilla y León · Galicia · Comunidad Valenciana",
    note: "Los incendios forestales son una amenaza grave durante los meses secos de verano. Protección Civil emite alertas a través del 112.",
  },
  {
    region: "France",
    flag: "🇫🇷",
    emergency: "112",
    fire_specific: "Pompiers: 18 · SAMU: 15 · Police: 17",
    hotspots: "Provence-Alpes-Côte d'Azur · Occitanie · Nouvelle-Aquitaine · Corse",
    note: "Les feux de forêt ravagent le sud de la France chaque été. La sécurité civile et les pompiers interviennent sur tous les incendies.",
  },
  {
    region: "Eastern Europe",
    flag: "🇪🇺",
    emergency: "112",
    fire_specific: "EU-wide emergency: 112",
    hotspots: "Greece · Bulgaria · Romania · Croatia · Türkiye",
    note: "Southeastern Europe faces severe wildfire seasons worsened by heatwaves. Each country routes civil protection alerts through 112.",
  },
];

const CHECKLIST = [
  { icon: AlertTriangle, title: "Know Your Evacuation Level", desc: "Understand your local evacuation zones (Levels 1-3 in the US, 'Get Ready / Leave Now' in Australia). Sign up for official alerts before fire season." },
  { icon: MapPin, title: "Two Escape Routes, Memorized", desc: "Wildfires close roads without warning. Map two routes out of your area — one may be blocked by fire or smoke." },
  { icon: Shield, title: "Defensible Space & Hardening", desc: "Clear vegetation within 30m of your home. Cover vents, remove ember traps, and move flammable items away from structures." },
  { icon: ClipboardList, title: "Go-Bag by the Door", desc: "Documents, medications, cash, phone chargers, N95 masks, and 72 hours of water and food. Pack it before fire season, not during." },
  { icon: Wind, title: "Air Quality Plan", desc: "Wildfire smoke travels hundreds of kilometers. Keep HEPA filters, know how to create a clean-air room, and track AQI daily." },
  { icon: Droplets, title: "Water & Hydration Ready", desc: "Store at least 4 liters per person per day. Power outages and damaged infrastructure can cut water supply for days." },
];

export default function Wildfire() {
  useEffect(() => {
    document.title = "Wildfire Evacuation Preparedness | RallyPack — Free Global Checklist";
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">

      <section className="relative min-h-[80vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=1800&q=85')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />
        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 md:pb-28">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-white/60 mb-5">Wildfire Evacuation Preparedness · Free · Global</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-none text-white mb-6 max-w-3xl">
            When the air<br />turns orange,<br />it's too late to plan.
          </h1>
          <p className="font-sans text-base md:text-lg text-white/75 max-w-xl mb-10 leading-relaxed">
            Wildfires give you hours, not days. RallyPack helps families in the Americas, Eastern Europe, Australia, and beyond build an evacuation plan before fire season starts — free and open source.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/ReadinessQuiz">
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-sm tracking-widest uppercase">
                <ClipboardList className="w-4 h-4" /> Take the readiness quiz
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-3 border border-white/50 text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-white/10 transition-colors text-sm tracking-widest uppercase">
                Build your wildfire plan <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <p className="mt-6 text-xs font-sans text-white/40 tracking-wide">No account required for the quiz · Always free · Open source</p>
        </div>
      </section>

      <section className="bg-[#1C1C1A] text-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { n: "6–48", unit: "hrs", label: "Typical wildfire evacuation warning window — often less for rural and interface zones" },
            { n: "2km+", unit: "", label: "Embers travel ahead of a fire front, igniting homes before flames arrive" },
            { n: "30m", unit: "", label: "Of defensible space recommended around structures in fire-prone areas" },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#D8D2C6]">
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
              <p className="text-xs text-[#8A8577] mb-3">{r.fire_specific}</p>
              <p className="text-xs font-sans font-semibold text-[#1C1C1A] mb-1">High-risk areas:</p>
              <p className="text-xs text-[#8A8577] mb-4">{r.hotspots}</p>
              <p className="text-xs text-[#8A8577] leading-relaxed border-t border-[#D8D2C6] pt-3 mt-auto">{r.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 max-w-6xl mx-auto px-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">The six things that save lives</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-14 leading-tight max-w-xl">
          What your wildfire plan needs to cover.
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
            Fire departments, shelter operators, and community organizations use RallyPack to send real-time evacuation alerts and shelter-open notices to their members. Approved alerts reach people via email, in-app, and Telegram — even when cell towers are overloaded.
          </p>
          <Link to="/BusinessOnboarding">
            <button className="inline-flex items-center gap-3 border border-white/40 text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-white/10 transition-colors text-sm tracking-widest uppercase">
              Explore RallyPack for Business <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#1C1C1A]">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=1600&q=80')" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-6">Start today — it takes 3 minutes</p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-none mb-8">
            Where would your family go<br />
            <em className="not-italic text-[#D64A2E]">if you had 2 hours?</em>
          </h2>
          <p className="text-base font-sans text-white/55 max-w-md mx-auto mb-12 leading-relaxed">
            Take the free readiness quiz to assess your wildfire plan, or create your RallyPack account to start building one today.
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
          <span>© 2026 RallyPack · In a wildfire, call your local emergency number first.</span>
          <Link to="/PrivacyPolicy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}