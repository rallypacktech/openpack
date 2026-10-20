// The approved RallyPack growth and engagement roadmap, phased sign-up-growth-first
// with explicit dependencies, success metrics and tradeoffs.
//
// Every phase carries a status — "complete", "in_progress" or "planned" — so the
// roadmap page can say plainly which phases are finished. Update the status here
// as work lands; the page reads it, it does not guess.
//
// Phase 1 (consent gate, conversion baseline, onboarding profile fix) is complete
// and has been retired — its dependencies below are now satisfied.
//
// Phase 3 (community & content depth) is complete and has been retired too:
// flood-mitigation, home-fire and community-drill resources are published, US and
// Canadian county/city/regional programs are listed on the Resources page, and the
// Red Cross tasks and trainings now run as user task recommendations on the dashboard.

export const ROADMAP_PHASES = [
  {
    id: "phase-1",
    label: "Phase 1 — Sign-up growth",
    status: "complete",
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
    status: "in_progress",
    signupLift: true,
    goal: "Convert Disasters Expo Texas contacts into partnerships and referrals by hand — never by cold blast.",
    items: [
      "Work the verified exhibitor and speaker list in the Expo Outreach tab, one conversation goal per contact.",
      "Record each prospect and its status so outreach stays auditable.",
      "Mirror the verified Expo contacts into the referral pipeline, tagged as Expo outreach so the scheduled referral emails skip them and outreach stays one conversation at a time.",
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
    id: "phase-4",
    label: "Phase 4 — Retention, multi-role & navigation",
    status: "complete",
    signupLift: false,
    goal: "Done. People can hold several roles at once without their records colliding, plans are shared by consent rather than copied, navigation holds up on a phone, and expiry reminders say what to actually do.",
    items: [
      "Account context is explicit: one person can be an individual, part of a household, and a member of several organisations, each with its own role and permissions.",
      "Plan sharing is a handshake — the owner offers access, the family member accepts or declines from their own account, and the plan is never duplicated. Each share records who invited whom and when, and the owner can withdraw it at any time.",
      "Primary and sub-navigation share one wrapping tab bar, so every dashboard stays usable on a narrow screen.",
      "Expiry reminders now separate safety-critical items — devices, certifications and medication — from ordinary supplies: the first are taken out of service and replaced with safe-disposal guidance, the second are checked and reused rather than thrown away.",
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
    status: "complete",
    signupLift: false,
    goal: "Done. The plan upgrade restored the backend functions, and every scheduled automation that calls them has been re-enabled, so alerts, wildfire refreshes, expiry reminders, referral outreach and the daily maintenance jobs all run again.",
    items: [
      "Upgraded the plan and re-enabled the backend functions and the workflows that call them — the eleven automations that had been paused are live again.",
      "Duplicate-incident, missing-hectares and validation reviews run on the restored automations.",
      "Moved the shared automation secret into the platform secret store, and bounded the public form endpoints server-side: fixed recipients, capped field sizes, escaped output, and race-safe daily submission limits.",
    ],
    metrics: [
      "Open data-quality findings closed",
      "Time to resolve a duplicate incident",
      "Scheduled automations completing without errors",
    ],
    dependsOn: [],
    tradeoff: "The upgrade adds recurring spend, but restores the automations and secure admin controls a manual path could not provide.",
  },
];