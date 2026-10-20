import { base44 } from "@/api/base44Client";
import { invokeWithFallback } from "@/lib/planLimits";
import {
  REFERRAL_ORIGIN,
  BUSINESS_PATH,
  audienceLabel,
  freePathFor,
} from "@/lib/referralAudiences";

// Backend functions answer with a 402 on the current plan, so every referral
// flow keeps a client-side path: the referral is recorded in the app, and the
// email is handed to the sender's own mail client with the same two-option
// ladder the server template uses — free resident resources first, then the paid
// business dashboard. No referral is ever lost to a plan limit.

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

// Records the referral so it still appears in the admin referral list.
export async function recordReferralFallback(payload, source = "manual_outreach") {
  const me = await base44.auth.me().catch(() => null);
  return base44.entities.BusinessReferral.create({
    referee_email: payload.referee_email,
    referee_name: payload.referee_name || "",
    organization_name: payload.organization_name || "",
    message: payload.message || "",
    referrer_name: payload.referrer_name || me?.full_name || "",
    referrer_email: payload.referrer_email || me?.email || "",
    audience_type: payload.audience_type || "general",
    source,
    status: "pending",
  });
}

// Hand the prepared email to the sender's own mail client. A real anchor click
// survives pop-up blockers where window.open does not.
export function openMailto(url) {
  if (!url) return;
  const link = document.createElement("a");
  link.href = url;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Send a referral email, falling back to a recorded referral plus a ready-to-send
// message when the plan does not include backend functions. Returns the same
// shape the function returns, so callers render one result view either way.
export async function sendReferralEmail(formData) {
  return invokeWithFallback("adminReferBusiness", formData, async () => {
    let recorded = false;
    try {
      await recordReferralFallback(formData);
      recorded = true;
    } catch (_e) {
      recorded = false;
    }
    return {
      message: recorded
        ? "Referral saved to your list. RallyPack's email service isn't available on this plan, so send it from your own mail client with the button below."
        : "RallyPack's email service isn't available on this plan. Send this referral from your own mail client with the button below.",
      audience: audienceLabel(formData.audience_type || "general"),
      mailto_url: buildReferralMailto(formData),
      used_fallback: true,
    };
  });
}