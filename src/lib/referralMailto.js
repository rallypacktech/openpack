import {
  REFERRAL_ORIGIN,
  BUSINESS_PATH,
  audienceLabel,
  freePathFor,
} from "@/lib/referralAudiences";

// A ready-to-send copy of a referral email, for the "send them a personal note
// too" option on the public referral form. The same two-option ladder the
// server template uses — free resident resources first, then the paid business
// dashboard.

export const REFERRAL_VOUCHER_CODE = "FIRSTMONTHFREE";

const OPENER =
  "The RallyPack Team thought your organization would benefit from RallyPack — free preparedness resources you can share, and a business dashboard for the operational side.";

export function buildReferralMailto({
  audience_type,
  referee_email,
  referee_name,
  organization_name,
  message,
  referrer_name,
}) {
  const label = audienceLabel(audience_type);
  const freeUrl = REFERRAL_ORIGIN + freePathFor(audience_type);
  const businessUrl = REFERRAL_ORIGIN + BUSINESS_PATH;

  const subject = `${organization_name ? organization_name + " — " : ""}Free preparedness resources, and a dashboard for the operational side`;

  const body = [
    `Hi${referee_name ? " " + referee_name : ""},`,
    "",
    OPENER,
    "",
    `RallyPack covers ${label.toLowerCase()} preparedness. There are two ways in, and the first one is free.`,
    "",
    "OPTION 1 — Free, for your members, staff and neighbours",
    "RallyPack is free and open-source. Anyone can build go-bags, document evacuation plans, log emergency supply caches, get real-time hazard alerts, and see how their neighbourhood ranks on the Readiness Map. No cost, and no account required.",
    freeUrl,
    "",
    "OPTION 2 — Paid, for your organization",
    "If your organization wants the business side — tracking first aid kits, AEDs, staff certifications and fire equipment across every location, with expiry reminders, documented evacuation plans and team-wide emergency alerts — that is a paid plan. Every feature is free for 7 days, then pick the plan that fits.",
    `Use code ${REFERRAL_VOUCHER_CODE} for your first month free.`,
    businessUrl,
    "",
    message ? `A note from ${referrer_name || "me"}: ${message}` : "",
    message ? "" : null,
    "Thanks,",
    referrer_name || "",
  ]
    .filter((line) => line !== null)
    .join("\n");

  return `mailto:${referee_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}