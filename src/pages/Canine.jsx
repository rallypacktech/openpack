import React from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, AlertTriangle, FileText, MapPin, Heart, Truck } from "lucide-react";

const CHECKLIST = [
  { icon: FileText, title: "Vaccination & Microchip Records", desc: "Many emergency shelters require proof of rabies vaccination. Keep a copy in your go-bag and a photo on your phone." },
  { icon: Heart, title: "72-Hour Food & Medication", desc: "Pre-portioned kibble, water, and any prescriptions in a waterproof bag. Include a collapsible bowl." },
  { icon: MapPin, title: "Pet-Friendly Shelter or Hotel", desc: "Most public emergency shelters don't accept pets. Identify two pet-friendly hotels along your evacuation routes now." },
  { icon: Truck, title: "Carrier or Leash Always Accessible", desc: "Your dog may panic in a disaster. A secure leash or crate prevents bolting — have it by the door, not in the garage." },
  { icon: FileText, title: "ID Tag & Recent Photo", desc: "An updated ID tag and a clear photo (stored in the cloud) is the fastest path to reunification if you're separated." },
  { icon: AlertTriangle, title: "Know Your Dog's Stress Signals", desc: "Disaster chaos affects animal behavior. Dogs that are calm at home may bolt, bite, or hide. Have a plan for that scenario." },
];

export default function Canine() {
  React.useEffect(() => {
    document.title = "Dog Emergency Preparedness — Evacuating with Your Dog | RallyPack";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = "Emergency preparedness guide for dog owners. Learn how to evacuate with your dog during a wildfire, hurricane, tornado, or flood. Pet go-bag checklist, pet-friendly shelters, and disaster planning tools from RallyPack.";
    let keywords = document.querySelector('meta[name="keywords"]');
    if (!keywords) { keywords = document.createElement('meta'); keywords.name = "keywords"; document.head.appendChild(keywords); }
    keywords.content = "dog emergency preparedness, evacuating with dogs, pet disaster plan, canine go bag, dog evacuation checklist, pet friendly shelter evacuation, dog natural disaster plan, dog wildfire evacuation, hurricane evacuation dogs, pet emergency kit dog, dog microchip disaster, how to evacuate with a dog, emergency plan for dog owners, disaster preparedness pets";
    return () => {};
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">

      {/* Hero */}
      <section className="relative h-[80vh] min-h-[560px] flex items-end">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1800&q=85')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 md:pb-28">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-white/60 mb-5">Dog Emergency Preparedness · RallyPack</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-none text-white mb-6 max-w-3xl">
            Your dog<br />goes where<br />you go.
          </h1>
          <p className="font-sans text-base md:text-lg text-white/75 max-w-md mb-10 leading-relaxed">
            Most emergency shelters don't accept dogs. Most evacuation plans don't account for them either. RallyPack helps you build a plan that keeps your whole family — leash and all — together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/ReadinessQuiz">
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-sm tracking-widest uppercase">
                <ClipboardList className="w-4 h-4" /> Take the readiness quiz
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-3 border border-white/50 text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-white/10 transition-colors text-sm tracking-widest uppercase">
                Build your dog's plan <ArrowRight className="w-4 h-4" />
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
            { n: "65M+", unit: "", label: "US households own a dog — but fewer than 1 in 3 have a pet-specific emergency plan" },
            { n: "30%", unit: "", label: "Of people who don't evacuate cite unwillingness to leave their pets behind as the reason" },
            { n: "500K+", unit: "", label: "Pets lost or separated from owners in US disasters annually, per ASPCA estimates" },
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
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">The dog emergency preparedness essentials</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-14 leading-tight max-w-xl">
          Six things every dog owner needs in place.
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
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1600&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1A]/80 to-transparent" />
        <div className="relative h-full flex items-center max-w-6xl mx-auto px-6">
          <div className="max-w-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-sans mb-4">What RallyPack tracks for your dog</p>
            <p className="font-serif text-3xl text-white font-bold leading-tight mb-4">
              Microchip. Vaccines. Medications. Feeding schedule. Offline, always.
            </p>
            <p className="text-sm text-white/60 font-sans leading-relaxed">
              When you're separated from your dog in a disaster, the people who find them need your information fast. RallyPack keeps it accessible even without internet.
            </p>
          </div>
        </div>
      </section>

      {/* SEO section */}
      <section className="py-16 max-w-6xl mx-auto px-6 border-t border-[#D8D2C6]">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Common questions & scenarios</p>
        <h2 className="font-serif text-3xl font-bold text-[#1C1C1A] mb-8">What dog owners search for in an emergency</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-sans text-[#8A8577] leading-relaxed">
          <div>
            <h3 className="font-semibold text-[#1C1C1A] mb-2">Dog go-bag checklist for disasters</h3>
            <p>Every dog emergency kit should include: 3-day food supply, bottled water, collapsible bowls, leash and collar, crate or carrier, poop bags, vaccination records, microchip info, current photo, medications, and a familiar blanket or toy to reduce stress.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#1C1C1A] mb-2">Evacuating with dogs during a wildfire</h3>
            <p>Keep your dog's crate accessible, not stored. During a wildfire evacuation, you may have minutes — not hours. Practice loading your dog quickly. Keep their records in your car or a go-bag by the door, not in a filing cabinet.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#1C1C1A] mb-2">Finding pet-friendly shelters and hotels</h3>
            <p>Most Red Cross shelters and public evacuation centers don't accept pets. Before a disaster, research pet-friendly hotels along your two planned evacuation routes. Apps like BringFido or GoPetFriendly can help — bookmark them now, not during the emergency.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#1C1C1A] mb-2">What to do if you're separated from your dog</h3>
            <p>A microchip and current ID tag are the fastest routes to reunification. Register your chip with a national database (Found Animals, HomeAgain) and keep your address current. File a report with local shelters immediately — don't wait.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[#1C1C1A]">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&q=80')" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-6">It takes 10 minutes — do it today</p>
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-white leading-none mb-8">
            Where would your dog go<br />
            <em className="not-italic text-[#D64A2E]">if you had to leave in an hour?</em>
          </h2>
          <p className="text-base font-sans text-white/55 max-w-md mx-auto mb-12 leading-relaxed">
            Take the free readiness quiz or create your RallyPack account to build a complete plan for your dog today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ReadinessQuiz">
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase w-full sm:w-auto justify-center">
                <ClipboardList className="w-4 h-4" /> Take the quiz free
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-3 border border-white/30 text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-white/5 transition-colors text-xs tracking-widest uppercase w-full sm:w-auto justify-center">
                Build your dog's plan <ArrowRight className="w-4 h-4" />
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