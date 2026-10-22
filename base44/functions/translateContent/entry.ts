import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

// Monthly DeepL ceiling for this app. Page translation may bill at most
// PAGE_LIMIT; the remainder of TOTAL_LIMIT is held for the chatbot.
const TOTAL_LIMIT = 50000;
const PAGE_LIMIT = 30000;
const CHAT_RESERVE = 20000;

// DeepL target language codes, keyed by the locale code stored on each entry.
// Every DeepL target is covered so any visitor country can be translated.
// English is the source language, so it is never a target.
const LOCALE_TO_DEEPL = {
  af: 'AF', sq: 'SQ', ar: 'AR', an: 'AN', hy: 'HY', as: 'AS', ay: 'AY', az: 'AZ',
  ba: 'BA', eu: 'EU', be: 'BE', bn: 'BN', bho: 'BHO', bs: 'BS', br: 'BR', bg: 'BG',
  my: 'MY', yue: 'YUE', ca: 'CA', ceb: 'CEB',
  'zh-Hans': 'ZH-HANS', 'zh-Hant': 'ZH-HANT', zh: 'ZH',
  hr: 'HR', cs: 'CS', da: 'DA', prs: 'PRS', nl: 'NL', eo: 'EO', et: 'ET', fi: 'FI',
  fr: 'FR', 'fr-CA': 'FR-CA', 'fr-FR': 'FR-FR', gl: 'GL', ka: 'KA',
  de: 'DE', 'de-DE': 'DE-DE', 'de-CH': 'DE-CH', el: 'EL', gn: 'GN', gu: 'GU',
  ht: 'HT', ha: 'HA', he: 'HE', hi: 'HI', hu: 'HU', is: 'IS', ig: 'IG', id: 'ID',
  ga: 'GA', it: 'IT', ja: 'JA', jv: 'JV', pam: 'PAM', kk: 'KK', gom: 'GOM', ko: 'KO',
  kmr: 'KMR', ckb: 'CKB', ky: 'KY', la: 'LA', lv: 'LV', ln: 'LN', lt: 'LT', lmo: 'LMO',
  lb: 'LB', mk: 'MK', mai: 'MAI', mg: 'MG', ms: 'MS', ml: 'ML', mt: 'MT', mi: 'MI',
  mr: 'MR', mn: 'MN', ne: 'NE', nb: 'NB', oc: 'OC', om: 'OM', pag: 'PAG', ps: 'PS',
  fa: 'FA', pl: 'PL', 'pt-BR': 'PT-BR', 'pt-PT': 'PT-PT', pt: 'PT', pa: 'PA', qu: 'QU',
  ro: 'RO', ru: 'RU', sa: 'SA', sr: 'SR', st: 'ST', scn: 'SCN', sk: 'SK', sl: 'SL',
  es: 'ES', 'es-ES': 'ES-ES', 'es-419': 'ES-419', su: 'SU', sw: 'SW', sv: 'SV',
  tl: 'TL', tg: 'TG', ta: 'TA', tt: 'TT', te: 'TE', th: 'TH', ts: 'TS', tn: 'TN',
  tr: 'TR', tk: 'TK', uk: 'UK', ur: 'UR', uz: 'UZ', vi: 'VI', cy: 'CY', wo: 'WO',
  xh: 'XH', yi: 'YI', zu: 'ZU',
};

const BATCH_SIZE = 25;

function hashText(value) {
  let h = 5381;
  for (let i = 0; i < value.length; i++) {
    h = ((h << 5) + h + value.charCodeAt(i)) >>> 0;
  }
  return 'h' + h.toString(36) + '_' + value.length.toString(36);
}

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

