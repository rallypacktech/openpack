// Supported interface languages. `en` is the source language of every page —
// nothing is translated for it, the original copy is shown as written.
//
// `code` is the tag stored on the visitor's device and on each TranslationEntry.
// `deepl` is the DeepL target code that produces the machine draft. Every DeepL
// target language is listed here so any visitor country is covered. English is
// never a target, and DeepL's English variants are omitted for that reason.
export const TRANSLATION_LOCALES = [
  { code: "en", label: "English", native: "English", deepl: null },

  { code: "af", label: "Afrikaans", native: "Afrikaans", deepl: "AF" },
  { code: "sq", label: "Albanian", native: "Shqip", deepl: "SQ" },
  { code: "ar", label: "Arabic", native: "العربية", deepl: "AR" },
  { code: "an", label: "Aragonese", native: "Aragonés", deepl: "AN" },
  { code: "hy", label: "Armenian", native: "Հայերեն", deepl: "HY" },
  { code: "as", label: "Assamese", native: "অসমীয়া", deepl: "AS" },
  { code: "ay", label: "Aymara", native: "Aymar aru", deepl: "AY" },
  { code: "az", label: "Azerbaijani", native: "Azərbaycanca", deepl: "AZ" },
  { code: "ba", label: "Bashkir", native: "Башҡортса", deepl: "BA" },
  { code: "eu", label: "Basque", native: "Euskara", deepl: "EU" },
  { code: "be", label: "Belarusian", native: "Беларуская", deepl: "BE" },
  { code: "bn", label: "Bengali", native: "বাংলা", deepl: "BN" },
  { code: "bho", label: "Bhojpuri", native: "भोजपुरी", deepl: "BHO" },
  { code: "bs", label: "Bosnian", native: "Bosanski", deepl: "BS" },
  { code: "br", label: "Breton", native: "Brezhoneg", deepl: "BR" },
  { code: "bg", label: "Bulgarian", native: "Български", deepl: "BG" },
  { code: "my", label: "Burmese", native: "မြန်မာ", deepl: "MY" },
  { code: "yue", label: "Cantonese", native: "粵語", deepl: "YUE" },
  { code: "ca", label: "Catalan", native: "Català", deepl: "CA" },
  { code: "ceb", label: "Cebuano", native: "Cebuano", deepl: "CEB" },
  { code: "zh-Hans", label: "Chinese (simplified)", native: "简体中文", deepl: "ZH-HANS" },
  { code: "zh-Hant", label: "Chinese (traditional)", native: "繁體中文", deepl: "ZH-HANT" },
  { code: "zh", label: "Chinese (unspecified)", native: "中文", deepl: "ZH" },
  { code: "hr", label: "Croatian", native: "Hrvatski", deepl: "HR" },
  { code: "cs", label: "Czech", native: "Čeština", deepl: "CS" },
  { code: "da", label: "Danish", native: "Dansk", deepl: "DA" },
  { code: "prs", label: "Dari", native: "دری", deepl: "PRS" },
  { code: "nl", label: "Dutch", native: "Nederlands", deepl: "NL" },
  { code: "eo", label: "Esperanto", native: "Esperanto", deepl: "EO" },
  { code: "et", label: "Estonian", native: "Eesti", deepl: "ET" },
  { code: "fi", label: "Finnish", native: "Suomi", deepl: "FI" },
  { code: "fr", label: "French", native: "Français", deepl: "FR" },
  { code: "fr-CA", label: "French (Canadian)", native: "Français (Canada)", deepl: "FR-CA" },
  { code: "fr-FR", label: "French (France)", native: "Français (France)", deepl: "FR-FR" },
  { code: "gl", label: "Galician", native: "Galego", deepl: "GL" },
  { code: "ka", label: "Georgian", native: "ქართული", deepl: "KA" },
  { code: "de", label: "German", native: "Deutsch", deepl: "DE" },
  { code: "de-DE", label: "German (Germany)", native: "Deutsch (Deutschland)", deepl: "DE-DE" },
  { code: "de-CH", label: "German (Swiss)", native: "Deutsch (Schweiz)", deepl: "DE-CH" },
  { code: "el", label: "Greek", native: "Ελληνικά", deepl: "EL" },
  { code: "gn", label: "Guarani", native: "Avañe'ẽ", deepl: "GN" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", deepl: "GU" },
  { code: "ht", label: "Haitian Creole", native: "Kreyòl ayisyen", deepl: "HT" },
  { code: "ha", label: "Hausa", native: "Hausa", deepl: "HA" },
  { code: "he", label: "Hebrew", native: "עברית", deepl: "HE" },
  { code: "hi", label: "Hindi", native: "हिन्दी", deepl: "HI" },
  { code: "hu", label: "Hungarian", native: "Magyar", deepl: "HU" },
  { code: "is", label: "Icelandic", native: "Íslenska", deepl: "IS" },
  { code: "ig", label: "Igbo", native: "Igbo", deepl: "IG" },
  { code: "id", label: "Indonesian", native: "Bahasa Indonesia", deepl: "ID" },
  { code: "ga", label: "Irish", native: "Gaeilge", deepl: "GA" },
  { code: "it", label: "Italian", native: "Italiano", deepl: "IT" },
  { code: "ja", label: "Japanese", native: "日本語", deepl: "JA" },
  { code: "jv", label: "Javanese", native: "Basa Jawa", deepl: "JV" },
  { code: "pam", label: "Kapampangan", native: "Kapampangan", deepl: "PAM" },
  { code: "kk", label: "Kazakh", native: "Қазақша", deepl: "KK" },
  { code: "gom", label: "Konkani", native: "कोंकणी", deepl: "GOM" },
  { code: "ko", label: "Korean", native: "한국어", deepl: "KO" },
  { code: "kmr", label: "Kurdish (Kurmanji)", native: "Kurdî", deepl: "KMR" },
  { code: "ckb", label: "Kurdish (Sorani)", native: "کوردی", deepl: "CKB" },
  { code: "ky", label: "Kyrgyz", native: "Кыргызча", deepl: "KY" },
  { code: "la", label: "Latin", native: "Latina", deepl: "LA" },
  { code: "lv", label: "Latvian", native: "Latviešu", deepl: "LV" },
  { code: "ln", label: "Lingala", native: "Lingála", deepl: "LN" },
  { code: "lt", label: "Lithuanian", native: "Lietuvių", deepl: "LT" },
  { code: "lmo", label: "Lombard", native: "Lombard", deepl: "LMO" },
  { code: "lb", label: "Luxembourgish", native: "Lëtzebuergesch", deepl: "LB" },
  { code: "mk", label: "Macedonian", native: "Македонски", deepl: "MK" },
  { code: "mai", label: "Maithili", native: "मैथिली", deepl: "MAI" },
  { code: "mg", label: "Malagasy", native: "Malagasy", deepl: "MG" },
  { code: "ms", label: "Malay", native: "Bahasa Melayu", deepl: "MS" },
  { code: "ml", label: "Malayalam", native: "മലയാളം", deepl: "ML" },
  { code: "mt", label: "Maltese", native: "Malti", deepl: "MT" },
  { code: "mi", label: "Maori", native: "Te Reo Māori", deepl: "MI" },
  { code: "mr", label: "Marathi", native: "मराठी", deepl: "MR" },
  { code: "mn", label: "Mongolian", native: "Монгол", deepl: "MN" },
  { code: "ne", label: "Nepali", native: "नेपाली", deepl: "NE" },
  { code: "nb", label: "Norwegian (bokmål)", native: "Norsk bokmål", deepl: "NB" },
  { code: "oc", label: "Occitan", native: "Occitan", deepl: "OC" },
  { code: "om", label: "Oromo", native: "Afaan Oromoo", deepl: "OM" },
  { code: "pag", label: "Pangasinan", native: "Pangasinan", deepl: "PAG" },
  { code: "ps", label: "Pashto", native: "پښتو", deepl: "PS" },
  { code: "fa", label: "Persian", native: "فارسی", deepl: "FA" },
  { code: "pl", label: "Polish", native: "Polski", deepl: "PL" },
  { code: "pt-BR", label: "Portuguese (Brazilian)", native: "Português (Brasil)", deepl: "PT-BR" },
  { code: "pt-PT", label: "Portuguese (European)", native: "Português (Portugal)", deepl: "PT-PT" },
  { code: "pt", label: "Portuguese (unspecified)", native: "Português", deepl: "PT" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", deepl: "PA" },
  { code: "qu", label: "Quechua", native: "Runasimi", deepl: "QU" },
  { code: "ro", label: "Romanian", native: "Română", deepl: "RO" },
  { code: "ru", label: "Russian", native: "Русский", deepl: "RU" },
  { code: "sa", label: "Sanskrit", native: "संस्कृतम्", deepl: "SA" },
  { code: "sr", label: "Serbian", native: "Српски", deepl: "SR" },
  { code: "st", label: "Sesotho", native: "Sesotho", deepl: "ST" },
  { code: "scn", label: "Sicilian", native: "Sicilianu", deepl: "SCN" },
  { code: "sk", label: "Slovak", native: "Slovenčina", deepl: "SK" },
  { code: "sl", label: "Slovenian", native: "Slovenščina", deepl: "SL" },
  { code: "es", label: "Spanish", native: "Español", deepl: "ES" },
  { code: "es-419", label: "Spanish (Latin American)", native: "Español (Latinoamérica)", deepl: "ES-419" },
  { code: "es-ES", label: "Spanish (Spain)", native: "Español (España)", deepl: "ES-ES" },
  { code: "su", label: "Sundanese", native: "Basa Sunda", deepl: "SU" },
  { code: "sw", label: "Swahili", native: "Kiswahili", deepl: "SW" },
  { code: "sv", label: "Swedish", native: "Svenska", deepl: "SV" },
  { code: "tl", label: "Tagalog", native: "Tagalog", deepl: "TL" },
  { code: "tg", label: "Tajik", native: "Тоҷикӣ", deepl: "TG" },
  { code: "ta", label: "Tamil", native: "தமிழ்", deepl: "TA" },
  { code: "tt", label: "Tatar", native: "Татарча", deepl: "TT" },
  { code: "te", label: "Telugu", native: "తెలుగు", deepl: "TE" },
  { code: "th", label: "Thai", native: "ไทย", deepl: "TH" },
  { code: "ts", label: "Tsonga", native: "Xitsonga", deepl: "TS" },
  { code: "tn", label: "Tswana", native: "Setswana", deepl: "TN" },
  { code: "tr", label: "Turkish", native: "Türkçe", deepl: "TR" },
  { code: "tk", label: "Turkmen", native: "Türkmençe", deepl: "TK" },
  { code: "uk", label: "Ukrainian", native: "Українська", deepl: "UK" },
  { code: "ur", label: "Urdu", native: "اردو", deepl: "UR" },
  { code: "uz", label: "Uzbek", native: "Oʻzbekcha", deepl: "UZ" },
  { code: "vi", label: "Vietnamese", native: "Tiếng Việt", deepl: "VI" },
  { code: "cy", label: "Welsh", native: "Cymraeg", deepl: "CY" },
  { code: "wo", label: "Wolof", native: "Wolof", deepl: "WO" },
  { code: "xh", label: "Xhosa", native: "isiXhosa", deepl: "XH" },
  { code: "yi", label: "Yiddish", native: "ייִדיש", deepl: "YI" },
  { code: "zu", label: "Zulu", native: "isiZulu", deepl: "ZU" },
];

// Languages that get machine drafts. English is the source, never a target.
export const TARGET_LOCALES = TRANSLATION_LOCALES.filter((l) => l.deepl);

export const LOCALE_STORAGE_KEY = "rallypack_locale";

export function findLocale(code) {
  return TRANSLATION_LOCALES.find((l) => l.code === code) || null;
}

export function localeLabel(code) {
  const match = findLocale(code);
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