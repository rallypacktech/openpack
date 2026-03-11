import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { ChevronRight, ChevronLeft, AlertTriangle, CheckCircle, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const questions = [
  {
    id: "region",
    question: "Where do you live?",
    subtext: "This helps us understand the risks most relevant to your area.",
    options: [
      { label: "Coastal / Hurricane Zone", value: "coastal" },
      { label: "Wildfire-Prone Region", value: "wildfire" },
      { label: "Tornado / Severe Storm Corridor", value: "tornado" },
      { label: "Earthquake Zone", value: "earthquake" },
      { label: "Mixed / Not Sure", value: "general" },
    ],
  },
  {
    id: "experienced_disaster",
    question: "Have you ever been through a natural disaster or major emergency?",
    subtext: "A hurricane evacuation, wildfire, flood, ice storm, prolonged power outage—anything that disrupted your normal life.",
    options: [
      { label: "Yes — more than once", value: "multiple" },
      { label: "Yes — once", value: "once" },
      { label: "No, but I know it's possible where I live", value: "at_risk" },
      { label: "No, and I don't feel at much risk", value: "low_risk" },
    ],
  },
  {
    id: "felt_prepared",
    question: "In that situation, how prepared did your household feel?",
    subtext: "Be honest — there's no wrong answer here.",
    options: [
      { label: "Fully prepared — we had a plan and followed it", value: "prepared" },
      { label: "Somewhat — we managed but there were real gaps", value: "partial" },
      { label: "Not prepared at all — we were figuring it out as we went", value: "unprepared" },
      { label: "I haven't been in one yet", value: "na" },
    ],
  },
  {
    id: "meeting_spot",
    question: "Does your household have a clear meeting spot if you can't reach each other?",
    subtext: "Somewhere everyone knows to go if phones are down or roads are blocked.",
    options: [
      { label: "Yes — everyone knows exactly where to go", value: "yes" },
      { label: "We've talked about it, but it's not clearly defined", value: "vague" },
      { label: "No", value: "no" },
    ],
  },
  {
    id: "supplies",
    question: "How would you rate your household's emergency supplies right now?",
    subtext: "Think: water, food, medications, flashlights, documents.",
    options: [
      { label: "Well stocked — 72+ hours covered", value: "good" },
      { label: "Partial — some things, but real gaps", value: "partial" },
      { label: "Minimal or none", value: "none" },
    ],
  },
  {
    id: "plan_documented",
    question: "Could your household follow an emergency plan without you leading it?",
    subtext: "If you were traveling and something happened at home, would they know what to do?",
    options: [
      { label: "Yes — it's written down or saved somewhere accessible", value: "yes" },
      { label: "Mostly in my head — I'm the one who knows it", value: "in_my_head" },
      { label: "We don't have a real plan", value: "no" },
    ],
  },
];

function calculateScore(answers) {
  let score = 0;
  const max = 18;

  // Region doesn't affect score (just context)
  
  // Experienced disaster
  if (answers.experienced_disaster === "multiple") score += 1;
  else if (answers.experienced_disaster === "once") score += 1;
  else if (answers.experienced_disaster === "at_risk") score += 1;
  
  // Felt prepared
  if (answers.felt_prepared === "prepared") score += 4;
  else if (answers.felt_prepared === "partial") score += 2;
  else if (answers.felt_prepared === "na") score += 2; // neutral, no experience

  // Meeting spot
  if (answers.meeting_spot === "yes") score += 4;
  else if (answers.meeting_spot === "vague") score += 2;

  // Supplies
  if (answers.supplies === "good") score += 4;
  else if (answers.supplies === "partial") score += 2;

  // Plan documented
  if (answers.plan_documented === "yes") score += 5;
  else if (answers.plan_documented === "in_my_head") score += 2;

  const pct = Math.round((score / max) * 100);
  return pct;
}

function getResult(score, answers) {
  const hadDisaster = answers.experienced_disaster === "multiple" || answers.experienced_disaster === "once";
  const feltUnprepared = answers.felt_prepared === "unprepared" || answers.felt_prepared === "partial";

  if (score >= 70) {
    return {
      level: "A Good Start",
      color: "blue",
      headline: "You've laid some groundwork—but gaps still put your family at risk.",
      body: hadDisaster && feltUnprepared
        ? "You've been through it before and know the gaps firsthand. The next emergency won't announce itself. Now's the time to turn what's in your head into a plan your whole household can follow."
        : "You're ahead of most people. But emergency plans that live only in one person's head—or aren't tested—fail at exactly the wrong moment. A few focused steps now will make the difference.",
      urgency: "medium",
    };
  } else if (score >= 40) {
    return {
      level: "Some Gaps to Address",
      color: "orange",
      headline: "Your household has real vulnerabilities right now.",
      body: hadDisaster && feltUnprepared
        ? "You know from experience what it feels like to be underprepared. The first 72 hours after a disaster are the most chaotic—before outside help fully ramps up. That window is entirely on you and your family."
        : "The families who struggle most during emergencies aren't unlucky—they just didn't have a plan before things got real. Supplies, a meeting spot, and a documented plan aren't complicated. They just need to happen.",
      urgency: "high",
    };
  } else {
    return {
      level: "Not Ready",
      color: "red",
      headline: "If something happened today, your family would be improvising.",
      body: hadDisaster && feltUnprepared
        ? "You've felt this before—the chaos, the uncertainty, the wishing you'd done more. The first 72 hours after a disaster are the most critical window your household has. Don't face the next one the same way."
        : "That's not a criticism—it's where most families are. But disasters don't wait for the right time. A storm shifts track. Power drops. School closes early. The families who come through it calmly are the ones who had a simple plan ready.",
      urgency: "critical",
    };
  }
}

const urgencyColors = {
  medium: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-800", icon: "text-blue-600" },
  high: { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-800", icon: "text-orange-600" },
  critical: { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-800", icon: "text-red-600" },
};

export default function ReadinessQuiz() {
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [questions[currentQ].id]: value };
    setAnswers(newAnswers);

    // Skip "felt_prepared" if no disaster experience
    if (
      questions[currentQ].id === "experienced_disaster" &&
      (value === "at_risk" || value === "low_risk")
    ) {
      setAnswers({ ...newAnswers, felt_prepared: "na" });
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
      // If we skipped felt_prepared, go back two
      const prevQ = currentQ - 1;
      if (questions[prevQ]?.id === "felt_prepared" && answers.felt_prepared === "na") {
        setCurrentQ(prevQ - 1);
      } else {
        setCurrentQ(prevQ);
      }
    }
  };

  const handleSignUp = () => {
    base44.auth.redirectToLogin(createPageUrl("Dashboard"));
  };

  if (showResults) {
    const score = calculateScore(answers);
    const result = getResult(score, answers);
    const colors = urgencyColors[result.urgency];
    const regionLabels = {
      coastal: "Coastal / Hurricane Zone",
      wildfire: "Wildfire-Prone Region",
      tornado: "Tornado / Severe Storm Corridor",
      earthquake: "Earthquake Zone",
      general: "Mixed / General Region",
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-600">RallyPack</span>
            </div>
          </div>

          {/* Score Card */}
          <Card className={`${colors.border} ${colors.bg} mb-6`}>
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className={`w-8 h-8 mt-1 flex-shrink-0 ${colors.icon}`} />
                <div>
                  <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${colors.badge}`}>
                    {result.level}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-3 mb-3">{result.headline}</h2>
                  <p className="text-gray-700 leading-relaxed">{result.body}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gap Summary */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Based on your answers, here's what to focus on:</h3>
              <div className="space-y-3">
                {answers.meeting_spot !== "yes" && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      <strong>No clear meeting spot.</strong> When phones go down, a pre-agreed location is the only way families reunite. RallyPack helps you set and share it with everyone.
                    </p>
                  </div>
                )}
                {(answers.supplies === "partial" || answers.supplies === "none") && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      <strong>Incomplete supplies.</strong> The first 72 hours after a disaster are before outside help fully ramps up. RallyPack tracks what you have, what's expiring, and what's missing.
                    </p>
                  </div>
                )}
                {(answers.plan_documented === "in_my_head" || answers.plan_documented === "no") && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      <strong>Plan only lives in your head.</strong> You're the family operations lead—but what happens when you're not there? RallyPack makes your plan accessible to everyone, even offline.
                    </p>
                  </div>
                )}
                {answers.meeting_spot === "yes" && answers.supplies === "good" && answers.plan_documented === "yes" && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      You've covered the basics. RallyPack helps you keep everything current, get real-time alerts, and ensure your household is aligned—especially during fast-moving situations.
                    </p>
                  </div>
                )}
              </div>
              {answers.region && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Region: <span className="font-medium text-gray-700">{regionLabels[answers.region]}</span> — RallyPack tailors alerts and recommendations to your local disaster risks.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Build your plan before you need it.</h3>
            <p className="text-gray-600 mb-6">
              RallyPack is free to join. Set up your family's plan in under 5 minutes—supplies, meeting spots, alerts, and more.
            </p>
            <Button
              onClick={handleSignUp}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg px-10 py-6 w-full sm:w-auto"
            >
              Create Your Free Account
            </Button>
            <p className="text-sm text-gray-500 mt-3">✓ Free  ✓ No credit card  ✓ Your data stays private</p>
            <button
              onClick={() => navigate(createPageUrl("Home"))}
              className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline block mx-auto"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const totalVisible = questions.filter(q => !(q.id === "felt_prepared" && answers.felt_prepared === "na")).length;
  const progress = Math.round(((currentQ) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-600">RallyPack</span>
          </div>
          <p className="text-sm text-gray-500">Family Readiness Quiz</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Card */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-8">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
              Question {currentQ + 1} of {questions.length}
            </p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{q.question}</h2>
            {q.subtext && <p className="text-sm text-gray-500 mb-6">{q.subtext}</p>}
            <div className="space-y-3">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-150 text-gray-800 font-medium flex items-center justify-between group"
                >
                  <span>{opt.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Back button */}
        {currentQ > 0 && (
          <button
            onClick={handleBack}
            className="mt-4 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mx-auto"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}
      </div>
    </div>
  );
}