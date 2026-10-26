// Google tag loader for Google Analytics 4 and Google Ads. Loaded only once the
// visitor has agreed to analytics, so no request leaves the browser before consent.
import { hasConsent } from "./consent";

export const GA4_MEASUREMENT_ID = "G-S98FCD38J6";

export function loadGtag() {
  if (typeof window === "undefined" || window.__gads_loaded) return;
  window.__gads_loaded = true;
  window.dataLayer = window.dataLayer || [];
  const inIframe = (() => {
    try {
      return window.self !== window.top;
    } catch (_e) {
      return true;
    }
  })();
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
    if (inIframe) {
      try {
        const args = Array.prototype.slice.call(arguments);
        const cmd = args[0];
        window.parent.postMessage(
          {
            type: "base44_gtag_event",
            event: {
              source: "gtag",
              timestamp: new Date().toLocaleTimeString(),
              command: cmd,
              params: args.slice(1),
              type: cmd === "event" ? args[1] || "event" : cmd,
            },
          },
          "*",
        );
      } catch (_e) {
        /* relay must not break gtag */
      }
    }
  };
  const s = document.createElement("script");
  s.src = "https://www.googletagmanager.com/gtag/js?id=AW-18405445520";
  s.async = true;
  document.head.appendChild(s);
  window.gtag("js", new Date());
  window.gtag("config", "AW-18405445520", { send_page_view: false });
  window.gtag("config", GA4_MEASUREMENT_ID, { send_page_view: false });
}

// A single-page app does not reload the document between routes, so each
// navigation is sent as its own page_view — that is what makes navigation
// patterns and per-page usage measurable.
export function trackPageView(pathname, search = "") {
  if (typeof window === "undefined" || !window.gtag || !hasConsent()) return;
  window.gtag("event", "page_view", {
    page_path: `${pathname}${search || ""}`,
    page_location: window.location.href,
    page_title: document.title,
  });
}