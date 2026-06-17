import React from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, AlertTriangle, FileText, MapPin, Heart, Package, Thermometer } from "lucide-react";

const CHECKLIST = [
  { icon: Thermometer, title: "Portable Heat Source", desc: "Reptiles are ectothermic — they cannot generate body heat. A chemical hand warmer, heat pack, or battery-powered heat pad is essential in any go-bag." },
  { icon: Package, title: "Escape-Proof Travel Container", desc: "A secure, ventilated plastic tub or specialty reptile travel container. Pillowcases work short-term for snakes but are not long-term safe." },
  { icon: Heart, title: "72-Hour Food & Hydration Plan", desc: "Most reptiles can fast for days, but hydration is critical. Include a spray bottle for humidity-dependent species like chameleons and crested geckos." },
  { icon: FileText, title: "Vet Records & Ownership Docs", desc: "Some reptiles require CITES permits or state ownership documentation. Keep copies in your go-bag — checkpoints after disasters may ask." },
  { icon: AlertTriangle, title: "Temperature Stress Signs", desc: "Hypothermia is the #1 killer of evacuated reptiles. Know the minimum temperature for your species and monitor closely in any shelter situation." },
  { icon: MapPin, title: "Reptile-Friendly Boarding or Vet", desc: "Almost no public shelters accept reptiles. A reptile vet or specialty boarding facility willing to take emergencies must be identified in advance." },
];

export default function Reptile() {
  React.useEffect(() => {
    document.title = "Reptile Emergency Preparedness — Evacuating with Snakes, Lizards & Turtles | RallyPack";
    // SEO meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = "Emergency preparedness guide for reptile owners. Learn how to evacuate with your snake, lizard, turtle, gecko, bearded dragon, or tortoise during a wildfire, hurricane, or flood. Free planning tools from RallyPack.";
    let keywords = document.querySelector('meta[name="keywords"]');
    if (!keywords) { keywords = document.createElement('meta'); keywords.name = "keywords"; document.head.appendChild(keywords); }
    keywords.content = "reptile emergency preparedness, evacuating with reptiles, snake evacuation plan, lizard disaster kit, turtle emergency plan, gecko evacuation, bearded dragon emergency, tortoise disaster preparedness, reptile go bag, reptile evacuation checklist, cold blooded pet emergency plan, exotic pet disaster preparedness";
    return () => {};
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">

      {/* Hero */}
      <section className="relative h-[80vh] min-h-[560px] flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1591389703635-e15a07b842d7?w=1800&q=85')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 md:pb-28">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-white/60 mb-5">Reptile Emergency Preparedness · RallyPack</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-none text-white mb-6 max-w-3xl">
            Cold-blooded<br />pets need a<br />warmer plan.
          </h1>
          <p className="font-sans text-base md:text-lg text-white/75 max-w-md mb-10 leading-relaxed">
            Snakes, lizards, turtles, and geckos can't survive temperature swings that mammals shrug off. Most evacuation shelters won't take them. Most owners have no plan. RallyPack helps you change that before the disaster arrives.
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
            { n: "9M+", unit: "", label: "Reptiles kept as pets in the US — including snakes, lizards, turtles, geckos, and tortoises" },
            { n: "60°F", unit: "", label: "The temperature below which many tropical reptiles begin to experience life-threatening cold stress" },
            { n: "~0%", unit: "", label: "Of public emergency shelters that can safely accommodate reptiles — owners are on their own" },
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

      {/* Species callout */}
      <section className="bg-[#D64A2E] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-6">Every species has different needs.</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm font-sans text-white/90">
            {[
              { sp: "Ball Pythons & Boa Constrictors", tip: "Maintain 75–80°F minimum. Use insulated bags with hand warmers during evacuation." },
              { sp: "Bearded Dragons", tip: "Require UVB and basking spots at 95–110°F. Battery-powered UVB sources exist for emergencies." },
              { sp: "Leopard & Crested Geckos", tip: "Lower temperature needs than many reptiles — still cold-sensitive below 65°F. Humidity critical for cresteds." },
              { sp: "Tortoises & Box Turtles", tip: "Many can tolerate cooler temps short-term, but dehydration is the primary risk. Always provide water access." },
              { sp: "Iguanas & Monitor Lizards", tip: "Large bodied but highly temperature-sensitive. Transport in well-insulated enclosures with heat packs." },
              { sp: "Chameleons", tip: "The most fragile of common pet reptiles. Stress alone can be fatal. Dark, ventilated travel container is essential." },
            ].map(({ sp, tip }) => (
              <div key={sp} className="bg-white/10 rounded p-4">
                <p className="font-semibold text-white mb-1">{sp}</p>
                <p className="text-white/70 text-xs leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial */}
      <section className="relative h-[50vh] min-h-[340px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=1600&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1A]/85 to-transparent" />
        <div className="relative h-full flex items-center max-w-6xl mx-auto px-6">
          <div className="max-w-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-sans mb-4">RallyPack for reptile owners</p>
            <p className="font-serif text-3xl text-white font-bold leading-tight mb-4">
              Vet records. Species temperature ranges. Emergency boarding. Offline when it matters most.
            </p>
            <p className="text-sm text-white/60 font-sans leading-relaxed">
              Log your reptile's species-specific temperature requirements, vet contact, ownership documents, and feeding schedule — then access everything offline when the power goes out.
            </p>
          </div>
        </div>
      </section>

      {/* SEO keywords section — visible, useful content */}
      <section className="py-16 max-w-6xl mx-auto px-6 border-t border-[#D8D2C6]">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Common questions & scenarios</p>
        <h2 className="font-serif text-3xl font-bold text-[#1C1C1A] mb-8">What reptile owners search for in an emergency</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-sans text-[#8A8577] leading-relaxed">
          <div>
            <h3 className="font-semibold text-[#1C1C1A] mb-2">Evacuating with snakes</h3>
            <p>Ball pythons, corn snakes, king snakes, and boa constrictors need insulated transport and maintained heat. Use a pillowcase inside an insulated tub for short-term moves, with hand warmers (never in direct contact) to maintain warmth above 75°F.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#1C1C1A] mb-2">Emergency plan for lizards</h3>
            <p>Bearded dragons, blue-tongue skinks, uromastyx, and monitor lizards require regulated heat. During wildfire or hurricane evacuations, a battery backup for heat mats or chemical heat packs can bridge the gap until you reach a safe destination.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#1C1C1A] mb-2">Evacuating with turtles and tortoises</h3>
            <p>Box turtles, Russian tortoises, sulcata tortoises, and red-eared sliders can tolerate brief temperature dips but need water access to avoid dehydration. Secure their transport container — stressed turtles can push lids open.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#1C1C1A] mb-2">Reptile disaster kit checklist</h3>
            <p>Every reptile owner's go-bag should include: portable heat source, species-appropriate container, spray bottle, 72-hour food supply, vet records, ownership documentation, and a list of emergency reptile vets along your evacuation route.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[#1C1C1A]">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1591389703635-e15a07b842d7?w=1600&q=80')" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-6">Build your plan before the emergency</p>
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-white leading-none mb-8">
            What happens to your reptile<br />
            <em className="not-italic text-[#D64A2E]">if the power goes out tonight?</em>
          </h2>
          <p className="text-base font-sans text-white/55 max-w-md mx-auto mb-12 leading-relaxed">
            Take the free readiness quiz or create your RallyPack account to build a complete emergency plan for your reptile today.
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