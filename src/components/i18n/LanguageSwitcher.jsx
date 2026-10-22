import React from "react";
import { Languages } from "lucide-react";
import { useTranslation } from "@/lib/TranslationContext";
import { TRANSLATION_LOCALES } from "@/lib/translationLocales";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** Lets a visitor read the public pages in their own language. */
export default function LanguageSwitcher({ className = "" }) {
  const { locale, setLocale } = useTranslation();

  return (
    <div data-no-translate className={className}>
      <Select value={locale} onValueChange={setLocale}>
        <SelectTrigger
          className="h-8 w-auto gap-1.5 border-border bg-transparent px-2 text-xs font-sans text-muted-foreground hover:text-foreground"
          aria-label="Choose language"
        >
          <Languages className="h-3.5 w-3.5" aria-hidden="true" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TRANSLATION_LOCALES.map((option) => (
            <SelectItem key={option.code} value={option.code} className="text-sm">
              {option.native}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}