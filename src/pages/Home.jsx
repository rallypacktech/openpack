import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Package, MapPin, Heart, Shield, CheckCircle, ClipboardList, ArrowRight, Github, Wind, Flame, Droplets, Zap, AlertTriangle, X } from "lucide-react";
import AdSlot from "../components/AdSlot";
import ResourcesSection from "../components/ResourcesSection";
import FooterContactForm from "../components/FooterContactForm";

const FEATURES = [
  { icon: Package, title: "Kit Tracker", desc: "Go-bags, car kits, home caches. Track what you have and when it expires." },
  { icon: MapPin, title: "Meeting Points", desc: "Pre-plan where your family rallies when phones go down." },
  { icon: Heart, title: "Pet & Medical", desc: "Microchip numbers, medications, allergies — one place, always accessible." },
  { icon: Shield, title: "Works Offline", desc: "Your plan survives when the grid doesn't." },
  { icon: CheckCircle, title: "FEMA-Aligned", desc: "Checklists built around 72-hour preparedness guidelines, adapted for your region." },
];

const SCENARIOS = [
  { icon: Wind, label: "Hurricane" },
  { icon: Flame, label: "Wildfire" },
  { icon: Droplets, label: "Flood" },
  { icon: Zap, label: "Power Outage" },
  { icon: AlertTriangle, label: "Earthquake" },
  { icon: Shield, label: "Civil Emergency" },
];

