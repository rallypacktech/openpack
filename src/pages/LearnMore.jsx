import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ClipboardList, ArrowRight, AlertTriangle, Users, Clock, MapPin, Home, Backpack, Mountain, Shield, DollarSign, CheckCircle } from "lucide-react";

export default function LearnMore() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        setIsLoggedIn(!!user);
      } catch (e) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/Dashboard");
    } else {
      base44.auth.redirectToLogin("/Dashboard");
    }
  };

  const stats = [
    { value: "60%", label: "Of Americans have no emergency plan", icon: AlertTriangle },
    { value: "40%", label: "Of families get separated during disasters", icon: Users },
    { value: "75%", label: "Don't know their local relief organizations", icon: MapPin },
    { value: "72hrs", label: "Before federal aid typically reaches a community", icon: Clock },
    { value: "1 in 5", label: "Families turned away from full shelters", icon: Home },
    { value: "28", label: "Billion-dollar disasters in the US (2023 record)", icon: AlertTriangle },
  ];

  const scenarios = [
    { title: "Shelter in Place", desc: "When disasters strike, you may need to stay home for days without power, water, or supplies. Being prepared means having the essentials on hand.", icon: Home, image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80", items: ["Water & food for 72+ hours", "First aid supplies", "Battery-powered radio", "Emergency lighting"] },
    { title: "Evacuation Ready", desc: "In emergencies like wildfires or floods, every second counts. A packed go-bag means you can leave immediately with everything critical.", icon: Backpack, image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80", items: ["Documents & medications", "Change of clothes", "Cash & phone charger", "Pet supplies"] },
    { title: "Outdoor Adventures", desc: "Whether it's a weekend camping trip or a day hike, being prepared for the unexpected enhances your experience and keeps you safe.", icon: Mountain, image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80", items: ["Navigation tools", "Weather protection", "Emergency shelter", "Extra food & water"] },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">

      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1800&q=85')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/75" />
        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 md:pb-28">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-6 h-6 text-white" />
            <p className="text-xs uppercase tracking-[0.25em] font-sans text-white/60">Why Preparedness Matters</p>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold leading-none text-white mb-6 max-w-3xl">
            200 million families<br />unprepared for disasters.
          </h1>
          <p className="font-sans text-base md:text-lg text-white/75 max-w-xl mb-10 leading-relaxed">
            During disasters, families are separated, communication fails, and relief resources are scattered — creating emotional distress, a $2B–$3.9B annual financial burden, and prolonged displacement for millions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/ReadinessQuiz">
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-sm tracking-widest uppercase">
                <ClipboardList className="w-4 h-4" /> Take the free quiz
              </button>
            </Link>
            <button onClick={handleGetStarted} className="inline-flex items-center gap-3 border border-white/50 text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-white/10 transition-colors text-sm tracking-widest uppercase">
              Start preparing <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 max-w-6xl mx-auto px-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3 text-center">The reality of being unprepared</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-4 text-center leading-tight">These numbers are families.</h2>
        <p className="text-center text-[#8A8577] mb-16 max-w-2xl mx-auto text-sm leading-relaxed">
          Statistics from FEMA, American Red Cross, and NOAA paint a clear picture of why preparation isn't optional — it's essential.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#D8D2C6]">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#F5F0E8] p-10 text-center">
              <stat.icon className="w-7 h-7 text-[#D64A2E] mx-auto mb-5" />
              <div className="font-serif text-5xl md:text-6xl font-bold text-[#1C1C1A] mb-3 leading-none">{stat.value}</div>
              <p className="text-sm text-[#8A8577] leading-snug max-w-[200px] mx-auto">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 bg-[#1C1C1A] text-white p-12 text-center">
          <DollarSign className="w-10 h-10 text-[#D64A2E] mx-auto mb-5" />
          <div className="font-serif text-5xl md:text-6xl font-bold text-[#D64A2E] mb-3 leading-none">$5K–$15K</div>
          <div className="font-sans font-semibold text-lg mb-3">Average family cost per disaster</div>
          <p className="text-sm text-white/55 max-w-xl mx-auto leading-relaxed">
            The financial impact of being unprepared extends far beyond immediate needs — lost wages, temporary housing, and replacing essential items add up quickly.
          </p>
        </div>
      </section>

      <section className="bg-[#1C1C1A] text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Be ready for any scenario</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">The right preparation brings peace of mind.</h2>
          <p className="text-white/55 max-w-2xl mb-16 text-sm leading-relaxed">
            Whether you're sheltering at home, evacuating in an emergency, or heading into the wilderness, the right preparation keeps necessities within reach.
          </p>
          <div className="space-y-8">
            {scenarios.map((scenario, i) => (
              <div key={i} className="grid md:grid-cols-2 gap-0 bg-white/5">
                <div className={`relative h-64 md:h-auto min-h-[280px] ${i % 2 === 0 ? 'order-1' : 'order-2 md:order-1'}`}>
                  <img src={scenario.image} alt={scenario.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className={`p-10 flex flex-col justify-center ${i % 2 === 0 ? 'order-2 md:order-2' : 'order-1 md:order-2'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 border border-[#D64A2E]/40 flex items-center justify-center">
                      <scenario.icon className="w-5 h-5 text-[#D64A2E]" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white">{scenario.title}</h3>
                  </div>
                  <p className="text-white/55 mb-6 leading-relaxed text-sm">{scenario.desc}</p>
                  <div className="space-y-2">
                    <p className="font-sans font-semibold text-white/80 text-xs uppercase tracking-widest mb-3">Essential items</p>
                    {scenario.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#D64A2E] flex-shrink-0" />
                        <span className="text-white/70 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#1C1C1A]">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80')" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-6">Don't wait for an emergency</p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-none mb-8">
            Join thousands of families<br />who took control of their safety.
          </h2>
          <p className="text-base font-sans text-white/55 max-w-md mx-auto mb-12 leading-relaxed">
            Start building your emergency plan today — it's free, private, and could save lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ReadinessQuiz">
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase w-full sm:w-auto justify-center">
                <ClipboardList className="w-4 h-4" /> Take the quiz free
              </button>
            </Link>
            <button onClick={handleGetStarted} className="inline-flex items-center gap-3 border border-white/30 text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-white/5 transition-colors text-xs tracking-widest uppercase w-full sm:w-auto justify-center">
              Create a free account <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-8 text-xs font-sans text-white/30 tracking-wide">✓ Free forever · ✓ No credit card · ✓ Open source</p>
        </div>
      </section>

      <footer className="bg-[#141412] text-white/50">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs font-sans text-white/25">
          <p>Sources: FEMA National Household Survey 2023, American Red Cross, NOAA 2023 Disasters Report</p>
        </div>
      </footer>
    </div>
  );
}