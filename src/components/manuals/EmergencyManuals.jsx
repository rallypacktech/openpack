import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Download } from "lucide-react";

export const MANUALS = [
  {
    id: "cpr_adult",
    title: "CPR — Adult & Child",
    category: "medical",
    icon: "🫀",
    source: "American Heart Association",
    summary: "Hands-only CPR saves lives. Act fast.",
    sections: [
      {
        heading: "1. Check the Scene & the Person",
        steps: [
          "Make sure the scene is safe for you.",
          "Tap the shoulder firmly and shout: Are you OK?",
          "If no response: call 911 (or have someone else call) and get an AED if available.",
        ],
      },
      {
        heading: "2. Position Your Hands",
        steps: [
          "Place the person on their back on a firm, flat surface.",
          "Kneel beside the person's chest.",
          "Place the heel of one hand on the center of the chest (lower half of the breastbone).",
          "Place your other hand on top, interlacing fingers. Keep fingers off the chest.",
        ],
      },
      {
        heading: "3. Give Chest Compressions",
        steps: [
          "Keep arms straight. Push down hard and fast — at least 2 inches deep.",
          "Rate: 100–120 compressions per minute. (Think: beat of Stayin' Alive by Bee Gees.)",
          "Let the chest fully recoil between compressions.",
          "Minimize interruptions to less than 10 seconds.",
        ],
      },
      {
        heading: "4. Give Rescue Breaths (optional — hands-only CPR is also effective)",
        steps: [
          "Tilt head back, lift chin to open the airway.",
          "Pinch nose shut. Create a complete seal over the mouth.",
          "Give 1 breath over 1 second — watch for chest rise.",
          "Give a second breath. Then resume compressions.",
          "Ratio: 30 compressions to 2 breaths.",
        ],
      },
      {
        heading: "5. Continue Until Help Arrives",
        steps: [
          "Keep going until an AED is ready, trained help takes over, or the person begins breathing normally.",
          "If you are tired, switch with another person every 2 minutes if possible.",
        ],
      },
      {
        heading: "Child CPR (ages 1 to puberty) — Key Differences",
        steps: [
          "Use 1 or 2 hands depending on child size.",
          "Compress at least 2 inches (or 1/3 depth of the chest).",
          "Give 2 rescue breaths after every 30 compressions.",
        ],
      },
    ],
    footer: "Source: American Heart Association (heart.org). This is a reference guide only — get certified CPR training for hands-on practice.",
  },
  {
    id: "cpr_infant",
    title: "CPR — Infant (Under 1 Year)",
    category: "medical",
    icon: "👶",
    source: "American Heart Association",
    summary: "Infant CPR uses 2 fingers and gentler breaths.",
    sections: [
      {
        heading: "1. Check Responsiveness",
        steps: [
          "Flick the bottom of the infant's foot. Shout the baby's name.",
          "If unresponsive and not breathing normally: call 911.",
        ],
      },
      {
        heading: "2. Compressions",
        steps: [
          "Lay infant on a firm, flat surface.",
          "Place 2 fingers on the center of the chest, just below the nipple line.",
          "Push down about 1.5 inches at 100–120 per minute.",
          "Allow full chest recoil between compressions.",
        ],
      },
      {
        heading: "3. Rescue Breaths",
        steps: [
          "Tilt head back gently (neutral position — do not over-extend).",
          "Cover the infant's nose AND mouth with your mouth.",
          "Give 1 small puff of air (just enough to see chest rise) over 1 second.",
          "Give 2 breaths per 30 compressions.",
        ],
      },
    ],
    footer: "Source: American Heart Association. Seek certified Infant CPR training — this is for reference only.",
  },
  {
    id: "fire_extinguisher",
    title: "Fire Extinguisher — PASS Technique",
    category: "tools",
    icon: "🧯",
    source: "FEMA / Ready.gov",
    summary: "Only fight a fire if it's small, contained, and you have an exit behind you.",
    sections: [
      {
        heading: "When to Fight vs. Evacuate",
        steps: [
          "EVACUATE if: the fire is spreading, the room is filling with smoke, or you do not have an exit behind you.",
          "FIGHT only if: the fire is small (wastebasket-sized), contained, you are not in danger, and 911 has been called.",
        ],
      },
      {
        heading: "P — Pull",
        steps: [
          "Pull the safety pin from the handle.",
          "The pin prevents accidental discharge.",
        ],
      },
      {
        heading: "A — Aim",
        steps: [
          "Aim the nozzle at the BASE of the fire — not the flames.",
          "Stand 6–8 feet away.",
        ],
      },
      {
        heading: "S — Squeeze",
        steps: [
          "Squeeze the handle to release the extinguishing agent.",
          "Release to stop.",
        ],
      },
      {
        heading: "S — Sweep",
        steps: [
          "Sweep the nozzle from side to side across the base of the fire.",
          "Continue until the fire is out.",
          "Watch for re-ignition and back away toward your exit.",
        ],
      },
      {
        heading: "Extinguisher Types",
        steps: [
          "Class A: Ordinary combustibles (wood, paper, cloth).",
          "Class B: Flammable liquids (gasoline, oil, grease).",
          "Class C: Electrical equipment — use dry chemical or CO2, never water.",
          "Class K: Kitchen fires (cooking oils) — use only a Class K extinguisher.",
          "ABC-rated extinguishers handle most home emergencies.",
        ],
      },
    ],
    footer: "Source: FEMA / Ready.gov / NFPA. Have extinguishers inspected annually. Replace or refill after any use.",
  },
  {
    id: "choking",
    title: "Choking — Heimlich Maneuver",
    category: "medical",
    icon: "🤲",
    source: "American Red Cross",
    summary: "Act immediately — choking becomes fatal within minutes.",
    sections: [
      {
        heading: "Signs of Severe Choking",
        steps: [
          "Cannot speak, cry, or make noise.",
          "Cannot breathe or breathing is very difficult.",
          "Skin turns blue (cyanosis).",
          "Clutching throat with hands (universal choking sign).",
        ],
      },
      {
        heading: "Adult and Child (over 1 year)",
        steps: [
          "Ask: Are you choking? If they can speak or cough forcefully, encourage coughing — do not interfere.",
          "If they cannot cough or speak: Call 911.",
          "Stand behind the person. Place one foot forward for balance.",
          "Make a fist with one hand. Place thumb side against the abdomen, just above the navel and below the breastbone.",
          "Grasp your fist with your other hand.",
          "Give firm, upward inward thrusts. Repeat until object is expelled or person becomes unconscious.",
          "If person loses consciousness, lower them to the floor and begin CPR.",
        ],
      },
      {
        heading: "Infant (under 1 year)",
        steps: [
          "Hold infant face-down on your forearm, supporting the head.",
          "Give 5 firm back blows between the shoulder blades with the heel of your hand.",
          "Turn infant face-up. Give 5 chest thrusts with 2 fingers on the center of the chest.",
          "Alternate 5 back blows and 5 chest thrusts until object is cleared or infant becomes unresponsive.",
        ],
      },
      {
        heading: "Choking Alone",
        steps: [
          "Call 911 immediately.",
          "Make a fist and thrust inward and upward on your own abdomen.",
          "Or lean over a hard edge (chair back, countertop) and drive it into your upper abdomen.",
        ],
      },
    ],
    footer: "Source: American Red Cross (redcross.org). Get certified first aid training for hands-on practice.",
  },
  {
    id: "bleeding_control",
    title: "Bleeding Control & Tourniquet",
    category: "medical",
    icon: "🩸",
    source: "Stop the Bleed / American College of Surgeons",
    summary: "Uncontrolled bleeding is the #1 preventable cause of traumatic death.",
    sections: [
      {
        heading: "Step 1: Ensure Scene Safety",
        steps: [
          "Do not enter an unsafe scene.",
          "Put on gloves if available.",
        ],
      },
      {
        heading: "Step 2: Apply Direct Pressure",
        steps: [
          "Pack wound tightly with gauze or clean cloth.",
          "Press firmly with both hands — do not let up.",
          "Hold for at least 5 minutes without peeking.",
          "If blood soaks through, add more gauze on top — do not remove what is already there.",
        ],
      },
      {
        heading: "Step 3: Tourniquet (Limbs Only)",
        steps: [
          "Use a commercial tourniquet (CAT, SOFT-T Wide) or improvise with a belt or torn cloth and a rigid stick.",
          "Apply 2–3 inches above the wound (NOT on a joint).",
          "Tighten until bleeding stops — it will be painful.",
          "Write the time of application on the tourniquet or skin.",
          "Do NOT remove once applied. Get to emergency care immediately.",
        ],
      },
      {
        heading: "Wound Packing (Deep Wounds)",
        steps: [
          "Locate the source of bleeding inside the wound.",
          "Pack gauze firmly into the wound with a finger.",
          "Continue packing until the wound is full.",
          "Apply direct pressure over the packed wound for 3 minutes.",
        ],
      },
    ],
    footer: "Source: Stop the Bleed campaign / American College of Surgeons (bleedingcontrol.org).",
  },
  {
    id: "shelter_in_place",
    title: "Shelter in Place",
    category: "tools",
    icon: "🏠",
    source: "FEMA / Ready.gov",
    summary: "Some emergencies require staying home — know when and how.",
    sections: [
      {
        heading: "When to Shelter in Place",
        steps: [
          "Hazardous material spill or chemical release in your area.",
          "Nuclear or radiological incident.",
          "Active threat or civil unrest outside.",
          "Authorities give explicit shelter-in-place orders via emergency alert.",
        ],
      },
      {
        heading: "Immediate Actions",
        steps: [
          "Go inside immediately. Bring pets in.",
          "Close and lock all doors and windows.",
          "Turn off all HVAC systems (heat, A/C, fans, ventilation).",
          "Close fireplace dampers.",
        ],
      },
      {
        heading: "Seal the Room",
        steps: [
          "Choose an interior room with few windows and doors.",
          "Use plastic sheeting and duct tape to seal gaps around doors, windows, and vents.",
          "Use wet towels at door bases for chemical emergencies.",
          "Bring food, water (1 gallon per person per day), medications, and a battery radio.",
        ],
      },
      {
        heading: "While Sheltering",
        steps: [
          "Monitor emergency broadcasts (NOAA Weather Radio, local radio, emergency alerts).",
          "Conserve phone battery.",
          "Do not go outside until authorities give the all-clear.",
          "If you must leave for medical reasons, cover nose and mouth with a wet cloth.",
        ],
      },
    ],
    footer: "Source: FEMA / Ready.gov. Follow official guidance from local emergency management.",
  },
  {
    id: "wildfire_smoke",
    title: "Wildfire Smoke & Air Quality Safety",
    category: "tools",
    icon: "💨",
    source: "EPA / CDC / NIFC",
    summary: "Wildfire smoke carries fine particles (PM2.5) deep into the lungs. Protect your household when the Air Quality Index (AQI) reaches unhealthy levels.",
    sections: [
      {
        heading: "Check Air Quality Daily",
        steps: [
          "Check AirNow.gov or the AirNow app for your local AQI — especially during wildfire season (June–October in the West).",
          "AQI 0–50: Good. 51–100: Moderate. 101–150: Unhealthy for sensitive groups. 151–200: Unhealthy. 201–300: Very Unhealthy. 301+: Hazardous.",
          "Sensitive groups: children under 18, adults 65+, pregnant people, and anyone with asthma, heart disease, COPD, or diabetes.",
        ],
      },
      {
        heading: "Create a Clean-Air Room",
        steps: [
          "Choose one room in your home with the fewest windows and doors — a bedroom is ideal.",
          "Run a portable HEPA air purifier sized for the room (look for a Clean Air Delivery Rate / CADR of 300+ for smoke).",
          "Keep windows and doors closed. Seal gaps with weather stripping or duct tape.",
          "Run the purifier continuously on the highest setting when smoke is present.",
          "Avoid activities that create indoor pollution: no smoking, no frying, no burning candles or incense.",
        ],
      },
      {
        heading: "When to Wear a Mask Outdoors",
        steps: [
          "Wear a NIOSH-approved N95 or P100 respirator when AQI is 151+ and you must go outside.",
          "Cloth masks, surgical masks, and bandanas do NOT filter fine wildfire smoke particles (PM2.5).",
          "Ensure the N95 fits tightly — no gaps around the edges. Facial hair prevents a proper seal.",
          "Children should stay indoors instead of wearing adult masks, which do not fit properly.",
        ],
      },
      {
        heading: "When to Evacuate Due to Smoke",
        steps: [
          "Evacuate if AQI reaches Hazardous (301+) and you cannot maintain clean indoor air.",
          "Evacuate immediately if you have trouble breathing, chest pain, or dizziness — seek medical attention.",
          "Consider relocating to a public clean-air shelter (often set up at community centers, libraries, or malls during severe smoke events).",
          "Follow local evacuation orders — smoke can be deadly even without direct fire threat.",
        ],
      },
      {
        heading: "Protect Pets and Livestock",
        steps: [
          "Bring pets indoors when AQI is 151+. Keep bathroom trips short.",
          "Reduce livestock exertion — avoid working animals in heavy smoke.",
          "Provide plenty of clean water — smoke irritation increases thirst.",
          "Watch for coughing, eye discharge, or labored breathing in animals — contact a veterinarian if symptoms persist.",
        ],
      },
    ],
    footer: "Sources: EPA (airnow.gov/wildfire-guide-factsheets), CDC (cdc.gov/air/wildfire-smoke), NIFC predictive outlook (nifc.gov). Check AirNow.gov for real-time AQI during wildfire events.",
  },
  {
    id: "wildfire_ready_set_go",
    title: "Wildfire Evacuation — Ready, Set, Go!",
    category: "tools",
    icon: "🔥",
    source: "NIFC / IAFC Ready, Set, Go! / Ready.gov",
    summary: "Wildfire moves fast. The Ready, Set, Go! program gives you a 3-step action plan to prepare before fire threatens, act when it does, and leave early.",
    sections: [
      {
        heading: "READY — Prepare Before Wildfire Season",
        steps: [
          "Create defensible space: clear dead leaves, dry brush, and flammable debris within 30 meters (100 feet) of your home.",
          "Move firewood, propane tanks, and combustibles at least 10 meters (30 feet) away from structures.",
          "Clean roofs and gutters of leaves and pine needles.",
          "Use fire-resistant building materials for roofing, siding, and decking where possible.",
          "Assemble a go-bag and keep it accessible. Include N95 masks for smoke.",
          "Sign up for local emergency alerts. Know your evacuation routes — identify at least two ways out.",
          "Check the NIFC monthly/seasonal outlook to know if your area is in an above-normal fire potential zone.",
        ],
      },
      {
        heading: "SET — Be Alert When Fire Threatens",
        steps: [
          "Monitor local fire reports, NWS Red Flag Warnings, and emergency alerts.",
          "Load your go-bag into your vehicle. Park facing the direction of escape.",
          "Move furniture to the center of rooms, away from windows and walls.",
          "Close all windows and doors (but leave them unlocked for firefighter access).",
          "Shut off gas at the meter and turn off propane tanks.",
          "Connect garden hoses and fill buckets — but do not stay to fight the fire yourself.",
          "Bring pets inside and load carriers. Prepare livestock trailers for quick loading.",
          "Place a ladder against the house (for firefighters) and leave outdoor lights on.",
        ],
      },
      {
        heading: "GO! — Evacuate Immediately",
        steps: [
          "Leave as soon as you are told to evacuate — do not wait. Wildfire can overrun a neighborhood in minutes.",
          "Follow designated evacuation routes. Do not take shortcuts — you may be trapped.",
          "Drive slowly with headlights on. Watch for fleeing wildlife and pedestrians.",
          "If caught in smoke while driving: slow down, close windows, turn off outside air, and turn on headlights. Pull over if visibility is near zero.",
          "If trapped and you cannot evacuate: call 911, stay in your car (it provides some thermal protection), lie on the floor, and cover up.",
          "Do not return home until authorities give the all-clear.",
        ],
      },
      {
        heading: "After the Fire — Returning Home",
        steps: [
          "Wait for official clearance before returning.",
          "Watch for hot spots, smoldering debris, and downed power lines.",
          "Check the roof and attic for hidden embers for several days — re-ignition is common.",
          "Document all damage with photos and video before cleanup for insurance claims.",
          "Contact your insurance company and register with FEMA at DisasterAssistance.gov if a disaster is declared.",
          "Reach out to your local COAD (Community Organizations Active in Disaster) for volunteer help with cleanup and recovery.",
        ],
      },
    ],
    footer: "Sources: NIFC (nifc.gov), IAFC Ready, Set, Go! Program (wildlandfiresrsg.org), Ready.gov/wildfires, Firewise USA (nfpa.org/Public-Education/By-topic/Wildfires/Firewise-USA). Review your plan and update your go-bag every 6 months.",
  },
  {
    id: "evacuation_checklist",
    title: "Go-Bag Evacuation Checklist",
    category: "documents",
    icon: "🎒",
    source: "FEMA",
    summary: "Grab and go in under 5 minutes with this checklist.",
    sections: [
      {
        heading: "Documents (originals or copies in a waterproof bag)",
        steps: [
          "Government-issued IDs (driver's license, passport)",
          "Social Security cards",
          "Insurance policies (home, auto, health, life)",
          "Bank account numbers and contact info",
          "Copies of prescriptions and medication lists",
          "Pet vaccination records and microchip numbers",
          "Contact list (written — do not rely only on your phone)",
        ],
      },
      {
        heading: "Water and Food (72-hour minimum)",
        steps: [
          "1 gallon of water per person per day (3 gallons per person)",
          "Non-perishable food (canned goods, energy bars, dried fruit)",
          "Manual can opener",
          "Pet food and water for 72 hours",
        ],
      },
      {
        heading: "Medical and First Aid",
        steps: [
          "Prescription medications (7-day supply minimum)",
          "First aid kit",
          "Extra glasses or contact lens solution",
          "Infant formula, diapers, or special needs supplies",
        ],
      },
      {
        heading: "Tools and Communication",
        steps: [
          "Battery-powered or hand-crank NOAA Weather Radio",
          "Flashlight and extra batteries (or hand-crank)",
          "Cell phone with chargers and battery backup",
          "Whistle (to signal for help)",
          "Cash in small bills (ATMs may not work)",
          "Local paper maps (GPS may be unreliable)",
        ],
      },
      {
        heading: "Clothing and Shelter",
        steps: [
          "Change of clothes per person",
          "Sturdy closed-toe shoes",
          "Rain gear",
          "Sleeping bag or warm blanket per person",
          "Emergency mylar blankets",
        ],
      },
    ],
    footer: "Source: FEMA / Ready.gov. Review and update your go-bag every 6 months.",
  },
];

