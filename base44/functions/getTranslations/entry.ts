import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Public read of the approved translation dictionary for one language.
// Only approved entries are returned, and only the two fields a visitor needs —
// this is deliberately public content (approved copy for public pages), never
// user data, so it is served without a sign-in check.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const locale = typeof payload.locale === 'string' ? payload.locale : '';
    if (!locale || locale === 'en') {
      return Response.json({ locale: 'en', entries: [] });
    }

    const entries = await base44.asServiceRole.entities.TranslationEntry.filter({
      locale,
      status: 'approved',
    });

    return Response.json({
      locale,
      entries: entries
        .filter((e) => e.human_text || e.machine_text)
        .map((e) => ({
          source: e.source_text,
          text: e.human_text || e.machine_text,
        })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}