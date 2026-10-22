import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "@/lib/TranslationContext";
import { applyTranslations } from "@/lib/domTranslate";

/**
 * Applies the approved dictionary to whatever is on screen. Mounted once inside
 * the router, so it covers every public page without each page knowing about it.
 * Text React re-renders is picked up again by the observer.
 */
export default function DomTranslation() {
  const { dictionary, locale } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    if (locale === "en" || dictionary.size === 0) return undefined;

    let frame = null;
    const run = () => {
      frame = null;
      applyTranslations(document.body, dictionary);
    };
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(run);
    };

    run();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [dictionary, locale, location.pathname]);

  return null;
}