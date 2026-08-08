import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ClipboardList, ArrowRight, Heart, X, Github, AlertTriangle, Users, Clock, MapPin, Home as HomeIcon, Backpack, Mountain, Shield, DollarSign, CheckCircle, CloudRain, Wind, Zap, Flame } from "lucide-react";
import AudienceStories from "../components/home/AudienceStories";
import CurrentSeasons from "../components/home/CurrentSeasons";
import FeedCard from "../components/home/FeedCard";
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

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">

      {/* ── Support banner (hidden when annual goal reached) ── */}
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
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1619461129861-d0c1479c48b4?q=80&w=1376&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/75" />
        <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 md:pb-28">
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

      {/* ── Prominent quiz CTA strip ── */}
      <section className="bg-[#D64A2E] py-5 md:py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="font-sans text-sm md:text-base text-white font-medium">
            <ClipboardList className="w-4 h-4 inline mr-2 -mt-0.5" />
            Not sure where you stand? Take the <strong>free 3-minute readiness quiz</strong> — no account needed.
          </p>
          <Link to={createPageUrl("ReadinessQuiz")} className="flex-shrink-0">
            <button className="inline-flex items-center gap-2 bg-white text-[#D64A2E] font-sans font-semibold px-6 py-3 rounded-none hover:bg-[#FFF8E7] transition-colors text-xs tracking-widest uppercase whitespace-nowrap">
              Start the quiz <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── Current Seasonal Risks ── */}
      <CurrentSeasons />

      {/* ── Story circles: audience onboarding ── */}
      <AudienceStories />

      {/* ── Feed: Quiz CTA ── */}
      <FeedCard
        image="https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=1600&q=80"
        eyebrow="3 minutes"
        title="How ready are you, really?"
        description="Take the free readiness quiz. Answer a few questions about your household's supplies, plans, and documents. Get a clear score with specific gaps to fix."
        ctaLabel="Take the quiz"
        ctaLink={createPageUrl("ReadinessQuiz")}
      />

      {/* ── Feed: Sign up CTA ── */}
      <FeedCard
        image="https://images.unsplash.com/photo-1591451204579-d1b6e3a72e7d?w=1600&q=80"
        eyebrow="Free account"
        title="Track your go-bag. Get alerts."
        description="Build a digital go-bag, track expiration dates, set family meeting points, and receive emergency alerts tailored to your location and the distances you choose."
        ctaLabel="Create a free account"
        ctaAction={handleSignUp}
        reversed
      />

      {/* ── Feed: Donate CTA ── */}
      <FeedCard
        image="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80"
        eyebrow="Support our mission"
        title="Keep RallyPack free."
        description="No ads. No investors. No paywalled safety features. Your contribution covers the real cost of keeping this tool running for every family."
        ctaLabel="Donate to operations"
        ctaLink="/Donate"
      >
        {donationProgress && (
          <div className="mb-6">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm font-sans text-[#1C1C1A]/60">{donationProgress.total_raised_display} raised</span>
              <span className="text-sm font-sans text-[#1C1C1A]/40">of {donationProgress.goal_display}</span>
            </div>
            <div className="w-full h-2 bg-[#D8D2C6] rounded-full overflow-hidden">
              <div className="h-full bg-[#D64A2E] rounded-full transition-all duration-500" style={{ width: `${donationProgress.progress_pct}%` }} />
            </div>
          </div>
        )}
      </FeedCard>

      {/* ── Stats ── */}
      <section className="bg-[#1C1C1A] text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3 text-center">The reality of being unprepared</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 text-center leading-tight">These numbers are families.</h2>
          <p className="text-center text-white/50 mb-12 max-w-2xl mx-auto text-sm leading-relaxed">
            Statistics from FEMA, American Red Cross, and NOAA paint a clear picture of why preparation isn't optional — it's essential.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 mb-12">
            {[
              { n: "60%", unit: "", label: "Of Americans have no emergency plan", icon: AlertTriangle },
              { n: "40%", unit: "", label: "Of families get separated during disasters", icon: Users },
              { n: "75%", unit: "", label: "Don't know their local relief organizations", icon: MapPin },
              { n: "72hrs", unit: "", label: "Before federal aid typically reaches a community", icon: Clock },
              { n: "1 in 5", unit: "", label: "Families turned away from full shelters", icon: HomeIcon },
              { n: "28", unit: "", label: "Billion-dollar disasters in the US (2023 record)", icon: AlertTriangle },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-[#1C1C1A] p-8 text-center">
                  <Icon className="w-6 h-6 text-[#D64A2E] mx-auto mb-4" />
                  <div className="font-serif text-4xl md:text-5xl font-bold text-white mb-2 leading-none">{s.n}<span className="text-2xl">{s.unit}</span></div>
                  <p className="text-xs text-white/50 leading-snug max-w-[180px] mx-auto">{s.label}</p>
                </div>
              );
            })}
          </div>
          <div className="bg-white/5 p-10 text-center">
            <DollarSign className="w-8 h-8 text-[#D64A2E] mx-auto mb-4" />
            <div className="font-serif text-4xl md:text-5xl font-bold text-[#D64A2E] mb-2 leading-none">$5K–$15K</div>
            <div className="font-sans font-semibold text-base mb-2 text-white">Average family cost per disaster</div>
            <p className="text-sm text-white/50 max-w-lg mx-auto leading-relaxed">
              The financial impact of being unprepared extends far beyond immediate needs — lost wages, temporary housing, and replacing essential items add up quickly.
            </p>
          </div>
        </div>
      </section>

      {/* ── Preparedness Scenarios ── */}
      <section className="bg-[#1C1C1A] text-white py-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Be ready for any scenario</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">The right preparation brings peace of mind.</h2>
          <p className="text-white/55 max-w-2xl mb-16 text-sm leading-relaxed">
            Whether you're sheltering at home, evacuating in an emergency, or heading into the wilderness, the right preparation keeps necessities within reach.
          </p>
          <div className="space-y-8">
            {[
              { title: "Shelter in Place", desc: "When disasters strike, you may need to stay home for days without power, water, or supplies. Being prepared means having the essentials on hand.", icon: HomeIcon, image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80", items: ["Water & food for 72+ hours", "First aid supplies", "Battery-powered radio", "Emergency lighting"] },
              { title: "Evacuation Ready", desc: "In emergencies like wildfires or floods, every second counts. A packed go-bag means you can leave immediately with everything critical.", icon: Backpack, image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80", items: ["Documents & medications", "Change of clothes", "Cash & phone charger", "Pet supplies"] },
              { title: "Outdoor Adventures", desc: "Whether it's a weekend camping trip or a day hike, being prepared for the unexpected enhances your experience and keeps you safe.", icon: Mountain, image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80", items: ["Navigation tools", "Weather protection", "Emergency shelter", "Extra food & water"] },
            ].map((scenario, i) => (
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

      {/* ── Sustainability ── */}
      <section className="py-12 bg-[#EDE7DC] border-y border-[#D8D2C6]">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-2">Built to be light</p>
            <h3 className="font-serif text-xl font-semibold text-[#1C1C1A] mb-2">Minimal footprint. Maximum access.</h3>
            <p className="text-sm font-sans text-[#1C1C1A]/60 leading-relaxed">
              RallyPack runs on lean infrastructure — no bloated scripts, no unnecessary data calls, no energy-hungry AI on every page load.
              We participate in the <a href="https://stripe.com/climate" target="_blank" rel="noopener noreferrer" className="text-[#D64A2E] underline underline-offset-2">Stripe Climate</a> program, directing a portion of every payment toward carbon removal.
              Free safety tools shouldn't cost the planet.
            </p>
          </div>
        </div>
      </section>

      {/* ── Trust / Guidelines ── */}
      <section className="py-16 border-b border-[#D8D2C6]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8A8577] font-sans flex-shrink-0">Built on guidance from</p>
          <div className="flex flex-wrap items-center gap-6 text-sm font-sans font-semibold text-[#1C1C1A]">
            <a href="https://www.ready.gov" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">FEMA Ready.gov</a>
            <span className="text-[#D8D2C6]">·</span>
            <a href="https://www.ifrc.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">IFRC</a>
            <span className="text-[#D8D2C6]">·</span>
            <a href="https://www.weather.gov" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">NOAA / NWS</a>
            <span className="text-[#D8D2C6]">·</span>
            <a href="https://www.publicsafety.gc.ca/cnt/mrgnc-mngmnt/index-en.aspx" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">Public Safety Canada</a>
            <span className="text-[#D8D2C6]">·</span>
            <a href="https://operationhope.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">Operation HOPE</a>
            <span className="text-[#D8D2C6]">·</span>
            <a href="https://emergency.cdc.gov" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">CDC Emergency</a>
            <span className="text-[#D8D2C6]">·</span>
            <a href="https://bestfriends.org/network/issues/emergency-response" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">Best Friends Animal Society</a>
            <span className="text-[#D8D2C6]">·</span>
            <a href="https://www.sierraclub.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">Sierra Club</a>
            <span className="text-[#D8D2C6]">·</span>
            <a href="https://www.humanesociety.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">HSUS</a>
            <span className="text-[#D8D2C6]">·</span>
            <a href="https://www.aspca.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">ASPCA</a>
            <span className="text-[#D8D2C6]">·</span>
            <a href="https://redrover.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">RedRover</a>
            <span className="text-[#D8D2C6]">·</span>
            <a href="https://www.narescue.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">NARS</a>
            <span className="text-[#D8D2C6]">·</span>
            <a href="https://www.oregonhumane.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">Oregon Humane Society</a>
          </div>
        </div>
      </section>

      {/* ── Wildfire SEO section ── */}
      <section className="bg-[#EDE7DC] border-y border-[#D8D2C6] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Wildfire season is here</p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-6 leading-tight">
                In wildfire country,<br />you get hours — not days.
              </h2>
              <p className="text-sm text-[#1C1C1A]/60 leading-relaxed mb-8 max-w-lg">
                Whether you're in California, Oregon, Washington, Utah, Spain, France, Australia, or Eastern Europe, RallyPack's free wildfire evacuation checklist covers defensible space, go-bags, two-route planning, and emergency numbers for every region.
              </p>
              <Link to="/wildfire">
                <button className="inline-flex items-center gap-3 bg-[#1C1C1A] text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-[#2a2a25] transition-colors text-xs tracking-widest uppercase">
                  Wildfire preparedness guide <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1619461129861-d0c1479c48b4?q=80&w=1376&auto=format&fit=crop"
                alt="Wildfire evacuation preparedness"
                loading="lazy"
                className="w-full md:w-80 h-64 object-cover"
              />
            </div>
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
            Take the free readiness quiz in under 3 minutes. No account needed. Get a clear picture of where your household stands.
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

      {/* ── Sticky quiz bar ── */}
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
            <div className="md:col-span-2">
              <span className="font-serif text-2xl font-bold text-white block mb-3">RallyPack</span>
              <p className="text-sm font-sans leading-relaxed text-white/40 max-w-xs">
                Free, open-source emergency preparedness for everyday families. Built around FEMA guidelines and the IFRC.
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-white/25 mb-4">Tools</p>
              <div className="flex flex-col gap-3 text-sm font-sans">
                <Link to={createPageUrl("ReadinessQuiz")} className="hover:text-white transition-colors">Readiness Quiz</Link>
                <Link to="/wildfire" className="hover:text-white transition-colors">Wildfire Prep</Link>
                <Link to="/hurricane" className="hover:text-white transition-colors">Hurricane Prep</Link>
                <Link to="/flood" className="hover:text-white transition-colors">Flood Prep</Link>
                <Link to="/tornado" className="hover:text-white transition-colors">Tornado Prep</Link>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
                <Link to={createPageUrl("Resources")} className="hover:text-white transition-colors">Resources</Link>
                <Link to={createPageUrl("Dashboard")} className="hover:text-white transition-colors">My Plan</Link>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-white/25 mb-4">Legal</p>
              <div className="flex flex-col gap-3 text-sm font-sans">
                <Link to={createPageUrl("PrivacyPolicy")} className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link to={createPageUrl("TermsAndConditions")} className="hover:text-white transition-colors">Terms</Link>
                <Link to={createPageUrl("AffiliatePartnerPolicy")} className="hover:text-white transition-colors">Affiliate Policy</Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="border-t border-white/10 pt-10 mb-8">
            <p className="text-[10px] uppercase tracking-[0.25em] font-sans text-white/25 mb-2">Contact Us</p>
            <p className="text-sm font-sans text-white/40 mb-5">Questions, feedback, or partnership inquiries? We read everything.</p>
            <FooterContactForm />
          </div>

          {/* Support section — always visible, even when goal reached */}
          <div className="border-t border-white/10 pt-10 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.25em] font-sans text-white/25 mb-2">Support RallyPack</p>
                <p className="text-sm font-sans text-white/50 leading-relaxed">
                  No ads on your safety data. No investors. Just a tool built for families.{" "}
                  <span className="text-white/70">Help us cover the cost of keeping it free.</span>
                </p>
              </div>
              <Link to="/Donate" className="flex-shrink-0 inline-flex items-center gap-2 bg-[#D64A2E] text-white hover:bg-[#be3f25] transition-colors text-xs font-sans font-semibold tracking-widest uppercase px-5 py-3">
                <Heart className="w-4 h-4" /> Donate
              </Link>
            </div>
          </div>

          {/* Open Source */}
          <div className="border-t border-white/10 pt-10 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.25em] font-sans text-white/25 mb-2">Open Source</p>
                <p className="text-sm font-sans text-white/50 leading-relaxed">
                  RallyPack's full codebase is available on GitHub. Audit it, fork it, contribute. Your family's safety tool should be transparent.
                </p>
              </div>
              <a href="https://github.com/rallypacktech/openpack" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 inline-flex items-center gap-2 border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-colors text-xs font-sans font-semibold tracking-widest uppercase px-5 py-3">
                <Github className="w-4 h-4" /> View on GitHub
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