export default function Home() {
  const { user } = useAuth();
  const [supportBannerDismissed, setSupportBannerDismissed] = useState(false);

  useEffect(() => {
    setSupportBannerDismissed(sessionStorage.getItem("supportBannerDismissed") === "true");
  }, []);

  const handleSignUp = () => {
    base44.auth.redirectToLogin("/Dashboard");
  };

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  const dismissBanner = () => {
    sessionStorage.setItem("supportBannerDismissed", "true");
    setSupportBannerDismissed(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1C1C1A]">

      {/* ── Wikipedia-style support banner ── */}
      {!supportBannerDismissed && (
        <div className="bg-[#FFF8E7] border-b border-[#E8C84A]/40 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm font-sans text-[#1C1C1A]/80 flex-1 text-center">
            <Heart className="w-3.5 h-3.5 inline text-[#D64A2E] mr-1.5 -mt-0.5" />
            RallyPack is free for everyone. If it's helped your family prepare, please consider{" "}
            <Link to="/Donate" className="font-semibold text-[#D64A2E] underline underline-offset-2 hover:no-underline">
              making a small donation
            </Link>{" "}
            to keep it that way.
          </p>
          <button onClick={dismissBanner} className="text-[#1C1C1A]/30 hover:text-[#1C1C1A] transition-colors flex-shrink-0" aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Hero — full bleed ── */}
      <section className="relative h-screen min-h-[640px] flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1800&q=85')" }}
        />
        {/* gradient: dark at bottom, semi-dark at top for nav legibility */}
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
                <ClipboardList className="w-4 h-4" />
                Free readiness quiz
              </button>
            </Link>
            {!user && (
              <button
                onClick={handleSignUp}
                className="inline-flex items-center gap-3 border border-white/50 text-white font-sans font-semibold px-8 py-4 rounded-none hover:bg-white/10 transition-colors text-sm tracking-widest uppercase"
              >
                Build your plan <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="mt-6 text-xs font-sans text-white/40 tracking-wide">
            No account required for the quiz &nbsp;·&nbsp; Always free
          </p>
        </div>
      </section>

      {/* ── Ad strip ── */}
      <div className="bg-[#EDE8DF] border-y border-[#D8D2C6] py-4 flex justify-center">
        <AdSlot size="leaderboard" label={true} />
      </div>

      {/* ── Stats — raw numbers, no fluff ── */}
      <section className="bg-[#1C1C1A] text-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { n: "72", unit: "hrs", label: "Before federal aid typically reaches a community after disaster" },
            { n: "60%", unit: "", label: "Of Americans don't have emergency supplies for even 3 days" },
            { n: "$1B+", unit: "", label: "In FEMA disaster assistance goes unclaimed every year" },
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

      {/* ── Full-bleed editorial image with overlaid quote ── */}
      <section className="relative h-[70vh] min-h-[420px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=1600&q=80"
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1C1C1A]/60" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-6 font-sans">FEMA Whole Community Approach</p>
          <blockquote className="font-serif text-3xl md:text-5xl text-white font-bold leading-tight">
            "The most resilient communities aren't the ones with the most resources — they're the ones where neighbors look out for each other."
          </blockquote>
        </div>
      </section>

      {/* ── Disaster scenarios — clean grid, no color noise ── */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">What are you preparing for?</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-12 leading-tight">
          Pick your scenario.
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-[#D8D2C6]">
          {SCENARIOS.map(({ icon: Icon, label }) => (
            <Link
              key={label}
              to={createPageUrl("ReadinessQuiz")}
              className="bg-[#F5F0E8] hover:bg-[#1C1C1A] group p-8 flex flex-col gap-4 transition-colors duration-200"
            >
              <Icon className="w-6 h-6 text-[#D64A2E] group-hover:text-[#D64A2E]" />
              <span className="font-sans font-semibold text-sm tracking-widest uppercase text-[#1C1C1A] group-hover:text-white transition-colors">
                {label}
              </span>
              <ArrowRight className="w-4 h-4 text-[#D8D2C6] group-hover:text-white/50 transition-colors mt-auto" />
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to={createPageUrl("ReadinessQuiz")}>
            <button className="inline-flex items-center gap-2 border border-[#1C1C1A] text-[#1C1C1A] font-sans text-xs font-semibold tracking-widest uppercase px-8 py-3.5 hover:bg-[#1C1C1A] hover:text-white transition-colors">
              Take the readiness quiz <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── Features — two-column, editorial layout ── */}
      <section className="bg-[#1C1C1A] text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-4">What RallyPack gives you</p>
              <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-none mb-8">
                Built for<br />the person<br />everyone<br />turns to.
              </h2>
              <Link to={createPageUrl("ReadinessQuiz")}>
                <button className="inline-flex items-center gap-3 bg-[#D64A2E] text-white font-sans font-semibold px-7 py-3.5 rounded-none hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase">
                  Start the quiz <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="space-y-0 divide-y divide-white/10">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
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
        </div>
      </section>

      {/* ── Third full-bleed image — action shot ── */}
      <section className="relative h-[55vh] min-h-[380px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1591451204579-d1b6e3a72e7d?w=1600&q=80"
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1A]/80 to-transparent" />
        <div className="relative h-full flex items-center max-w-6xl mx-auto px-6">
          <div className="max-w-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-sans mb-4">Privacy first</p>
            <p className="font-serif text-3xl md:text-4xl text-white font-bold leading-tight mb-4">
              Your data is never sold. Ever.
            </p>
            <p className="text-sm text-white/60 font-sans leading-relaxed">
              AES-256 encrypted. GDPR & CCPA aligned. You own your data — and you can delete it anytime.
            </p>
          </div>
        </div>
      </section>

      {/* ── Guidelines / Trust ── */}
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
            <a href="https://dartcc.org/" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">DART Command Center</a>
            <span className="text-[#D8D2C6]">·</span>
            <a href="https://code3associates.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">Code 3 Associates</a>
            <span className="text-[#D8D2C6]">·</span>
            <a href="https://www.rei.com/learn/expert-advice/emergency-preparedness.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">REI Co-op</a>
            <span className="text-[#D8D2C6]">·</span>
            <a href="https://www.oregonhumane.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#D64A2E] transition-colors">Oregon Humane Society</a>
          </div>
        </div>
      </section>

      {/* ── Resources Section ── */}
      <ResourcesSection />

      {/* ── Sponsored referral banner ── */}
      <div className="bg-[#EDE8DF] border-y border-[#D8D2C6] py-6">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-[10px] uppercase tracking-widest text-[#8A8577] font-sans mb-1">Sponsored</p>
            <p className="font-sans text-sm text-[#1C1C1A] font-medium">
              Lost a pet? <span className="text-[#D64A2E] font-semibold">Crumb</span> helps you find them — GPS pet tracking that works.
            </p>
          </div>
          <a
            href="https://crumb.pet/refer/db715b10-2a09-4fab-b730-eb20c538abe9"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#1C1C1A] text-white font-sans font-semibold text-xs tracking-widest uppercase px-6 py-3 hover:bg-[#D64A2E] transition-colors"
          >
            Get Crumb <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden bg-[#1C1C1A]">
        <img
          src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80"
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
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
              <button
                onClick={handleSignUp}
                className="inline-flex items-center gap-3 border border-white/30 text-white font-sans font-semibold px-10 py-4 rounded-none hover:bg-white/5 transition-colors text-xs tracking-widest uppercase"
              >
                Create a free account <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="mt-8 text-xs font-sans text-white/30 tracking-wide">✓ Free forever &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Open source on GitHub</p>
        </div>
      </section>

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

          {/* Support section */}
          <div className="border-t border-white/10 pt-10 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.25em] font-sans text-white/25 mb-2">Support RallyPack</p>
                <p className="text-sm font-sans text-white/50 leading-relaxed">
                  No ads on your safety data. No investors. Just a tool built for families.{" "}
                  <span className="text-white/70">Help us cover the cost of keeping it free.</span>
                </p>
              </div>
              <Link
                to="/Donate"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-[#D64A2E] text-white hover:bg-[#be3f25] transition-colors text-xs font-sans font-semibold tracking-widest uppercase px-5 py-3"
              >
                <Heart className="w-4 h-4" /> Donate
              </Link>
            </div>
          </div>

          {/* Open Source section — moved here as requested */}
          <div className="border-t border-white/10 pt-10 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.25em] font-sans text-white/25 mb-2">Open Source</p>
                <p className="text-sm font-sans text-white/50 leading-relaxed">
                  RallyPack's full codebase is available on GitHub. Audit it, fork it, contribute. Your family's safety tool should be transparent.
                </p>
              </div>
              <a
                href="https://github.com/rallypacktech/openpack"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-2 border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-colors text-xs font-sans font-semibold tracking-widest uppercase px-5 py-3"
              >
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