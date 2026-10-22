// Supported interface languages. `en` is the source language of every page —
// nothing is translated for it, the original copy is shown as written.
export const TRANSLATION_LOCALES = [
  { code: "en", label: "English", native: "English", deepl: null },
  { code: "fr", label: "French", native: "Français", deepl: "FR" },
  { code: "es", label: "Spanish", native: "Español", deepl: "ES" },
  { code: "de", label: "German", native: "Deutsch", deepl: "DE" },
  { code: "it", label: "Italian", native: "Italiano", deepl: "IT" },
  { code: "zh", label: "Mandarin", native: "中文", deepl: "ZH" },
  { code: "ja", label: "Japanese", native: "日本語", deepl: "JA" },
];

// Languages that get machine drafts. English is the source, never a target.
export const TARGET_LOCALES = TRANSLATION_LOCALES.filter((l) => l.deepl);

export const LOCALE_STORAGE_KEY = "rallypack_locale";

export function localeLabel(code) {
  const match = TRANSLATION_LOCALES.find((l) => l.code === code);
  return match ? match.label : code;
}

export function readStoredLocale() {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && TRANSLATION_LOCALES.some((l) => l.code === stored)) return stored;
  } catch (_e) {
    /* storage unavailable — fall through to the source language */
  }
  return "en";
}

export function writeStoredLocale(code) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, code);
  } catch (_e) {
    /* storage unavailable — the choice simply won't persist */
  }
}