async function callDeepl(texts, targetLang, apiKey) {
  const key = apiKey.trim();
  const endpoint = key.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';

  const body = new URLSearchParams();
  for (const text of texts) body.append('text', text);
  body.append('target_lang', targetLang);
  body.append('source_lang', 'EN');

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`DeepL ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  return (data.translations || []).map((t) => t.text);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const payload = await req.json().catch(() => ({}));
    const action = payload.action;
    const db = base44.asServiceRole.entities;

    if (action === 'collect') {
      const raw = Array.isArray(payload.strings) ? payload.strings : [];
      const locales = (Array.isArray(payload.locales) ? payload.locales : []).filter((l) => LOCALE_TO_DEEPL[l]);
      const pageKey = typeof payload.page_key === 'string' ? payload.page_key.slice(0, 200) : '';
      if (!raw.length || !locales.length) return Response.json({ added: 0, skipped: 0 });

      // Normalise and de-duplicate the batch before touching the database.
      const seen = new Map();
      for (const item of raw) {
        const text = typeof item === 'string' ? item : item && item.text;
        if (typeof text !== 'string') continue;
        const trimmed = text.trim();
        if (trimmed.length < 2 || trimmed.length > 1200) continue;
        if (!/[A-Za-z\u00C0-\u024F]/.test(trimmed)) continue;
        const hash = hashText(trimmed);
        if (!seen.has(hash)) seen.set(hash, trimmed);
      }
      if (!seen.size) return Response.json({ added: 0, skipped: 0 });

      const hashes = Array.from(seen.keys());
      let added = 0;

      for (const locale of locales) {
        const existing = await db.TranslationEntry.filter({
          locale,
          source_hash: { $in: hashes },
        });
        const known = new Set(existing.map((e) => e.source_hash));
        const toCreate = hashes
          .filter((h) => !known.has(h))
          .map((h) => ({
            source_text: seen.get(h),
            source_hash: h,
            locale,
            page_key: pageKey,
            status: 'queued',
            char_count: 0,
          }));
        if (toCreate.length) {
          await db.TranslationEntry.bulkCreate(toCreate);
          added += toCreate.length;
        }
      }

      return Response.json({ added, skipped: Math.max(0, raw.length - seen.size) });
    }

    if (action === 'translate') {
      const apiKey = secrets.get('DEEPL_API_KEY');
      if (!apiKey) return Response.json({ error: 'DEEPL_API_KEY is not set' }, { status: 400 });

      const key = monthKey();
      const existingUsage = await db.TranslationUsage.filter({ month_key: key });
      let usage = existingUsage[0];
      if (!usage) {
        usage = await db.TranslationUsage.create({
          month_key: key,
          page_chars_used: 0,
          chat_chars_used: 0,
          page_char_limit: PAGE_LIMIT,
          chat_reserve: CHAT_RESERVE,
        });
      }

      const pageUsed = usage.page_chars_used || 0;
      const chatUsed = usage.chat_chars_used || 0;
      const pageRemaining = Math.max(0, (usage.page_char_limit ?? PAGE_LIMIT) - pageUsed);
      const totalRemaining = Math.max(0, TOTAL_LIMIT - pageUsed - chatUsed);
      const budget = Math.min(pageRemaining, totalRemaining);

      if (budget <= 0) {
        return Response.json({
          translated: 0,
          reason: 'Monthly page translation budget is fully used. It resets on the 1st.',
          page_remaining: pageRemaining,
        });
      }

      const requestedLocales = Array.isArray(payload.locales) && payload.locales.length
        ? payload.locales.filter((l) => LOCALE_TO_DEEPL[l])
        : Object.keys(LOCALE_TO_DEEPL);

      const queued = await db.TranslationEntry.filter({
        status: 'queued',
        locale: { $in: requestedLocales },
      });

      if (!queued.length) {
        return Response.json({ translated: 0, reason: 'Nothing is waiting to be translated.' });
      }

      // Spend the budget in queue order so a partial month still makes progress.
      const byLocale = new Map();
      let planned = 0;
      let deferred = 0;
      for (const entry of queued) {
        const cost = (entry.source_text || '').length;
        if (planned + cost > budget) {
          deferred += 1;
          continue;
        }
        planned += cost;
        if (!byLocale.has(entry.locale)) byLocale.set(entry.locale, []);
        byLocale.get(entry.locale).push(entry);
      }

      let translatedCount = 0;
      let billedChars = 0;
      const errors = [];

      for (const [locale, entries] of byLocale.entries()) {
        const targetLang = LOCALE_TO_DEEPL[locale];
        const updates = [];

        for (let i = 0; i < entries.length; i += BATCH_SIZE) {
          const slice = entries.slice(i, i + BATCH_SIZE);
          try {
            const results = await callDeepl(slice.map((e) => e.source_text), targetLang, apiKey);
            slice.forEach((entry, idx) => {
              const text = results[idx];
              if (!text) return;
              updates.push({
                id: entry.id,
                machine_text: text,
                status: 'draft',
                char_count: (entry.source_text || '').length,
              });
            });
          } catch (error) {
            errors.push(`${locale}: ${error.message}`);
          }
        }

        if (updates.length) {
          await db.TranslationEntry.bulkUpdate(updates);
          translatedCount += updates.length;
          billedChars += updates.reduce((sum, u) => sum + (u.char_count || 0), 0);
        }
      }

      if (billedChars > 0) {
        await db.TranslationUsage.update(usage.id, { page_chars_used: pageUsed + billedChars });
      }

      return Response.json({
        translated: translatedCount,
        billed_chars: billedChars,
        deferred,
        page_remaining: Math.max(0, pageRemaining - billedChars),
        errors,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}