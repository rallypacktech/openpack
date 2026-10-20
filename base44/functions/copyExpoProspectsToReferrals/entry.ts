import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Copies the manually-verified Expo outreach list into the business referral
// pipeline, tagged as coming from the Expo, so one place tracks every business
// conversation.
//
// These rows are deliberately marked with source 'expo_outreach'. The scheduled
// referral emails skip that source — Expo contacts were never asked for an
// email and must be approached by hand, one conversation at a time.

const FIT_LABELS = {
  forecast_inputs: 'Validated forecast inputs',
  resource_distribution: 'Preparedness-resource distribution',
  county_partnership: 'County & community partnerships',
  communications: 'Communications & alerting',
  training: 'Training & resilience programs',
  housing_resilience: 'Housing & flood resilience',
  funding_referral: 'Funding referrals',
};

const MAX_ROWS = 500;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin access required' }, { status: 403 });
    }

    const prospects = await base44.asServiceRole.entities.ExpoProspect.list();
    const existing = await base44.asServiceRole.entities.BusinessReferral.filter({
      source: 'expo_outreach',
    });

    const alreadyCopied = new Set(
      existing.map((r) => (r.referee_email || '').trim().toLowerCase()).filter(Boolean)
    );

    const toCreate = [];
    const seen = new Set();
    let skippedNoEmail = 0;
    let skippedExisting = 0;

    for (const p of prospects) {
      if (toCreate.length >= MAX_ROWS) break;

      const email = (p.contact_email || '').trim().toLowerCase();
      if (!email) {
        skippedNoEmail++;
        continue;
      }
      if (alreadyCopied.has(email) || seen.has(email)) {
        skippedExisting++;
        continue;
      }
      seen.add(email);

      const fit = FIT_LABELS[p.partnership_fit] || 'Other';
      const role = p.contact_role ? `, ${p.contact_role}` : '';
      const goal = p.conversation_goal ? ` ${p.conversation_goal}` : '';

      toCreate.push({
        referee_email: email,
        referee_name: p.contact_name || '',
        organization_name: p.organization_name || '',
        referrer_name: 'Disasters Expo Texas 2026',
        audience_type: 'general',
        state: 'TX',
        status: 'pending',
        source: 'expo_outreach',
        description: `Expo outreach — ${fit}`,
        message: `From the Disasters Expo Texas 2026 contact list (${fit}). Contact: ${p.contact_name || 'not recorded'}${role}.${goal}`,
      });
    }

    if (toCreate.length > 0) {
      await base44.asServiceRole.entities.BusinessReferral.bulkCreate(toCreate);
    }

    return Response.json({
      success: true,
      created: toCreate.length,
      skipped_existing: skippedExisting,
      skipped_no_email: skippedNoEmail,
      total_prospects: prospects.length,
      message:
        `${toCreate.length} Expo contact(s) copied to Referrals. ` +
        `${skippedExisting} already there. ` +
        `${skippedNoEmail} skipped for having no verified email.`,
    });
  } catch (error) {
    console.error('copyExpoProspectsToReferrals error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}