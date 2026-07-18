import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const FROM_EMAIL = 'RallyPack <no-reply@rallypack.org>';
const BATCH_LIMIT = 3000;

function isQuotaError(status, errorMessage) {
  if (status === 429) return true;
  const lower = (errorMessage || '').toLowerCase();
  return lower.includes('limit') || lower.includes('quota') || lower.includes('exceeded') || lower.includes('rate');
}

async function sendViaResend(to, subject, html, text) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) throw new Error('RESEND_API_KEY not set');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
      text
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw { status: response.status, message: `Resend API error (${response.status}): ${errorBody}` };
  }

  return await response.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Authorization: admin user OR valid automation secret (for scheduled jobs)
    const automationSecret = Deno.env.get("AUTOMATION_SECRET");
    const providedSecret = req.headers.get("x-automation-secret");
    let isAuthorized = false;
    if (automationSecret && providedSecret) {
      const a = new TextEncoder().encode(automationSecret);
      const b = new TextEncoder().encode(providedSecret);
      if (a.length === b.length) {
        let diff = 0;
        for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
        isAuthorized = diff === 0;
      }
    }
    if (!isAuthorized) {
      try {
        const user = await base44.auth.me();
        isAuthorized = !!(user && user.role === 'admin');
      } catch {
        isAuthorized = false;
      }
    }
    if (!isAuthorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all pending queued emails, sorted oldest-first
    const pending = await base44.asServiceRole.entities.EmailQueue.filter({ status: 'pending' });
    pending.sort((a, b) => (a.queued_at || '').localeCompare(b.queued_at || ''));

    const toProcess = pending.slice(0, BATCH_LIMIT);

    let sent = 0;
    let failed = 0;
    let stoppedByQuota = false;
    const updates = [];

    for (const email of toProcess) {
      try {
        await sendViaResend(email.recipient_email, email.subject, email.html_body, email.text_body);
        updates.push({ id: email.id, status: 'sent', sent_at: new Date().toISOString() });
        sent++;
      } catch (e) {
        const errStatus = e?.status || 0;
        const errMsg = e?.message || String(e);
        if (isQuotaError(errStatus, errMsg)) {
          // Still capped — stop processing, leave remaining as pending
          stoppedByQuota = true;
          break;
        }
        updates.push({ id: email.id, status: 'failed', error_message: errMsg.slice(0, 500) });
        failed++;
      }
    }

    if (updates.length > 0) {
      await base44.asServiceRole.entities.EmailQueue.bulkUpdate(updates);
    }

    return Response.json({
      success: true,
      sent,
      failed,
      stopped_by_quota: stoppedByQuota,
      remaining_pending: pending.length - sent - failed,
      processed: sent + failed,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});