// Sensitive expiry framing for every reminder that mentions a due date.
//
// Telling someone an item "expired" is not the same advice for a smoke alarm as
// for a spare battery. Anything that protects life — fire and life safety
// devices, certifications, and medication — has to come out of service and be
// replaced. Anything else can usually be checked and reused, so the reminder
// should say so rather than pushing people to throw away good supplies.

const CRITICAL_TERMS = [
  'smoke alarm',
  'smoke detector',
  'carbon monoxide',
  'co alarm',
  'fire extinguisher',
  'fire alarm',
  'sprinkler',
  'emergency lighting',
  'exit sign',
  'aed',
  'defibrillator',
  'cpr',
  'certification',
  'medication',
  'insulin',
  'epinephrine',
  'epipen',
  'tourniquet',
  'naloxone',
];

export const CRITICAL_GUIDANCE = {
  heading: 'Replace now',
  action:
    'Take these out of service and replace them. An expired safety device or a lapsed certification is not something to keep relying on.',
  disposal:
    'Dispose of the old ones safely: most fire departments and hardware stores take back smoke alarms and extinguishers, and expired medication belongs at a pharmacy take-back point rather than in the bin.',
};

export const REUSABLE_GUIDANCE = {
  heading: 'Check, then replace only if needed',
  action:
    'Check the condition, seal and packaging. Non-critical supplies are usually fine to reuse or rotate into everyday use.',
  disposal:
    'Replace only what has actually spoiled, cracked or lost its seal — the rest does not need to be thrown away.',
};

export function isSafetyCritical(text) {
  const value = String(text || '').toLowerCase();
  if (!value) return false;
  return CRITICAL_TERMS.some((term) => value.includes(term));
}

// Copy for a lapsed item, split by how it must actually be handled.
export function expiryGuidance(text) {
  return isSafetyCritical(text)
    ? { critical: true, ...CRITICAL_GUIDANCE }
    : { critical: false, ...REUSABLE_GUIDANCE };
}

// Lapsed entries split into the ones that must be replaced and the ones that
// only need a look, so a reminder never tells someone to bin good supplies.
export function splitLapsed(entries) {
  return {
    critical: entries.filter((e) => isSafetyCritical(e.label)),
    reusable: entries.filter((e) => !isSafetyCritical(e.label)),
  };
}