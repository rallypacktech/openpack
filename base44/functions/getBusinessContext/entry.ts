import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Returns everything the Business dashboard needs to know about the signed-in
// person's relationship to an organization: the shared organization profile,
// its locations, and the records belonging to each location. A person reaches
// this through their own personal login, either as the owner or as a member who
// linked a business email alias — their personal plans, caches and meet spots
// are never touched or moved.

const MAX_ROWS = 200;

function norm(value) {
  return (value || '').trim().toLowerCase();
}

async function filterOrEmpty(entity, query) {
  try {
    const rows = await entity.filter(query);
    return Array.isArray(rows) ? rows : (rows?.items || []);
  } catch (_e) {
    return [];
  }
}

function dedupeByEmail(rows) {
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

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const personalEmail = norm(user.email);

    // The business email alias lives on the person's profile — it is a contact
    // identity, not a second account.
    const profiles = await filterOrEmpty(
      base44.asServiceRole.entities.UserProfile,
      { created_by_id: user.id },
    );
    const businessEmail = norm(profiles[0]?.business_email);

    const emails = Array.from(new Set([personalEmail, businessEmail].filter(Boolean)));

    // Subscriptions this person owns, by either address.
    const ownedLists = await Promise.all(
      emails.map((email) =>
        filterOrEmpty(base44.asServiceRole.entities.BusinessSubscription, { owner_email: email }),
      ),
    );
    const ownedSubs = dedupeByEmail(ownedLists.flat());

    // Memberships tied to this person: linked directly, or matched by any of
    // their addresses.
    const memberLists = await Promise.all([
      filterOrEmpty(base44.asServiceRole.entities.OrganizationMember, { linked_user_id: user.id }),
      ...emails.map((email) =>
        filterOrEmpty(base44.asServiceRole.entities.OrganizationMember, { business_email: email }),
      ),
      ...emails.map((email) =>
        filterOrEmpty(base44.asServiceRole.entities.OrganizationMember, { email }),
      ),
    ]);
    const memberships = dedupeByEmail(memberLists.flat());

    // Pull in the organizations those memberships point at.
    const memberSubIds = Array.from(
      new Set(memberships.map((m) => m.subscription_id).filter(Boolean)),
    );
    const memberSubs = memberSubIds.length
      ? await filterOrEmpty(base44.asServiceRole.entities.BusinessSubscription, {
          id: { $in: memberSubIds.slice(0, MAX_ROWS) },
        })
      : [];

    const allSubs = dedupeByEmail([...ownedSubs, ...memberSubs]);

    const organizations = [];
    for (const sub of allSubs) {
      const membership =
        memberships.find(
          (m) =>
            m.subscription_id === sub.id &&
            (m.linked_user_id === user.id ||
              emails.includes(norm(m.business_email)) ||
              emails.includes(norm(m.email))),
        ) || null;

      const isOwner = emails.includes(norm(sub.owner_email));
      const isOrgAdmin =
        isOwner ||
        (sub.org_admin_emails || []).some((e) => emails.includes(norm(e))) ||
        membership?.is_org_admin === true;

      const [locations, members, kits, plans] = await Promise.all([
        filterOrEmpty(base44.asServiceRole.entities.OrganizationLocation, { subscription_id: sub.id }),
        filterOrEmpty(base44.asServiceRole.entities.OrganizationMember, { subscription_id: sub.id }),
        filterOrEmpty(base44.asServiceRole.entities.EmergencyCache, { subscription_id: sub.id }),
        filterOrEmpty(base44.asServiceRole.entities.EvacuationPlan, { subscription_id: sub.id }),
      ]);

      organizations.push({
        subscription: sub,
        is_owner: isOwner,
        is_org_admin: isOrgAdmin,
        membership_role: membership?.role || (isOwner ? 'owner' : 'member'),
        locations: locations.slice(0, MAX_ROWS),
        members: members.slice(0, MAX_ROWS),
        kits: kits.slice(0, MAX_ROWS),
        plans: plans.slice(0, MAX_ROWS),
      });
    }

    // Transfers waiting on this person, plus ones they started.
    const incoming = [];
    for (const email of emails) {
      const rows = await filterOrEmpty(base44.asServiceRole.entities.BusinessAccessTransfer, {
        to_email: email,
      });
      incoming.push(...rows.filter((t) => t.status === 'pending'));
    }
    const outgoing = [];
    for (const email of emails) {
      const rows = await filterOrEmpty(base44.asServiceRole.entities.BusinessAccessTransfer, {
        from_email: email,
      });
      outgoing.push(...rows.filter((t) => t.status === 'pending'));
    }

    return Response.json({
      is_linked: emails.length > 1,
      business_email: businessEmail || '',
      personal_email: personalEmail,
      organizations,
      incoming_transfers: dedupeByEmail(incoming),
      outgoing_transfers: dedupeByEmail(outgoing),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}