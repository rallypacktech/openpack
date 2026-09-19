// Shared home-safety device presets and service-interval helpers.
// Used by household device tracking and workplace fire-equipment records.

export const DEVICE_TYPES = [
  {
    value: "smoke_alarm",
    label: "Smoke alarm",
    default_interval_months: 12,
    hint: "Test monthly · replace the battery yearly · replace the unit every 10 years",
  },
  {
    value: "carbon_monoxide_alarm",
    label: "Carbon monoxide alarm",
    default_interval_months: 12,
    hint: "Test monthly · replace the battery yearly · replace the unit every 5–7 years",
  },
  {
    value: "fire_extinguisher",
    label: "Fire extinguisher",
    default_interval_months: 12,
    hint: "Visual check monthly · professional service yearly · replace every 12 years",
  },
  {
    value: "aed",
    label: "AED",
    default_interval_months: 12,
    hint: "Check the status light, pads, and battery monthly",
  },
  {
    value: "fire_alarm",
    label: "Fire alarm panel",
    default_interval_months: 12,
    hint: "Test and service annually",
  },
  {
    value: "emergency_lighting",
    label: "Emergency lighting",
    default_interval_months: 12,
    hint: "Test the 30-second and 90-minute cycles monthly",
  },
  {
    value: "exit_sign",
    label: "Exit sign",
    default_interval_months: 12,
    hint: "Check illumination and battery backup monthly",
  },
  {
    value: "sprinkler_system",
    label: "Sprinkler system",
    default_interval_months: 12,
    hint: "Professional inspection annually",
  },
  { value: "other", label: "Other device", default_interval_months: 12, hint: "" },
];

export function deviceLabel(value) {
  return DEVICE_TYPES.find((d) => d.value === value)?.label || "Device";
}

export function deviceHint(value) {
  return DEVICE_TYPES.find((d) => d.value === value)?.hint || "";
}

export function defaultInterval(value) {
  return DEVICE_TYPES.find((d) => d.value === value)?.default_interval_months || 12;
}

// Local-date helpers — avoid UTC drift that can shift a date by a day.
function toIso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayIso() {
  return toIso(new Date());
}

export function addMonthsIso(baseIso, months) {
  const d = baseIso ? new Date(`${baseIso}T00:00:00`) : new Date();
  d.setMonth(d.getMonth() + months);
  return toIso(d);
}

// "I checked / replaced this today" — moves the next due date forward one interval.
export function nextServiceDates(record) {
  const interval = Number(record?.interval_months) || defaultInterval(record?.equipment_type);
  const today = todayIso();
  return { issued_date: today, expiration_date: addMonthsIso(today, interval) };
}