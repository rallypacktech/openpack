import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { FOOTER_ROUTES, SWEEP_LOCALES } from "@/lib/footerRoutes";
import { collectRouteStrings } from "@/lib/pageSweep";
import { COLLECT_MODE_KEY } from "@/components/i18n/TranslationCollector";
import { useTranslation } from "@/lib/TranslationContext";
import SweepResultList from "@/components/admin/SweepResultList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Loader2, ScanSearch, Square } from "lucide-react";

/** Walks every footer-linked public page and queues its copy for translation. */
export default function FooterSweepPanel({ onFinished }) {
  const { locale, setLocale } = useTranslation();
  const englishOnly = locale === "en";
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState(null);
  const cancelled = useRef(false);

  const run = async () => {
    cancelled.current = false;
    setRunning(true);
    setResults([]);
    setMessage(null);

    // The sweep drives collection itself for one fixed language set, so the
    // browse-as-you-go collector is paused for its duration and put back after.
    let previousFlag = null;
    try {
      previousFlag = localStorage.getItem(COLLECT_MODE_KEY);
      localStorage.removeItem(COLLECT_MODE_KEY);
    } catch (_e) {
      /* storage unavailable */
    }

    const collected = [];
    let total = 0;
    let failure = null;

    try {
      for (const route of FOOTER_ROUTES) {
        if (cancelled.current) break;
        const strings = await collectRouteStrings(route.path);
        let added = 0;
        if (strings.length) {
          try {
            const res = await base44.functions.invoke("translateContent", {
              action: "collect",
              page_key: route.path,
              strings,
              locales: SWEEP_LOCALES,
            });
            added = res?.data?.added || 0;
          } catch (error) {
            failure = `${route.label}: ${error.message}`;
          }
        }
        total += added;
        collected.push({ path: route.path, label: route.label, strings: strings.length, added });
        setResults([...collected]);
      }
    } finally {
      try {
        if (previousFlag === null) localStorage.removeItem(COLLECT_MODE_KEY);
        else localStorage.setItem(COLLECT_MODE_KEY, previousFlag);
      } catch (_e) {
        /* non-fatal */
      }
      setRunning(false);
      onFinished?.();
    }

    setMessage({
      tone: failure ? "warn" : "ok",
      text:
        failure ||
        `${collected.length} of ${FOOTER_ROUTES.length} pages walked · ${total.toLocaleString()} new strings queued for ${SWEEP_LOCALES.length} languages.`,
    });
  };

  const percent = Math.round((results.length / FOOTER_ROUTES.length) * 100);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <ScanSearch className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
          <div className="flex-1">
            <h2 className="font-serif text-lg font-bold text-foreground">Footer page sweep</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Opens each of the {FOOTER_ROUTES.length} pages linked in the site footer, collects its
              English copy, and queues it for {SWEEP_LOCALES.length} languages. Nothing is sent to
              DeepL until you translate.
            </p>
          </div>
        </div>

        {!englishOnly && (
          <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
            <p className="text-xs text-amber-900">
              Your interface is set to another language, so pages render translated text and the
              English source cannot be collected.
              <button
                onClick={() => setLocale("en")}
                className="ml-1 font-semibold underline underline-offset-2"
              >
                Switch back to English
              </button>
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {running ? (
            <Button variant="outline" onClick={() => { cancelled.current = true; }}>
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          ) : (
            <Button onClick={run} disabled={!englishOnly}>
              <ScanSearch className="w-4 h-4 mr-2" />
              Collect footer pages
            </Button>
          )}
          {running && (
            <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {results.length} / {FOOTER_ROUTES.length} pages
            </span>
          )}
        </div>

        {running && <Progress value={percent} className="h-1.5" />}

        {message && (
          <p className={`text-sm ${message.tone === "warn" ? "text-amber-700" : "text-emerald-700"}`}>
            {message.text}
          </p>
        )}

        <SweepResultList results={results} />
      </CardContent>
    </Card>
  );
}