import { createClientFromRequest } from 'npm:@base44/sdk@0.8.53';
import { readCachedPayload, writeCachedPayload } from '../../shared/reportCache.ts';

// Public, unauthenticated endpoint: the fundraising thermometer on the public
// Donate and Home pages. It must never expose donor records, so the totals are
// computed with a server-side aggregate — no individual Donation (and therefore
// no donor name, email, or amount) is ever read into this function. The result
// is snapshotted so anonymous traffic cannot drive one aggregate per visitor.

// Preseed funding goal — transparent breakdown of real costs
const ANNUAL_GOAL_CENTS = 500000 * 100;
const CACHE_KEY = 'donation_progress';
const TTL_MS = 10 * 60 * 1000; // 10 minutes

const OPERATING_COSTS = [
  { label: "Founder & Developer Salary", amount: 120000, description: "Full-time development, maintenance, and user support" },
  { label: "Software Engineer", amount: 77000, description: "Engineering hire to build and harden the preparedness platform" },
  { label: "Outreach Coordinator", amount: 55000, description: "Partnerships with agencies, schools, and community organizations" },
  { label: "Ad Budget", amount: 243000, description: "Paid acquisition to reach families before the next disaster" },
  { label: "Base44 Builder Subscription", amount: 2400, description: "App hosting, database, backend functions, and integrations (~$200/mo)" },
  { label: "Domain Registration (Name.com)", amount: 50, description: "Annual domain renewal" },
  { label: "Email & Communication Tools", amount: 350, description: "Resend, Telegram Bot infrastructure, and notification delivery" },
  { label: "Payment Processing & Buffer", amount: 2200, description: "Stripe transaction fees and contingency reserve. We participate in the Stripe Climate program — a portion of every transaction funds carbon removal projects." },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const cached = await readCachedPayload(sr, CACHE_KEY, TTL_MS);
    if (cached) return Response.json(cached);

    // Aggregate only — the donor rows themselves never leave the database.
    const totals = await sr.entities.Donation.aggregate({
      query: {},
      sum: ['amount_cents'],
    });
    const row = totals?.rows?.[0] || {};
    const totalRaised = row.sum_amount_cents || 0;

    const payload = {
      total_raised_cents: totalRaised,
      total_raised_display: `$${Math.floor(totalRaised / 100).toLocaleString('en-US')}`,
      goal_cents: ANNUAL_GOAL_CENTS,
      goal_display: `$${(ANNUAL_GOAL_CENTS / 100).toLocaleString('en-US')}`,
      progress_pct: Math.min(100, Math.round((totalRaised / ANNUAL_GOAL_CENTS) * 100)),
      donor_count: row.count || 0,
      operating_costs: OPERATING_COSTS,
      total_costs: OPERATING_COSTS.reduce((sum, c) => sum + c.amount, 0),
    };

    await writeCachedPayload(sr, CACHE_KEY, payload);

    return Response.json(payload);
  } catch (error) {
    console.error('getDonationProgress error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});