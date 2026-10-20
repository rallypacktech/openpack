import { base44 } from "@/api/base44Client";
import { hasConsent } from "./consent";

// Baseline funnel events for the growth roadmap: quiz start → sign-up → first
// cache created. Nothing fires until the visitor has agreed to analytics, so
// these numbers describe consenting visitors only.

export const FUNNEL = {
  QUIZ_STARTED: "readiness_quiz_started",
  SIGNUP_COMPLETED: "signup_completed",
  FIRST_CACHE_CREATED: "first_cache_created",
  BUSINESS_QUIZ_COMPLETED: "business_quiz_completed",
};

export function trackFunnel(eventName, properties = {}) {
  if (!hasConsent()) return;
  try {
    Promise.resolve(base44.analytics.track({ eventName, properties })).catch(
      () => {},
    );
  } catch (_e) {
    /* analytics must never break a flow */
  }
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, properties);
    }
  } catch (_e) {
    /* non-fatal */
  }
}