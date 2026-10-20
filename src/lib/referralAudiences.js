// Audience → label and free-resource landing page for every referral email.
// Mirrors the audience keys on the BusinessReferral and EmailTemplate entities,
// and the two-option ladder in base44/shared/referralEmail.ts.

export const REFERRAL_ORIGIN = "https://rallypack.org";
export const BUSINESS_PATH = "/BusinessOnboarding";
export const READINESS_MAP_PATH = "/readiness-map";

export const REFERRAL_AUDIENCES = [
  { value: "general", label: "General / Household", path: "/LearnMore" },
  { value: "equine", label: "Equine / Horses", path: "/equine" },
  { value: "canine", label: "Canine / Dogs", path: "/canine" },
  { value: "feline", label: "Feline / Cats", path: "/feline" },
  { value: "infant", label: "Infants", path: "/infant" },
  { value: "avian", label: "Avian / Birds", path: "/avian" },
  { value: "reptile", label: "Reptiles", path: "/reptile" },
  { value: "livestock", label: "Livestock", path: "/livestock" },
  { value: "wildfire", label: "Wildfire", path: "/wildfire" },
  { value: "flood", label: "Flood", path: "/flood" },
  { value: "hurricane", label: "Hurricane", path: "/hurricane" },
  { value: "tornado", label: "Tornado", path: "/tornado" },
  { value: "hoa", label: "Homeowner Association (HOA)", path: "/ReadinessQuiz" },
  { value: "fire_marshal", label: "Fire Safety & Prevention", path: BUSINESS_PATH },
  { value: "commercial_property", label: "Commercial Property / Coworking", path: BUSINESS_PATH },
];

export function audienceLabel(value) {
  return REFERRAL_AUDIENCES.find((a) => a.value === value)?.label || "General";
}

// The free option must never send someone into the paid flow, so an audience
// whose landing page is a business page points at the Readiness Map instead —
// the same swap the server-side email template makes.
export function freePathFor(value) {
  const path =
    REFERRAL_AUDIENCES.find((a) => a.value === value)?.path || READINESS_MAP_PATH;
  return path.indexOf(BUSINESS_PATH) === 0 ? READINESS_MAP_PATH : path;
}