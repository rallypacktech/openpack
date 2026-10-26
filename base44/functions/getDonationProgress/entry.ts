import { createClientFromRequest } from 'npm:@base44/sdk@0.8.53';
import { readCachedPayload, writeCachedPayload } from '../../shared/reportCache.ts';

// Public, unauthenticated endpoint: the fundraising thermometer on the public
// Donate and Home pages. It must never expose donor records, so the totals are
// computed with a server-side aggregate — no individual Donation (and therefore
// no donor name, email, or amount) is ever read into this function. The result
// is snapshotted so anonymous traffic cannot drive one aggregate per visitor.

// Preseed funding goal — transparent breakdown of real costs
const ANNUAL_GOAL_CENTS = 150000 * 100;
const CACHE_KEY = 'donation_progress';
const TTL_MS = 10 * 60 * 1000; // 10 minutes

// A lean, founder-led pre-seed: 12 months of runway with no full-time hires.
const OPERATING_COSTS = [
  { label: "Founder-led product & engineering", amount: 45000, description: "Part-time founder stipend covering product, engineering and support — no headcount this year" },
  { label: "Hosting & platform", amount: 6000, description: "Base44 app hosting, database, backend functions, maps and file storage (~$500/mo)" },
  { label: "Disaster data & API feeds", amount: 9000, description: "OpenFEMA, NOAA, wildfire and weather feeds plus translation and AI integration credits" },
  { label: "Security, legal & compliance", amount: 12000, description: "Privacy policy, data processing agreements, entity setup and a security review organizations ask for before they buy" },
  { label: "Go-to-market & organization pilots", amount: 48000, description: "Pilots with fire districts, schools and multi-location employers, plus content and search — the cheapest acquisition channel we have" },
  { label: "Design & content contractors", amount: 12000, description: "Contract design and copy work, no full-time hires" },
  { label: "Contingency reserve", amount: 18000, description: "Roughly one month of runway held back for the unexpected. A portion of every payment also funds carbon removal through the Stripe Climate program." },
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