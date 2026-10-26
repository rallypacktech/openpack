import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { hasConsent, subscribeConsent } from "@/lib/consent";
import { loadGtag, trackPageView } from "@/lib/gtag";

// Sends one Analytics page_view per route change. Nothing is sent before the
// visitor agrees to analytics.
export default function AnalyticsPageViews() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!hasConsent()) return;
    loadGtag();
    trackPageView(pathname, search);
  }, [pathname, search]);

  // A visitor who has just agreed should have the page they are on counted.
  useEffect(
    () =>
      subscribeConsent(() => {
        if (!hasConsent()) return;
        loadGtag();
        trackPageView(pathname, search);
      }),
    [pathname, search],
  );

  return null;
}