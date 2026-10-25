import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  norm,
  isEmail,
  filterOrEmpty,
  verifiedBusinessEmails,
  trustedCreatorIds,
  membershipIsTrusted,
  findTrustedMembership,
  resolveStanding,
} from '../../shared/businessAccess.ts';

// Business access handoff. When someone leaves, either the current owner or a
// designated organization admin can offer the business side of the account to a
// replacement. Nothing moves until the replacement accepts. Personal plans,
// caches, meet spots and other personal records belong to the person's own
// account and are never touched by a transfer.
//
// Authorization is anchored to facts the caller cannot write: the
// subscription's own owner/org-admin records, a roster row created by the
// organization's trusted side, and a business address whose owner confirmed a
// code sent to it. A self-asserted alias or a roster row someone wrote for
// themselves grants nothing.

const CODE_TTL_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function makeCode() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(bytes[0] % 1000000).padStart(6, '0');
}

function sameCode(a, b) {
  const x = norm(a);
  const y = norm(b);
  if (!x || x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    const personalEmail = norm(user.email);
    const businessEmails = await verifiedBusinessEmails(base44, user.id);
    const emails = Array.from(new Set([personalEmail, ...businessEmails].filter(Boolean)));

    // ---- Connect a business email alias to this personal login -------------
    // A code goes to the address first. Until it comes back, the address is not
    // part of this person's identity and grants nothing.
    if (action === 'link_alias') {
      const alias = norm(body.business_email);
      if (!isEmail(alias)) {
        return Response.json({ error: 'Enter a valid business email address.' }, { status: 400 });
      }
      if (alias === personalEmail) {
        return Response.json(
          { error: 'That is already your personal sign-in address. Use your work address.' },
          { status: 400 },
        );
      }
      if (businessEmails.includes(alias)) {
        return Response.json({ ok: true, verified: true, business_email: alias });
      }

      const code = makeCode();
      await base44.asServiceRole.entities.BusinessEmailLink.deleteMany({
        linked_user_id: user.id,
        status: 'pending',
      });
      await base44.asServiceRole.entities.BusinessEmailLink.create({
        linked_user_id: user.id,
        email: alias,
        code,
        status: 'pending',
        expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
        attempts: 0,
      });

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: alias,
          template_name: 'BusinessEmailVerification',
          variables: { business_email: alias, code },
        });
      } catch (_e) {
        await base44.asServiceRole.entities.BusinessEmailLink.deleteMany({
          linked_user_id: user.id,
          status: 'pending',
        });
        return Response.json(
          {
            error:
              'We could not send a confirmation code to that address. Check the spelling and try again.',
          },
          { status: 502 },
        );
      }

      return Response.json({ ok: true, pending: true, business_email: alias });
    }

    // ---- Confirm the code sent to the business address --------------------
    if (action === 'confirm_alias') {
      const alias = norm(body.business_email);
      const code = String(body.code || '').trim();
      if (!isEmail(alias) || !code) {
        return Response.json({ error: 'Enter the code we sent to that address.' }, { status: 400 });
      }

      const rows = await filterOrEmpty(base44.asServiceRole.entities.BusinessEmailLink, {
        linked_user_id: user.id,
        email: alias,
        status: 'pending',
      });
      const link = rows[0];
      if (!link) {
        return Response.json({ error: 'Request a new code for that address.' }, { status: 400 });
      }
      if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
        await base44.asServiceRole.entities.BusinessEmailLink.delete(link.id);
        return Response.json({ error: 'That code has expired. Request a new one.' }, { status: 400 });
      }
      if ((link.attempts || 0) >= MAX_ATTEMPTS) {
        await base44.asServiceRole.entities.BusinessEmailLink.delete(link.id);
        return Response.json({ error: 'Too many attempts. Request a new code.' }, { status: 429 });
      }
      if (!sameCode(link.code, code)) {
        await base44.asServiceRole.entities.BusinessEmailLink.update(link.id, {
          attempts: (link.attempts || 0) + 1,
        });
        return Response.json({ error: 'That code is not correct.' }, { status: 400 });
      }

      await base44.asServiceRole.entities.BusinessEmailLink.update(link.id, {
        status: 'verified',
        verified_at: new Date().toISOString(),
        code: '',
      });

      // The profile field is a display mirror only — nothing authorizes on it.
      const profiles = await filterOrEmpty(base44.asServiceRole.entities.UserProfile, {
        created_by_id: user.id,
      });
      const mirror = {
        business_email: alias,
        business_email_linked_at: new Date().toISOString(),
      };
      if (profiles[0]) {
        await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, mirror);
      } else {
        await base44.asServiceRole.entities.UserProfile.create(mirror);
      }

      // Attach roster rows the organization's trusted side already created for
      // this address. Rows someone wrote for themselves are left alone.
      const pendingMembers = [
        ...(await filterOrEmpty(base44.asServiceRole.entities.OrganizationMember, { business_email: alias })),
        ...(await filterOrEmpty(base44.asServiceRole.entities.OrganizationMember, { email: alias })),
      ];
      const seen = new Set();
      const creatorCache = new Map();
      for (const member of pendingMembers) {
        if (seen.has(member.id)) continue;
        seen.add(member.id);
        if (!member.subscription_id) continue;

        let creatorIds = creatorCache.get(member.subscription_id);
        if (!creatorIds) {
          const subs = await filterOrEmpty(base44.asServiceRole.entities.BusinessSubscription, {
            id: member.subscription_id,
          });
          creatorIds = subs[0] ? await trustedCreatorIds(base44, subs[0]) : new Set();
          creatorCache.set(member.subscription_id, creatorIds);
        }
        if (!membershipIsTrusted(member, user.id, creatorIds)) continue;

        await base44.asServiceRole.entities.OrganizationMember.update(member.id, {
          linked_user_id: user.id,
          status: 'active',
        });
      }

      return Response.json({ ok: true, verified: true, business_email: alias });
    }

    if (action === 'unlink_alias') {
      const profiles = await filterOrEmpty(base44.asServiceRole.entities.UserProfile, {
        created_by_id: user.id,
      });
      if (profiles[0]) {
        await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
          business_email: '',
          business_email_linked_at: '',
        });
      }
      await base44.asServiceRole.entities.BusinessEmailLink.deleteMany({ linked_user_id: user.id });

      const linked = await filterOrEmpty(base44.asServiceRole.entities.OrganizationMember, {
        linked_user_id: user.id,
      });
      for (const member of linked) {
        await base44.asServiceRole.entities.OrganizationMember.update(member.id, { linked_user_id: '' });
      }
      return Response.json({ ok: true });
    }

    // ---- Initiate a transfer ----------------------------------------------
    if (action === 'initiate') {
      const subscriptionId = body.subscription_id;
      const scope = body.scope === 'location' ? 'location' : 'organization';
      const toEmail = norm(body.to_email);
      const note = (body.note || '').slice(0, 1000);

      if (!subscriptionId) {
        return Response.json({ error: 'Missing organization.' }, { status: 400 });
      }
      if (!isEmail(toEmail)) {
        return Response.json({ error: 'Enter a valid business email for the replacement.' }, { status: 400 });
      }

      const subs = await filterOrEmpty(base44.asServiceRole.entities.BusinessSubscription, {
        id: subscriptionId,
      });
      const sub = subs[0];
      if (!sub) return Response.json({ error: 'Organization not found.' }, { status: 404 });

      const adminMembers = await filterOrEmpty(base44.asServiceRole.entities.OrganizationMember, {
        subscription_id: subscriptionId,
      });
      const creatorIds = await trustedCreatorIds(base44, sub);
      const membership = findTrustedMembership(adminMembers, user.id, emails, sub, creatorIds);
      const { isOwner, isOrgAdmin } = resolveStanding(sub, emails, membership);

      if (!isOrgAdmin) {
        return Response.json(
          { error: 'Only the current owner or an organization admin can transfer business access.' },
          { status: 403 },
        );
      }

      let location = null;
      if (scope === 'location') {
        if (!body.location_id) {
          return Response.json({ error: 'Choose which location is moving.' }, { status: 400 });
        }
        const locations = await filterOrEmpty(
          base44.asServiceRole.entities.OrganizationLocation,
          { id: body.location_id },
        );
        location = locations[0] || null;
        if (!location) return Response.json({ error: 'Location not found.' }, { status: 404 });
        if (location.subscription_id !== subscriptionId) {
          return Response.json({ error: 'That location belongs to a different organization.' }, { status: 403 });
        }
      }

      // One live offer per subscription/scope at a time.
      const existing = await filterOrEmpty(
        base44.asServiceRole.entities.BusinessAccessTransfer,
        { subscription_id: subscriptionId, status: 'pending' },
      );
      const clash = existing.find(
        (t) => t.scope === scope && (scope === 'organization' || t.location_id === body.location_id),
      );
      if (clash) {
        return Response.json(
          { error: 'There is already a pending transfer for this. Cancel it first.' },
          { status: 409 },
        );
      }

      const currentHolderEmail =
        scope === 'location' ? norm(location.location_manager_email) : norm(sub.owner_email);

      const transfer = await base44.asServiceRole.entities.BusinessAccessTransfer.create({
        subscription_id: subscriptionId,
        organization_name: sub.organization_name,
        scope,
        location_id: scope === 'location' ? location.id : '',
        location_name: scope === 'location' ? location.name : '',
        from_email: currentHolderEmail,
        from_name: scope === 'location' ? location.manager_name || '' : '',
        to_email: toEmail,
        to_name: (body.to_name || '').slice(0, 200),
        initiated_by_email: personalEmail,
        initiated_by_role: isOwner ? 'owner' : 'org_admin',
        note,
        status: 'pending',
      });

      return Response.json({ ok: true, transfer });
    }

    // ---- Respond to a transfer --------------------------------------------
    if (action === 'accept' || action === 'decline' || action === 'cancel') {
      const transferId = body.transfer_id;
      if (!transferId) return Response.json({ error: 'Missing transfer.' }, { status: 400 });

      const found = await filterOrEmpty(base44.asServiceRole.entities.BusinessAccessTransfer, {
        id: transferId,
      });
      const transfer = found[0];
      if (!transfer) return Response.json({ error: 'Transfer not found.' }, { status: 404 });
      if (transfer.status !== 'pending') {
        return Response.json({ error: 'This transfer has already been answered.' }, { status: 409 });
      }

      const isRecipient = emails.includes(norm(transfer.to_email));
      const isInitiator = norm(transfer.initiated_by_email) === personalEmail;

      if (action === 'cancel') {
        if (!isInitiator) {
          return Response.json({ error: 'Only the person who started the transfer can cancel it.' }, { status: 403 });
        }
        await base44.asServiceRole.entities.BusinessAccessTransfer.update(transferId, {
          status: 'cancelled',
          responded_at: new Date().toISOString(),
        });
        return Response.json({ ok: true, status: 'cancelled' });
      }

      if (!isRecipient) {
        return Response.json(
          { error: 'This transfer was addressed to a different business email. Connect and confirm that address first.' },
          { status: 403 },
        );
      }

      if (action === 'decline') {
        await base44.asServiceRole.entities.BusinessAccessTransfer.update(transferId, {
          status: 'declined',
          responded_at: new Date().toISOString(),
          response_note: (body.note || '').slice(0, 1000),
        });
        return Response.json({ ok: true, status: 'declined' });
      }

      // ---- Accept: the actual handoff -------------------------------------
      if (transfer.scope === 'location') {
        if (transfer.location_id) {
          await base44.asServiceRole.entities.OrganizationLocation.update(transfer.location_id, {
            location_manager_email: transfer.to_email,
            manager_name: transfer.to_name || '',
          });
        }
        const locationMembers = await filterOrEmpty(
          base44.asServiceRole.entities.OrganizationMember,
          { subscription_id: transfer.subscription_id, location_id: transfer.location_id },
        );
        for (const member of locationMembers) {
          if (emails.includes(norm(member.email)) || emails.includes(norm(member.business_email))) {
            await base44.asServiceRole.entities.OrganizationMember.update(member.id, {
              linked_user_id: user.id,
              status: 'active',
            });
          }
        }
      } else {
        const subs = await filterOrEmpty(base44.asServiceRole.entities.BusinessSubscription, {
          id: transfer.subscription_id,
        });
        const sub = subs[0];
        if (sub) {
          const admins = (sub.org_admin_emails || []).filter(
            (e) => !emails.includes(norm(e)),
          );
          await base44.asServiceRole.entities.BusinessSubscription.update(sub.id, {
            owner_email: transfer.to_email,
            org_admin_emails: admins,
          });
        }

        // Swap the owner role on the member roster. The previous owner keeps
        // their member record (and their personal account) but no longer holds
        // the organization.
        const roster = await filterOrEmpty(base44.asServiceRole.entities.OrganizationMember, {
          subscription_id: transfer.subscription_id,
        });
        const previousOwner = roster.find(
          (m) =>
            norm(m.email) === norm(transfer.from_email) ||
            norm(m.business_email) === norm(transfer.from_email),
        );
        if (previousOwner && previousOwner.role === 'owner') {
          await base44.asServiceRole.entities.OrganizationMember.update(previousOwner.id, {
            role: 'safety_officer',
            is_org_admin: true,
          });
        }
        const newOwner = roster.find(
          (m) =>
            norm(m.email) === norm(transfer.to_email) ||
            norm(m.business_email) === norm(transfer.to_email),
        );
        if (newOwner) {
          await base44.asServiceRole.entities.OrganizationMember.update(newOwner.id, {
            role: 'owner',
            is_org_admin: true,
            linked_user_id: user.id,
            status: 'active',
          });
        } else {
          await base44.asServiceRole.entities.OrganizationMember.create({
            subscription_id: transfer.subscription_id,
            email: transfer.to_email,
            business_email: transfer.to_email,
            full_name: transfer.to_name || '',
            role: 'owner',
            is_org_admin: true,
            linked_user_id: user.id,
            status: 'active',
          });
        }
      }

      await base44.asServiceRole.entities.BusinessAccessTransfer.update(transferId, {
        status: 'accepted',
        responded_at: new Date().toISOString(),
        response_note: (body.note || '').slice(0, 1000),
      });

      return Response.json({ ok: true, status: 'accepted', scope: transfer.scope });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}