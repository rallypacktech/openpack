// Shared labels for the Community Drill Directory.

export const DRILL_TYPES = [
  { value: "fire_evacuation", label: "Fire evacuation" },
  { value: "earthquake", label: "Earthquake" },
  { value: "flood", label: "Flood" },
  { value: "hurricane", label: "Hurricane" },
  { value: "tornado", label: "Tornado" },
  { value: "wildfire", label: "Wildfire" },
  { value: "active_threat", label: "Active threat" },
  { value: "cpr_aed", label: "CPR / AED" },
  { value: "tabletop", label: "Tabletop exercise" },
  { value: "full_scale", label: "Full-scale exercise" },
  { value: "other", label: "Other" },
];

export function drillTypeLabel(value) {
  return DRILL_TYPES.find((t) => t.value === value)?.label || "Drill";
}

export const FLAG_REASONS = [
  { value: "wrong_date", label: "Wrong date or time" },
  { value: "wrong_location", label: "Wrong location" },
  { value: "cancelled", label: "This drill was cancelled" },
  { value: "duplicate", label: "Duplicate listing" },
  { value: "not_a_drill", label: "This isn't a training drill" },
  { value: "inappropriate", label: "Inappropriate or misleading" },
  { value: "other", label: "Something else" },
];

export function flagReasonLabel(value) {
  return FLAG_REASONS.find((r) => r.value === value)?.label || "Issue";
}

export const DRILL_STATUS_LABELS = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};