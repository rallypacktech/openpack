import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Emails a signed-in user's own emergency plan to a saved contact.
// The recipient must be one of the caller's own saved family members or
// authorized handlers, and the email body is rebuilt server-side from the
// caller's stored plan data — caller-supplied free text is never relayed.

const PUBLIC_ORIGIN = 'https://rallypack.org';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildPlanText(user, profile, spots, caches, members, pets) {
  const lines = [];
  lines.push('===== RALLYPACK EMERGENCY PLAN =====');
  lines.push(`Prepared by: ${user.full_name || user.email}`);
  if (profile?.city) lines.push(`Location: ${profile.city}, ${profile.state_province || ''}`.trim());
  lines.push('');

  if (spots.length) {
    lines.push('--- MEETING SPOTS ---');
    spots.forEach((s) => {
      lines.push(`\u2022 ${s.is_primary ? '[PRIMARY] ' : ''}${s.name}${s.address ? ' \u2014 ' + s.address : ''}`);
      if (s.description) lines.push(`  ${s.description}`);
    });
    lines.push('');
  }

  if (caches.length) {
    lines.push('--- EMERGENCY CACHES ---');
    caches.forEach((c) => {
      lines.push(`\u2022 ${c.name} (${(c.cache_type || '').replace('_', ' ')}) \u2014 Location: ${c.location}`);
    });
    lines.push('');
  }

  if (members.length) {
    lines.push('--- HOUSEHOLD MEMBERS ---');
    members.forEach((m) => {
      lines.push(`\u2022 ${m.name} (${m.relationship})${m.emergency_contact ? ' \u2014 Contact: ' + m.emergency_contact : ''}`);
      if (m.medical_conditions) lines.push(`  Medical: ${m.medical_conditions}`);
    });
    lines.push('');
  }

  if (pets.length) {
    lines.push('--- PETS ---');
    pets.forEach((pet) => {
      lines.push(`\u2022 ${pet.name} (${pet.species}${pet.breed ? ', ' + pet.breed : ''})${pet.microchip_number ? ' \u2014 Chip: ' + pet.microchip_number : ''}`);
      if (pet.medical_conditions) lines.push(`  Medical: ${pet.medical_conditions}`);
    });
    lines.push('');
  }

  lines.push('In an emergency, always call 911 first.');
  lines.push('FEMA Helpline: 1-800-621-3362');
  lines.push('=====================================');
  return lines.join('\n');
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const to = String(body.to || '').trim().toLowerCase();

    if (!EMAIL_RE.test(to)) {
      return Response.json({ error: 'A valid recipient email is required' }, { status: 400 });
    }

    // Ownership check: the recipient must be a contact the caller saved.
    const [familyMembers, handlers] = await Promise.all([
      base44.entities.FamilyMember.filter({ created_by: user.email }),
      base44.entities.AuthorizedHandler.filter({ created_by: user.email }),
    ]);

    const isKnownContact =
      familyMembers.some((m) => String(m.emergency_contact || '').trim().toLowerCase() === to) ||
      handlers.some((h) => String(h.email || '').trim().toLowerCase() === to);

    if (!isKnownContact) {
      return Response.json(
        { error: 'You can only email your plan to a saved family member or authorized handler.' },
        { status: 403 },
      );
    }

    // Rebuild the plan from the caller's stored data — never from request text.
    const [profiles, caches, spots, pets] = await Promise.all([
      base44.entities.UserProfile.filter({ created_by: user.email }),
      base44.entities.EmergencyCache.filter({ created_by: user.email }),
      base44.entities.MeetSpot.filter({ created_by: user.email }),
      base44.entities.Pet.filter({ created_by: user.email }),
    ]);

    const planText = buildPlanText(user, profiles[0] || null, spots, caches, familyMembers, pets);

    const safeName = (user.full_name || 'A RallyPack user').replace(/[\r\n]+/g, ' ').trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      subject: `${safeName} shared their RallyPack Emergency Plan with you`,
      body: `Hi,\n\n${safeName} has shared their emergency preparedness plan with you.\n\n${planText}\n\nYou can create your own free plan at ${PUBLIC_ORIGIN}\n\nStay safe,\nRallyPack`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sharePlanByEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}