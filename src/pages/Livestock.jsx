import React from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, AlertTriangle, FileText, Truck, MapPin, Heart, CheckCircle, Flame, Wind, Droplets, Shield, Beef } from "lucide-react";

const CHECKLIST = [
  { icon: FileText, title: "Brands, Tags & Health Papers", desc: "Brand inspections, scrapie tags, ear tag records, and health certificates in a waterproof pouch. Reunification and interstate movement both depend on documentation." },
  { icon: Truck, title: "Stock Trailer & Tow Vehicle", desc: "Fuel up when threats are forecast. Know your trailer's weight capacity and the number of animals it safely holds. Stock trailers aren't one-size-fits-all." },
  { icon: MapPin, title: "Pre-Arranged Destinations", desc: "Fairgrounds, stockyards, or private ranches in two different directions. Confirm they'll accept your species and have water access before you arrive." },
  { icon: Heart, title: "72-Hour Feed & Water", desc: "Cattle drink 30–50 gallons a day. Haul water troughs and enough hay — most evacuation sites don't supply feed or water for livestock." },
  { icon: FileText, title: "Loading Chute & Alleyway", desc: "Portable panels or a working loading chute at home. Animals that won't walk onto a trailer freely will need a squeeze chute and an experienced crew." },
  { icon: AlertTriangle, title: "Multiple Trips Plan", desc: "Most herds need 2–5 trailer loads. Map the load order: highest-value and most difficult animals first, in case you only get one trip out." },
];

const DISASTERS = [
  { icon: Flame, label: "Wildfire", desc: "Smoke and heat stress kill livestock before flames arrive. Cattle will stampede through fences. Load and leave early — fire moves faster than a herd." },
  { icon: Wind, label: "Hurricane", desc: "Storm surge drowns animals left in low pastures. Wind collapses barns and shelters. Move herds 150+ km inland at least 48 hours before landfall." },
  { icon: Droplets, label: "Flood", desc: "Livestock standing in floodwater develop foot rot and hypothermia within hours. Move to high ground or elevated pasture well before water rises." },
];

