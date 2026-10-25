import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Business access handoff. When someone leaves, either the current owner or a
// designated organization admin can offer the business side of the account to a
// replacement. Nothing moves until the replacement accepts. Personal plans,
// caches, meet spots and other personal records belong to the person's own
// account and are never touched by a transfer.

function norm(value) {
  return (value || '').trim().toLowerCase();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
}

async function filterOrEmpty(entity, query) {
  try {
    const rows = await entity.filter(query);
    return Array.isArray(rows) ? rows : (rows?.items || []);
  } catch (_e) {
    return [];
  }
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    const personalEmail = norm(user.email);
    const profiles = await filterOrEmpty(
      base44.asServiceRole.entities.UserProfile,
      { created_by_id: user.id },
    );
    const profile = profiles[0] || null;
    const businessEmail = norm(profile?.business_email);
    const emails = Array.from(new Set([personalEmail, businessEmail].filter(Boolean)));

    // ---- Connect a business email alias to this personal login -------------
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

      const fields = { business_email: alias, business_email_linked_at: new Date().toISOString() };
      if (profile) {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, fields);
      } else {
        await base44.asServiceRole.entities.UserProfile.create(fields);
      }

      // Attach any member records already waiting on that work address.
      const pendingMembers = [
        ...(await filterOrEmpty(base44.asServiceRole.entities.OrganizationMember, { business_email: alias })),
        ...(await filterOrEmpty(base44.asServiceRole.entities.OrganizationMember, { email: alias })),
      ];
      const seen = new Set();
      for (const member of pendingMembers) {
        if (seen.has(member.id)) continue;
        seen.add(member.id);
        await base44.asServiceRole.entities.OrganizationMember.update(member.id, {
          linked_user_id: user.id,
          status: 'active',
        });
      }

      return Response.json({ ok: true, business_email: alias, linked_memberships: seen.size });
    }

    if (action === 'unlink_alias') {
      if (profile) {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          business_email: '',
          business_email_linked_at: '',
        });
      }
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

      const isOwner = emails.includes(norm(sub.owner_email));
      const adminMembers = await filterOrEmpty(base44.asServiceRole.entities.OrganizationMember, {
        subscription_id: subscriptionId,
      });
      const membership = adminMembers.find(
        (m) =>
          m.linked_user_id === user.id ||
          emails.includes(norm(m.business_email)) ||
          emails.includes(norm(m.email)),
      );
      const isOrgAdmin =
        isOwner ||
        (sub.org_admin_emails || []).some((e) => emails.includes(norm(e))) ||
        membership?.is_org_admin === true;

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
          { error: 'This transfer was addressed to a different business email. Connect that address first.' },
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