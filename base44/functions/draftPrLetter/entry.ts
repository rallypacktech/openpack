import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Drafts the RallyPack wildfire outreach letter from the public report figures.
// The prompt lives here so the endpoint stays a specific operation, not an LLM proxy.

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const recipientType = body.recipient_type === 'municipality' ? 'municipality' : 'press';
    const recipientName = String(body.recipient_name || '').trim().slice(0, 200);
    const focusCountry = String(body.focus_country || '').trim().slice(0, 120);
    const stats = String(body.stats || '').trim().slice(0, 4000);

    if (!stats) {
      return Response.json({ error: 'Report figures are required' }, { status: 400 });
    }

    const prompt = `You are drafting a public-relations letter from RallyPack, a nonprofit disaster-preparedness platform, to ${recipientType === 'press' ? 'a journalist or newsroom' : 'a municipal government official'}${recipientName ? ` (${recipientName})` : ''}${focusCountry ? `, focused on ${focusCountry}` : ''}.

Use ONLY these verified figures from RallyPack's 10-year wildfire trend report (do not invent numbers):
${stats}

Methodology note to include: causes are canonicalized; fires that smoulder and re-ignite may be counted separately, which can inflate counts; no records were modified; hectares are burned area across recorded incidents, not a global total.

Write a concise, professional letter (350–500 words) that:
1. Opens with the trend story and the 2017–2018 / 2024–2025 spikes.
2. Highlights the firework-holiday correlation and the dominance of human-caused fires.
3. Frames these as preventable and proposes 3–4 concrete prevention actions (public fireworks restrictions, debris-burning bans during high-risk weather, community alert signup at rallypack.org, brush-clearance programs).
4. Closes with an offer of the full dataset and a spokesperson contact (beta@rallypack.tech).
Return only the letter body text, no subject line.`;

    const draft = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });

    return Response.json({ draft: typeof draft === 'string' ? draft : draft?.text || '' });
  } catch (error) {
    console.error('draftPrLetter error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}