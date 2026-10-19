// Google Ads tag. Loaded only once the visitor has agreed to analytics, so no
// request leaves the browser before consent.

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
}