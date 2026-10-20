import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Read-only view of a plan someone has shared with the caller.
//
// Meet spots and caches are private to their owner, so the caller cannot read
// them directly. This returns them only when the caller's account is the one
// that accepted this share — the owner's own records are never duplicated, and
// revoking the share cuts the view off immediately.

const MAX_CACHES = 100;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const memberId = String(body.family_member_id || '').trim();
    if (!memberId) {
      return Response.json({ error: 'family_member_id is required' }, { status: 400 });
    }

    let member;
    try {
      member = await base44.asServiceRole.entities.FamilyMember.get(memberId);
    } catch (_e) {
      return Response.json({ error: 'Share not found' }, { status: 404 });
    }
    if (member.link_status !== 'accepted' || member.linked_user_id !== user.id) {
      return Response.json({ error: 'This plan is not shared with your account' }, { status: 403 });
    }

    const ownerEmail = member.created_by;
    if (!ownerEmail) {
      return Response.json({ error: 'Share has no owner' }, { status: 409 });
    }

    const [caches, spots, household, profiles] = await Promise.all([
      base44.asServiceRole.entities.EmergencyCache.filter({ created_by: ownerEmail }),
      base44.asServiceRole.entities.MeetSpot.filter({ created_by: ownerEmail }),
      base44.asServiceRole.entities.FamilyMember.filter({ created_by: ownerEmail }),
      base44.asServiceRole.entities.UserProfile.filter({ created_by: ownerEmail }),
    ]);

    const cacheList = (caches || []).slice(0, MAX_CACHES);
    const cacheIds = cacheList.map((c) => c.id);
    const items = cacheIds.length
      ? await base44.asServiceRole.entities.CacheItem.filter({ cache_id: { $in: cacheIds } })
      : [];

    const profile = (profiles || [])[0] || null;

    return Response.json({
      success: true,
      plan: {
        owner_name: member.name || 'Family member',
        relationship: member.relationship || '',
        location: profile ? [profile.city, profile.state_province].filter(Boolean).join(', ') : '',
        meet_spots: (spots || []).map((s) => ({
          name: s.name || 'Meeting spot',
          address: s.address || '',
          description: s.description || '',
          is_primary: Boolean(s.is_primary),
        })),
        caches: cacheList.map((c) => ({
          name: c.name || 'Cache',
          location: c.location || '',
          cache_type: c.cache_type || 'general',
          items: (items || [])
            .filter((i) => i.cache_id === c.id)
            .map((i) => ({ name: i.item_name || '', quantity: i.quantity || null })),
        })),
        household: (household || []).map((m) => ({
          name: m.name || '',
          relationship: m.relationship || '',
        })),
      },
    });
  } catch (error) {
    console.error('getSharedPlan error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}