const CATEGORY_COLORS = {
  medical: "bg-red-100 text-red-700",
  tools: "bg-gray-100 text-gray-700",
  documents: "bg-yellow-100 text-yellow-700",
};

function printManual(manual) {
  const win = window.open("", "_blank");
  const sectionsHtml = manual.sections.map(s =>
    `<h2>${s.heading}</h2><ul>${s.steps.map(step => `<li>${step}</li>`).join("")}</ul>`
  ).join("");
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${manual.title} — RallyPack Emergency Manual</title>
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
  <h1>${manual.icon} ${manual.title}</h1>
  <div class="meta">Source: ${manual.source} &nbsp;&middot;&nbsp; Category: ${manual.category}</div>
  <div class="summary">${manual.summary}</div>
  ${sectionsHtml}
  <div class="footer">${manual.footer}</div>
</body>
</html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

export default function EmergencyManuals() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-3">
      {MANUALS.map((manual) => {
        const isOpen = expanded === manual.id;
        return (
          <Card key={manual.id} className="overflow-hidden">
            <CardContent className="p-0">
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-secondary/40 transition-colors"
                onClick={() => setExpanded(isOpen ? null : manual.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">{manual.icon}</span>
                  <div>
                    <p className="font-sans font-semibold text-foreground text-sm">{manual.title}</p>
                    <p className="text-xs text-muted-foreground font-sans">{manual.source}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Badge className={`text-xs ${CATEGORY_COLORS[manual.category] || "bg-gray-100 text-gray-700"}`}>
                    {manual.category}
                  </Badge>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  }
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-border">
                  <p className="text-sm text-muted-foreground font-sans italic mt-3 mb-4">{manual.summary}</p>
                  {manual.sections.map((section, idx) => (
                    <div key={idx} className="mb-4">
                      <h4 className="text-xs font-sans font-semibold uppercase tracking-widest text-foreground mb-2">{section.heading}</h4>
                      <ul className="space-y-1.5">
                        {section.steps.map((step, i) => (
                          <li key={i} className="text-sm font-sans text-foreground flex gap-2">
                            <span className="text-muted-foreground shrink-0 mt-0.5">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground font-sans border-t border-border pt-3 mt-2">{manual.footer}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 gap-2"
                    onClick={() => printManual(manual)}
                  >
                    <Download className="w-3.5 h-3.5" />
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