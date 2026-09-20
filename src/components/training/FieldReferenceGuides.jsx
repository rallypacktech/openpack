import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Download } from "lucide-react";

// Printable field reference cards for deployed volunteers. Each guide is a
// quick reminder of standard practice — not a substitute for the training the
// responding organization provides.
export const FIELD_GUIDES = [
  {
    id: "size_up",
    title: "Incident Size-Up — The First Five Minutes",
    icon: "🧭",
    source: "FEMA / NIMS",
    summary:
      "Size-up is the ongoing assessment you make from the moment you are dispatched. The first five minutes set the tone for the whole assignment.",
    sections: [
      {
        heading: "What to Establish",
        steps: [
          "What is actually happening — and what is likely to happen next.",
          "Where the problem is, and where it is heading.",
          "Who and what is at risk, and how many.",
          "What resources are on scene, en route, and still needed.",
          "Where you will set up, and which way you will leave if it goes wrong.",
        ],
      },
      {
        heading: "Before You Commit",
        steps: [
          "Do not enter a scene you cannot safely leave.",
          "Identify at least two ways out of your working area.",
          "Confirm your assignment with the person in charge — do not self-deploy.",
          "Establish and announce your location and status on the assigned channel.",
        ],
      },
      {
        heading: "Keep It Current",
        steps: [
          "Reassess continuously — a size-up is never finished.",
          "Report changes that affect the plan: weather shift, fire behaviour, structural collapse risk, rising water.",
          "Speak up early if the assignment no longer matches conditions on the ground.",
        ],
      },
    ],
    footer:
      "Source: FEMA / National Incident Management System (NIMS). Follow the direction of the incident commander at all times.",
  },
  {
    id: "start_triage",
    title: "START Triage — Mass Casualty Sorting",
    icon: "🩺",
    source: "FEMA / NIMS",
    summary:
      "START sorts casualties into four categories in about 30 seconds each, so the most treatable life threats get attention first.",
    sections: [
      {
        heading: "The Four Categories",
        steps: [
          "GREEN — Minor: walking wounded. Can walk on their own; minor injuries.",
          "YELLOW — Delayed: not walking, but breathing, has a pulse, and follows simple commands.",
          "RED — Immediate: not walking, and one of — breathing faster than 30 per minute, no radial pulse, or cannot follow simple commands.",
          "BLACK — Deceased / Expectant: not breathing after the airway is repositioned.",
        ],
      },
      {
        heading: "The Sequence",
        steps: [
          "Call out: everyone who can walk, move to that spot. Those who walk are GREEN.",
          "For everyone else, check breathing first — reposition the airway once if they are not breathing.",
          "Still not breathing after repositioning: BLACK. Move on.",
          "Breathing present: check respiratory rate, then pulse, then mental status.",
          "Sort, tag, and move to the next casualty. Treatment comes after the whole scene is sorted.",
        ],
      },
      {
        heading: "In Practice",
        steps: [
          "Triage is about doing the greatest good for the greatest number — not about who is loudest.",
          "Re-triage as resources arrive; a YELLOW can become RED.",
          "Announce your casualty count and categories to the person in charge as soon as you have them.",
          "Wear gloves and eye protection throughout.",
        ],
      },
    ],
    footer:
      "Source: FEMA / NIMS START triage. This is a sorting aid only. Treat within your training and scope — this is not a substitute for certification.",
  },
  {
    id: "radio",
    title: "Radio Discipline & Clear Text",
    icon: "📻",
    source: "FEMA / NIMS ICS",
    summary:
      "The radio channel is shared and finite. Clear, short, plain-language transmissions keep everyone safe.",
    sections: [
      {
        heading: "Speak Plainly",
        steps: [
          "Use clear text — no ten-codes, no agency slang, no abbreviations only your team understands.",
          "Say what you mean in ordinary words. Responders from other agencies must understand you first time.",
          "Use agreed common phrases: \"Say again\", \"Stand by\", \"Clear\", \"Copy\".",
        ],
      },
      {
        heading: "Transmit Correctly",
        steps: [
          "Identify yourself and who you are calling before the message.",
          "Listen before you transmit — never talk over another unit.",
          "Keep it brief. If it needs a conversation, move to a working channel.",
          "Hold the microphone correctly and speak at a steady pace.",
        ],
      },
      {
        heading: "Prioritise",
        steps: [
          "Emergency traffic first — say \"Emergency traffic\" and the channel clears for you.",
          "Report safety-critical changes immediately: fire behaviour, structural collapse risk, rising water, a missing responder.",
          "Log your check-in and check-out with the person tracking resources.",
        ],
      },
    ],
    footer:
      "Source: FEMA / NIMS Incident Command System. Use the communications plan issued for your assignment.",
  },
  {
    id: "heat_cold",
    title: "Heat & Cold Stress in the Field",
    icon: "🌡️",
    source: "OSHA / NIOSH",
    summary:
      "Deployment work is heavy, long and often in extreme weather. Heat and cold illness build quietly — watch your team, not just yourself.",
    sections: [
      {
        heading: "Heat — Watch the Ladder",
        steps: [
          "Heat cramps: painful muscle spasms. Rest, cool down, replace fluids and electrolytes.",
          "Heat exhaustion: heavy sweating, weakness, dizziness, nausea, headache. Move to shade, cool actively, hydrate.",
          "Heat stroke: hot skin, confusion, slurred speech, collapse — this is a medical emergency. Call for help and cool aggressively while waiting.",
          "Work in cycles with rest in shade, and drink water regularly rather than waiting for thirst.",
        ],
      },
      {
        heading: "Cold — Watch the Ladder",
        steps: [
          "Hypothermia: shivering, confusion, slurred speech, loss of coordination. Move to shelter, remove wet clothing, warm gradually.",
          "Frostbite: white or waxy skin, numbness, stiffness. Warm gently with body heat — never rub the area or use direct high heat.",
          "Keep extremities dry. Wet clothing and wind strip heat far faster than cold alone.",
          "Rotate out of the weather before someone becomes a casualty themselves.",
        ],
      },
      {
        heading: "Team Habits",
        steps: [
          "New arrivals need several days to acclimatise — start them lighter.",
          "Buddy-check for symptoms; people underestimate their own condition.",
          "Report any heat or cold illness to the safety officer so the work cycle can be adjusted.",
        ],
      },
    ],
    footer:
      "Source: OSHA (osha.gov/heat) and NIOSH. Treat any collapse or altered mental status as a medical emergency.",
  },
  {
    id: "deployment_kit",
    title: "Responder Deployment Kit — 72 Hours",
    icon: "🎒",
    source: "FEMA / American Red Cross",
    summary:
      "Assume you are self-sufficient for the first 72 hours. Relief logistics rarely reach you before then.",
    sections: [
      {
        heading: "Personal Sustenance",
        steps: [
          "Water — at least 3 litres per person per day, plus a refill container.",
          "Non-perishable food for 72 hours and a manual can opener.",
          "Sleeping bag or bedding, and a change of clothes kept dry.",
          "Any personal prescription medication, plus a written medication list.",
        ],
      },
      {
        heading: "Safety & Protective Equipment",
        steps: [
          "Helmet, work gloves, sturdy boots, eye protection and high-visibility vest.",
          "Hearing protection and a dust mask or N95 respirator.",
          "Sun protection, insect repellent, and wet-weather gear.",
          "A personal first aid kit and hand sanitiser.",
        ],
      },
      {
        heading: "Working Documents & Power",
        steps: [
          "Photo ID, deployment credentials and a written emergency contact list.",
          "Notebook, pens, and your ICS activity log.",
          "Phone, charging cable, and a charged battery bank.",
          "Cash in small bills — card readers and ATMs may be down.",
        ],
      },
    ],
    footer:
      "Source: FEMA / Ready.gov and American Red Cross deployment guidance. Check your organization's own kit requirements before deploying.",
  },
  {
    id: "animal_handling",
    title: "Animal Handling in the Field",
    icon: "🐾",
    source: "Best Friends Animal Society / DART",
    summary:
      "Displaced animals are frightened, injured and unpredictable. Calm, slow, species-appropriate handling protects the animal and you.",
    sections: [
      {
        heading: "Approach",
        steps: [
          "Move slowly and quietly. Avoid direct eye contact and looming over the animal.",
          "Speak in a low, steady voice. Give the animal room to move away.",
          "Never corner an animal — always leave it an escape route that is not through you.",
          "Ask the owner or the authority on scene before handling any animal.",
        ],
      },
      {
        heading: "Restraint & Transport",
        steps: [
          "Use the restraint method appropriate to the species and size — a slip lead, carrier or crush for large animals.",
          "Never lift a large dog or livestock animal by the limbs or scruff.",
          "Keep carriers covered and ventilated to reduce stress during transport.",
          "Label every carrier with the animal's ID, location found, and time of intake.",
        ],
      },
      {
        heading: "Sheltering & Records",
        steps: [
          "Scan for a microchip where a scanner is available and record the number.",
          "Set up holding areas away from the command post — quiet, shaded, and secure.",
          "Keep species separated and log feeding, watering and any treatment given.",
          "Bites and scratches: wash immediately, report to the safety officer, and seek medical advice.",
        ],
      },
    ],
    footer:
      "Source: Best Friends Animal Society and Disaster Animal Response Team (DART) field guidance. Follow the direction of the responsible animal authority on scene.",
  },
];

