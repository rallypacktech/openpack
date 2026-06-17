import React from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, AlertTriangle, FileText, Truck, MapPin, Heart, CheckCircle, Flame, Wind, Droplets } from "lucide-react";

const CHECKLIST = [
  { icon: FileText, title: "Coggins & Health Papers", desc: "Keep a current negative Coggins test and health certificate in a waterproof pouch in your trailer." },
  { icon: Truck, title: "Trailer & Tow Vehicle Ready", desc: "Fuel up when threats are forecast. Know your trailer's stall count and GVWR before you need them." },
  { icon: MapPin, title: "Two Evacuation Destinations", desc: "A fairgrounds north, a private barn south. Different directions in case one route is cut off." },
  { icon: Heart, title: "72-Hour Feed & Water", desc: "Hay, grain, and buckets for each horse. Many shelters don't supply feed — you're on your own." },
  { icon: FileText, title: "Photo ID & Microchip Record", desc: "Photos from both sides plus the microchip number stored offsite. Reunification after a disaster depends on it." },
  { icon: AlertTriangle, title: "Difficult Loaders", desc: "Practice loading before a disaster. Note any horse that needs extra time — panic and rushing cause injuries." },
];

const DISASTERS = [
  { icon: Flame, label: "Wildfire" },
  { icon: Wind, label: "Hurricane" },
  { icon: Droplets, label: "Flood" },
];

export default function Equine() {
  React.useEffect(() => {
    document.title = "Equine Emergency Preparedness | RallyPack";
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">

      {/* Hero */}
      <section className="relative h-[80vh] min-h-[560px] flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1800&q=85')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 md:pb-28">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-white/60 mb-5">Equine Emergency Preparedness · RallyPack</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-none text-white mb-6 max-w-3xl">
            Your horse<br />can't wait for<br />you to plan.
          </h1>
          <p className="font-sans text-base md:text-lg text-white/75 max-w-md mb-10 leading-relaxed">
            Evacuating with horses requires coordination that takes days to set up — but disasters give you hours. RallyPack helps you get your equine plan in place before it matters.
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
                Build your equine plan <ArrowRight className="w-4 h-4" />
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
            { n: "6–48", unit: "hrs", label: "Typical wildfire evacuation warning window — often less for horse properties in fire corridors" },
            { n: "1–4", unit: "loads", label: "Horses you can move per trip depending on trailer size — multiple trips mean lost time" },
            { n: "40%", unit: "", label: "Of horse owners have never pre-arranged an evacuation destination, per AVMA surveys" },
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
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">The six things that actually save horses</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-14 leading-tight max-w-xl">
          What your equine plan needs to cover.
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

      {/* Editorial image */}
      <section className="relative h-[55vh] min-h-[380px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://media.base44.com/images/public/69dc170f0871ac017d79debb/26c0efe73_generated_image.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1A]/80 to-transparent" />
        <div className="relative h-full flex items-center max-w-6xl mx-auto px-6">
          <div className="max-w-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-sans mb-4">What RallyPack tracks for you</p>
            <p className="font-serif text-3xl md:text-4xl text-white font-bold leading-tight mb-4">
              Coggins dates. Trailer logistics. Evacuation destinations. All in one place.
            </p>
            <p className="text-sm text-white/60 font-sans leading-relaxed">
              Log your horses, their microchip numbers, trailer stall count, and pre-authorized facilities — then access it offline when the internet goes down.
            </p>
          </div>
        </div>
      </section>

      {/* What disasters apply */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Equine threats by disaster type</p>
        <h2 className="font-serif text-4xl font-bold text-[#1C1C1A] mb-12 leading-tight">
          Horses face unique risks in every scenario.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#D8D2C6]">
          {[
            { icon: Flame, label: "Wildfire", desc: "Smoke inhalation, road closures, and terrified animals make fire the #1 cause of equine disaster deaths. Plan to leave early." },
            { icon: Wind, label: "Hurricane", desc: "Pasture flooding and wind damage to structures. Know your storm surge zone and have a destination 100+ miles away." },
            { icon: Droplets, label: "Flood", desc: "Horses standing in floodwater develop hoof and leg conditions within hours. Elevated pasture or trailer evacuation is essential." },
          ].map(({ icon: Icon, label, desc }) => (
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
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1600&q=80')" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-6">Start today — it takes 10 minutes</p>
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-white leading-none mb-8">
            Where would your horses go<br />
            <em className="not-italic text-[#D64A2E]">if you had 2 hours?</em>
          </h2>
          <p className="text-base font-sans text-white/55 max-w-md mx-auto mb-12 leading-relaxed">
            Take the free readiness quiz to assess your equine plan, or create your RallyPack account to start building one today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ReadinessQuiz">
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase w-full sm:w-auto justify-center">
                <ClipboardList className="w-4 h-4" /> Take the quiz free
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-3 border border-white/30 text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-white/5 transition-colors text-xs tracking-widest uppercase w-full sm:w-auto justify-center">
                Create your equine plan <ArrowRight className="w-4 h-4" />
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