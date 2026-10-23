import { collectSourceStrings } from "@/lib/domTranslate";

// How long a route is given to render after its document loads. Data-backed
// pages fetch on mount, so the strings are not all in the DOM immediately.
const SETTLE_MS = 2500;
const LOAD_TIMEOUT_MS = 15000;

/**
 * Renders one app route in an off-screen iframe and returns the English
 * strings on it. Same origin, so the iframe document is readable and the
 * signed-in admin's session carries into it.
 */
export function collectRouteStrings(path) {
  return new Promise((resolve) => {
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.setAttribute("tabindex", "-1");
    frame.style.cssText =
      "position:fixed;left:-10000px;top:0;width:1280px;height:900px;border:0;visibility:hidden";
    frame.src = path;

    let settled = false;
    let hardStop = null;

    const finish = () => {
      if (settled) return;
      settled = true;
      if (hardStop) clearTimeout(hardStop);
      let strings = [];
      try {
        const doc = frame.contentDocument;
        if (doc && doc.body) strings = collectSourceStrings(doc.body);
      } catch (_e) {
        strings = [];
      }
      frame.remove();
      resolve(strings);
    };

    hardStop = setTimeout(finish, LOAD_TIMEOUT_MS);
    frame.onload = () => setTimeout(finish, SETTLE_MS);
    frame.onerror = finish;
    document.body.appendChild(frame);
  });
}