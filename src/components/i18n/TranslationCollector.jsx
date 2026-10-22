import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useTranslation } from "@/lib/TranslationContext";
import { collectSourceStrings } from "@/lib/domTranslate";
import { TARGET_LOCALES } from "@/lib/translationLocales";

export const COLLECT_MODE_KEY = "rallypack_translation_collect";

/**
 * Pre-translation collection. When an administrator turns on collect mode in the
 * Translation Studio, each public page they visit reports its English strings to
 * the queue. Nothing is translated here and visitors never trigger this — the
 * translation itself happens later, in one budget-checked batch.
 */
export default function TranslationCollector() {
  const { locale } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    // Collection reads English source copy — never run it on a translated page.
    if (locale !== "en") return undefined;

    let enabled = false;
    try {
      enabled = localStorage.getItem(COLLECT_MODE_KEY) === "1";
    } catch (_e) {
      return undefined;
    }
    if (!enabled) return undefined;

    const marker = `rallypack_collected_${location.pathname}`;
    try {
      if (sessionStorage.getItem(marker)) return undefined;
    } catch (_e) {
      /* storage unavailable — collect once per mount instead */
    }

    const timer = setTimeout(async () => {
      const strings = collectSourceStrings(document.body);
      if (!strings.length) return;
      try {
        sessionStorage.setItem(marker, "1");
      } catch (_e) {
        /* non-fatal */
      }
      try {
        await base44.functions.invoke("translateContent", {
          action: "collect",
          page_key: location.pathname,
          strings,
          locales: TARGET_LOCALES.map((l) => l.code),
        });
      } catch (_e) {
        try {
          sessionStorage.removeItem(marker);
        } catch (_e2) {
          /* non-fatal */
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [location.pathname, locale]);

  return null;
}