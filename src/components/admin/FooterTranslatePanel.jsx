import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SWEEP_LOCALES } from "@/lib/footerRoutes";
import FooterCoverageList from "@/components/admin/FooterCoverageList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

const RESERVE_DEFAULT = 20000;

/** Translates the queued footer copy, drawing on the held-back reserve. */
export default function FooterTranslatePanel({ usage, onFinished }) {
  const [coverage, setCoverage] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [message, setMessage] = useState(null);

  const loadCoverage = useCallback(async () => {
    const [queued, drafts] = await Promise.all([
      base44.entities.TranslationEntry.aggregate({
        query: { status: "queued", locale: { $in: SWEEP_LOCALES } },
        groupBy: "locale",
      }),
      base44.entities.TranslationEntry.aggregate({
        query: { status: "draft", locale: { $in: SWEEP_LOCALES } },
        groupBy: "locale",
      }),
    ]);
    const toMap = (rows) => new Map((rows || []).map((row) => [row.locale, row.count]));
    const queuedMap = toMap(queued?.rows);
    const draftMap = toMap(drafts?.rows);
    setCoverage(
      SWEEP_LOCALES.map((code) => ({
        code,
        queued: queuedMap.get(code) || 0,
        drafts: draftMap.get(code) || 0,
      }))
    );
  }, []);

  useEffect(() => {
    loadCoverage();
  }, [loadCoverage]);

  const reserveLeft = Math.max(
    0,
    (usage?.chat_reserve ?? RESERVE_DEFAULT) - (usage?.chat_chars_used || 0)
  );

  const handleTranslate = async () => {
    setTranslating(true);
    setMessage(null);
    try {
      const res = await base44.functions.invoke("translateContent", {
        action: "translate",
        locales: SWEEP_LOCALES,
        allow_reserve: true,
      });
      const data = res?.data || {};
      if (data.reason) {
        setMessage({ tone: "warn", text: data.reason });
      } else {
        const parts = [`${data.translated} strings translated`];
        if (data.billed_chars) parts.push(`${data.billed_chars.toLocaleString()} characters billed`);
        if (data.reserve_used) parts.push(`${data.reserve_used.toLocaleString()} from the reserve`);
        if (data.deferred) parts.push(`${data.deferred} left queued`);
        setMessage({ tone: "ok", text: parts.join(" · ") });
      }
      if (data.errors?.length) {
        setMessage({ tone: "warn", text: `DeepL reported: ${data.errors.join("; ")}` });
      }
      await loadCoverage();
      onFinished?.();
    } catch (error) {
      setMessage({ tone: "warn", text: error.message });
    } finally {
      setTranslating(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-foreground">Footer languages</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Translates the queued copy for these {SWEEP_LOCALES.length} languages. The page budget is
            unchanged — this run may draw on the {reserveLeft.toLocaleString()} characters still held
            in reserve this month.
          </p>
        </div>

        <Button onClick={handleTranslate} disabled={translating}>
          {translating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Translate footer languages
        </Button>

        {message && (
          <p className={`text-sm ${message.tone === "warn" ? "text-amber-700" : "text-emerald-700"}`}>
            {message.text}
          </p>
        )}

        <FooterCoverageList coverage={coverage} />
      </CardContent>
    </Card>
  );
}