export default function Livestock() {
  React.useEffect(() => {
    document.title = "Livestock Emergency Preparedness | RallyPack";
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">

      {/* Hero */}
      <section className="relative h-[80vh] min-h-[560px] flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500595046743-cd271d694d10?w=1800&q=85')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 md:pb-28">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-white/60 mb-5">Livestock Emergency Preparedness · RallyPack</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-none text-white mb-6 max-w-3xl">
            Move the herd<br />before the<br />danger moves.
          </h1>
          <p className="font-sans text-base md:text-lg text-white/75 max-w-md mb-10 leading-relaxed">
            Evacuating a herd takes planning that starts weeks ahead — loading chutes, multiple trailer trips, and destinations that accept livestock. RallyPack helps you build that plan before disaster forces your hand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/ReadinessQuiz">
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-sm tracking-widest uppercase">
                <ClipboardList className="w-4 h-4" />
                Take the readiness quiz
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-3 border border-white/50 text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-white/10 transition-colors text-sm tracking-widest uppercase">
                Build your herd plan <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <p className="mt-6 text-xs font-sans text-white/40 tracking-wide">No account required for the quiz &nbsp;·&nbsp; Always free</p>
        </div>
      </section>

      {/* The reality */}
      <section className="bg-[#1C1C1A] text-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { n: "2–5", unit: "loads", label: "Typical trailer trips needed to evacuate a 50-head herd — each round trip can take over an hour in disaster traffic" },
            { n: "50", unit: "gal", label: "Daily water consumption per cow — evacuation sites rarely supply enough water for large animals" },
            { n: "70%", unit: "", label: "Of livestock disaster losses come from animals left behind in barns or fenced pastures with no escape route" },
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

      {/* Checklist */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">The six things that save a herd</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-14 leading-tight max-w-xl">
          What your livestock plan needs to cover.
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

      {/* Evacuation rules */}
      <section className="bg-[#1C1C1A] text-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Rules that save lives</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-14 leading-tight">
            When the clock is running.
          </h2>
          <div className="space-y-0 divide-y divide-white/10">
            {[
              { icon: Truck, title: "Go-bag lives on the trailer", desc: "Keep your livestock go-bag — brand papers, health certificates, medications, halters/leads — stored on the stock trailer. When it's time to move, you grab and go without doubling back." },
              { icon: AlertTriangle, title: "Never re-enter an evacuation zone", desc: "Once the herd is out, do not go back for anything. Conditions change instantly and roads close behind you. Animals and crew come first — everything else can be replaced." },
              { icon: Shield, title: "If they won't fit or you're out of time", desc: "Sink valuables into a stock tank or water trough. Leave what you can't haul in the most fire-resistant or flood-proof structure on the property. Insurance covers things — not lives." },
              { icon: Heart, title: "Last resort: open the gates", desc: "If loading is impossible and time has run out, open all gates and cut interior fences to give the herd an escape path on foot. Close gates behind you to the exterior so animals can't circle back into a burning or flooding barn. Turn them loose to outrun the threat on open ground." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="py-6 flex items-start gap-5">
                <Icon className="w-5 h-5 text-[#D64A2E] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-sans font-semibold text-white text-sm tracking-wide mb-1">{title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Species considerations */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Species-specific evacuation</p>
        <h2 className="font-serif text-4xl font-bold text-[#1C1C1A] mb-12 leading-tight">
          Different animals, different problems.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#D8D2C6]">
          {[
            { icon: Beef, label: "Cattle", desc: "Load in groups — isolated animals panic. Use a crowding tub and alley. Cows can be driven up ramps but balk at steep steps. Remove headgates only if the animal is calm." },
            { icon: Beef, label: "Sheep & Goats", desc: "Herd animals that move together — load in small groups. Goats climb; ensure trailer ventilation is adequate and top doors are secured. Sheep will not move toward a dead-end." },
            { icon: Beef, label: "Swine", desc: "Pigs are notoriously difficult to load. Use panels to create a narrow chute with no visual gaps. Move in small groups of 3–5. Never use electric prods on market hogs in heat stress." },
            { icon: Beef, label: "Poultry (Flocks)", desc: "Crate in ventilated carriers — 8–10 birds per standard crate. Move at dusk when they're calm. Secure waterers; dehydration kills poultry faster than any disaster." },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-[#F5F0E8] p-8">
              <Icon className="w-6 h-6 text-[#D64A2E] mb-4" />
              <h3 className="font-sans font-semibold text-sm tracking-widest uppercase text-[#1C1C1A] mb-3">{label}</h3>
              <p className="text-sm text-[#8A8577] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What disasters apply */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Livestock threats by disaster type</p>
        <h2 className="font-serif text-4xl font-bold text-[#1C1C1A] mb-12 leading-tight">
          Herds face unique risks in every scenario.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#D8D2C6]">
          {DISASTERS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-[#F5F0E8] p-8">
              <Icon className="w-6 h-6 text-[#D64A2E] mb-4" />
              <h3 className="font-sans font-semibold text-sm tracking-widest uppercase text-[#1C1C1A] mb-3">{label}</h3>
              <p className="text-sm text-[#8A8577] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[#1C1C1A]">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1605000797489-7b29f30f5d9b?w=1600&q=80')" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-6">Start today — it takes 10 minutes</p>
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-white leading-none mb-8">
            Where would your herd go<br />
            <em className="not-italic text-[#D64A2E]">if you had 4 hours?</em>
          </h2>
          <p className="text-base font-sans text-white/55 max-w-md mx-auto mb-12 leading-relaxed">
            Take the free readiness quiz to assess your livestock plan, or create your RallyPack account to start building one today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ReadinessQuiz">
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase w-full sm:w-auto justify-center">
                <ClipboardList className="w-4 h-4" /> Take the quiz free
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-3 border border-white/30 text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-white/5 transition-colors text-xs tracking-widest uppercase w-full sm:w-auto justify-center">
                Create your herd plan <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <p className="mt-8 text-xs font-sans text-white/30 tracking-wide">✓ Free forever &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Open source</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#141412] text-white/50">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-sans text-white/25">
          <Link to="/" className="font-serif text-lg font-bold text-white/60 hover:text-white transition-colors">RallyPack</Link>
          <span>© 2026 RallyPack · In emergencies, always call 911 first.</span>
          <Link to="/PrivacyPolicy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}