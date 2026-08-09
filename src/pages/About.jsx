import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, Heart, Github, Shield, Globe, Users } from "lucide-react";
import { useHeroShot } from "@/hooks/useHeroShot";

export default function About() {
  useEffect(() => {
    document.title = "About RallyPack | Free, Open-Source Emergency Preparedness";
  }, []);

  const heroUrl = useHeroShot("about");

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">

      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${heroUrl}')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/75" />
        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 md:pb-28">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-white/60 mb-5">Our Story · RallyPack</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold leading-none text-white mb-6 max-w-3xl">
            Built so no family<br />faces disaster alone.
          </h1>
          <p className="font-sans text-base md:text-lg text-white/75 max-w-xl mb-10 leading-relaxed">
            RallyPack is a free, open-source emergency preparedness platform. We believe every family — regardless of income, language, or geography — deserves the tools to get ready before it matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/ReadinessQuiz">
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-sm tracking-widest uppercase">
                <ClipboardList className="w-4 h-4" /> Take the readiness quiz
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-3 border border-white/50 text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-white/10 transition-colors text-sm tracking-widest uppercase">
                Create a free account <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 max-w-4xl mx-auto px-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">The problem we're solving</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-8 leading-tight">
          200 million families are unprepared.
        </h2>
        <div className="space-y-6 text-base text-[#1C1C1A]/70 leading-relaxed font-sans">
          <p>
            When disaster strikes, the first 72 hours are on you. Yet <strong className="text-[#1C1C1A]">60% of Americans have no emergency plan</strong>, <strong className="text-[#1C1C1A]">40% of families get separated</strong> during evacuations, and <strong className="text-[#1C1C1A]">75% don't know their local relief organizations</strong>.
          </p>
          <p>
            The result is emotional distress, prolonged displacement, and a <strong className="text-[#1C1C1A]">$2B–$3.9B annual financial burden</strong> on families who weren't ready. The average unprepared family loses <strong className="text-[#1C1C1A]">$5,000–$15,000</strong> per disaster — in lost wages, temporary housing, and replacing essentials.
          </p>
          <p>
            Existing solutions are fragmented, paid, or region-locked. Free government resources exist but are hard to navigate. Paid apps lock safety-critical features behind subscriptions. Nothing brings go-bag tracking, family coordination, emergency alerts, and preparedness education into one free, accessible place.
          </p>
          <p>
            RallyPack changes that.
          </p>
        </div>
      </section>

      <section className="bg-[#1C1C1A] text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Our solution</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-14 leading-tight">One free platform. Every family covered.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
            {[
              { icon: ClipboardList, title: "Readiness Quiz", desc: "A free 3-minute assessment that scores your household's preparedness and identifies the specific gaps to fix — no account required." },
              { icon: Shield, title: "Digital Go-Bag & Cache Tracking", desc: "Track your emergency supplies, expiration dates, and cache locations. Get alerts when food or medication is about to expire." },
              { icon: Users, title: "Family Coordination", desc: "Set family meeting points, share emergency plans, and check in with 'I'm safe' status alerts when phones and internet go down." },
              { icon: Globe, title: "Multi-Region Alerts", desc: "Emergency alerts for wildfires, severe weather, and more — tailored to your location across the Americas, Europe, and Australia." },
              { icon: Heart, title: "Pet & Livestock Planning", desc: "Species-specific preparedness guides for equine, canine, feline, avian, reptile, livestock, and infants — because animals are family too." },
              { icon: ArrowRight, title: "Business & Organization Tools", desc: "Fire departments, shelters, and community orgs can send approved emergency alerts to their members through RallyPack." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#1C1C1A] p-8">
                <Icon className="w-6 h-6 text-[#D64A2E] mb-4" />
                <h3 className="font-sans font-semibold text-sm tracking-widest uppercase text-white mb-3">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 max-w-6xl mx-auto px-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3 text-center">Our impact</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-16 text-center leading-tight">Built lean. Reaching far.</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#D8D2C6]">
          {[
            { n: "100%", label: "Free for every family" },
            { n: "3 min", label: "To get your readiness score" },
            { n: "8", label: "Species-specific guides" },
            { n: "MIT", label: "Open-source license" },
          ].map((s) => (
            <div key={s.label} className="bg-[#F5F0E8] p-10 text-center">
              <div className="font-serif text-5xl md:text-6xl font-bold text-[#D64A2E] mb-3 leading-none">{s.n}</div>
              <p className="text-sm text-[#8A8577] leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#EDE7DC] border-y border-[#D8D2C6] py-24">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Meet the founder</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-12 leading-tight">
            Llora McGrath
          </h2>
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-shrink-0">
              <img
                src="https://media.base44.com/images/public/69dc170f0871ac017d79debb/aa879fed8_StaffLoraMcGrath_Peanut_0430_bySonyaSellers.jpg"
                alt="Llora McGrath, Founder of RallyPack"
                loading="lazy"
                className="w-48 h-48 object-cover bg-[#D8D2C6]"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="flex-1 space-y-5 text-base text-[#1C1C1A]/70 leading-relaxed font-sans">
              <p>
                Llora McGrath founded RallyPack after seeing firsthand how disasters disproportionately affect families who were never given the tools to prepare. Her mission is simple: make emergency preparedness accessible to everyone — free, private, and without paywalls on safety.
              </p>
              <p>
                With a background in community resilience and a belief that safety tools should be transparent and open-source, Llora built RallyPack around FEMA guidelines and international Red Cross frameworks. The platform serves families across the Americas, Eastern Europe, Australia, and beyond — guiding them through readiness quizzes, go-bag tracking, and species-specific evacuation planning for pets and livestock.
              </p>
              <p>
                "We don't sell safety. We give it away. Every family — regardless of income, language, or geography — deserves to be ready before it matters."
              </p>
              <p className="text-sm text-[#8A8577] italic">— Llora McGrath, Founder</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-4xl mx-auto px-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Our values</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-12 leading-tight">What we stand for.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {[
            { title: "Free, forever", desc: "No ads on your safety data. No paywalled preparedness features. No investors demanding monetization. RallyPack is free for every family, always." },
            { title: "Open source", desc: "Our full codebase is on GitHub. Audit it, fork it, contribute. Your family's safety tool should be transparent — trust is earned, not assumed." },
            { title: "Privacy first", desc: "GDPR and CCPA compliant. We don't sell your data, use it for AI training, or share it with third parties. Your emergency plan is yours." },
            { title: "Built light", desc: "Lean infrastructure, no bloated scripts, no unnecessary data calls. We participate in Stripe Climate — free safety tools shouldn't cost the planet." },
          ].map((v) => (
            <div key={v.title}>
              <h3 className="font-sans font-semibold text-sm tracking-widest uppercase text-[#1C1C1A] mb-2">{v.title}</h3>
              <p className="text-sm text-[#8A8577] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#1C1C1A]">
        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-6">Ready before it matters</p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-none mb-8">
            The next disaster<br />won't wait for you<br />
            <em className="not-italic text-[#D64A2E]">to get ready.</em>
          </h2>
          <p className="text-base font-sans text-white/55 max-w-md mx-auto mb-12 leading-relaxed">
            Take the free readiness quiz in under 3 minutes. No account needed.
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
          <div className="mt-12 flex justify-center">
            <a href="https://github.com/rallypacktech/openpack" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-sans tracking-widest uppercase">
              <Github className="w-4 h-4" /> View on GitHub
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-[#141412] text-white/50">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-sans text-white/25">
          <Link to="/" className="font-serif text-lg font-bold text-white/60 hover:text-white transition-colors">RallyPack</Link>
          <span>© 2026 RallyPack · MIT License · GDPR & CCPA Compliant</span>
          <Link to="/PrivacyPolicy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}