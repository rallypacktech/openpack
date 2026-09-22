// Question-and-answer content for the public FAQ hub and the on-page Q&A blocks.
//
// Each entry carries a one-sentence direct answer (`a`) that is visible without
// interaction, plus optional `detail` behind a disclosure. The phrasing mirrors
// how people actually search, so the answers are extractable by answer engines.
export const FAQ_TOPICS = [
  { key: "general", label: "Preparedness basics" },
  { key: "wildfire", label: "Wildfire" },
  { key: "hurricane", label: "Hurricane" },
  { key: "flood", label: "Flood" },
  { key: "tornado", label: "Tornado" },
  { key: "species", label: "Pets, livestock & family" },
];

export const PUBLIC_FAQ = {
  general: [
    {
      q: "How long should I be prepared to manage on my own after a disaster?",
      a: "Plan for at least 72 hours, and build toward 7 to 14 days where wildfire, extreme heat, outages or remote access make that realistic.",
      detail:
        "Help may be delayed, shelters may be full or distant, and normal services may be unavailable. FEMA uses 72 hours as a minimum sustainment benchmark and contemplates up to 14 days for evacuation and shelter planning. Keep well-stocked supplies at home, at work, and in your vehicles — and treat the 72-hour figure as a floor, not a promise that aid will arrive.",
    },
    {
      q: "What are the four meeting points every family should agree on?",
      a: "One inside the home, one outside the home, one in the neighborhood, and one outside the neighborhood or region.",
      detail:
        "Disasters separate people in different ways, so each location covers a different failure: a safe spot for an immediate hazard such as fire or a tornado warning; a nearby rendezvous after evacuating the building; a location reachable if the home area is inaccessible; and a destination that still works if roads, schools, workplaces or the whole area is affected. Each one needs a physical address, an accessible route, an alternate route, an assigned adult contact and a go/no-go trigger — on paper as well as on phones.",
    },
    {
      q: "Is wildfire season still a useful concept?",
      a: "Your region may still have peak wildfire months, but preparedness is year-round because dangerous fire conditions can recur outside the historic season.",
      detail:
        "Warmer, drier conditions and longer dry intervals are extending the period in which ignitions can spread, which is why many agencies now refer to a fire year rather than a fire season. Keep supplies, documents, contacts and animal plans current all year, update routes and defensible space before local high-risk periods, and raise readiness whenever heat, drought, wind, low humidity, red-flag warnings, holidays, festivals, conflict or utility shutoff conditions converge.",
    },
    {
      q: "Should animals evacuate at the same time as people?",
      a: "Yes — evacuate people and animals together on the first departure, and do not return after you leave unless authorities explicitly reopen the area.",
      detail:
        "Someone who returns to an evacuation zone for a pet, livestock, documents or belongings can become an additional rescue problem and delay first responders. Pre-commit instead: assign one person to each animal or livestock group, keep carriers, leashes, halters, medication, food, water, identification and veterinary records ready, and identify at least two animal-friendly destinations plus a backup boarding, stable or mutual-aid contact.",
    },
    {
      q: "Does insurance replace the need to prepare?",
      a: "No — insurance cannot replace early evacuation, animal planning, home hardening or defensible space, and it should never delay a life-safety decision.",
      detail:
        "In many high-risk markets households face rising premiums, non-renewals and reduced coverage. Verify whether your policy covers wildfire, smoke, additional living expenses, rebuilding at current code, debris removal and detached structures; review deductibles, exclusions and any mitigation requirements; and keep a current video or photo inventory with policy documents stored off-site.",
    },
    {
      q: "What should be loaded first when you evacuate?",
      a: "People, animals, medication, IDs, cash, keys, phones and chargers, records, and photographs — irreplaceable items before belongings.",
      detail:
        "Put medication, keys, chargers, cash, documents, pet carriers and animal leads in one known location so nothing has to be searched for under pressure. A large kit is never a reason to stay late.",
    },
  ],
  wildfire: [
    {
      q: "How much warning does a wildfire usually give?",
      a: "Typically 6 to 48 hours, and often less in rural or wildland–urban interface zones.",
      detail:
        "Wildfire evacuation orders can arrive as a warning level, a 'be ready' notice, or an immediate 'leave now' instruction that gives you minutes. Know your local evacuation levels and sign up for official alerts before fire season.",
    },
    {
      q: "What is defensible space and how much do I need?",
      a: "Roughly 30 metres of cleared, low-fuel space around a structure, plus an ember-resistant home.",
      detail:
        "Clear dry debris from the roof, gutters, deck, vents and the immediate perimeter; cover vents; remove ember traps; and move flammable items away from structures. Embers can travel more than 2 km ahead of a fire front and ignite homes before flames arrive.",
    },
    {
      q: "How does drought affect wildfire risk?",
      a: "Drought, heat and wind dry grasses, shrubs and living vegetation, making it far more likely that an ignition becomes a large, fast-moving fire.",
      detail:
        "Severe drought also lowers stream, river, lake and reservoir levels and removes natural fire breaks and convenient water sources for suppression, which can allow fires to spread farther and faster. Prolonged drought can eventually reduce fine-fuel growth in some ecosystems, so it does not guarantee more fire everywhere — but where fuel remains, the landscape is more flammable and fire behaviour more extreme.",
    },
    {
      q: "How does wildfire affect my drinking water?",
      a: "Fires can strain water sources during an incident and contaminate watersheds afterwards, while municipal networks are not designed to suppress a fast-moving wildfire at community scale.",
      detail:
        "During major incidents, water availability can be constrained by dry reservoirs, reduced streamflow, damaged pumps, power outages, low pressure or competing municipal demand — a local, incident-scale strain rather than a driver of regional drought. Afterwards, ash, sediment, debris, metals and nutrients can wash into streams and reservoirs, increasing treatment requirements and reducing storage. Store, protect and conserve household water, and never treat hoses, pools or hydrants as a substitute for evacuating.",
    },
    {
      q: "How do I keep wildfire smoke out of my home?",
      a: "Create a clean-air room with a HEPA filter, keep windows and doors closed, and track local air quality daily.",
      detail:
        "Wildfire smoke travels hundreds of kilometres and can affect people far from the fire itself. Keep N95 masks available, run filtration with backup power where possible, and plan for people with respiratory or cardiac conditions first. Masks do not make an evacuation zone safe.",
    },
    {
      q: "Can I go back home after evacuating?",
      a: "Only once officials explicitly reopen the area — do not return for property, pets or livestock after you leave.",
      detail:
        "Returning into a closed evacuation zone risks your life and pulls responders away from the incident. Wait for an official all-clear, and expect hazards such as hot ash pits, damaged utilities, weakened trees and contaminated water after you are allowed back.",
    },
  ],
  hurricane: [
    {
      q: "How many days of supplies do I need for a hurricane?",
      a: "At least 7 days of water and food per person and per pet — power and water can be out for over a week.",
      detail:
        "Store at least 4 litres of water per person per day for drinking and sanitation, and fill bathtubs for washing. Add medications, backup power, fuel and a way to receive alerts if cell networks are overloaded.",
    },
    {
      q: "What is storm surge and why is it the deadliest part of a hurricane?",
      a: "Storm surge is the rise of seawater driven ashore by wind — it can reach 6 metres in minutes and is the leading cause of hurricane deaths.",
      detail:
        "Surge, not wind, is what makes coastal evacuation orders urgent. If officials order an evacuation for your zone, leave — a 72-hour window shrinks fast once the storm approaches.",
    },
    {
      q: "Does taping windows stop them from breaking?",
      a: "No — tape does not prevent glass from breaking and can create larger, more dangerous shards.",
      detail:
        "Use storm shutters or 5/8-inch plywood instead, and reinforce garage doors, because wind entering a garage can lift the roof.",
    },
    {
      q: "When should I evacuate for a hurricane?",
      a: "When officials issue an order for your zone — and earlier if you have mobility, medical or animal transport needs.",
      detail:
        "Hurricanes give days of warning, but storm surge gives hours. Plan two inland routes, because coastal roads can be underwater or blocked by debris well before landfall.",
    },
  ],
  flood: [
    {
      q: "Should I drive through floodwater?",
      a: "No — turn around. As little as 30 cm of moving water can float a vehicle and sweep it off the road.",
      detail:
        "Floodwater hides washed-out roads, debris and live electrical hazards, and most flood deaths happen in vehicles. Find higher ground on foot only if you can do so safely.",
    },
    {
      q: "How quickly can a flash flood develop?",
      a: "In minutes — often with little or no visible rain where you are standing.",
      detail:
        "Flash flooding is driven by rainfall upstream, so a dry street can flood from a storm several kilometres away. Move to higher ground immediately when a warning is issued.",
    },
    {
      q: "Is flood damage covered by homeowners insurance?",
      a: "Usually not — flood damage generally requires a separate flood policy.",
      detail:
        "Check your coverage before you need it, and document your property with photos and receipts. Standard policies typically exclude rising water.",
    },
    {
      q: "What should I do before floodwater reaches my home?",
      a: "Move essentials and valuables above the expected water line, shut off utilities if instructed, and evacuate when told.",
      detail:
        "Take documents, medication, cash, phones and chargers with you, and never enter a flooded basement or a building surrounded by water.",
    },
  ],
  tornado: [
    {
      q: "Where is the safest place in a home during a tornado?",
      a: "The lowest level, in a small interior room away from windows — a basement, or a bathroom or closet on the ground floor.",
      detail:
        "Put as many walls between you and the outside as possible, protect your head and neck, and avoid rooms with large windows or a wide roof span.",
    },
    {
      q: "Should I open windows to equalize air pressure during a tornado?",
      a: "No — opening windows is a myth and wastes the seconds you have to reach shelter.",
      detail:
        "Wind damage comes from debris impact and structural failure, not from a pressure difference you can fix by opening a window.",
    },
    {
      q: "What should I do if I'm in a vehicle when a tornado approaches?",
      a: "Drive to the nearest sturdy shelter; if none is reachable, get out, lie flat in a low ditch and cover your head.",
      detail:
        "Never shelter under a highway overpass — it concentrates wind and debris. Mobile homes are not safe shelter in any tornado warning.",
    },
    {
      q: "How much warning time does a tornado warning give?",
      a: "Warnings are issued with a median lead time of only about 10 to 15 minutes — treat one as an instruction to act now.",
      detail:
        "Have a battery-powered or hand-crank weather radio, enable wireless emergency alerts, and know your shelter location before a warning is issued.",
    },
  ],
  species: [
    {
      q: "How do I evacuate pets if emergency shelters do not accept animals?",
      a: "Identify at least two animal-friendly destinations before an emergency — pet-friendly hotels, boarding kennels, veterinary clinics or a mutual-aid contact.",
      detail:
        "Confirm which local shelters accept animals and under what conditions, and keep a backup boarding or stable contact for large animals. Never leave an animal tethered or confined where it cannot escape.",
    },
    {
      q: "What should a pet evacuation kit contain?",
      a: "A carrier or leash and harness, medication, food and water for at least 72 hours, bowls, identification, and copies of veterinary records.",
      detail:
        "Add a recent photo of you with the animal for proof of ownership, a litter tray or waste bags, and a favourite item to reduce stress. Keep the kit with your own go-bag so both leave together.",
    },
    {
      q: "How do I plan to evacuate livestock?",
      a: "Assign one person to each animal or livestock group and arrange transport, destinations and mutual-aid help in advance.",
      detail:
        "Pre-identify two destinations plus a backup, keep halters, leads and records ready, and coordinate with neighbours so a single regional disaster does not consume all available transport at once.",
    },
    {
      q: "Should I leave animals behind if I cannot take them?",
      a: "No — evacuate people and animals together on the first departure, and never return to a closed zone for an animal.",
      detail:
        "Returning for animals makes you an additional rescue problem and delays first responders. If you truly cannot take an animal, leave it loose indoors with food and water and tell responders or animal services it is there.",
    },
    {
      q: "How do I make sure my pet can be identified after a disaster?",
      a: "Use a microchip plus a collar tag with a phone number, and carry a recent photo of you with the animal.",
      detail:
        "Keep microchip registration details current and store copies of vaccination records with your own documents, since shelters and boarding facilities often require them.",
    },
  ],
};

/** Flat list of questions for one or more topics, used by the on-page Q&A blocks. */
export function getFaq(topic) {
  return PUBLIC_FAQ[topic] || [];
}