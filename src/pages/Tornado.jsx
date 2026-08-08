import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, Wind, MapPin, Phone, AlertTriangle, Shield, Home } from "lucide-react";

const REGIONS = [
  {
    region: "Americas",
    flag: "🌎",
    emergency: "911",
    hotspots: "Tornado Alley (Texas, Oklahoma, Kansas, Nebraska) · Dixie Alley · Southeast US · Ontario · Manitoba",
    note: "The US experiences more tornadoes than any other country. NOAA Storm Prediction Center issues watches and warnings. A watch means conditions are right; a warning means one has been spotted or detected by radar — take shelter immediately.",
  },
  {
    region: "Europe & Australia",
    flag: "🌏",
    emergency: "112",
    hotspots: "Germany · France · UK · Italy · Eastern Australia · Bangladesh",
    note: "Europe sees hundreds of tornadoes annually, often weaker but still dangerous. Bangladesh has the highest tornado death tolls per capita. Monitor local weather services and take indoor shelter immediately.",
  },
];

const CHECKLIST = [
  { icon: AlertTriangle, title: "Know the Difference: Watch vs Warning", desc: "A tornado watch means conditions are favorable — stay alert. A warning means a tornado has been spotted or detected — take shelter now. Don't wait to see it." },
  { icon: Home, title: "Identify Your Safe Room", desc: "Lowest level, interior room, away from windows. A basement is best; a bathroom or closet on the ground floor works. Mobile homes are not safe — evacuate to a sturdy building." },
  { icon: Shield, title: "Helmet & Head Protection", desc: "Keep a bicycle or sports helmet in your safe room. Head injuries are the leading cause of tornado fatalities. Protect your head and neck." },
  { icon: AlertTriangle, title: "Don't Try to Outrun a Tornado", desc: "Tornadoes can move at 100+ km/h and change direction without warning. If you're driving and can't reach a sturdy building, abandon the vehicle for a ditch or low ground — never under an overpass." },
  { icon: Wind, title: "Go-Bag in the Safe Room", desc: "Keep a go-bag with documents, medications, flashlight, whistle, weather radio, and helmet in or near your safe room. You may have less than 5 minutes." },
  { icon: MapPin, title: "Two Meeting Points After", desc: "Tornadoes destroy landmarks. Set a family meeting point near the home and a backup point elsewhere. Cell networks often fail after a strike." },
];

export default function Tornado() {
  useEffect(() => {
    document.title = "Tornado Preparedness & Safety | RallyPack — Free Checklist";
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">

      <section className="relative min-h-[80vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1527482797697-8795b05a13fe?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />
        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 md:pb-28">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-white/60 mb-5">Tornado Preparedness · Free · Global</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-none text-white mb-6 max-w-3xl">
            When the sky<br />turns green,<br />it's too late to plan.
          </h1>
          <p className="font-sans text-base md:text-lg text-white/75 max-w-xl mb-10 leading-relaxed">
            Tornadoes give you minutes — sometimes seconds. You can't prepare during the warning. RallyPack helps families identify safe rooms, build go-bags, and plan reunification before storm season — free and open source.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/ReadinessQuiz">
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-sm tracking-widest uppercase">
                <ClipboardList className="w-4 h-4" /> Take the readiness quiz
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-3 border border-white/50 text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-white/10 transition-colors text-sm tracking-widest uppercase">
                Build your tornado plan <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <p className="mt-6 text-xs font-sans text-white/40 tracking-wide">No account required for the quiz · Always free · Open source</p>
        </div>
      </section>

      <section className="bg-[#1C1C1A] text-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { n: "5", unit: "min", label: "Average tornado warning lead time — sometimes as little as 30 seconds" },
            { n: "100", unit: "km/h", label: "Tornado winds can exceed — EF5 tornadoes reach over 300 km/h" },
            { n: "#1", unit: "", label: "US experiences more tornadoes than any other country on Earth" },
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
          What your tornado plan needs to cover.
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
            Fire departments, shelter operators, and community organizations use RallyPack to send real-time tornado alerts and shelter-open notices to their members — via email, in-app, and Telegram, even when cell towers are overloaded.
          </p>
          <Link to="/BusinessOnboarding">
            <button className="inline-flex items-center gap-3 border border-white/40 text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-white/10 transition-colors text-sm tracking-widest uppercase">
              Explore RallyPack for Business <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#1C1C1A]">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1527482797697-8795b05a13fe?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-6">Start today — it takes 3 minutes</p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-none mb-8">
            Would your family know where<br />
            <em className="not-italic text-[#D64A2E]">to shelter tonight?</em>
          </h2>
          <p className="text-base font-sans text-white/55 max-w-md mx-auto mb-12 leading-relaxed">
            Take the free readiness quiz to assess your tornado plan, or create your RallyPack account to start building one today.
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
          <span>© 2026 RallyPack · In a tornado, call your local emergency number first.</span>
          <Link to="/PrivacyPolicy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}