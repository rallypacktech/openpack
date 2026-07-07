import React from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, AlertTriangle, FileText, MapPin, Heart, Package, Thermometer, Wind } from "lucide-react";

const CHECKLIST = [
  { icon: Package, title: "Secure Travel Cage", desc: "Your bird's everyday cage is rarely safe for transport. A hard-sided travel carrier with proper ventilation can save their life." },
  { icon: Heart, title: "72-Hour Food & Water Supply", desc: "Pellets, seed mix, and fresh water. Many birds refuse new foods under stress — pack only what they normally eat." },
  { icon: Thermometer, title: "Temperature Sensitivity Plan", desc: "Birds are extremely sensitive to temperature swings and fumes. Keep them away from car exhaust, smoke, and cold drafts." },
  { icon: FileText, title: "Vet Records & ID Information", desc: "A current photo showing leg band or microchip, vaccination records, and your avian vet's contact — stored offsite." },
  { icon: AlertTriangle, title: "Smoke & Air Quality Danger", desc: "Birds have highly efficient respiratory systems — what's an irritant to you can be lethal to them. Evacuate them first." },
  { icon: MapPin, title: "Avian-Friendly Boarding Found", desc: "Most emergency shelters and hotels won't accept birds. Identify a boarding aviary or avian vet with emergency boarding ahead of time." },
];

export default function Avian() {
  React.useEffect(() => {
    document.title = "Avian Emergency Preparedness | RallyPack";
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">

      {/* Hero */}
      <section className="relative h-[80vh] min-h-[560px] flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1800&q=85')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 md:pb-28">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-white/60 mb-5">Avian Emergency Preparedness · RallyPack</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-none text-white mb-6 max-w-3xl">
            Birds are the<br />first to sense<br />danger.
          </h1>
          <p className="font-sans text-base md:text-lg text-white/75 max-w-md mb-10 leading-relaxed">
            Canaries warned miners of bad air for a reason — birds are extraordinarily sensitive to their environment. In a disaster, that sensitivity becomes a life-threatening vulnerability. RallyPack helps bird owners build a plan that protects them.
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
                Build your bird's plan <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <p className="mt-6 text-xs font-sans text-white/40 tracking-wide">No account required for the quiz &nbsp;·&nbsp; Always free</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#1C1C1A] text-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { n: "20M+", unit: "", label: "Pet birds in the US — nearly none of their owners have a species-specific emergency plan" },
            { n: "Seconds", unit: "", label: "It can take for a bird to succumb to smoke, fumes, or rapid temperature change in an emergency" },
            { n: "99%", unit: "", label: "Of public emergency shelters cannot accommodate birds — leaving owners without options if unprepared" },
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
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">The avian preparedness essentials</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-14 leading-tight max-w-xl">
          Six things every bird owner needs in place.
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

      {/* Key warning callout */}
      <section className="bg-[#D64A2E] py-16">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
          <Wind className="w-12 h-12 text-white flex-shrink-0" />
          <div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">Air quality is your bird's primary threat.</h3>
            <p className="text-white/80 font-sans text-sm leading-relaxed max-w-2xl">
              Birds have a unique respiratory system that processes air more efficiently than mammals — which means airborne toxins, smoke, and even non-stick cookware fumes at high heat can be fatal in minutes. In wildfire or chemical emergency scenarios, evacuate your bird before you pack anything else.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial */}
      <section className="relative h-[50vh] min-h-[340px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1600&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1A]/80 to-transparent" />
        <div className="relative h-full flex items-center max-w-6xl mx-auto px-6">
          <div className="max-w-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-sans mb-4">RallyPack for bird owners</p>
            <p className="font-serif text-3xl text-white font-bold leading-tight mb-4">
              Vet records. Species-specific needs. Emergency boarding contacts. Offline when you need them.
            </p>
            <p className="text-sm text-white/60 font-sans leading-relaxed">
              Different species have very different needs. RallyPack lets you log what your bird eats, any medications, and your avian vet — so rescuers and caregivers have the right information fast.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[#1C1C1A]">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('https://media.base44.com/images/public/69dc170f0871ac017d79debb/74c10a1f8_generated_image.png')" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-6">Plan it before you need it</p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-none mb-8">
            Where would your bird go<br />
            <em className="not-italic text-[#D64A2E]">if the air became unsafe?</em>
          </h2>
          <p className="text-base font-sans text-white/55 max-w-md mx-auto mb-12 leading-relaxed">
            Take the free readiness quiz to assess your household's preparedness, or create your RallyPack account to build a complete avian emergency plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ReadinessQuiz">
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase w-full sm:w-auto justify-center">
                <ClipboardList className="w-4 h-4" /> Take the quiz free
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-3 border border-white/30 text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-white/5 transition-colors text-xs tracking-widest uppercase w-full sm:w-auto justify-center">
                Build your avian plan <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <p className="mt-8 text-xs font-sans text-white/30 tracking-wide">✓ Free forever &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Open source</p>
        </div>
      </section>

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