// Shared trust rules for organization business access.
//
// getBusinessContext and manageBusinessTransfer both import these so exactly the
// same evidence is required everywhere. Two things are never taken on the
// caller's word:
//
//   1. A member roster row. Any signed-in person can create one, so a row only
//      counts when the organization's own trusted side created it.
//   2. A business email alias. Anyone can type any address into a form, so an
//      address only counts once its owner has confirmed a code sent to it.

export function norm(value) {
  return String(value == null ? '' : value).trim().toLowerCase();
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value == null ? '' : value).trim());
}

export async function filterOrEmpty(entity, query) {
  try {
    const rows = await entity.filter(query);
    return Array.isArray(rows) ? rows : (rows?.items || []);
  } catch (_e) {
    return [];
  }
}

export function dedupeRows(rows) {
  const seen = new Set();
  const out = [];
  for (const row of rows) {
    const key = row?.id || `${norm(row?.email)}|${row?.subscription_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

// Business addresses this person has actually proved they control. The alias
// stored on the profile is only a display mirror and is never trusted.
export async function verifiedBusinessEmails(base44, userId) {
  const rows = await filterOrEmpty(base44.asServiceRole.entities.BusinessEmailLink, {
    linked_user_id: userId,
    status: 'verified',
  });
  return Array.from(new Set(rows.map((r) => norm(r.email)).filter(Boolean)));
}

// The accounts allowed to speak for an organization: whoever created it, plus
// the accounts behind its owner and org-admin addresses.
export async function trustedCreatorIds(base44, sub) {
  const ids = new Set();
  if (sub?.created_by_id) ids.add(sub.created_by_id);
  const emails = Array.from(
    new Set([norm(sub?.owner_email), ...(sub?.org_admin_emails || []).map(norm)].filter(Boolean)),
  );
  if (emails.length) {
    const users = await filterOrEmpty(base44.asServiceRole.entities.User, {
      email: { $in: emails },
    });
    for (const u of users) if (u?.id) ids.add(u.id);
  }
  return ids;
}

// A roster row is evidence of affiliation only when the organization's trusted
// side created it. created_by_id is stamped by the platform and cannot be
// forged, so a person cannot write a row naming themselves and have it count.
export function membershipIsTrusted(member, callerId, creatorIds) {
  const creator = member?.created_by_id;
  if (!creator) return false;
  if (creator === callerId) return false;
  return creatorIds.has(creator);
}

// The membership that genuinely ties this person to this organization, or null.
export function findTrustedMembership(memberships, callerId, emails, sub, creatorIds) {
  return (
    memberships.find(
      (m) =>
        m.subscription_id === sub.id &&
        membershipIsTrusted(m, callerId, creatorIds) &&
        (m.linked_user_id === callerId ||
          emails.includes(norm(m.business_email)) ||
          emails.includes(norm(m.email))),
    ) || null
  );
}

// Whether this person may speak for the organization at all. Only the owner
// address, a listed org-admin address, or a trusted roster row counts.
export function resolveStanding(sub, emails, membership) {
  const isOwner = emails.includes(norm(sub.owner_email));
  const isOrgAdmin =
    isOwner ||
    (sub.org_admin_emails || []).some((e) => emails.includes(norm(e))) ||
    membership?.is_org_admin === true;
  return { isOwner, isOrgAdmin, hasStanding: isOwner || isOrgAdmin || Boolean(membership) };
}