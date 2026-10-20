// Offering plan access is a two-step handshake.
//
// When the owner saves a family member with an email address, the share starts
// as 'pending'. The family member then accepts or declines it from their own
// account, and only then is their user id linked to the record. Nothing is
// copied either way, so each person keeps their own plan.
//
// A family member saved without an email has nothing to share and stays 'none'.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value) {
  return EMAIL_RE.test(String(value || "").trim());
}

export function shareFieldsFor(emergencyContact) {
  return isEmail(emergencyContact)
    ? { link_status: "pending", invited_at: new Date().toISOString() }
    : { link_status: "none" };
}