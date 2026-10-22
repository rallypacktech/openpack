import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { readStoredLocale, writeStoredLocale } from "@/lib/translationLocales";

const TranslationContext = createContext(null);

const CACHE_TTL_MS = 10 * 60 * 1000;
const cacheKey = (locale) => `rallypack_translations_${locale}`;

function readCache(locale) {
  try {
    const raw = localStorage.getItem(cacheKey(locale));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.entries)) return null;
    return parsed;
  } catch (_e) {
    return null;
  }
}

function writeCache(locale, entries) {
  try {
    localStorage.setItem(cacheKey(locale), JSON.stringify({ fetchedAt: Date.now(), entries }));
  } catch (_e) {
    /* storage unavailable — the dictionary simply reloads next visit */
  }
}

/**
 * Holds the visitor's chosen language and the approved translation dictionary
 * for it. Approved translations are cached so a page never waits on a network
 * round trip before it can render in the chosen language.
 */
export function TranslationProvider({ children }) {
  const [locale, setLocaleState] = useState(() => readStoredLocale());
  const [dictionary, setDictionary] = useState(() => new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    let cancelled = false;

    if (locale === "en") {
      setDictionary(new Map());
      setLoading(false);
      return () => { cancelled = true; };
    }

    const cached = readCache(locale);
    if (cached) {
      setDictionary(new Map(cached.entries.map((e) => [e.source, e.text])));
      const fresh = Date.now() - cached.fetchedAt < CACHE_TTL_MS;
      if (fresh) {
        setLoading(false);
        return () => { cancelled = true; };
      }
    } else {
      setDictionary(new Map());
    }

    setLoading(true);
    base44.functions
      .invoke("getTranslations", { locale })
      .then((res) => {
        if (cancelled) return;
        const entries = res?.data?.entries || [];
        setDictionary(new Map(entries.map((e) => [e.source, e.text])));
        writeCache(locale, entries);
      })
      .catch(() => {
        /* keep whatever is cached rather than dropping the visitor to English */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [locale]);

  const setLocale = useCallback((next) => {
    setLocaleState(next);
    writeStoredLocale(next);
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, dictionary, loading, hasTranslations: dictionary.size > 0 }),
    [locale, setLocale, dictionary, loading]
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error("useTranslation must be used inside TranslationProvider");
  return ctx;
}