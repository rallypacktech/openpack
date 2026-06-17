import React from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, AlertTriangle, FileText, MapPin, Heart, Thermometer, Package } from "lucide-react";

const CHECKLIST = [
  { icon: Thermometer, title: "Temperature & Humidity Control", desc: "Reptiles are ectothermic — without their heat source they can go into shock within hours. Pack a portable heat mat and thermometer in your go-bag." },
  { icon: Package, title: "Secure Transport Container", desc: "A pillow case or ventilated box for snakes; a hard-sided carrier for lizards and turtles. Practice handling before a stressful event." },
  { icon: Heart, title: "72-Hour Food Supply", desc: "Frozen feeders, insects in a ventilated container, or fresh greens depending on species. Know your animal's feeding schedule and adjust for stress." },
  { icon: FileText, title: "Vet Records & Species Documentation", desc: "Some reptiles require permits. Keep your exotic animal documentation, vet contact, and species-specific care notes stored offsite and digitally." },
  { icon: AlertTriangle, title: "Most Shelters Won't Accept Reptiles", desc: "Public emergency shelters almost universally turn away reptiles. Identify a reptile-friendly boarding facility or exotic animal vet with emergency capacity now." },
  { icon: MapPin, title: "Pre-Arranged Boarding Contact", desc: "Call your exotic vet or local herpetological society before disaster season. Knowing who will take your animal is the most important step you can take." },
];

export default function Reptile() {
  React.useEffect(() => {
    document.title = "Reptile Emergency Preparedness | RallyPack";
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">

      {/* Hero */}
      <section className="relative h-[80vh] min-h-[560px] flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=1800&q=85')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 md:pb-28">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-white/60 mb-5">Reptile Emergency Preparedness · RallyPack</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-none text-white mb-6 max-w-3xl">
            Cold-blooded<br />animals need<br />warm plans.
          </h1>
          <p className="font-sans text-base md:text-lg text-white/75 max-w-md mb-10 leading-relaxed">
            Reptiles are among the most overlooked animals in disaster planning — and the most vulnerable to it. Without heat, hydration, and a pre-arranged destination, they rarely survive. RallyPack helps reptile owners plan before it matters.
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
                Build your reptile plan <ArrowRight className="w-4 h-4" />
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
            { n: "9M+", unit: "", label: "Reptiles kept as pets in the US — with almost no emergency preparedness resources designed for them" },
            { n: "2–4", unit: "hrs", label: "Without proper temperature, a reptile can enter metabolic shutdown — often irreversible without a vet" },
            { n: "100%", unit: "", label: "Of public emergency shelters will turn away reptiles — making pre-arranged boarding non-negotiable" },
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
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">The reptile preparedness essentials</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-14 leading-tight max-w-xl">
          Six things every reptile owner needs in place.
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

      {/* Editorial */}
      <section className="relative h-[50vh] min-h-[340px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://media.base44.com/images/public/69dc170f0871ac017d79debb/df12b2780_generated_image.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1A]/85 to-transparent" />
        <div className="relative h-full flex items-center max-w-6xl mx-auto px-6">
          <div className="max-w-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-sans mb-4">RallyPack for reptile owners</p>
            <p className="font-serif text-3xl text-white font-bold leading-tight mb-4">
              Species care notes. Exotic vet contacts. Boarding arrangements. All offline.
            </p>
            <p className="text-sm text-white/60 font-sans leading-relaxed">
              Log your reptile's heat requirements, feeding schedule, and emergency boarding contact — then access it without internet when you need it most.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[#1C1C1A]">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('https://media.base44.com/images/public/69dc170f0871ac017d79debb/06ed9b653_generated_image.png')" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-6">Start today — it takes 10 minutes</p>
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-white leading-none mb-8">
            Where would your reptile go<br />
            <em className="not-italic text-[#D64A2E]">if you had to leave tonight?</em>
          </h2>
          <p className="text-base font-sans text-white/55 max-w-md mx-auto mb-12 leading-relaxed">
            Take the free readiness quiz to assess your preparedness, or create your RallyPack account to build a complete reptile emergency plan today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ReadinessQuiz">
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase w-full sm:w-auto justify-center">
                <ClipboardList className="w-4 h-4" /> Take the quiz free
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-3 border border-white/30 text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-white/5 transition-colors text-xs tracking-widest uppercase w-full sm:w-auto justify-center">
                Build your reptile plan <ArrowRight className="w-4 h-4" />
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