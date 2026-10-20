import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GENERAL_VOUCHER_CODE,
  GENERAL_VOUCHER_LABEL,
  GENERAL_VOUCHER_NOTE,
} from "@/lib/generalVoucher";
import { trackFunnel, FUNNEL } from "@/lib/funnel";

const QUESTIONS = [
  {
    id: "extinguishers",
    q: "Are your fire extinguishers serviced and tagged within the last 12 months?",
    fix: "Book a licensed extinguisher service and log the date.",
  },
  {
    id: "evacuation",
    q: "Do you have a written evacuation plan with routes and a muster point?",
    fix: "Document your routes, assembly points and floor wardens.",
  },
  {
    id: "aed",
    q: "Is there an AED on site with pads and batteries still in date?",
    fix: "Log your AED, its pads and its battery expiry.",
  },
  {
    id: "certifications",
    q: "Are your staff CPR, first aid and AED certifications current?",
    fix: "Track each staff certification and its renewal date.",
  },
  {
    id: "alarms",
    q: "Are smoke alarms, exit signs and emergency lighting tested on a schedule?",
    fix: "Set a repeating check interval for every device.",
  },
  {
    id: "records",
    q: "Could you produce inspection-ready records in under five minutes?",
    fix: "Keep every record in one place you can pull up on the spot.",
  },
];

const ANSWERS = [
  { value: "yes", label: "Yes", score: 1 },
  { value: "unsure", label: "Not sure", score: 0.5 },
  { value: "no", label: "No", score: 0 },
];

function bandFor(score) {
  if (score >= 85) {
    return {
      label: "Inspection-ready",
      tone: "text-green-700 bg-green-50 border-green-200",
      icon: CheckCircle2,
      summary:
        "Your fire and life-safety basics are in place. Keep the records current and you can hand an inspector everything on the spot.",
    };
  }
  if (score >= 50) {
    return {
      label: "Gaps that put you at risk",
      tone: "text-amber-700 bg-amber-50 border-amber-200",
      icon: AlertTriangle,
      summary:
        "Most of your programme is in place, but the gaps below are the ones inspectors and insurers notice first.",
    };
  }
  return {
    label: "Not inspection-ready",
    tone: "text-red-700 bg-red-50 border-red-200",
    icon: XCircle,
    summary:
      "Several core items are missing or undocumented. Each one is fixable — and most are quick wins.",
  };
}

export default function ComplianceCheckQuiz() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allAnswered) return;
    const total = QUESTIONS.reduce(
      (sum, q) => sum + ANSWERS.find((a) => a.value === answers[q.id]).score,
      0,
    );
    const score = Math.round((total / QUESTIONS.length) * 100);
    const band = bandFor(score);
    trackFunnel(FUNNEL.BUSINESS_QUIZ_COMPLETED, { score, band: band.label });
    setResult({ score, band });
  };

  if (result) {
    const BandIcon = result.band.icon;
    const gaps = QUESTIONS.filter((q) => answers[q.id] !== "yes");

    return (
      <div className="border border-border rounded-lg bg-white p-6 sm:p-8">
        <div className={`inline-flex items-center gap-2 border rounded px-3 py-1.5 text-xs font-sans font-semibold mb-5 ${result.band.tone}`}>
          <BandIcon className="w-4 h-4" aria-hidden="true" />
          {result.band.label}
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-serif text-5xl font-bold text-foreground">{result.score}%</span>
          <span className="text-sm font-sans text-muted-foreground">inspection-ready</span>
        </div>
        <p className="text-sm font-sans text-muted-foreground leading-relaxed mb-8">
          {result.band.summary}
        </p>

        {gaps.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground mb-3">
              What to fix first
            </h3>
            <ul className="space-y-3">
              {gaps.map((g) => (
                <li key={g.id} className="flex items-start gap-3 border-l-2 border-[#D64A2E] pl-4">
                  <div className="min-w-0">
                    <p className="text-sm font-sans font-medium text-foreground leading-snug">{g.q}</p>
                    <p className="text-xs font-sans text-muted-foreground mt-1">{g.fix}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-[#1C1C1A] text-white rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="w-4 h-4 text-[#D64A2E]" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-sans">
              {GENERAL_VOUCHER_LABEL}
            </span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed mb-5">
            Every gap above is a record you can track in RallyPack — kits, AEDs,
            certifications and inspection dates in one dashboard. {GENERAL_VOUCHER_NOTE} Use code{" "}
            <span className="font-semibold text-white">{GENERAL_VOUCHER_CODE}</span> at checkout.
          </p>
          <Link
            to="/BusinessOnboarding"
            className="inline-flex items-center justify-center gap-2 bg-[#D64A2E] text-white font-sans font-semibold text-xs tracking-widest uppercase px-6 py-4 hover:bg-[#be3f25] transition-colors"
          >
            Start the 7-day free trial <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <Button
          variant="outline"
          className="mt-5 text-sm"
          onClick={() => {
            setAnswers({});
            setResult(null);
          }}
        >
          Retake the check
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-lg bg-white p-6 sm:p-8">
      <div className="space-y-6">
        {QUESTIONS.map((q, i) => (
          <fieldset key={q.id}>
            <legend className="text-sm font-sans font-medium text-foreground leading-snug mb-3">
              <span className="text-muted-foreground mr-2">{i + 1}.</span>
              {q.q}
            </legend>
            <div className="flex flex-wrap gap-2">
              {ANSWERS.map((a) => {
                const selected = answers[q.id] === a.value;
                return (
                  <label
                    key={a.value}
                    className={`px-4 py-2 rounded-full text-xs font-sans font-semibold border cursor-pointer transition-colors ${
                      selected
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={a.value}
                      checked={selected}
                      onChange={() => setAnswers({ ...answers, [q.id]: a.value })}
                      className="sr-only"
                    />
                    {a.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <Button
        type="submit"
        disabled={!allAnswered}
        className="mt-8 w-full bg-[#D64A2E] hover:bg-[#be3f25] text-white font-semibold"
      >
        See my score
        <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
      </Button>
      <p className="text-xs font-sans text-muted-foreground text-center mt-3">
        Six questions · no account needed · nothing is stored
      </p>
    </form>
  );
}