function printGuide(guide) {
  const sectionsHtml = guide.sections
    .map(
      (s) =>
        `<h2>${s.heading}</h2><ul>${s.steps.map((step) => `<li>${step}</li>`).join("")}</ul>`,
    )
    .join("");
  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${guide.title} — RallyPack Field Reference</title>
  <style>
    body { font-family: Georgia, serif; max-width: 720px; margin: 40px auto; padding: 0 24px; color: #111; }
    h1 { font-size: 26px; margin-bottom: 4px; }
    .meta { font-size: 13px; color: #555; margin-bottom: 24px; font-family: sans-serif; }
    .summary { background: #f5f5f0; border-left: 4px solid #c0392b; padding: 12px 16px; margin-bottom: 24px; font-size: 15px; font-style: italic; }
    h2 { font-size: 16px; margin-top: 24px; margin-bottom: 8px; color: #222; font-family: sans-serif; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    ul { margin: 0; padding-left: 20px; }
    li { margin-bottom: 6px; font-size: 14px; line-height: 1.6; }
    .footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 12px; font-family: sans-serif; }
    .logo { font-family: Georgia, serif; font-size: 18px; font-weight: bold; margin-bottom: 4px; }
    .print-note { font-size: 12px; color: #888; font-family: sans-serif; margin-bottom: 24px; }
    @media print { .print-note { display: none; } }
  </style>
</head>
<body>
  <div class="logo">RallyPack</div>
  <p class="print-note">To save as PDF: File &rarr; Print &rarr; Save as PDF</p>
  <h1>${guide.icon} ${guide.title}</h1>
  <div class="meta">Source: ${guide.source}</div>
  <div class="summary">${guide.summary}</div>
  ${sectionsHtml}
  <div class="footer">${guide.footer}</div>
</body>
</html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

export default function FieldReferenceGuides() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-3">
      {FIELD_GUIDES.map((guide) => {
        const isOpen = expanded === guide.id;
        return (
          <Card key={guide.id} className="overflow-hidden">
            <CardContent className="p-0">
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-secondary/40 transition-colors"
                onClick={() => setExpanded(isOpen ? null : guide.id)}
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">{guide.icon}</span>
                  <div>
                    <p className="font-sans font-semibold text-foreground text-sm">{guide.title}</p>
                    <p className="text-xs text-muted-foreground font-sans">{guide.source}</p>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 ml-2" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2" aria-hidden="true" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-border">
                  <p className="text-sm text-muted-foreground font-sans italic mt-3 mb-4">{guide.summary}</p>
                  {guide.sections.map((section, idx) => (
                    <div key={idx} className="mb-4">
                      <h4 className="text-xs font-sans font-semibold uppercase tracking-widest text-foreground mb-2">
                        {section.heading}
                      </h4>
                      <ul className="space-y-1.5">
                        {section.steps.map((step, i) => (
                          <li key={i} className="text-sm font-sans text-foreground flex gap-2">
                            <span className="text-muted-foreground shrink-0 mt-0.5" aria-hidden="true">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground font-sans border-t border-border pt-3 mt-2">
                    {guide.footer}
                  </p>
                  <Button size="sm" variant="outline" className="mt-3 gap-2" onClick={() => printGuide(guide)}>
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    Save as PDF / Print
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}