// Shared expiry helpers for business compliance tracking.

export function getExpiryStatus(dateStr) {
  if (!dateStr) return { state: "none", days: null, label: "No date set" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const days = Math.round((target - today) / 86400000);
  if (days < 0) {
    return {
      state: "expired",
      days,
      label: `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`,
    };
  }
  if (days === 0) return { state: "expired", days, label: "Expires today" };
  if (days <= 30) {
    return { state: "expiring", days, label: `Expires in ${days} day${days === 1 ? "" : "s"}` };
  }
  return { state: "ok", days, label: `${days} days left` };
}

export const EXPIRY_STYLES = {
  expired: "bg-red-50 text-red-700 border-red-200",
  expiring: "bg-amber-50 text-amber-700 border-amber-200",
  ok: "bg-green-50 text-green-700 border-green-200",
  none: "bg-muted text-muted-foreground border-border",
};

export function formatExpiryDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Soonest expiry first; undated items sink to the bottom.
export function sortByExpiry(list) {
  return [...list].sort((a, b) => {
    if (!a.expiration_date && !b.expiration_date) return 0;
    if (!a.expiration_date) return 1;
    if (!b.expiration_date) return -1;
    return new Date(a.expiration_date) - new Date(b.expiration_date);
  });
}