import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import {
  loadHoaTemplate, buildHoaEmailHtml, buildHoaEmailText, sendViaResend,
  loadProgress, saveProgress, pickNextState
} from '../../shared/hoaOutreach.ts';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth: AUTOMATION_SECRET (scheduled automations) or authenticated admin
    const automationSecret = Deno.env.get('AUTOMATION_SECRET');
    const headerSecret = req.headers.get('x-automation-secret') || req.headers.get('automation-secret');
    if (!(headerSecret && automationSecret && headerSecret === automationSecret)) {
      let user;
      try { user = await base44.auth.me(); } catch (_) { user = null; }
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 1. Load progress + pick the next state to process
    const progress = await loadProgress(base44);
    const target = pickNextState(progress);
    if (!target) {
      return Response.json({
        success: true,
        complete: true,
        message: 'All 50 states have completed pass 1 and pass 2 (where eligible). Nothing more to do.'
      });
    }

    // 2. Find up to 100 HOAs in the target state via web search
    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Find up to 100 Homeowner Association (HOA) organizations located in ${target.name} (US state code ${target.code}), USA. For each one, return the HOA or community name and a publicly listed contact email address (board, management company, or property manager email). Only include real organizations with real, publicly listed email addresses — do not invent or guess any email. Return as many distinct HOAs as you can find, up to 100.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          hoas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                organization_name: { type: 'string' },
                contact_email: { type: 'string' },
                contact_name: { type: 'string' }
              },
              required: ['organization_name', 'contact_email']
            }
          }
        },
        required: ['hoas']
      }
    });

    let found: any[] = [];
    if (Array.isArray(llmRes?.hoas)) {
      found = llmRes.hoas;
    } else if (typeof llmRes === 'string') {
      try { found = (JSON.parse(llmRes).hoas) || []; } catch (_) { found = []; }
    }

    // 3. Load existing HOA emails for global dedup
    const existing = await base44.asServiceRole.entities.BusinessReferral.filter({ audience_type: 'hoa' }, null, 5000);
    const existingEmails = new Set(existing.map((r: any) => (r.referee_email || '').trim().toLowerCase()));

    // 4. Dedup, validate, and create new referral records (max 100)
    const seen = new Set();
    const created: any[] = [];
    for (const h of found) {
      const email = (h.contact_email || '').trim().toLowerCase();
      const org = (h.organization_name || '').trim();
      if (!email || !EMAIL_REGEX.test(email) || !org) continue;
      if (existingEmails.has(email) || seen.has(email)) continue;
      seen.add(email);
      const referral = await base44.asServiceRole.entities.BusinessReferral.create({
        referee_email: email,
        referee_name: (h.contact_name || '').trim(),
        organization_name: org,
        audience_type: 'hoa',
        state: target.code,
        status: 'pending',
        referrer_name: 'RallyPack HOA Outreach',
        referrer_email: '',
        message: ''
      });
      created.push(referral);
      if (created.length >= 100) break;
    }

    // 5. Save progress BEFORE sending, so a timeout mid-send won't re-pick this state
    const stateEntry = progress.states[target.code] || {};
    if (target.pass === 1) {
      stateEntry.pass1_done = true;
      stateEntry.pass1_count = created.length;
    } else {
      stateEntry.pass2_done = true;
      stateEntry.pass2_count = created.length;
    }
    stateEntry.last_run = new Date().toISOString();
    progress.states[target.code] = stateEntry;
    progress.total_runs = (progress.total_runs || 0) + 1;
    await saveProgress(base44, progress);

    // 6. Send the HOA template to each newly created referral
    const config = await loadHoaTemplate(base44);
    const html = buildHoaEmailHtml(config);
    const text = buildHoaEmailText(config);

    let sent = 0;
    let queued = 0;
    let failed = 0;
    const contactedIds: string[] = [];

    for (const r of created) {
      try {
        const result = await sendViaResend(r.referee_email, config.subject, html, text, base44, 'seedDailyHoaReferrals');
        if (result.queued) {
          queued++;
        } else {
          sent++;
          contactedIds.push(r.id);
        }
      } catch (_e) {
        failed++;
        await base44.asServiceRole.entities.BusinessReferral.update(r.id, { bounced: true }).catch(() => {});
      }
    }

    // Mark contacted; set general_email_sent on all created so the weekly general
    // catchup doesn't double-email HOAs with the business pitch.
    if (created.length > 0) {
      await base44.asServiceRole.entities.BusinessReferral.bulkUpdate(
        created.map((r: any) => ({ id: r.id, general_email_sent: true }))
      );
    }
    if (contactedIds.length > 0) {
      await base44.asServiceRole.entities.BusinessReferral.bulkUpdate(
        contactedIds.map(id => ({ id, status: 'contacted' }))
      );
    }

    return Response.json({
      success: true,
      state: target.code,
      state_name: target.name,
      pass: target.pass,
      found: found.length,
      created: created.length,
      sent,
      queued,
      failed,
      complete: false,
      message: `Pass ${target.pass} for ${target.name} (${target.code}): found ${found.length} HOAs, created ${created.length} new referrals, sent ${sent} emails (${queued} queued, ${failed} failed).`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});