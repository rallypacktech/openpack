import React from "react";
import { useTranslation } from "@/lib/TranslationContext";
import { TRANSLATION_LOCALES } from "@/lib/translationLocales";
import LanguagePicker from "@/components/i18n/LanguagePicker";

/** Lets a visitor read the public pages in their own language. */
export default function LanguageSwitcher({ className = "" }) {
  const { locale, setLocale } = useTranslation();

  return (
    <div data-no-translate className={className}>
      <LanguagePicker
        locales={TRANSLATION_LOCALES}
        value={locale}
        onChange={setLocale}
        showIcon
        className="h-8 max-w-[9rem] border border-border bg-transparent px-2"
      />
    </div>
  );
}