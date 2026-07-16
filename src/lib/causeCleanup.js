export const STANDARD_CAUSES = [
  "Lightning",
  "Arson",
  "Human Negligence",
  "Agricultural Burning",
  "Power Lines / Electrical",
  "Unknown / Under Investigation",
  "Climate / Drought",
  "Human Activity",
  "Other",
];

export function suggestCleanedCause(original) {
  const lower = (original || "").toLowerCase().trim();
  if (!lower || lower === "(none)") return "Unknown / Under Investigation";
  if (lower.includes("lightning")) return "Lightning";
  if (lower.includes("arson") || lower.includes("sabotage")) return "Arson";
  if (
    lower.includes("neglig") ||
    lower.includes("careless") ||
    lower.includes("campfire") ||
    lower.includes("unattended") ||
    lower.includes("cooking") ||
    lower.includes("stove") ||
    lower.includes("machinery") ||
    lower.includes("accident")
  )
    return "Human Negligence";
  if (
    lower.includes("agricultur") ||
    lower.includes("slash") ||
    lower.includes("clearing") ||
    lower.includes("pasture") ||
    lower.includes("stubble") ||
    lower.includes("chaqueo") ||
    lower.includes("land clearing") ||
    lower.includes("burning") ||
    lower.includes("burn")
  )
    return "Agricultural Burning";
  if (lower.includes("power") || lower.includes("electric") || lower.includes("utility"))
    return "Power Lines / Electrical";
  if (
    lower.includes("unknown") ||
    lower.includes("undetermined") ||
    lower.includes("investigation") ||
    lower.includes("under invest")
  )
    return "Unknown / Under Investigation";
  if (
    lower.includes("drought") ||
    lower.includes("heat") ||
    lower.includes("climate") ||
    lower.includes("dry") ||
    lower.includes("el ni")
  )
    return "Climate / Drought";
  if (
    lower.includes("human") ||
    lower.includes("anthropogenic") ||
    lower.includes("hunting") ||
    lower.includes("poach")
  )
    return "Human Activity";
  return "Other";
}