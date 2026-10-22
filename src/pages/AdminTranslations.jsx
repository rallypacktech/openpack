import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useTranslation } from "@/lib/TranslationContext";
import { TARGET_LOCALES } from "@/lib/translationLocales";
import { COLLECT_MODE_KEY } from "@/components/i18n/TranslationCollector";
import TranslationBudgetPanel from "@/components/admin/TranslationBudgetPanel";
import TranslationRow from "@/components/admin/TranslationRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, ScanSearch, AlertTriangle } from "lucide-react";

const STATUSES = [
  { value: "draft", label: "Awaiting review" },
  { value: "queued", label: "Not translated yet" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const currentMonthKey = () => new Date().toISOString().slice(0, 7);

export default function AdminTranslations() {
  const { locale: visitorLocale, setLocale } = useTranslation();
  const [authorized, setAuthorized] = useState(null);
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [locale, setTargetLocale] = useState(TARGET_LOCALES[0].code);
  const [status, setStatus] = useState("draft");
  const [entries, setEntries] = useState([]);
  const [counts, setCounts] = useState({});
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [collecting, setCollecting] = useState(() => {
    try {
      return localStorage.getItem(COLLECT_MODE_KEY) === "1";
    } catch (_e) {
      return false;
    }
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setReviewerEmail(me?.email || "");
        setAuthorized(me?.role === "admin");
      } catch (_e) {
        setAuthorized(false);
      }
    })();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [page, usageRows] = await Promise.all([
        base44.entities.TranslationEntry.filter(
          { locale, status },
          { sort: "-updated_date", limit: 50 }
        ),
        base44.entities.TranslationUsage.filter({ month_key: currentMonthKey() }),
      ]);
      setEntries(page?.items || []);
      setUsage(usageRows[0] || null);

      const tally = {};
      await Promise.all(
        STATUSES.map(async (s) => {
          tally[s.value] = await base44.entities.TranslationEntry.count({ locale, status: s.value });
        })
      );
      setCounts(tally);
    } finally {
      setLoading(false);
    }
  }, [locale, status]);

  useEffect(() => {
    if (authorized) load();
  }, [authorized, load]);

  const toggleCollect = (next) => {
    setCollecting(next);
    try {
      if (next) localStorage.setItem(COLLECT_MODE_KEY, "1");
      else localStorage.removeItem(COLLECT_MODE_KEY);
    } catch (_e) {
      /* storage unavailable */
    }
  };

  const handleTranslate = async () => {
    setTranslating(true);
    setMessage(null);
    try {
      const res = await base44.functions.invoke("translateContent", {
        action: "translate",
        locales: [locale],
      });
      const data = res?.data || {};
      if (data.reason) {
        setMessage({ tone: "warn", text: data.reason });
      } else {
        const parts = [`${data.translated} strings translated`];
        if (data.billed_chars) parts.push(`${data.billed_chars.toLocaleString()} characters billed`);
        if (data.deferred) parts.push(`${data.deferred} left for next time`);
        setMessage({ tone: "ok", text: parts.join(" · ") });
      }
      if (data.errors?.length) {
        setMessage({ tone: "warn", text: `DeepL reported: ${data.errors.join("; ")}` });
      }
      await load();
    } catch (error) {
      setMessage({ tone: "warn", text: error.message });
    } finally {
      setTranslating(false);
    }
  };

  if (authorized === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Translation Studio</h1>
        <p className="text-sm text-muted-foreground">This page is available to administrators only.</p>
      </div>
    );
  }

  const monthLabel = new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div data-no-translate className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Translation Studio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Collect public page copy, generate DeepL drafts, and publish reviewed wording.
        </p>
      </div>

      <TranslationBudgetPanel usage={usage} monthLabel={monthLabel} />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-4">
            <ScanSearch className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="collect-mode" className="text-sm font-medium">
                  Collect copy from pages I visit
                </Label>
                <Switch id="collect-mode" checked={collecting} onCheckedChange={toggleCollect} />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Turn this on, then browse each public page. Every English string is queued here for
                translation — nothing is sent to DeepL until you press translate.
              </p>
            </div>
          </div>

          {visitorLocale !== "en" && (
            <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
              <p className="text-xs text-amber-900">
                Your own interface is set to another language, so pages show translated text and
                nothing new can be collected.
                <button
                  onClick={() => setLocale("en")}
                  className="ml-1 font-semibold underline underline-offset-2"
                >
                  Switch back to English
                </button>
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Language</Label>
              <Select value={locale} onValueChange={setTargetLocale}>
                <SelectTrigger className="w-44 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_LOCALES.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Show</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-52 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                      {counts[option.value] !== undefined ? ` (${counts[option.value]})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleTranslate} disabled={translating}>
              {translating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate DeepL drafts
            </Button>
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.tone === "warn" ? "text-amber-700" : "text-emerald-700"
              }`}
            >
              {message.text}
            </p>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Nothing here yet. Turn on collection, browse a public page, then generate drafts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <TranslationRow
              key={entry.id}
              entry={entry}
              reviewerEmail={reviewerEmail}
              onSaved={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}