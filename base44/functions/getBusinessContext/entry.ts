import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  norm,
  filterOrEmpty,
  dedupeRows,
  verifiedBusinessEmails,
  trustedCreatorIds,
  findTrustedMembership,
  resolveStanding,
} from '../../shared/businessAccess.ts';

// Returns everything the Business dashboard needs to know about the signed-in
// person's relationship to an organization: the shared organization profile,
// its locations, and the records belonging to each location. A person reaches
// this through their own personal login, either as the owner or as a member who
// linked a business email alias — their personal plans, caches and meet spots
// are never touched or moved.
//
// Nothing here is taken on the caller's word. A business email counts only once
// its owner confirmed a code sent to it, and a roster row counts only when the
// organization's own trusted side created it. Without that, anyone could write
// themselves a membership row and read an organization's private records.

const MAX_ROWS = 200;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const personalEmail = norm(user.email);
    const businessEmails = await verifiedBusinessEmails(base44, user.id);
    const emails = Array.from(new Set([personalEmail, ...businessEmails].filter(Boolean)));

    // Subscriptions this person owns, by any address they have proved.
    const ownedLists = await Promise.all(
      emails.map((email) =>
        filterOrEmpty(base44.asServiceRole.entities.BusinessSubscription, { owner_email: email }),
      ),
    );
    const ownedSubs = dedupeRows(ownedLists.flat());

    // Roster rows that mention any of this person's addresses. These are only
    // candidates — each one is checked against who created it below.
    const memberLists = await Promise.all([
      filterOrEmpty(base44.asServiceRole.entities.OrganizationMember, { linked_user_id: user.id }),
      ...emails.map((email) =>
        filterOrEmpty(base44.asServiceRole.entities.OrganizationMember, { business_email: email }),
      ),
      ...emails.map((email) =>
        filterOrEmpty(base44.asServiceRole.entities.OrganizationMember, { email }),
      ),
    ]);
    const memberships = dedupeRows(memberLists.flat());

    const memberSubIds = Array.from(
      new Set(memberships.map((m) => m.subscription_id).filter(Boolean)),
    );
    const memberSubs = memberSubIds.length
      ? await filterOrEmpty(base44.asServiceRole.entities.BusinessSubscription, {
          id: { $in: memberSubIds.slice(0, MAX_ROWS) },
        })
      : [];

    const candidates = dedupeRows([...ownedSubs, ...memberSubs]);

    const organizations = [];
    for (const sub of candidates) {
      const creatorIds = await trustedCreatorIds(base44, sub);
      const membership = findTrustedMembership(memberships, user.id, emails, sub, creatorIds);
      const { isOwner, isOrgAdmin, hasStanding } = resolveStanding(sub, emails, membership);

      // Nothing verifiable ties this person to the organization, so its
      // records are neither read nor returned.
      if (!hasStanding) continue;

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
      is_linked: businessEmails.length > 0,
      business_email: businessEmails[0] || '',
      personal_email: personalEmail,
      organizations,
      incoming_transfers: dedupeRows(incoming),
      outgoing_transfers: dedupeRows(outgoing),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}