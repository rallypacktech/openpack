import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ClipboardList, ArrowRight, Heart, X, Github, AlertTriangle, Users, Clock, MapPin, Home as HomeIcon, Backpack, Mountain, Shield, DollarSign, CheckCircle, Flame, Wind, CloudRain, Zap } from "lucide-react";
import FooterContactForm from "../components/FooterContactForm";

export default function Home() {
  const { user, isLoadingAuth } = useAuth();
  const [supportBannerDismissed, setSupportBannerDismissed] = useState(false);
  const [homeRedirect, setHomeRedirect] = useState(null);
  const [donationProgress, setDonationProgress] = useState(null);

  useEffect(() => {
    setSupportBannerDismissed(sessionStorage.getItem("supportBannerDismissed") === "true");
    base44.functions.invoke("getDonationProgress", {}).then(res => {
      if (res.data) setDonationProgress(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isLoadingAuth || !user) return;
    (async () => {
      try {
        const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
        const profile = profiles[0];
        const defaultHome = profile?.default_home_page || "dashboard";
        if (profile?.onboarding_completed && (defaultHome === "offline" || defaultHome === "resources")) {
          setHomeRedirect(defaultHome);
        } else {
          setHomeRedirect("dashboard");
        }
      } catch {
        setHomeRedirect("dashboard");
      }
    })();
  }, [user, isLoadingAuth]);

  if (isLoadingAuth || (user && !homeRedirect)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" role="status" aria-label="Loading"></div>
      </div>
    );
  }

  if (homeRedirect) {
    const path = homeRedirect === "offline" ? "/Offline" : homeRedirect === "resources" ? "/Resources" : "/Dashboard";
    return <Navigate to={path} replace />;
  }

  const goalReached = donationProgress?.progress_pct >= 100;
  const showBanner = !goalReached && !supportBannerDismissed;

  const handleSignUp = () => base44.auth.redirectToLogin("/Dashboard");
  const dismissBanner = () => {
    sessionStorage.setItem("supportBannerDismissed", "true");
    setSupportBannerDismissed(true);
  };

  // Active seasons
  const currentMonth = new Date().getMonth() + 1;
  const SEASONS = [
    { key: "wildfire", label: "Wildfire Season", icon: Flame, color: "#D64A2E", path: "/wildfire", months: [5,6,7,8,9,10] },
    { key: "hurricane", label: "Hurricane Season", icon: Wind, color: "#7c3aed", path: "/hurricane", months: [6,7,8,9,10,11] },
    { key: "tornado", label: "Tornado Season", icon: Zap, color: "#d97706", path: "/tornado", months: [3,4,5,6,7] },
    { key: "flood", label: "Flood Season", icon: CloudRain, color: "#2563eb", path: "/flood", months: [4,5,6,7,8,9] },
  ];
  const activeSeasons = SEASONS.filter(s => s.months.includes(currentMonth));

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">

      {/* ── Support banner ── */}
      {showBanner && (
        <div className="bg-[#FFF8E7] border-b border-[#E8C84A]/40 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm font-sans text-[#1C1C1A]/80 flex-1 text-center">
            <Heart className="w-3.5 h-3.5 inline text-[#D64A2E] mr-1.5 -mt-0.5" />
            RallyPack is free for everyone.{" "}
            <Link to="/Donate" className="font-semibold text-[#D64A2E] underline underline-offset-2 hover:no-underline">
              Help us cover our 2026 operating costs
            </Link>
          </p>
          <button onClick={dismissBanner} className="text-[#1C1C1A]/30 hover:text-[#1C1C1A] transition-colors flex-shrink-0" aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="relative h-screen min-h-[640px] flex items-end">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1594156596782-656c93e4d504?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/80" />

        {/* Active season pills — overlaid on hero bottom */}
        {activeSeasons.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-16 pb-6 px-6">
            <div className="max-w-7xl mx-auto flex flex-wrap gap-2 mb-6">
              {activeSeasons.map(s => {
                const Icon = s.icon;
                return (
                  <Link key={s.key} to={s.path} className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm text-white px-3 py-1.5 text-xs font-sans font-medium hover:bg-white/20 transition-colors">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color }} />
                    {s.label} — Active Now
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="relative w-full max-w-7xl mx-auto px-6 pb-24 md:pb-32">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-white/60 mb-5">Emergency Preparedness · Free · Open Source</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-[96px] font-bold leading-none text-white mb-6 max-w-4xl">
            Ready<br />before it<br />matters.
          </h1>
          <p className="font-sans text-base md:text-lg text-white/75 max-w-md mb-10 leading-relaxed">
            The 72 hours after a major disaster, you're on your own. RallyPack helps everyday families prepare — so when it counts, you're not scrambling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to={createPageUrl("ReadinessQuiz")}>
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-sm tracking-widest uppercase">
                <ClipboardList className="w-4 h-4" /> Free readiness quiz
              </button>
            </Link>
            {!user && (
              <button onClick={handleSignUp} className="inline-flex items-center gap-3 border border-white/50 text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-white/10 transition-colors text-sm tracking-widest uppercase">
                Build your plan <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── "A Spark Can Change Everything" — problem statement ── */}
      <section className="bg-[#F0EBE0] border-b border-[#D8D2C6]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="px-8 md:px-16 py-16 md:py-24 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-4">The cost of not being ready</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-6 leading-tight">A spark can<br />change everything.</h2>
            <p className="text-sm text-[#1C1C1A]/65 leading-relaxed mb-8 max-w-lg">
              Families in disaster-prone regions lose billions annually because emergency alerts fail offline and exclude pets — forcing chaotic, last-minute evacuations with no plan.
            </p>
            <div className="space-y-3">
              {[
                { label: "Fire suppression alone", value: "$500–$5K per hectare" },
                { label: "Total economic losses", value: "$5K–$50K per hectare" },
                { label: "Wildland-urban interface fires", value: ">$100K per hectare" },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between border-b border-[#D8D2C6] pb-3">
                  <span className="text-sm text-[#1C1C1A]/60 font-sans">{row.label}</span>
                  <span className="text-sm font-semibold text-[#1C1C1A] font-sans">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[360px] md:min-h-0">
            <img src="https://images.unsplash.com/photo-1661177408809-4184b3b65f2c?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Wildfire approaching homes" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F0EBE0]/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Stats: These numbers are families ── */}
      <section className="bg-[#1C1C1A] text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3 text-center">The reality of being unprepared</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 text-center leading-tight">These numbers are families.</h2>
          <p className="text-center text-white/50 mb-12 max-w-2xl mx-auto text-sm leading-relaxed">
            Statistics from FEMA, American Red Cross, and NOAA paint a clear picture of why preparation isn't optional — it's essential.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 mb-0">
            {[
              { n: "60%", label: "Of Americans have no emergency plan", icon: AlertTriangle },
              { n: "40%", label: "Of families get separated during disasters", icon: Users },
              { n: "75%", label: "Don't know their local relief organizations", icon: MapPin },
              { n: "72hrs", label: "Before federal aid typically reaches a community", icon: Clock },
              { n: "1 in 5", label: "Families turned away from full shelters", icon: HomeIcon },
              { n: "28", label: "Billion-dollar disasters in the US (2023 record)", icon: AlertTriangle },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-[#1C1C1A] p-8 text-center">
                  <Icon className="w-6 h-6 text-[#D64A2E] mx-auto mb-4" />
                  <div className="font-serif text-4xl md:text-5xl font-bold text-white mb-2 leading-none">{s.n}</div>
                  <p className="text-xs text-white/50 leading-snug max-w-[180px] mx-auto">{s.label}</p>
                </div>
              );
            })}
          </div>
          {/* Cost callout bleeds into the next section */}
          <div className="bg-[#D64A2E] p-10 text-center">
            <div className="font-serif text-4xl md:text-5xl font-bold text-white mb-2 leading-none">$5K–$15K</div>
            <div className="font-sans font-semibold text-base mb-2 text-white/90">Average family cost per disaster</div>
            <p className="text-sm text-white/75 max-w-lg mx-auto leading-relaxed">
              Lost wages, temporary housing, and replacing essential items add up fast. Preparation costs a fraction of that.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works: Check. Prepare. Share. ── */}
      <section className="bg-[#1C1C1A] text-white py-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-4">Your readiness journey</p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Check.<br />Prepare.<br />Share.</h2>
              <p className="text-white/55 mb-10 text-sm leading-relaxed max-w-sm">From awareness to action — in three steps that take less than an afternoon.</p>
              <Link to={createPageUrl("ReadinessQuiz")}>
                <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase">
                  <ClipboardList className="w-4 h-4" /> Start with the quiz
                </button>
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { num: "01", title: "Check your risk", desc: "See real-time fire danger, drought conditions, and local restrictions for your exact location." },
                { num: "02", title: "Build your plan", desc: "Create a personalized checklist for your family, home, and animals — tailored to your specific risks." },
                { num: "03", title: "Share & rally", desc: "Share a prevention pledge or evacuation plan with neighbors, creating community accountability." },
              ].map(step => (
                <div key={step.num} className="flex gap-5 p-5 bg-white/5 border border-white/10">
                  <span className="font-serif text-3xl font-bold text-[#D64A2E] leading-none flex-shrink-0 mt-1">{step.num}</span>
                  <div>
                    <h3 className="font-sans font-semibold text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Every plan includes them: pets & animals ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="relative min-h-[440px]">
          <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80" alt="Family with dog during evacuation" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1C1C1A]/40" />
        </div>
        <div className="bg-[#F0EBE0] px-8 md:px-16 py-16 md:py-20 flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-4">Every family member</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1C1A] mb-4 leading-tight">Every evacuation plan includes them.</h2>
          <p className="text-sm text-[#1C1C1A]/60 leading-relaxed mb-8">
            Reducing animal surrender during disruption starts with including pets in the plan from day one. RallyPack makes pets and livestock first-class members of your household emergency plan.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {[
              { title: "Digital pet profiles", desc: "Vet records, photos, microchip IDs, behavioral notes." },
              { title: "Foster & reunification", desc: "Connect with temporary foster homes and track separated animals." },
              { title: "Species-specific go-bags", desc: "Carrier prep, medication lists, and transport routing." },
              { title: "Shelter & resource map", desc: "Pet-friendly shelters, emergency vets, large-animal sites." },
            ].map(f => (
              <div key={f.title} className="border-l-2 border-[#D64A2E] pl-3 py-1">
                <p className="font-sans font-semibold text-sm text-[#1C1C1A] mb-0.5">{f.title}</p>
                <p className="text-xs text-[#1C1C1A]/55 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="inline-block bg-[#2D4A2D] text-white text-xs font-sans font-semibold px-4 py-2 leading-relaxed">
            100,000 fewer animals entering shelters — because the plan already included them.
          </div>
        </div>
      </section>

      {/* ── Quiz CTA (urgent, full-bleed) ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="bg-[#D64A2E] text-white px-8 md:px-16 py-16 md:py-20 flex flex-col justify-center order-2 md:order-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-sans mb-4">3 minutes · free · no account</p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">Do it now.<br />Before you forget.</h2>
          <p className="text-sm text-white/75 font-sans leading-relaxed mb-8">
            The next disaster won't wait for you to be ready. Take 3 minutes right now to find your gaps — supplies, plans, documents — and get a clear score with specific fixes.
          </p>
          <Link to={createPageUrl("ReadinessQuiz")}>
            <button className="self-start inline-flex items-center gap-2 bg-white text-[#D64A2E] font-sans font-bold px-8 py-4 hover:bg-white/90 transition-colors text-sm tracking-widest uppercase">
              Start the quiz <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
        <div className="relative min-h-[380px] order-1 md:order-2">
          <img src="https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=1600&q=80" alt="Family emergency planning" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </section>

      {/* ── Sign-up CTA (reversed) ── */}
      {!user && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="relative min-h-[380px]">
            <img src="https://images.unsplash.com/photo-1661177408809-4184b3b65f2c?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Emergency planning app" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="bg-[#1C1C1A] text-white px-8 md:px-16 py-16 md:py-20 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-4">Free account</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">Track your go-bag.<br />Get alerts.</h2>
            <p className="text-sm text-white/60 font-sans leading-relaxed mb-8">
              Build a digital go-bag, track expiration dates, set family meeting points, and receive emergency alerts tailored to your location and the distances you choose.
            </p>
            <button onClick={handleSignUp} className="self-start inline-flex items-center gap-2 bg-[#D64A2E] text-white font-sans font-semibold px-7 py-3.5 hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase">
              Create a free account <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ── Preparedness scenarios ── */}
      <section className="bg-[#1C1C1A] text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Be ready for any scenario</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-16 leading-tight">The right plan brings peace of mind.</h2>
          <div className="space-y-0">
            {[
              { title: "Shelter in Place", desc: "When disasters strike, you may need to stay home for days without power, water, or supplies. Being prepared means having the essentials on hand.", icon: HomeIcon, image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80", items: ["Water & food for 72+ hours", "First aid supplies", "Battery-powered radio", "Emergency lighting"] },
              { title: "Evacuation Ready", desc: "In emergencies like wildfires or floods, every second counts. A packed go-bag means you can leave immediately with everything critical.", icon: Backpack, image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80", items: ["Documents & medications", "Change of clothes", "Cash & phone charger", "Pet supplies"] },
              { title: "Outdoor Adventures", desc: "Whether it's a weekend camping trip or a day hike, being prepared for the unexpected enhances your experience and keeps you safe.", icon: Mountain, image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80", items: ["Navigation tools", "Weather protection", "Emergency shelter", "Extra food & water"] },
            ].map((scenario, i) => (
              <div key={i} className={`grid md:grid-cols-2 gap-0 ${i > 0 ? 'border-t border-white/10' : ''}`}>
                <div className={`relative h-64 md:h-auto min-h-[300px] ${i % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                  <img src={scenario.image} alt={scenario.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[#1C1C1A]/30" />
                </div>
                <div className={`p-10 md:p-16 flex flex-col justify-center bg-white/5 ${i % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 border border-[#D64A2E]/40 flex items-center justify-center flex-shrink-0">
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

      {/* ── Donate CTA ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="bg-[#F5F0E8] px-8 md:px-16 py-16 md:py-20 flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-4">Support our mission</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1C1A] mb-4 leading-tight">Keep RallyPack free.</h2>
          <p className="text-sm text-[#1C1C1A]/60 font-sans leading-relaxed mb-6">
            No ads. No investors. No paywalled safety features. Your contribution covers the real cost of keeping this tool running for every family.
          </p>
          {donationProgress && (
            <div className="mb-6">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm font-sans text-[#1C1C1A]/60">{donationProgress.total_raised_display} raised</span>
                <span className="text-sm font-sans text-[#1C1C1A]/40">of {donationProgress.goal_display}</span>
              </div>
              <div className="w-full h-2 bg-[#D8D2C6] overflow-hidden">
                <div className="h-full bg-[#D64A2E] transition-all duration-500" style={{ width: `${donationProgress.progress_pct}%` }} />
              </div>
            </div>
          )}
          <Link to="/Donate">
            <button className="self-start inline-flex items-center gap-2 bg-[#D64A2E] text-white font-sans font-semibold px-7 py-3.5 hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase">
              <Heart className="w-4 h-4" /> Donate to operations
            </button>
          </Link>
        </div>
        <div className="relative min-h-[380px]">
          <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80" alt="Community resilience" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1C1C1A]/30" />
        </div>
      </section>

      {/* ── Sustainability ── */}
      <section className="py-10 bg-[#EDE7DC] border-y border-[#D8D2C6]">
        <div className="max-w-4xl mx-auto px-6 text-center sm:text-left sm:flex sm:items-center sm:gap-8">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-2">Built to be light</p>
            <p className="text-sm font-sans text-[#1C1C1A]/60 leading-relaxed">
              Lean infrastructure — no bloated scripts, no unnecessary data calls. We participate in the <a href="https://stripe.com/climate" target="_blank" rel="noopener noreferrer" className="text-[#D64A2E] underline underline-offset-2">Stripe Climate</a> program, directing a portion of every payment toward carbon removal.
            </p>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="py-10 border-b border-[#D8D2C6]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8A8577] font-sans flex-shrink-0">Built on guidance from</p>
          <div className="flex flex-wrap items-center gap-4 text-sm font-sans font-semibold text-[#1C1C1A]">
            {[
                { label: "FEMA Ready.gov", href: "https://www.ready.gov" },
                { label: "IFRC Volunteers", href: "https://www.ifrc.org/get-involved" },
                { label: "NOAA / NWS Safety", href: "https://www.weather.gov/safety" },
                { label: "Get Prepared (Canada)", href: "https://www.getprepared.gc.ca/index-en.aspx" },
                { label: "CDC Preparedness", href: "https://emergency.cdc.gov/preparedness/index.asp" },
                { label: "Best Friends Emergency Response", href: "https://bestfriends.org/network/issues/emergency-response" },
                { label: "ASPCA Disaster Prep", href: "https://www.aspca.org/pet-care/pet-disaster-preparedness" },
                { label: "NARS", href: "https://www.narescue.com/" },
                { label: "Oregon Humane Volunteering", href: "https://www.oregonhumane.org/get-involved/volunteer/" },
              ].map((org, i, arr) => (
              <React.Fragment key={org.label}>
                <a href={org.href} target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">{org.label}</a>
                {i < arr.length - 1 && <span className="text-[#D8D2C6]">·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden bg-[#1C1C1A]">
        <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80" alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-6">The next emergency won't wait</p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-none mb-8">
            Where would your<br />family meet<br />
            <em className="not-italic text-[#D64A2E]">if phones went down?</em>
          </h2>
          <p className="text-base font-sans text-white/55 max-w-md mx-auto mb-12 leading-relaxed">
            Take the free readiness quiz in under 3 minutes. No account needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("ReadinessQuiz")}>
              <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase w-full sm:w-auto justify-center">
                <ClipboardList className="w-4 h-4" /> Take the quiz free
              </button>
            </Link>
            {!user && (
              <button onClick={handleSignUp} className="inline-flex items-center gap-3 border border-white/30 text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-white/5 transition-colors text-xs tracking-widest uppercase">
                Create a free account <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="mt-8 text-xs font-sans text-white/30 tracking-wide">✓ Free forever · ✓ No credit card · ✓ Open source on GitHub</p>
        </div>
      </section>

      {/* ── Sticky quiz bar (mobile) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1C1C1A]/95 backdrop-blur-sm border-t border-[#D64A2E]/30 px-4 py-3 md:hidden">
        <Link to={createPageUrl("ReadinessQuiz")}>
          <button className="w-full inline-flex items-center justify-center gap-2 bg-[#D64A2E] text-white font-sans font-semibold px-5 py-3 rounded-none text-xs tracking-widest uppercase">
            <ClipboardList className="w-4 h-4" /> Take the free quiz
          </button>
        </Link>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-[#141412] text-white/50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">
            <div className="md:col-span-1">
              <span className="font-serif text-2xl font-bold text-white block mb-3">RallyPack</span>
              <p className="text-sm font-sans leading-relaxed text-white/40 max-w-xs">
                Free, open-source emergency planning for everyday families. Built around FEMA guidelines and the IFRC.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-white/25 mb-4">Climate</p>
              <div className="flex flex-col gap-3 text-sm font-sans">
                <Link to="/wildfire" className="hover:text-white transition-colors">Wildfire</Link>
                <Link to="/hurricane" className="hover:text-white transition-colors">Hurricane</Link>
                <Link to="/flood" className="hover:text-white transition-colors">Flood</Link>
                <Link to="/tornado" className="hover:text-white transition-colors">Tornado</Link>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-white/25 mb-4">By Species</p>
              <div className="flex flex-col gap-3 text-sm font-sans">
                <Link to="/equine" className="hover:text-white transition-colors">Equine</Link>
                <Link to="/canine" className="hover:text-white transition-colors">Canine</Link>
                <Link to="/feline" className="hover:text-white transition-colors">Feline</Link>
                <Link to="/avian" className="hover:text-white transition-colors">Avian</Link>
                <Link to="/reptile" className="hover:text-white transition-colors">Reptile</Link>
                <Link to="/livestock" className="hover:text-white transition-colors">Livestock</Link>
                <Link to="/infant" className="hover:text-white transition-colors">Infant</Link>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-white/25 mb-4">Company</p>
              <div className="flex flex-col gap-3 text-sm font-sans">
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
                <Link to={createPageUrl("ReadinessQuiz")} className="hover:text-white transition-colors">Readiness Quiz</Link>
                <Link to={createPageUrl("Resources")} className="hover:text-white transition-colors">Resources</Link>
                <Link to={createPageUrl("Dashboard")} className="hover:text-white transition-colors">My Plan</Link>
                <Link to="/Donate" className="hover:text-white transition-colors">Donate</Link>
              </div>
            </div>
          </div>

          {/* Legal row */}
          <div className="border-t border-white/10 pt-8 mb-8 flex flex-wrap gap-5 text-sm font-sans">
            <Link to={createPageUrl("PrivacyPolicy")} className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to={createPageUrl("TermsAndConditions")} className="hover:text-white transition-colors">Terms</Link>
            <Link to={createPageUrl("AffiliatePartnerPolicy")} className="hover:text-white transition-colors">Affiliate Policy</Link>
            <Link to="/Feedback" className="hover:text-white transition-colors">Feedback</Link>
          </div>

          {/* Contact form */}
          <div className="border-t border-white/10 pt-10 mb-8">
            <p className="text-[10px] uppercase tracking-[0.25em] font-sans text-white/25 mb-2">Contact Us</p>
            <p className="text-sm font-sans text-white/40 mb-5">Questions, feedback, or partnership inquiries?</p>
            <FooterContactForm />
          </div>

          {/* Support & Open source */}
          <div className="border-t border-white/10 pt-10 mb-8 flex flex-col sm:flex-row gap-8">
            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.25em] font-sans text-white/25 mb-2">Support RallyPack</p>
                <p className="text-sm font-sans text-white/50 leading-relaxed">No ads on your safety data. Help us keep it free.</p>
              </div>
              <Link to="/Donate" className="flex-shrink-0 inline-flex items-center gap-2 bg-[#D64A2E] text-white hover:bg-[#be3f25] transition-colors text-xs font-sans font-semibold tracking-widest uppercase px-5 py-3">
                <Heart className="w-4 h-4" /> Donate
              </Link>
            </div>
            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.25em] font-sans text-white/25 mb-2">Open Source</p>
                <p className="text-sm font-sans text-white/50 leading-relaxed">Audit it, fork it, contribute. Your safety tool should be transparent.</p>
              </div>
              <a href="https://github.com/rallypacktech/openpack" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 inline-flex items-center gap-2 border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-colors text-xs font-sans font-semibold tracking-widest uppercase px-5 py-3">
                <Github className="w-4 h-4" /> GitHub
              </a>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-sans text-white/25">
            <span>© 2026 RallyPack · MIT License · GDPR & CCPA Compliant</span>
            <span>In emergencies, always call 911 first.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}