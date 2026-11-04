import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { matchesAutomationSecret } from '../../shared/automationAuth.ts';

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

// Imports commercial workplaces — companies with offices and office managers,
// coworking spaces, and warehouses — for one US state, as fire_marshal referrals
// so each one receives the Fire Safety outreach email.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // Auth: AUTOMATION_SECRET or authenticated admin
    const headerSecret = req.headers.get('x-automation-secret') || req.headers.get('automation-secret');
    if (!matchesAutomationSecret(headerSecret)) {
      let user;
      try { user = await base44.auth.me(); } catch (_) { user = null; }
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json().catch(() => ({}));
    let stateCodes: string[] = Array.isArray(body.state_codes)
      ? body.state_codes.map((c: string) => String(c).trim().toUpperCase())
      : [(body.state_code || '').trim().toUpperCase()];

    const targets = stateCodes
      .map((code) => US_STATES.find((s) => s.code === code))
      .filter(Boolean) as { code: string; name: string }[];
    if (targets.length === 0) {
      return Response.json({ error: 'Invalid state_code', valid_codes: US_STATES.map((s) => s.code) }, { status: 400 });
    }

    const results: any[] = [];

    for (const target of targets) {
      // 1. Find commercial workplaces with a published office / facilities inbox
      const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Find up to 150 commercial employers and workplace operators headquartered or operating in ${target.name} (US state code ${target.code}), USA, that employ office staff and must keep workplace safety and first aid records. Focus on: technology and software companies with offices, coworking and shared-office operators, logistics and distribution warehouses, 3PL and fulfillment centers, light manufacturing plants, business services and consulting firms, insurance and financial services offices, and corporate office parks. For each one return the company name, its city, the office-manager or general office/admin contact email address published on its own website (office@, info@, admin@, facilities@, or a named office manager), and the page URL where that address is published. Only include companies with a real email address you can actually see printed on their own official site. Never invent, guess, or construct an address from a pattern. Skip companies that publish only a web form or phone number. Return as many distinct companies as you can find, up to 150.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            companies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  organization_name: { type: 'string' },
                  contact_email: { type: 'string' },
                  contact_name: { type: 'string' },
                  city: { type: 'string' },
                  industry: { type: 'string' },
                  source_url: { type: 'string' },
                },
                required: ['organization_name', 'contact_email'],
              },
            },
          },
          required: ['companies'],
        },
      });

      let found: any[] = [];
      if (Array.isArray(llmRes?.companies)) found = llmRes.companies;
      else if (Array.isArray(llmRes)) found = llmRes;
      else if (typeof llmRes === 'string') {
        try { found = JSON.parse(llmRes).companies || []; } catch (_) { found = []; }
      }

      // 2. Load every existing referral for this state (any audience) so a company
      // is never added twice and never emailed twice.
      const existing = await base44.asServiceRole.entities.BusinessReferral.filter(
        { state: target.code }, null, 5000
      );
      const existingEmails = new Set(existing.map((r: any) => (r.referee_email || '').trim().toLowerCase()));

      // 3. Dedup, validate, build records
      const seen = new Set<string>();
      const records: any[] = [];
      for (const c of found) {
        const email = (c.contact_email || '').trim().toLowerCase();
        const org = (c.organization_name || '').trim();
        if (!email || !EMAIL_REGEX.test(email) || !org) continue;
        if (existingEmails.has(email) || seen.has(email)) continue;
        seen.add(email);
        records.push({
          referee_email: email,
          referee_name: (c.contact_name || '').trim(),
          organization_name: org,
          audience_type: 'fire_marshal',
          state: target.code,
          source: 'commercial_seed',
          status: 'pending',
          referrer_name: 'RallyPack Commercial Outreach',
          referrer_email: '',
          message: [c.industry, c.city, c.source_url].filter(Boolean).join(' · ') || 'Commercial workplace',
        });
        if (records.length >= 150) break;
      }

      // 4. Bulk create
      let created = 0;
      if (records.length > 0) {
        const result = await base44.asServiceRole.entities.BusinessReferral.bulkCreate(records);
        created = Array.isArray(result) ? result.length : records.length;
      }

      results.push({
        state: target.code,
        state_name: target.name,
        found: found.length,
        created,
      });
    }

    const totalCreated = results.reduce((s, r) => s + r.created, 0);
    return Response.json({
      success: true,
      results,
      created: totalCreated,
      message: results
        .map((r) => `${r.state_name}: ${r.found} found, ${r.created} imported`)
        .join(' · '),
    });
  } catch (error) {
    console.error('seedCommercialReferrals error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}