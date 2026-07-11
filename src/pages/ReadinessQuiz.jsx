import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { ChevronRight, ChevronLeft, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import LoginWall from "../components/LoginWall";
import { detectBot, getStableBotId } from "@/lib/botDetection";
import AdSlot from "../components/AdSlot";
import ResourcesSection from "../components/ResourcesSection";

const questions = [
  {
    id: "region",
    question: "Where do you live?",
    subtext: "Your region shapes which disasters you're most at risk for, and which FEMA resources apply to you.",
    options: [
      { label: "Coastal / Hurricane Zone", value: "coastal" },
      { label: "Wildfire-Prone Region", value: "wildfire" },
      { label: "Tornado / Severe Storm Corridor", value: "tornado" },
      { label: "Earthquake Zone", value: "earthquake" },
      { label: "Flood Plain", value: "flood" },
      { label: "Mixed / Not Sure", value: "general" },
    ],
  },
  {
    id: "county_plan",
    question: "Do you know your county's emergency plan?",
    subtext: "Most counties have a published evacuation plan, shelter locations, and emergency management contact. Do you know yours?",
    options: [
      { label: "Yes — I know the shelter locations and evacuation routes", value: "yes" },
      { label: "I know one exists but haven't looked at it", value: "vague" },
      { label: "I didn't know counties had these", value: "no" },
    ],
  },
  {
    id: "experienced_disaster",
    question: "Have you ever been through a major emergency?",
    subtext: "A hurricane evacuation, wildfire, flood, ice storm, extended power outage — anything that disrupted normal life for days.",
    options: [
      { label: "Yes — more than once", value: "multiple" },
      { label: "Yes — once", value: "once" },
      { label: "No, but I know it's possible where I live", value: "at_risk" },
      { label: "No, and I don't feel at much risk", value: "low_risk" },
    ],
  },
  {
    id: "felt_prepared",
    question: "In that situation, how prepared was your household?",
    subtext: "Be honest — this is for your benefit, not a grade.",
    options: [
      { label: "Fully prepared — we had a plan and followed it", value: "prepared" },
      { label: "Somewhat — we managed but there were real gaps", value: "partial" },
      { label: "Not prepared — we figured it out as we went", value: "unprepared" },
      { label: "I haven't been in one yet", value: "na" },
    ],
  },
  {
    id: "meeting_spot",
    question: "Does your household have a clear meeting spot?",
    subtext: "Somewhere everyone knows to go if phones are down, roads are blocked, or you can't reach each other.",
    options: [
      { label: "Yes — everyone knows exactly where to go", value: "yes" },
      { label: "We've talked about it but it's not clearly defined", value: "vague" },
      { label: "No", value: "no" },
    ],
  },
  {
    id: "supplies",
    question: "How are your household's emergency supplies right now?",
    subtext: "FEMA recommends 72 hours minimum: water (1 gal/person/day), food, medications, flashlights, documents, cash.",
    options: [
      { label: "Well stocked — 72+ hours covered", value: "good" },
      { label: "Partial — some things, but real gaps", value: "partial" },
      { label: "Minimal or none", value: "none" },
    ],
  },
  {
    id: "plan_documented",
    question: "Could your family execute the plan without you leading it?",
    subtext: "If you were traveling and something happened at home — would they know what to do, where to go, who to call?",
    options: [
      { label: "Yes — it's written down and accessible to everyone", value: "yes" },
      { label: "It's mostly in my head — I'm the one who knows it", value: "in_my_head" },
      { label: "We don't have a real plan", value: "no" },
    ],
  },
  {
    id: "insurance",
    question: "Is your home or renter's insurance current and do you know what it covers?",
    subtext: "After a disaster, insurance is often the fastest path to recovery — but many people discover gaps too late.",
    options: [
      { label: "Yes — covered and I know exactly what's included", value: "yes" },
      { label: "I have insurance but I'm not sure what it covers", value: "unsure" },
      { label: "No insurance or it's lapsed", value: "no" },
    ],
  },
];

function calculateScore(answers) {
  let score = 0;
  const max = 26;

  if (answers.county_plan === "yes") score += 3;
  else if (answers.county_plan === "vague") score += 1;

  if (answers.experienced_disaster === "multiple" || answers.experienced_disaster === "once") score += 1;
  else if (answers.experienced_disaster === "at_risk") score += 1;

  if (answers.felt_prepared === "prepared") score += 4;
  else if (answers.felt_prepared === "partial") score += 2;
  else if (answers.felt_prepared === "na") score += 2;

  if (answers.meeting_spot === "yes") score += 4;
  else if (answers.meeting_spot === "vague") score += 2;

  if (answers.supplies === "good") score += 5;
  else if (answers.supplies === "partial") score += 2;

  if (answers.plan_documented === "yes") score += 6;
  else if (answers.plan_documented === "in_my_head") score += 2;

  if (answers.insurance === "yes") score += 3;
  else if (answers.insurance === "unsure") score += 1;

  return Math.round((score / max) * 100);
}

function getResult(score, answers) {
  const hadDisaster = answers.experienced_disaster === "multiple" || answers.experienced_disaster === "once";

  if (score >= 70) return {
    level: "A Solid Foundation",
    badge: "bg-blue-100 text-blue-800",
    headline: "You've built some groundwork. Now close the gaps before they matter.",
    body: hadDisaster
      ? "You've been through it before — you know firsthand how fast things change. The families who come through emergencies calmly aren't lucky; they closed their gaps before it got real."
      : "You're ahead of most families. But a plan that lives in one person's head — or that isn't documented — fails at exactly the wrong moment. A few focused steps change that.",
    urgency: "medium",
  };
  if (score >= 40) return {
    level: "Gaps That Put You at Risk",
    badge: "bg-amber-100 text-amber-800",
    headline: "Your household has real vulnerabilities. Now is the time.",
    body: "The first 72 hours after a disaster — before outside help fully ramps up, before FEMA arrives, before the Red Cross sets up shelters — that window is entirely yours. Right now, your family isn't ready for it.",
    urgency: "high",
  };
  return {
    level: "Not Ready",
    badge: "bg-red-100 text-red-800",
    headline: "If something happened today, your family would be improvising.",
    body: hadDisaster
      ? "You've felt this before — the chaos, the uncertainty, the wishing you'd done more. Don't face the next one the same way. The steps aren't complicated. They just need to happen."
      : "That's where most American families are. But disasters don't wait. A storm shifts track. Power drops. School closes early. The families who come through it are the ones who had a simple plan ready.",
    urgency: "critical",
  };
}

const REGION_RESOURCES = {
  coastal: { name: "Hurricane preparedness", url: "https://www.ready.gov/hurricanes", fema: "https://www.fema.gov/emergency-managers/risk-management/hurricanes" },
  wildfire: { name: "Wildfire preparedness", url: "https://www.ready.gov/wildfires", fema: "https://www.fema.gov/emergency-managers/risk-management/wildfires" },
  tornado: { name: "Tornado preparedness", url: "https://www.ready.gov/tornadoes", fema: "https://www.fema.gov/emergency-managers/risk-management/tornadoes" },
  earthquake: { name: "Earthquake preparedness", url: "https://www.ready.gov/earthquakes", fema: "https://www.fema.gov/emergency-managers/risk-management/earthquakes" },
  flood: { name: "Flood preparedness", url: "https://www.ready.gov/floods", fema: "https://www.fema.gov/flood-insurance" },
  general: { name: "General preparedness", url: "https://www.ready.gov/be-informed", fema: "https://www.fema.gov/emergency-managers/individuals-communities" },
};

function getSessionId() {
  const { isBot } = detectBot();
  if (isBot) {
    return getStableBotId();
  }
  let sid = localStorage.getItem("rp_quiz_session");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("rp_quiz_session", sid);
  }
  return sid;
}

