// Shared HOA outreach helpers used by the daily seedDailyHoaReferrals function.
// Keeps the 50-state list, HOA email template, Resend sender, and per-state progress
// tracking in one place so the workflow function stays small.

export const PROGRESS_CACHE_KEY = 'hoa_outreach_progress';
export const FROM_EMAIL = 'RallyPack <no-reply@rallypack.org>';
export const ORIGIN = 'https://www.rallypack.org';

export const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

// States already ingested (~100 each) in prior manual passes — seeded as pass 1 done
// so the automation doesn't re-process them and can move straight to pass 2 eligibility.
export const SEEDED_STATES = ['WA', 'UT', 'NY', 'CA', 'TX', 'OR'];

export const DEFAULT_HOA_CONFIG = {
  label: 'Homeowner Association (HOA)',
  learnPath: '/ReadinessQuiz',
  subject: 'A free preparedness resource for your neighborhood — from RallyPack',
  intro: "RallyPack is a free, open-source emergency preparedness platform that helps families build go-bags, evacuation plans, and emergency supply caches — making it a great resource to share with your entire neighborhood. We'd love to encourage you to add our free Readiness Quiz to your next HOA newsletter so every resident can quickly check how prepared they really are."
};

export async function loadHoaTemplate(base44: any) {
  try {
    const templates = await base44.asServiceRole.entities.EmailTemplate.filter({ audience_key: 'hoa' });
    if (templates.length > 0) {
      const t = templates[0];
      return {
        label: t.label || DEFAULT_HOA_CONFIG.label,
        learnPath: t.learn_path || DEFAULT_HOA_CONFIG.learnPath,
        subject: t.subject || DEFAULT_HOA_CONFIG.subject,
        intro: t.intro || DEFAULT_HOA_CONFIG.intro
      };
    }
  } catch (_e) { /* fall through to default */ }
  return DEFAULT_HOA_CONFIG;
}

export function buildHoaEmailHtml(config: any) {
  const learnUrl = `${ORIGIN}${config.learnPath}`;
  const businessUrl = `${ORIGIN}/BusinessOnboarding`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.label} — RallyPack</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Inter,DM Sans,Arial,sans-serif;color:#1c1c1a;line-height:1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #d8d2c6;max-width:600px;width:100%;">
          <tr>
            <td style="background-color:#1c1c1a;padding:32px 24px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">RallyPack</h1>
              <p style="margin:4px 0 0;font-size:12px;color:#ffffff;opacity:0.6;text-transform:uppercase;letter-spacing:2px;">Emergency Preparedness Platform</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;">
              <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;font-weight:600;color:#1c1c1a;">${config.label}</h2>
              <p style="margin:0 0 16px;font-size:15px;color:#1c1c1a;">Hello,</p>
              <p style="margin:0 0 16px;font-size:15px;color:#1c1c1a;">
                The RallyPack Team thought your neighborhood would benefit from a free emergency preparedness resource you can share with every resident.
              </p>
              <p style="margin:0 0 20px;font-size:15px;color:#1c1c1a;">${config.intro}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr><td style="padding-bottom:12px;"><a href="${learnUrl}" style="display:inline-block;background-color:#d64a2e;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:4px;">Take the Readiness Quiz &rarr;</a></td></tr>
                <tr><td><a href="${businessUrl}" style="display:inline-block;background-color:#1c1c1a;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:4px;">Explore Business Accounts</a></td></tr>
              </table>
              <p style="margin:0 0 16px;font-size:13px;color:#6b6b66;">RallyPack is free and open-source. No account is required to access preparedness guides and checklists.</p>
              <p style="margin:0;font-size:14px;color:#1c1c1a;">Stay safe,<br><strong>RallyPack Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#1c1c1a;padding:20px 24px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#ffffff;opacity:0.5;">&copy; 2026 RallyPack &middot; MIT License &middot; GDPR &amp; CCPA Compliant<br>In emergencies, always call your local emergency services first.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildHoaEmailText(config: any) {
  const learnUrl = `${ORIGIN}${config.learnPath}`;
  const businessUrl = `${ORIGIN}/BusinessOnboarding`;
  return [
    'Hello,',
    '',
    'Audience: ' + config.label,
    '',
    'The RallyPack Team thought your neighborhood would benefit from a free emergency preparedness resource you can share with every resident.',
    '',
    config.intro,
    '',
    'Take the Readiness Quiz: ' + learnUrl,
    'Explore Business Accounts: ' + businessUrl,
    '',
    'RallyPack is free and open-source. No account is required to access preparedness guides and checklists.',
    '',
    'Stay safe,',
    'RallyPack Team',
    '',
    '—',
    '© 2026 RallyPack · MIT License · GDPR & CCPA Compliant',
    'In emergencies, always call your local emergency services first.'
  ].join('\n');
}

