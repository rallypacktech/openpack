import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Countries with a high share of English-speaking urban centres.
const COUNTRIES = [
  { code: 'IN', name: 'India', cities: 'Mumbai, Delhi NCR (New Delhi, Gurugram, Noida), Bengaluru, Hyderabad, Chennai, Pune, Kolkata and Ahmedabad' },
  { code: 'IE', name: 'Ireland', cities: 'Dublin, Cork, Galway, Limerick and Waterford' },
  { code: 'CA', name: 'Canada', cities: 'Toronto, Vancouver, Montreal, Calgary, Ottawa, Edmonton, Mississauga and Winnipeg' },
  { code: 'AU', name: 'Australia', cities: 'Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra, Gold Coast and Newcastle' },
  { code: 'PK', name: 'Pakistan', cities: 'Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad and Peshawar' },
  { code: 'SG', name: 'Singapore', cities: 'Singapore' },
  { code: 'BD', name: 'Bangladesh', cities: 'Dhaka, Chittagong, Sylhet and Khulna' },
];

const CATEGORIES: Record<string, any> = {
  fire_marshal: {
    audience_type: 'fire_marshal',
    array_key: 'offices',
    limit: 150,
    referrer_name: 'RallyPack Fire Marshal Outreach',
    label: 'Fire prevention office',
    build: (country: any, limit: number) =>
      `Find up to ${limit} fire marshal, fire prevention, fire safety and fire code enforcement offices in ${country.name}. Focus on these major urban areas: ${country.cities}. Include national and provincial/state fire authorities, municipal fire brigade headquarters, fire prevention and inspection bureaus, and fire safety departments — for example India's State Fire & Emergency Services and city fire brigade offices, Ireland's local authority fire services and Chief Fire Officer offices, Canada's provincial Fire Marshal / Fire Commissioner offices and municipal fire prevention divisions, Australia's state fire service fire safety units, Pakistan's provincial fire brigades and Rescue 1122 offices, Singapore's SCDF Fire Safety and Shelter Department, and Bangladesh's Fire Service and Civil Defence. For each, return the office name, the city or region it serves, and a publicly listed OFFICE, ADMIN or INSPECTION email address. Only include real offices with real, publicly listed email addresses — never invent or guess an email address.`,
  },
  daycare: {
    audience_type: 'infant',
    array_key: 'daycares',
    limit: 200,
    referrer_name: 'RallyPack Daycare Outreach',
    label: 'Day care centre',
    build: (country: any, limit: number) =>
      `Find up to ${limit} day care, child care, preschool and early learning centres in ${country.name}. Focus on these major urban areas where English is widely spoken: ${country.cities}. Include private and nonprofit centres such as crèches, Montessori schools, play schools, day care centres and long day care centres. For each, return the centre name, the city or region it is in, and a publicly listed ADMIN, OFFICE, DIRECTOR or INFO email address. Only include real centres with real, publicly listed email addresses — never invent or guess an email address.`,
  },
  wework: {
    audience_type: 'commercial_property',
    array_key: 'locations',
    limit: 60,
    referrer_name: 'RallyPack Coworking Outreach',
    label: 'Coworking location',
    build: (country: any, limit: number) =>
      `Find up to ${limit} WeWork coworking locations in ${country.name}. Focus on these major urban areas: ${country.cities}. For each location return the location name (for example "WeWork BKC, Mumbai"), the city it is in, and a publicly listed location, community, sales or enquiries email address. Only include real WeWork locations with a real, publicly listed email address — never invent or guess an email address.`,
  },
};

// Pulls fire marshal / daycare / coworking (WeWork) contact emails for one
// country and one category per run, as business referrals. One category per
// call keeps each run inside the function execution time limit.
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
    const categoryKey = (body.category || '').trim();
    const model = (body.model || 'gemini_3_flash').trim();

    const country = COUNTRIES.find(c => c.code === countryCode);
    if (!country) {
      return Response.json({ error: 'Invalid country_code', valid_codes: COUNTRIES.map(c => c.code) }, { status: 400 });
    }
    const category = CATEGORIES[categoryKey];
    if (!category) {
      return Response.json({ error: 'Invalid category', valid_categories: Object.keys(CATEGORIES) }, { status: 400 });
    }

    // 1. Find contacts via LLM web search
    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: category.build(country, category.limit) + ' Return as many distinct organisations as you can find, up to ' + category.limit + ' — do not stop at the first few.',
      add_context_from_internet: true,
      model,
      response_json_schema: {
        type: 'object',
        properties: {
          [category.array_key]: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                organization_name: { type: 'string' },
                contact_email: { type: 'string' },
                contact_name: { type: 'string' },
                region: { type: 'string' }
              },
              required: ['organization_name', 'contact_email']
            }
          }
        },
        required: [category.array_key]
      }
    });

    let found: any[] = [];
    if (Array.isArray(llmRes?.[category.array_key])) {
      found = llmRes[category.array_key];
    } else if (Array.isArray(llmRes)) {
      found = llmRes;
    } else if (typeof llmRes === 'string') {
      try { found = (JSON.parse(llmRes)[category.array_key]) || []; } catch (_) { found = []; }
    }

    // 2. Load existing referrals for this country + category for dedup
    const existing = await base44.asServiceRole.entities.BusinessReferral.filter(
      { audience_type: category.audience_type, country_code: country.code }, null, 5000
    );
    const existingEmails = new Set(existing.map((r: any) => (r.referee_email || '').trim().toLowerCase()));

    // 3. Dedup, validate, and build new referral records
    const seen = new Set<string>();
    const records: any[] = [];
    for (const o of found) {
      const email = (o.contact_email || '').trim().toLowerCase();
      const org = (o.organization_name || '').trim();
      if (!email || !EMAIL_REGEX.test(email) || !org) continue;
      if (existingEmails.has(email) || seen.has(email)) continue;
      seen.add(email);
      records.push({
        referee_email: email,
        referee_name: (o.contact_name || '').trim(),
        organization_name: org,
        audience_type: category.audience_type,
        state: (o.region || '').trim(),
        country_code: country.code,
        status: 'pending',
        referrer_name: category.referrer_name,
        referrer_email: '',
        message: category.label,
      });
      if (records.length >= category.limit) break;
    }

    // 4. Bulk create
    let created = 0;
    if (records.length > 0) {
      const result = await base44.asServiceRole.entities.BusinessReferral.bulkCreate(records);
      created = Array.isArray(result) ? result.length : records.length;
    }

    return Response.json({
      success: true,
      country: country.code,
      country_name: country.name,
      category: categoryKey,
      found: found.length,
      created,
      message: `${country.name} (${country.code}) ${categoryKey}: found ${found.length}, imported ${created} new referrals.`
    });
  } catch (error) {
    console.error('seedInternationalReferrals error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}