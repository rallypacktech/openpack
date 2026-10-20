// The approved RallyPack growth and engagement roadmap, phased sign-up-growth-first
// with explicit dependencies, success metrics and tradeoffs.
//
// Phase 1 (consent gate, conversion baseline, onboarding profile fix) is complete
// and has been retired — its dependencies below are now satisfied.

export const ROADMAP_PHASES = [
  {
    id: "phase-1",
    label: "Phase 1 — Sign-up growth",
    signupLift: true,
    goal: "Turn search traffic and business interest into accounts — the highest-priority work now that measurement is sound.",
    items: [
      "Publish volunteer-targeted preparedness content (the Level 1 volunteer goal) optimised for search.",
      "Make the readiness map the primary neighbourhood CTA across public pages.",
      "Surface wildfire trends prominently on Business Onboarding.",
      "Ship the business compliance quiz with a tailored trial CTA (FIRSTMONTHFREE).",
      "Keep the two-option CTA on every referral email: free resident resources and the paid business dashboard.",
    ],
    metrics: [
      "Organic sessions → readiness-quiz starts",
      "Quiz starts → sign-ups",
      "Business quiz completions → trial starts",
    ],
    dependsOn: [],
    tradeoff: "The business trial focus can dilute the free-resident funnel — keep both CTAs on every touchpoint.",
  },
  {
    id: "phase-2",
    label: "Phase 2 — Expo follow-up (manual outreach)",
    signupLift: true,
    goal: "Convert Disasters Expo Texas contacts into partnerships and referrals by hand — never by cold blast.",
    items: [
      "Work the verified exhibitor and speaker list in the Expo Outreach tab, one conversation goal per contact.",
      "Record each prospect and its status so outreach stays auditable.",
      "Route financial-aid organisations to trusted-resource links with eligibility disclaimers, not partnership claims.",
    ],
    metrics: [
      "Prospects recorded per week",
      "Conversations started → partnerships or referrals",
      "Zero unsolicited bulk sends",
    ],
    dependsOn: ["Verified Expo contact data", "Phase 1 landing pages worth sending them to"],
    tradeoff: "Manual outreach caps volume — that is the point; it protects deliverability and reputation.",
  },
  {
    id: "phase-3",
    label: "Phase 3 — Community & content depth",
    signupLift: false,
    goal: "Give every hazard audience a concrete next step, not just information.",
    items: [
      "Publish the flood-mitigation, home-fire and community-drill resources — now live on the public Resources page.",
      "Add US and Canadian county, city and regional emergency programs as further community examples.",
      "Expand Red Cross preparedness tasks and trainings into user task recommendations.",
    ],
    metrics: [
      "Outbound clicks per resource",
      "Share of flood-region users who open a mitigation resource",
      "Volunteer-intent conversions",
    ],
    dependsOn: ["Phase 1 public content structure"],
    tradeoff: "Verification slows publishing — publish nothing unconfirmed.",
  },
  {
    id: "phase-4",
    label: "Phase 4 — Retention, multi-role & navigation",
    signupLift: false,
    goal: "Keep the users you won, without confusing their records.",
    items: [
      "Model account context explicitly: individual, household, and multiple organisation affiliations, with role-based access and auditable sharing.",
      "Let a person accept shared access to a family member's plan while keeping control of their own — never duplicating plans.",
      "Standardise primary and sub-navigation across every dashboard so it wraps cleanly on narrow screens.",
      "Frame expiry reminders sensitively: safe disposal and replacement for anything safety-critical, reuse only for non-critical items.",
    ],
    metrics: [
      "Multi-role accounts created",
      "Cross-dashboard navigation drop-off",
      "Expiry-reminder action rate",
    ],
    dependsOn: [],
    tradeoff: "Multi-role modelling touches identity and data — sequence it carefully, with sharing auditable from day one.",
  },
  {
    id: "phase-5",
    label: "Phase 5 — Admin data quality (backend functions restored)",
    signupLift: false,
    goal: "Backend functions are being restored through the plan upgrade, so the scheduled automations and admin tooling can run at full strength again.",
    items: [
      "Upgrade the plan and re-enable the backend functions and the workflows that call them.",
      "Keep duplicate-incident, missing-hectares and validation reviews running on the restored automations.",
      "Move the shared automation secret into the platform secret store and require server-side auth on the public form endpoints.",
    ],
    metrics: [
      "Open data-quality findings closed",
      "Time to resolve a duplicate incident",
      "Scheduled automations completing without errors",
    ],
    dependsOn: ["Plan upgrade completed"],
    tradeoff: "The upgrade adds recurring spend, but restores the automations and secure admin controls a manual path could not provide.",
  },
];