import { useEffect } from "react";
import { hasConsent } from "@/lib/consent";
import { trackFunnel, FUNNEL } from "@/lib/funnel";

// Baseline funnel: the first cache a person builds. Recorded once per account,
// and only for visitors who agreed to analytics.
export function useFirstCacheMilestone(currentUser, caches, ready) {
  useEffect(() => {
    if (!ready || !currentUser || caches.length === 0) return;
    if (!hasConsent()) return;
    const key = `rallypack_first_cache_${currentUser.id}`;
    if (localStorage.getItem(key)) return;
    trackFunnel(FUNNEL.FIRST_CACHE_CREATED, { cache_count: caches.length });
    localStorage.setItem(key, "1");
  }, [ready, currentUser, caches]);
}