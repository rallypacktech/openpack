import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Shield, Package, AlertTriangle, Heart, MapPin, CheckCircle, ClipboardList, ArrowRight, Github, ExternalLink, Wind, Flame, Droplets, Zap } from "lucide-react";
import AdSlot from "../components/AdSlot";
import ResourcesSection from "../components/ResourcesSection";

const STATS = [
  { number: "72", unit: "hours", label: "Before federal aid typically reaches communities after a major disaster" },
  { number: "60%", unit: "", label: "of Americans lack emergency supplies for even 3 days" },
  { number: "$1B+", unit: "", label: "in unclaimed FEMA disaster assistance goes unused each year" },
];

const SCENARIOS = [
  { icon: Wind, label: "Hurricane", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Flame, label: "Wildfire", color: "text-orange-600", bg: "bg-orange-50" },
  { icon: Droplets, label: "Flood", color: "text-cyan-600", bg: "bg-cyan-50" },
  { icon: Zap, label: "Power Outage", color: "text-yellow-600", bg: "bg-yellow-50" },
  { icon: AlertTriangle, label: "Earthquake", color: "text-red-600", bg: "bg-red-50" },
  { icon: Shield, label: "Civil Emergency", color: "text-purple-600", bg: "bg-purple-50" },
];

export default function Home() {
  const [email, setEmail] = useState("");

  const handleSignUp = () => {
    base44.auth.redirectToLogin("/Dashboard");
  };

  return (
    <div className="min-h-screen bg-cream font-sans">

      {/* ── Top bar ── */}
      <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-xs font-sans tracking-wide">
        Open source & free — no credit card, no paywall on tools.{" "}
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80 transition-opacity inline-flex items-center gap-1">
          View on GitHub <Github className="w-3 h-3" />
        </a>
      </div>

      {/* ── Header ── */}
      <header className="bg-cream/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div>
            <span className="font-serif text-2xl font-bold text-foreground tracking-tight">RallyPack</span>
            <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground font-sans border border-border rounded px-1.5 py-0.5">Open Source</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-sans text-muted-foreground">
            <Link to={createPageUrl("ReadinessQuiz")} className="hover:text-foreground transition-colors">Readiness Quiz</Link>
            <Link to={createPageUrl("Resources")} className="hover:text-foreground transition-colors">Resources</Link>
            <Link to={createPageUrl("LearnMore")} className="hover:text-foreground transition-colors">Learn More</Link>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={handleSignUp} className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Sign in</button>
            <button onClick={handleSignUp} className="bg-primary text-primary-foreground text-sm font-sans px-5 py-2 rounded hover:bg-primary/90 transition-colors">
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-navy/70" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-28 md:py-40 text-white">
          <p className="text-xs uppercase tracking-widest font-sans text-primary/90 mb-4 font-semibold">Emergency Preparedness · Open Source</p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6 max-w-3xl">
            The first 72 hours<br />
            <em className="not-italic text-primary/90">are yours alone.</em>
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/80 max-w-xl mb-10 leading-relaxed">
            Before federal aid arrives, before the Red Cross sets up, before your county opens a shelter — your family is on its own. RallyPack helps you be ready for that window.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to={createPageUrl("ReadinessQuiz")}>
              <button className="inline-flex items-center gap-2 bg-primary text-white font-sans font-medium px-8 py-4 rounded hover:bg-primary/90 transition-colors text-base">
                <ClipboardList className="w-4 h-4" />
                Take the free readiness quiz
              </button>
            </Link>
            <button
              onClick={handleSignUp}
              className="inline-flex items-center gap-2 border border-white/40 text-white font-sans font-medium px-8 py-4 rounded hover:bg-white/10 transition-colors text-base"
            >
              Build your family plan <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-5 text-xs font-sans text-white/50">
            ✓ No account needed to take the quiz &nbsp;·&nbsp; ✓ Free forever &nbsp;·&nbsp; ✓ Open source on GitHub
          </p>
        </div>
      </section>

      {/* ── Leaderboard Ad ── */}
      <div className="bg-secondary/40 border-y border-border py-4 flex justify-center">
        <AdSlot size="leaderboard" label={true} />
      </div>

      {/* ── Stats Strip ── */}
      <section className="bg-navy text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x divide-white/10">
          {STATS.map((s) => (
            <div key={s.label} className="text-center md:px-8">
              <div className="font-serif text-5xl font-bold text-primary mb-1">
                {s.number}<span className="text-2xl">{s.unit}</span>
              </div>
              <p className="text-sm font-sans text-white/65 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Editorial Pull Quote ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <blockquote className="font-serif text-3xl md:text-4xl text-foreground font-semibold leading-tight italic mb-6">
          "A simple plan executed calmly beats a perfect plan that exists only in your head."
        </blockquote>
        <p className="text-sm font-sans text-muted-foreground">— Modeled on FEMA's Community Preparedness Doctrine and Red Cross Ready guidelines</p>
      </section>

      {/* ── Scenarios ── */}
      <section className="bg-secondary/50 border-y border-border py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold font-sans mb-2">Think through worst-case</p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground font-semibold">
              Which of these keeps you up at night?
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {SCENARIOS.map(({ icon: Icon, label, color, bg }) => (
              <Link key={label} to={createPageUrl("ReadinessQuiz")} className={`${bg} border border-border rounded p-5 flex items-center gap-3 hover:shadow-sm hover:border-primary/30 transition-all group`}>
                <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
                <span className="font-sans font-medium text-sm text-foreground group-hover:text-primary transition-colors">{label}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link to={createPageUrl("ReadinessQuiz")}>
              <button className="inline-flex items-center gap-2 border border-primary text-primary font-sans text-sm font-medium px-7 py-3 rounded hover:bg-primary hover:text-white transition-colors">
                Take the readiness quiz to find your gaps <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features + Side Ad ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold font-sans mb-2">What RallyPack does</p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground font-semibold mb-8">Built for the person<br />everyone turns to.</h2>
            <div className="space-y-6">
              {[
                { icon: Package, title: "Emergency Kit Tracker", desc: "Build and manage go-bags, car kits, and home supplies. Track expiration dates with smart reminders." },
                { icon: MapPin, title: "Meet-Up Planning", desc: "Define meeting spots for your household. Document them so anyone can follow the plan — even without you." },
                { icon: Heart, title: "Pet & Medical Records", desc: "Store microchip numbers, vet contacts, medication needs, and allergy info in one accessible place." },
                { icon: Shield, title: "Offline Access", desc: "Your plan, supplies, and emergency contacts work without internet. Critical when power and cell service go down." },
                { icon: CheckCircle, title: "FEMA-Aligned Checklists", desc: "Checklists built around FEMA's 72-hour preparedness guidelines, adapted for your region's specific risks." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-foreground mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-72 flex flex-col gap-6 items-center">
            <AdSlot size="rectangle" />
            <div className="border border-border rounded p-6 bg-card text-center w-full">
              <p className="text-xs uppercase tracking-widest text-primary font-sans font-semibold mb-3">Open Source</p>
              <p className="font-serif text-xl font-semibold text-foreground mb-3">Transparent by design.</p>
              <p className="text-xs text-muted-foreground font-sans mb-4 leading-relaxed">RallyPack's full codebase is available on GitHub. Audit it, fork it, contribute. Your family's safety tool should be trustworthy.</p>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-sans text-primary hover:underline">
                <Github className="w-3.5 h-3.5" /> View repository <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section className="bg-navy/5 border-y border-border py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-center gap-8 text-center sm:text-left">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-sans font-semibold mb-1">Guidelines from</p>
            <div className="flex flex-wrap items-center gap-4 text-sm font-sans text-foreground font-medium">
              <span>🏛️ FEMA Ready.gov</span>
              <span>🔴 American Red Cross</span>
              <span>🤝 Operation HOPE</span>
              <span>🏥 CDC Emergency</span>
            </div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-border" />
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-sans font-semibold mb-1">Privacy</p>
            <p className="text-sm font-sans text-foreground">Your data is never sold. AES-256 encrypted. GDPR & CCPA aligned.</p>
          </div>
        </div>
      </section>

      {/* ── Resources Section ── */}
      <ResourcesSection />

      {/* ── Mid-page Ad ── */}
      <div className="bg-secondary/30 border-y border-border py-6 flex justify-center">
        <AdSlot size="leaderboard" />
      </div>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-widest text-primary font-sans font-semibold mb-4">The next emergency won't wait</p>
        <h2 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          What would your family do<br />
          <em className="text-primary">today?</em>
        </h2>
        <p className="text-lg font-sans text-muted-foreground max-w-xl mx-auto mb-10">
          Take the free readiness quiz in under 3 minutes. No account needed. Get personalized gaps and a starting kit list — save your plan by creating a free account.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl("ReadinessQuiz")}>
            <button className="inline-flex items-center gap-2 bg-primary text-white font-sans font-medium px-10 py-4 rounded hover:bg-primary/90 transition-colors text-base w-full sm:w-auto justify-center">
              <ClipboardList className="w-4 h-4" /> Take the quiz free
            </button>
          </Link>
          <button onClick={handleSignUp} className="inline-flex items-center gap-2 border border-foreground/20 text-foreground font-sans font-medium px-10 py-4 rounded hover:bg-foreground/5 transition-colors text-base">
            Create a free account <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-5 text-xs font-sans text-muted-foreground">✓ Free forever &nbsp;·&nbsp; ✓ Open source &nbsp;·&nbsp; ✓ No credit card</p>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-navy text-white/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <span className="font-serif text-2xl font-bold text-white block mb-2">RallyPack</span>
              <p className="text-sm font-sans leading-relaxed text-white/60 max-w-xs">
                Free, open-source family emergency preparedness. Built around FEMA guidelines and inspired by the Red Cross and Operation HOPE.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-sans font-semibold text-white/40 mb-3">Tools</p>
              <div className="flex flex-col gap-2 text-sm font-sans">
                <Link to={createPageUrl("ReadinessQuiz")} className="hover:text-white transition-colors">Readiness Quiz</Link>
                <Link to={createPageUrl("Resources")} className="hover:text-white transition-colors">Resources</Link>
                <Link to={createPageUrl("Dashboard")} className="hover:text-white transition-colors">My Plan</Link>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-sans font-semibold text-white/40 mb-3">Legal</p>
              <div className="flex flex-col gap-2 text-sm font-sans">
                <Link to={createPageUrl("PrivacyPolicy")} className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link to={createPageUrl("TermsAndConditions")} className="hover:text-white transition-colors">Terms</Link>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  GitHub <Github className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-sans text-white/40">
            <span>© 2026 RallyPack. Open source under MIT License.</span>
            <span>In emergencies, always call 911 first.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}