export function isQuotaError(status: number, errorMessage: string) {
  if (status === 429) return true;
  const lower = (errorMessage || '').toLowerCase();
  return lower.includes('limit') || lower.includes('quota') || lower.includes('exceeded') || lower.includes('rate');
}

export async function sendViaResend(to: string, subject: string, html: string, text: string, base44: any, sourceFunction: string) {
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
    if (isQuotaError(response.status, errorBody) && base44) {
      await base44.asServiceRole.entities.EmailQueue.create({
        recipient_email: to,
        subject,
        html_body: html,
        text_body: text,
        from_name: FROM_EMAIL,
        source_function: sourceFunction || 'seedDailyHoaReferrals',
        status: 'pending',
        queued_at: new Date().toISOString()
      });
      return { queued: true };
    }
    throw new Error(`Resend API error (${response.status}): ${errorBody}`);
  }

  return await response.json();
}

export function defaultProgress() {
  const states: any = {};
  for (const s of US_STATES) {
    const seeded = SEEDED_STATES.includes(s.code);
    states[s.code] = {
      pass1_done: seeded,
      pass1_count: seeded ? 100 : 0,
      pass2_done: false,
      pass2_count: 0,
      last_run: null
    };
  }
  return { states, total_runs: 0, initialized_at: new Date().toISOString() };
}

export async function loadProgress(base44: any) {
  try {
    const cached = await base44.asServiceRole.entities.ReportCache.filter({ cache_key: PROGRESS_CACHE_KEY });
    if (cached.length > 0 && cached[0].payload && cached[0].payload.states) {
      const def = defaultProgress();
      return {
        ...def,
        ...cached[0].payload,
        states: { ...def.states, ...(cached[0].payload.states || {}) }
      };
    }
  } catch (_e) { /* fall through */ }
  return defaultProgress();
}

export async function saveProgress(base44: any, progress: any) {
  const built_at = new Date().toISOString();
  const existing = await base44.asServiceRole.entities.ReportCache.filter({ cache_key: PROGRESS_CACHE_KEY });
  if (existing.length > 0) {
    await base44.asServiceRole.entities.ReportCache.update(existing[0].id, { payload: progress, built_at });
  } else {
    await base44.asServiceRole.entities.ReportCache.create({ cache_key: PROGRESS_CACHE_KEY, payload: progress, built_at });
  }
}

// Pick the next state to process.
// Pass 1: every state not yet done (alphabetical).
// Pass 2: states that hit 100 in pass 1 and haven't had a second pass yet.
// Returns null when everything eligible is complete.
export function pickNextState(progress: any) {
  const states = progress.states || {};
  for (const s of US_STATES) {
    const st = states[s.code];
    if (!st || !st.pass1_done) {
      return { code: s.code, name: s.name, pass: 1 };
    }
  }
  for (const s of US_STATES) {
    const st = states[s.code];
    if (st && st.pass1_count >= 100 && !st.pass2_done) {
      return { code: s.code, name: s.name, pass: 2 };
    }
  }
  return null;
}