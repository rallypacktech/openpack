import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COUNTRIES: Record<string, { name: string; regionLabel: string }> = {
  US: { name: 'United States', regionLabel: 'US state' },
  CA: { name: 'Canada', regionLabel: 'province or territory' },
  AU: { name: 'Australia', regionLabel: 'state or territory' },
  IE: { name: 'Ireland', regionLabel: 'county' },
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // Auth: AUTOMATION_SECRET or authenticated admin
    const automationSecret = Deno.env.get('AUTOMATION_SECRET');
    const headerSecret = req.headers.get('x-automation-secret') || req.headers.get('automation-secret');
    if (!(headerSecret && automationSecret && headerSecret === automationSecret)) {
      let user;
      try { user = await base44.auth.me(); } catch (_) { user = null; }
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const countryCode = (body.country_code || '').trim().toUpperCase();
    const meta = COUNTRIES[countryCode];
    if (!meta) {
      return Response.json({ error: 'Invalid country_code', valid_codes: Object.keys(COUNTRIES) }, { status: 400 });
    }
    const region = (body.region || '').trim();
    const regionClause = region ? ` in ${region}, ${meta.name}` : ` across ${meta.name}`;

    // 1. Find up to 200 pet resorts / boarding facilities with public emails
    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Find up to 200 pet resorts, pet boarding facilities, dog boarding kennels, pet hotels, and doggy daycare resorts${regionClause}. Include independently owned and small-chain facilities — the kind a pet owner would leave a dog or cat with while travelling or during an evacuation. For each facility return its business name, the ${meta.regionLabel} it is located in, its website if known, and a publicly listed ADMIN, OFFICE, INFO, BOOKINGS, or RESERVATIONS email address.

Search broadly and be exhaustive: check business directories, tourism and regional listing sites, and the facilities' own websites. List every qualifying facility you can find in this region — aim for dozens, not a handful, and do not stop after the first few.

Only include real facilities with real, publicly listed email addresses — never invent, guess, or reconstruct an email address, and never derive one from a domain name. It is far better to omit a facility than to guess its email. Skip any facility that does not have a genuine public email.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          facilities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                organization_name: { type: 'string' },
                contact_email: { type: 'string' },
                contact_name: { type: 'string' },
                region: { type: 'string' },
                website: { type: 'string' },
              },
              required: ['organization_name', 'contact_email'],
            },
          },
        },
        required: ['facilities'],
      },
    });

    let found: any[] = [];
    if (Array.isArray(llmRes?.facilities)) found = llmRes.facilities;
    else if (Array.isArray(llmRes)) found = llmRes;
    else if (typeof llmRes === 'string') {
      try { found = JSON.parse(llmRes).facilities || []; } catch (_) { found = []; }
    }

    // 2. Load existing pet-resort referrals for dedup by email
    const existing = await base44.asServiceRole.entities.BusinessReferral.filter(
      { audience_type: 'canine' }, null, 10000
    );
    const existingEmails = new Set(
      existing.map((r: any) => (r.referee_email || '').trim().toLowerCase())
    );

    // 3. Dedup, validate, and build new referral records
    const seen = new Set<string>();
    const records: any[] = [];
    for (const f of found) {
      const email = (f.contact_email || '').trim().toLowerCase();
      const org = (f.organization_name || '').trim();
      if (!email || !EMAIL_REGEX.test(email) || !org) continue;
      if (existingEmails.has(email) || seen.has(email)) continue;
      seen.add(email);
      records.push({
        referee_email: email,
        referee_name: (f.contact_name || '').trim(),
        organization_name: org,
        audience_type: 'canine',
        state: (f.region || region || '').trim(),
        country_code: countryCode === 'US' ? '' : countryCode,
        status: 'pending',
        referrer_name: 'RallyPack Pet Resort Outreach',
        referrer_email: '',
        message: 'Pet resort / boarding facility',
      });
      if (records.length >= 200) break;
    }

    // 4. Bulk create
    let created = 0;
    if (records.length > 0) {
      const result = await base44.asServiceRole.entities.BusinessReferral.bulkCreate(records);
      created = Array.isArray(result) ? result.length : records.length;
    }

    return Response.json({
      success: true,
      country_code: countryCode,
      region: region || null,
      found: found.length,
      created,
      message: `${meta.name}${region ? ' — ' + region : ''}: found ${found.length} pet resorts, imported ${created} new referrals.`,
    });
  } catch (error) {
    console.error('seedPetResortReferrals error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}