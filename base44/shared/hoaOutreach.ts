// Shared HOA outreach helpers used by the daily seedDailyHoaReferrals function.
// Keeps the 50-state list, HOA email template, Resend sender, and per-state progress
// tracking in one place so the workflow function stays small.
//
// The HOA email renders through base44/shared/referralEmail.ts — the same builder
// every other referral email uses — so the free-vs-paid options read identically.
// HOA is the audience where the split matters most: RallyPack is free for every
// resident, while the association's own business features are a paid tier, so the
// email carries the FIRSTMONTHFREE code to let the board try that side.

import {
  FROM_EMAIL,
  ORIGIN,
  READINESS_MAP_PATH,
  buildReferralEmailHtml,
  buildReferralEmailText,
  isQuotaError,
  sendViaResend,
} from './referralEmail.ts';

export { FROM_EMAIL, ORIGIN, isQuotaError, sendViaResend };

export const PROGRESS_CACHE_KEY = 'hoa_outreach_progress';

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
  learnPath: READINESS_MAP_PATH,
  subject: 'Free for every resident — and a first month free on the HOA business plan',
  opener: 'The RallyPack Team thought your neighborhood would benefit from a free emergency preparedness resource you can share with every resident.',
  intro: "RallyPack is a free, open-source emergency preparedness platform. Every one of your members can build go-bags, document evacuation plans, and log emergency supply caches at no cost — and the Readiness Map shows each resident how their neighborhood ranks against the rest of the world.\n\nIf the association itself wants the business side, the first month is on us with the code below.",
  freeTitle: 'Free — for every member of your association',
  freeBody: 'RallyPack is free for all of your residents. They can build go-bags, document evacuation plans, log emergency supply caches, get real-time hazard alerts, and see how prepared their neighborhood is compared to the rest of the world. No cost, and no account required.',
  freeCtaLabel: 'See how prepared you are compared to the rest of the world',
  businessTitle: 'Paid — for the association',
  businessBody: 'If the HOA wants the business side — tracking first aid kits, AEDs, staff certifications and fire equipment across every location, with expiry reminders, documented evacuation plans and association-wide emergency alerts — that is a paid plan. Your first month is free with the code below.',
  businessCtaLabel: 'Start the business plan — first month free',
  voucherCode: 'FIRSTMONTHFREE',
  voucherLabel: 'First month free',
  voucherNote: 'Your first month of the RallyPack business plan is on us — try every business feature, then decide.'
};

export async function loadHoaTemplate(base44: any) {
  try {
    const templates = await base44.asServiceRole.entities.EmailTemplate.filter({ audience_key: 'hoa' });
    if (templates.length > 0) {
      const t = templates[0];
      return {
        ...DEFAULT_HOA_CONFIG,
        label: t.label || DEFAULT_HOA_CONFIG.label,
        learnPath: t.learn_path || DEFAULT_HOA_CONFIG.learnPath,
        subject: t.subject || DEFAULT_HOA_CONFIG.subject,
        intro: t.intro || DEFAULT_HOA_CONFIG.intro,
        voucherCode: t.voucher_code || DEFAULT_HOA_CONFIG.voucherCode
      };
    }
  } catch (_e) { /* fall through to default */ }
  return DEFAULT_HOA_CONFIG;
}

export function buildHoaEmailHtml(config: any) {
  return buildReferralEmailHtml(config, ORIGIN);
}

export function buildHoaEmailText(config: any) {
  return buildReferralEmailText(config, ORIGIN);
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