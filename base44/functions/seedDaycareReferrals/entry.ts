import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'District of Columbia' },
];

export default async function(req: Request): Promise<Response> {
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
    const stateCode = (body.state_code || '').trim().toUpperCase();
    const target = US_STATES.find(s => s.code === stateCode);
    if (!target) {
      return Response.json({ error: 'Invalid state_code', valid_codes: US_STATES.map(s => s.code) }, { status: 400 });
    }

    // 1. Find up to 200 private & nonprofit day cares via web search
    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Find up to 200 day care centers and child care centers located in ${target.name} (US state code ${target.code}), USA. Focus on PRIVATE (for-profit) and NONPROFIT day care centers — exclude large national chains like KinderCare or Bright Horizons unless they are independently operated. For each one, return the day care name and a publicly listed ADMIN or OFFICE email address (director, office, admin, or info email). Only include real day care centers with real, publicly listed email addresses — do not invent or guess any email. Return as many distinct day cares as you can find, up to 200.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          daycares: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                organization_name: { type: 'string' },
                contact_email: { type: 'string' },
                contact_name: { type: 'string' },
                is_nonprofit: { type: 'boolean' }
              },
              required: ['organization_name', 'contact_email']
            }
          }
        },
        required: ['daycares']
      }
    });

    let found: any[] = [];
    if (Array.isArray(llmRes?.daycares)) {
      found = llmRes.daycares;
    } else if (Array.isArray(llmRes)) {
      found = llmRes;
    } else if (typeof llmRes === 'string') {
      try { found = (JSON.parse(llmRes).daycares) || []; } catch (_) { found = []; }
    }

    // 2. Load existing daycare referral emails for dedup (audience_type 'infant', same state)
    const existing = await base44.asServiceRole.entities.BusinessReferral.filter(
      { audience_type: 'infant', state: target.code }, null, 5000
    );
    const existingEmails = new Set(existing.map((r: any) => (r.referee_email || '').trim().toLowerCase()));

    // 3. Dedup, validate, and build new referral records
    const seen = new Set<string>();
    const records: any[] = [];
    for (const d of found) {
      const email = (d.contact_email || '').trim().toLowerCase();
      const org = (d.organization_name || '').trim();
      if (!email || !EMAIL_REGEX.test(email) || !org) continue;
      if (existingEmails.has(email) || seen.has(email)) continue;
      seen.add(email);
      records.push({
        referee_email: email,
        referee_name: (d.contact_name || '').trim(),
        organization_name: org,
        audience_type: 'infant',
        state: target.code,
        status: 'pending',
        referrer_name: 'RallyPack Daycare Outreach',
        referrer_email: '',
        message: d.is_nonprofit ? 'Nonprofit day care' : 'Private day care',
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
      state: target.code,
      state_name: target.name,
      found: found.length,
      created,
      message: `${target.name} (${target.code}): found ${found.length} day cares, imported ${created} new referrals.`
    });
  } catch (error) {
    console.error('seedDaycareReferrals error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}