function QuizResults({ score, answers, onRetake }) {
  const result = getResult(score, answers);
  const regionRes = REGION_RESOURCES[answers.region] || REGION_RESOURCES.general;
  const [isAuthed, setIsAuthed] = React.useState(null);

  React.useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthed).catch(() => setIsAuthed(false));
  }, []);

  // Save result on mount (once)
  React.useEffect(() => {
    const save = async () => {
      const sessionId = getSessionId();
      let userEmail = null;
      let isRegistered = false;
      try {
        const user = await base44.auth.me();
        userEmail = user?.email || null;
        isRegistered = !!user;
      } catch (_) {}

      // Check if we already saved for this session to avoid duplicates on re-render
      const savedKey = `rp_quiz_saved_${sessionId}`;
      if (sessionStorage.getItem(savedKey)) return;

      const { isBot, botName } = detectBot();
      try {
        const res = await base44.functions.invoke("saveQuizResult", {
          session_id: sessionId,
          user_email: userEmail,
          score,
          score_level: result.level,
          region: answers.region,
          county_plan: answers.county_plan,
          experienced_disaster: answers.experienced_disaster,
          felt_prepared: answers.felt_prepared,
          meeting_spot: answers.meeting_spot,
          supplies: answers.supplies,
          plan_documented: answers.plan_documented,
          insurance: answers.insurance,
          is_registered_user: isRegistered,
          is_bot: isBot,
          bot_name: botName,
        });
        if (res.data?.saved || res.data?.reason === "duplicate") {
          sessionStorage.setItem(savedKey, "1");
        }
      } catch (e) {
        console.error("Failed to save quiz result:", e);
      }
    };
    save();
  }, []);

  const urgencyBorder = {
    medium: "border-blue-200",
    high: "border-amber-200",
    critical: "border-red-200",
  }[result.urgency];

  const urgencyBg = {
    medium: "bg-blue-50",
    high: "bg-amber-50",
    critical: "bg-red-50",
  }[result.urgency];

  return (
    <div className="min-h-screen bg-cream font-sans">
      {/* Header */}
      <header className="bg-cream/95 border-b border-border py-4 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link to="/" className="font-serif text-xl font-bold text-foreground">RallyPack</Link>
          <p className="text-xs font-sans text-muted-foreground uppercase tracking-widest">Readiness Results</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Score Banner */}
        <div className={`border ${urgencyBorder} ${urgencyBg} rounded p-8 mb-8`}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="font-serif text-2xl font-bold text-foreground">{score}%</span>
            </div>
            <div>
              <span className={`text-xs font-sans font-semibold uppercase tracking-widest px-2 py-1 rounded-full ${result.badge}`}>
                {result.level}
              </span>
              <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mt-3 mb-3">{result.headline}</h1>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">{result.body}</p>
            </div>
          </div>
        </div>

        {/* Ad between score and recommendations */}
        <div className="mb-6 flex justify-center">
          <AdSlot size="banner" />
        </div>

        {/* Public: What to focus on - always visible */}
        <div className="bg-card border border-border rounded p-6 mb-6">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Based on your answers, focus here first:</h2>
          <div className="space-y-3">
            {answers.county_plan !== "yes" && (
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-sm font-sans text-muted-foreground">
                  <strong className="text-foreground">Learn your county's emergency plan.</strong> Your county has published evacuation routes, shelter locations, and emergency contacts. Most families never look at it until it's too late.{" "}
                  <a href="https://www.ready.gov/plan" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80 inline-flex items-center gap-0.5">
                    Find it on ready.gov <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            )}
            {answers.meeting_spot !== "yes" && (
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-sm font-sans text-muted-foreground">
                  <strong className="text-foreground">No meeting spot.</strong> When phones fail, a pre-agreed location is the only way families reunite. Define two: one near home, one outside your neighborhood.
                </p>
              </div>
            )}
            {(answers.supplies === "partial" || answers.supplies === "none") && (
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-sm font-sans text-muted-foreground">
                  <strong className="text-foreground">Supply gaps.</strong> FEMA recommends at least 72 hours of water (1 gallon per person/day), food, medications, and cash. Most families have less than 24 hours.{" "}
                  <a href="https://www.ready.gov/kit" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80 inline-flex items-center gap-0.5">
                    FEMA kit guide <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            )}
            {(answers.plan_documented === "in_my_head" || answers.plan_documented === "no") && (
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-sm font-sans text-muted-foreground">
                  <strong className="text-foreground">Plan exists only in your head.</strong> You're the operations lead — but what if you're not there? A written, shared plan means your family can act without you.
                </p>
              </div>
            )}
            {answers.insurance === "no" && (
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-sm font-sans text-muted-foreground">
                  <strong className="text-foreground">No insurance coverage.</strong> Operation HOPE's disaster recovery programs can help with financial recovery — but insurance is the fastest path.{" "}
                  <a href="https://operationhope.org" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80 inline-flex items-center gap-0.5">
                    Operation HOPE <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            )}
            {answers.meeting_spot === "yes" && answers.supplies === "good" && answers.plan_documented === "yes" && (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-sans text-muted-foreground">
                  You've covered the core basics. Keep your supplies current, review your plan annually, and make sure everyone in your household has practiced it.
                </p>
              </div>
            )}
          </div>

          {/* Region-specific resource */}
          {answers.region && (
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-2">Region-specific resource</p>
              <a
                href={regionRes.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-sans text-primary hover:opacity-80 transition-opacity"
              >
                🏛️ FEMA {regionRes.name} guide <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* CTA — login wall for guests, dashboard link for authed users */}
        <div className="mb-8">
          {isAuthed ? (
            <div className="bg-card border border-border rounded p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-serif text-lg font-semibold text-foreground">Results saved to your account.</p>
                <p className="text-sm text-muted-foreground font-sans mt-1">Set up your household profile, address, and emergency plan — it takes 2 minutes.</p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button onClick={onRetake} className="text-sm font-sans text-muted-foreground hover:text-foreground underline transition-colors">
                  Retake quiz
                </button>
                <Link to="/Dashboard" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-sans font-medium px-6 py-2.5 rounded hover:bg-primary/90 transition-colors text-sm">
                  Start Onboarding <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-widest text-primary font-sans font-semibold mb-1">Save your results & get your kit</p>
                <h2 className="font-serif text-2xl font-semibold text-foreground">Your personalized action plan is ready.</h2>
              </div>
              <LoginWall context="kit checklist & personalized recommendations" redirectTo="/Dashboard" />
            </>
          )}
        </div>

        {/* Public FEMA Resources teaser */}
        <div className="bg-navy/5 border border-border rounded p-6 mb-8">
          <p className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground mb-3">Free federal resources — no account needed</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "FEMA Disaster Assistance", url: "https://www.disasterassistance.gov", icon: "🏛️" },
              { label: "Red Cross Shelter Finder", url: "https://www.redcross.org/get-help/disaster-relief-and-recovery-services/find-an-open-shelter.html", icon: "🔴" },
              { label: "211 — Local Resources", url: "https://www.211.org", icon: "📞" },
              { label: "NOAA Weather Alerts", url: "https://www.weather.gov/alerts", icon: "⛈️" },
            ].map((r) => (
              <a
                key={r.label}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors py-1.5"
              >
                <span>{r.icon}</span>
                <span>{r.label}</span>
                <ExternalLink className="w-3 h-3 ml-auto flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="text-sm font-sans text-muted-foreground hover:text-foreground underline transition-colors">
            ← Back to RallyPack
          </Link>
        </div>
      </div>

      <ResourcesSection regionFilter={answers.region} />
    </div>
  );
}

export default function ReadinessQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [questions[currentQ].id]: value };
    setAnswers(newAnswers);

    if (
      questions[currentQ].id === "experienced_disaster" &&
      (value === "at_risk" || value === "low_risk")
    ) {
      const updated = { ...newAnswers, felt_prepared: "na" };
      setAnswers(updated);
      if (currentQ + 2 < questions.length) {
        setCurrentQ(currentQ + 2);
      } else {
        setShowResults(true);
      }
      return;
    }

    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentQ > 0) {
      const prevQ = currentQ - 1;
      if (questions[prevQ]?.id === "felt_prepared" && answers.felt_prepared === "na") {
        setCurrentQ(prevQ - 1);
      } else {
        setCurrentQ(prevQ);
      }
    }
  };

  if (showResults) {
    const score = calculateScore(answers);
    return <QuizResults score={score} answers={answers} onRetake={() => { setShowResults(false); setAnswers({}); setCurrentQ(0); }} />;
  }

  const q = questions[currentQ];
  const progress = Math.round((currentQ / questions.length) * 100);

  return (
    <div className="min-h-screen bg-cream font-sans flex flex-col">
      {/* Header */}
      <header className="bg-cream/95 border-b border-border py-4 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link to="/" className="font-serif text-xl font-bold text-foreground">RallyPack</Link>
          <p className="text-xs font-sans text-muted-foreground uppercase tracking-widest">Family Readiness Quiz</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-widest">
                Question {currentQ + 1} of {questions.length}
              </p>
              <p className="text-xs font-sans text-muted-foreground">{progress}% complete</p>
            </div>
            <div className="w-full bg-secondary rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-card border border-border rounded p-8 shadow-sm">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-2">{q.question}</h2>
            {q.subtext && (
              <p className="text-sm font-sans text-muted-foreground mb-7 leading-relaxed">{q.subtext}</p>
            )}
            <div className="space-y-3">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  className="w-full text-left px-5 py-4 rounded border border-border hover:border-primary hover:bg-primary/5 transition-all duration-150 text-foreground font-sans font-medium text-sm flex items-center justify-between group"
                >
                  <span>{opt.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Back */}
          {currentQ > 0 && (
            <button
              onClick={handleBack}
              className="mt-5 flex items-center gap-1 text-sm font-sans text-muted-foreground hover:text-foreground mx-auto transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}

          <p className="text-center text-xs font-sans text-muted-foreground mt-6">
            No account required · Free · Open source
          </p>
        </div>
      </div>
    </div>
  );
}