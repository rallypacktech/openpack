import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// 2026 annual operating goal — transparent breakdown of real costs
const ANNUAL_GOAL_CENTS = 125000 * 100;

const OPERATING_COSTS = [
  { label: "Founder & Developer Salary", amount: 120000, description: "Full-time development, maintenance, and user support" },
  { label: "Base44 Builder Subscription", amount: 2400, description: "App hosting, database, backend functions, and integrations (~$200/mo)" },
  { label: "Domain Registration (Name.com)", amount: 50, description: "Annual domain renewal" },
  { label: "Email & Communication Tools", amount: 350, description: "Resend, Telegram Bot infrastructure, and notification delivery" },
  { label: "Payment Processing & Buffer", amount: 2200, description: "Stripe transaction fees and contingency reserve. We participate in the Stripe Climate program — a portion of every transaction funds carbon removal projects." },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const donations = await base44.asServiceRole.entities.Donation.list();
    const totalRaised = donations.reduce((sum, d) => sum + (d.amount_cents || 0), 0);

    return Response.json({
      total_raised_cents: totalRaised,
      total_raised_display: `$${Math.floor(totalRaised / 100).toLocaleString('en-US')}`,
      goal_cents: ANNUAL_GOAL_CENTS,
      goal_display: `$${(ANNUAL_GOAL_CENTS / 100).toLocaleString('en-US')}`,
      progress_pct: Math.min(100, Math.round((totalRaised / ANNUAL_GOAL_CENTS) * 100)),
      donor_count: donations.length,
      operating_costs: OPERATING_COSTS,
      total_costs: OPERATING_COSTS.reduce((sum, c) => sum + c.amount, 0),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});