// Single source of truth for every RallyPack referral email.
//
// The multi-audience outreach (contactPendingReferrals), the weekly general
// catch-up (sendGeneralEmailCatchup) and the daily HOA outreach (hoaOutreach)
// all render through here, so the two-option call to action — free for
// residents/members vs. the paid business dashboard — stays identical across
// every audience and only has to be edited once.

import { VOUCHER_CODE } from './fireMarshalVoucher.ts';

export const FROM_EMAIL = 'RallyPack <no-reply@rallypack.org>';
export const ORIGIN = 'https://rallypack.org';

export const BUSINESS_PATH = '/BusinessOnboarding';
export const READINESS_MAP_PATH = '/readiness-map';

export const READINESS_MAP_CTA = 'See how prepared you are compared to the rest of the world';

export const DEFAULT_OPENER =
  'The RallyPack Team thought your organization would benefit from RallyPack — free preparedness resources you can share, and a business dashboard for the operational side.';

export const DEFAULT_FREE = {
  title: 'Free — for your members, staff and neighbors',
  body: 'RallyPack is free and open-source. Anyone can build go-bags, document evacuation plans, log emergency supply caches, get real-time hazard alerts, and see how their neighborhood ranks on the Readiness Map. No cost, and no account required.',
};

export const DEFAULT_BUSINESS = {
  title: 'Paid — for your organization',
  body: 'If your organization wants the business side — tracking first aid kits, AEDs, staff certifications and fire equipment across every location, with expiry reminders, documented evacuation plans and team-wide emergency alerts — that is a paid plan. Every feature is free for 7 days, then pick the plan that fits.',
};

export function escapeHtml(str: any) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// The free option is the audience's own landing page, except for audiences whose
// configured path is a business page — those point at the Readiness Map instead,
// since the free option must never send someone to the paid flow.
export function freeOption(config: any, origin: string = ORIGIN) {
  const rawPath = config.freePath || config.learnPath || READINESS_MAP_PATH;
  const path = rawPath.indexOf(BUSINESS_PATH) === 0 ? READINESS_MAP_PATH : rawPath;
  const isMap = path === READINESS_MAP_PATH;
  return {
    title: config.freeTitle || DEFAULT_FREE.title,
    body: config.freeBody || DEFAULT_FREE.body,
    ctaLabel: config.freeCtaLabel || (isMap ? READINESS_MAP_CTA : 'Explore the free resources'),
    url: origin + path,
  };
}

export function businessOption(config: any, origin: string = ORIGIN) {
  return {
    title: config.businessTitle || DEFAULT_BUSINESS.title,
    body: config.businessBody || DEFAULT_BUSINESS.body,
    ctaLabel: config.businessCtaLabel || 'Explore business accounts',
    url: origin + BUSINESS_PATH,
  };
}

export function buildReferralEmailHtml(config: any, origin: string = ORIGIN, personalMessage: string = '') {
  const free = freeOption(config, origin);
  const business = businessOption(config, origin);
  const opener = config.opener || DEFAULT_OPENER;
  const label = escapeHtml(config.label);
  const messageBlock = personalMessage
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background-color:#f5f0e8;border-left:4px solid #d64a2e;">
                 <tr>
                   <td style="padding:16px 20px;">
                     <p style="margin:0;font-size:14px;color:#1c1c1a;font-style:italic;">&ldquo;${personalMessage}&rdquo;</p>
                     <p style="margin:8px 0 0;font-size:12px;color:#6b6b66;">&mdash; RallyPack Team</p>
                   </td>
                 </tr>
               </table>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${label} — RallyPack</title>
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

          ${config.heroImageUrl ? `
          <tr>
            <td style="padding:0;line-height:0;">
              <img src="${config.heroImageUrl}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
            </td>
          </tr>` : ''}

          <tr>
            <td style="padding:32px 24px;">

              <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;font-weight:600;color:#1c1c1a;">${label}</h2>

              <p style="margin:0 0 16px;">
                <span style="display:inline-block;background-color:#f5f0e8;color:#1c1c1a;font-size:12px;font-weight:600;padding:4px 12px;border-radius:3px;border:1px solid #d8d2c6;">Audience: ${label}</span>
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#1c1c1a;">Hello,</p>

              <p style="margin:0 0 16px;font-size:15px;color:#1c1c1a;">${opener}</p>

              <p style="margin:0 0 20px;font-size:15px;color:#1c1c1a;">${config.intro}</p>

              ${messageBlock}

              <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#6b6b66;">Your two options</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-collapse:separate;border-spacing:0 12px;">
                <tr>
                  <td style="border:1px solid #d8d2c6;border-left:4px solid #2f7a4f;background-color:#f7faf7;padding:18px 20px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#2f7a4f;">Option 1</p>
                    <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#1c1c1a;">${free.title}</p>
                    <p style="margin:0 0 14px;font-size:14px;color:#1c1c1a;">${free.body}</p>
                    <a href="${free.url}" style="display:inline-block;background-color:#2f7a4f;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:4px;">${free.ctaLabel} &rarr;</a>
                  </td>
                </tr>
                <tr>
                  <td style="border:1px solid #d8d2c6;border-left:4px solid #d64a2e;background-color:#fdf7f5;padding:18px 20px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#a83a20;">Option 2</p>
                    <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#1c1c1a;">${business.title}</p>
                    <p style="margin:0 0 14px;font-size:14px;color:#1c1c1a;">${business.body}</p>
                    <a href="${business.url}" style="display:inline-block;background-color:#d64a2e;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:4px;">${business.ctaLabel} &rarr;</a>
                  </td>
                </tr>
              </table>

              ${config.voucherCode ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background-color:#fff8e7;border:1px dashed #d64a2e;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#a83a20;">${config.voucherLabel || 'Voucher'}</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#1c1c1a;">${config.voucherNote || ''} Enter this code in the promo code box at checkout:</p>
                    <p style="margin:0;font-family:'Courier New',monospace;font-size:20px;font-weight:700;letter-spacing:2px;color:#1c1c1a;">${escapeHtml(config.voucherCode)}</p>
                  </td>
                </tr>
              </table>` : ''}

              <p style="margin:0 0 16px;font-size:13px;color:#6b6b66;">
                Business plans include multi-location kit tracking, AED and certification expiry alerts, evacuation plan documentation, and emergency team notifications.
              </p>

              <p style="margin:0;font-size:14px;color:#1c1c1a;">
                ${config.signatureName
                  ? `Best regards,<br><strong>${escapeHtml(config.signatureName)}</strong>${config.signatureTitle ? `<br>${escapeHtml(config.signatureTitle)}` : ''}${config.signatureEmail ? `<br><a href="mailto:${escapeHtml(config.signatureEmail)}" style="color:#d64a2e;">${escapeHtml(config.signatureEmail)}</a>` : ''}`
                  : 'Stay safe,<br><strong>RallyPack Team</strong>'}
              </p>

            </td>
          </tr>

          <tr>
            <td style="background-color:#1c1c1a;padding:20px 24px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#ffffff;opacity:0.5;">
                &copy; 2026 RallyPack &middot; MIT License &middot; GDPR &amp; CCPA Compliant<br>
                In emergencies, always call your local emergency services first.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildReferralEmailText(config: any, origin: string = ORIGIN, personalMessage: string = '') {
  const free = freeOption(config, origin);
  const business = businessOption(config, origin);
  const opener = config.opener || DEFAULT_OPENER;

  return [
    'Hello,',
    '',
    'Audience: ' + config.label,
    '',
    opener,
    '',
    config.intro,
    '',
    ...(personalMessage ? [`"${personalMessage}"`, '— RallyPack Team', ''] : []),
    'YOUR TWO OPTIONS',
    '',
    'OPTION 1 — ' + free.title,
    free.body,
    free.ctaLabel + ': ' + free.url,
    '',
    'OPTION 2 — ' + business.title,
    business.body,
    business.ctaLabel + ': ' + business.url,
    '',
    ...(config.voucherCode ? [
      (config.voucherLabel || 'Voucher').toUpperCase() + ': ' + (config.voucherNote || ''),
      'Enter this code in the promo code box at checkout: ' + config.voucherCode,
      '',
    ] : []),
    'Business plans include multi-location kit tracking, AED and certification expiry alerts, evacuation plan documentation, and emergency team notifications.',
    '',
    config.signatureName ? 'Best regards,' : 'Stay safe,',
    config.signatureName ? config.signatureName : 'RallyPack Team',
    ...(config.signatureTitle ? [config.signatureTitle] : []),
    ...(config.signatureEmail ? [config.signatureEmail] : []),
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

export async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  text: string,
  base44: any,
  sourceFunction: string
) {
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
        source_function: sourceFunction,
        status: 'pending',
        queued_at: new Date().toISOString()
      });
      return { queued: true };
    }
    throw new Error(`Resend API error (${response.status}): ${errorBody}`);
  }

  return await response.json();
}

// Single source of truth for every audience's referral email: label, landing
// path, subject, intro and voucher. The admin referral form, the multi-audience
// outreach (contactPendingReferrals) and any audience added later all render
// through here, so the two-option call to action stays identical everywhere.
//
// The `learnPath` is the FREE option's landing page; the paid option always
// points at /BusinessOnboarding. When an audience's path is a business page, the
// free option falls back to the Readiness Map automatically.
export const AUDIENCE_CONFIG: Record<string, any> = {
  general: {
    label: 'Workplace Preparedness',
    learnPath: '/readiness-map',
    subject: 'Free for your team — and a first month free on the business dashboard',
    intro: 'RallyPack gives your business one place to stay inspection-ready: log first aid kits across every floor, AEDs, staff CPR/first aid certifications and fire equipment checks, and get reminded before anything expires. That is the paid side — and your first month is on us with the code below.\n\nThe free side is for your people: anyone can look up how their county, territory, state, province or country ranks for emergency preparedness, and build a go-bag and evacuation plan at no cost.',
    voucherLabel: 'First month free',
    voucherNote: 'Your first month of the Professional plan is on us.',
  },
  equine: {
    label: 'Equine Emergency Preparedness',
    learnPath: '/equine',
    subject: 'Equine emergency preparedness — a free resource for your clients',
    intro: 'RallyPack offers free, species-specific emergency preparedness resources for horse owners — including evacuation planning, trailer logistics, Coggins test tracking, and emergency feed protocols. As an equine business, you can help your clients protect their horses when disasters strike.',
  },
  canine: {
    label: 'Canine Emergency Preparedness',
    learnPath: '/canine',
    subject: 'Canine emergency preparedness — a free resource for your clients',
    intro: 'RallyPack offers free, species-specific emergency preparedness resources for dog owners — including transport planning, medical record storage, 72-hour supply kits, and shelter logistics. As a canine-focused business, you can help your clients keep their dogs safe during emergencies.',
  },
  feline: {
    label: 'Feline Emergency Preparedness',
    learnPath: '/feline',
    subject: 'Feline emergency preparedness — a free resource for your clients',
    intro: 'RallyPack offers free, species-specific emergency preparedness resources for cat owners — including carrier training, medical records, and shelter logistics. As a feline-focused business, you can help your clients protect their cats during disasters.',
  },
  infant: {
    label: 'Infant Emergency Preparedness',
    learnPath: '/infant',
    subject: 'Infant emergency preparedness — a free resource for your clients',
    intro: 'RallyPack offers free emergency preparedness resources for parents of infants — including formula and supply checklists, medical record storage, and evacuation planning. As a business serving families with infants, you can help your clients protect their youngest during emergencies.',
  },
  avian: {
    label: 'Avian Emergency Preparedness',
    learnPath: '/avian',
    subject: 'Avian emergency preparedness — a free resource for your clients',
    intro: 'RallyPack offers free, species-specific emergency preparedness resources for bird owners — including respiratory safety, transport containers, and temperature control. As an avian-focused business, you can help your clients protect their birds during disasters.',
  },
  reptile: {
    label: 'Reptile Emergency Preparedness',
    learnPath: '/reptile',
    subject: 'Reptile emergency preparedness — a free resource for your clients',
    intro: 'RallyPack offers free, species-specific emergency preparedness resources for reptile owners — including temperature control, transport containers, and food supply planning. As a reptile-focused business, you can help your clients protect their reptiles during disasters.',
  },
  livestock: {
    label: 'Livestock Emergency Preparedness',
    learnPath: '/livestock',
    subject: 'Livestock emergency preparedness — a free resource for your clients',
    intro: 'RallyPack offers free, species-specific emergency preparedness resources for livestock owners — including evacuation logistics, trailer capacity planning, and destination coordination. As a livestock-focused business, you can help your clients protect their animals during disasters.',
  },
  wildfire: {
    label: 'Wildfire Preparedness',
    learnPath: '/wildfire',
    subject: 'Is your community ready for wildfire season? A free resource from RallyPack',
    intro: 'RallyPack provides free, real-time wildfire alerts, go-bag checklists, and evacuation planning tools for families in fire-prone areas. Whether you\'re a business in a high-risk region or serve clients who are, share this resource to help your community prepare before a fire starts.',
    voucherLabel: 'Free year for wildfire partners',
    voucherNote: 'Your first year of the Professional plan is on us.',
  },
  flood: {
    label: 'Flood Preparedness',
    learnPath: '/flood',
    subject: 'Flood season is coming — free preparedness resources for your community',
    intro: 'RallyPack provides free flood preparedness guides, emergency supply checklists, and shelter-in-place vs. evacuation guidance for families in flood-prone areas. Help your employees or clients know what to do before floodwaters rise.',
  },
  hurricane: {
    label: 'Hurricane Preparedness',
    learnPath: '/hurricane',
    subject: 'Hurricane season preparedness — a free resource for your team and community',
    intro: 'RallyPack offers free hurricane preparedness resources including evacuation planning, go-bag checklists, and real-time storm alerts. As a business in a coastal or storm-prone area, you can help your employees and clients plan ahead before the season peaks.',
  },
  tornado: {
    label: 'Tornado Preparedness',
    learnPath: '/tornado',
    subject: 'Tornado season alert — free preparedness resources for your community',
    intro: 'RallyPack provides free tornado preparedness guidance including shelter-in-place protocols, family communication plans, and emergency supply checklists. Share this resource with your team or community to help everyone know what to do when a tornado warning sounds.',
  },
  hoa: {
    label: 'Homeowner Association (HOA)',
    learnPath: '/readiness-map',
    subject: 'Free for every resident — and a first month free on the HOA business plan',
    opener: 'The RallyPack Team thought your neighborhood would benefit from a free emergency preparedness resource you can share with every resident.',
    intro: 'RallyPack is a free, open-source emergency preparedness platform. Every one of your members can build go-bags, document evacuation plans, and log emergency supply caches at no cost — and the Readiness Map shows each resident how their neighborhood ranks against the rest of the world.\n\nIf the association itself wants the business side, the first month is on us with the code below.',
    freeTitle: 'Free — for every member of your association',
    freeBody: 'RallyPack is free for all of your residents. They can build go-bags, document evacuation plans, log emergency supply caches, get real-time hazard alerts, and see how prepared their neighborhood is compared to the rest of the world. No cost, and no account required.',
    freeCtaLabel: 'See how prepared you are compared to the rest of the world',
    businessTitle: 'Paid — for the association',
    businessBody: 'If the HOA wants the business side — tracking first aid kits, AEDs, staff certifications and fire equipment across every location, with expiry reminders, documented evacuation plans and association-wide emergency alerts — that is a paid plan. Your first month is free with the code below.',
    businessCtaLabel: 'Start the business plan — first month free',
    voucherCode: 'FIRSTMONTHFREE',
    voucherLabel: 'First month free',
    voucherNote: 'Your first month of the RallyPack business plan is on us — try every business feature, then decide.',
  },
  commercial_property: {
    label: 'Commercial Property Preparedness',
    learnPath: '/BusinessOnboarding',
    subject: 'Fire safety readiness & emergency tracking for your properties',
    intro: 'RallyPack helps commercial landlords and office park managers stay inspection-ready across every building — track first aid kits by floor with automatic expiry alerts, document evacuation plans and assembly points, maintain your floor warden roster, and send emergency notifications to tenants and staff. One dashboard proves every property is compliant.',
    businessCtaLabel: 'Explore business accounts — 7 days free',
  },
  insurance_broker: {
    label: 'Commercial Insurance Broker Preparedness',
    learnPath: '/BusinessOnboarding',
    subject: 'A value-add preparedness tool for your commercial clients',
    intro: 'RallyPack helps your commercial clients stay inspection-ready and disaster-prepared — tracking first aid kits and expiry dates across every floor, documenting evacuation plans and assembly points, and maintaining floor warden rosters. Clients who stay compliant file fewer claims. Share RallyPack as a free preparedness resource that adds value at every policy review.',
    businessCtaLabel: 'Explore business accounts — 7 days free',
  },
  fire_marshal: {
    label: 'Fire Safety',
    learnPath: '/BusinessOnboarding',
    subject: 'A free year of RallyPack — and a request for your inspection expertise',
    intro: 'We built RallyPack with input from the fire service: a dashboard where a business logs its first aid kits, AED units, batteries, pads, staff CPR / first aid / AED certifications, and fire equipment inspections, and gets reminded before anything expires. The goal is that nothing lapses between inspections — no dead AED batteries, no out-of-date pads, no expired certifications.\n\nWe would like your candid feedback on whether this actually helps a building prepare for an inspection, and what you would want a business to have ready when you walk in. In return, your first year of the Professional plan is free.',
    voucherLabel: 'Free year for fire safety teams',
    voucherNote: 'Your first year of the Professional plan is on us.',
    businessCtaLabel: 'Start the free year — no card required',
  },
  compliance_quiz: {
    label: 'Compliance Quiz — Fire Departments',
    learnPath: '/compliance-quiz',
    subject: 'A preparedness resource for your community',
    opener: 'I am writing to introduce RallyPack, an emergency preparedness resource for households, organizations, and businesses.',
    intro: 'RallyPack helps people prepare for hazards such as wildfires, hurricanes, floods, and tornadoes by organizing readiness information, responsibilities, and next steps in one place. Businesses can keep preparedness planning and compliance records organized too, including first aid kits, AEDs, staff certifications, and fire equipment checks, with reminders before anything expires.\n\nWould your department consider sharing RallyPack with businesses and community members as an optional preparedness resource? We can provide a short description or a link you could include in a newsletter, resource page, or follow-up materials, whatever best fits your department policies.\n\nRallyPack is not a substitute for local codes, inspections, or direction from your department. We hope it can complement your work by encouraging people to plan ahead and keep important readiness tasks organized.',
    freeTitle: 'Free — a compliance quiz for local businesses',
    freeBody: 'A short, no-obligation quiz that shows a business where its preparedness plan is already strong and where it still needs attention. It takes a few minutes and is free to share with the businesses in your community.',
    freeCtaLabel: 'Take the compliance quiz',
    businessTitle: 'Paid — for your department and local businesses',
    businessBody: 'The business dashboard keeps preparedness planning and compliance records organized: first aid kits, AEDs, staff certifications and fire equipment checks across every location, with reminders before anything expires and documented evacuation plans.',
    businessCtaLabel: 'Explore business accounts — 7 days free',
    voucherCode: VOUCHER_CODE,
    voucherLabel: 'Free year for fire safety teams',
    voucherNote: 'Your first year of the Professional plan is on us.',
    heroImageUrl: 'https://media.base44.com/images/public/69dc170f0871ac017d79debb/43630c023_BusinessPreparednessPlan.png',
    signatureName: 'Lore Taylor',
    signatureTitle: 'Director, RallyPack.org',
    signatureEmail: 'lore@rallypack.tech',
  },
};

// Audience configs, overridden field-by-field by any EmailTemplate rows the
// admin has edited in the app.
export async function loadTemplates(base44: any) {
  const result: Record<string, any> = {};
  for (const [key, config] of Object.entries(AUDIENCE_CONFIG)) {
    result[key] = { ...config };
  }
  try {
    const templates = await base44.asServiceRole.entities.EmailTemplate.list();
    for (const t of templates) {
      if (result[t.audience_key]) {
        result[t.audience_key] = {
          ...result[t.audience_key],
          label: t.label || result[t.audience_key].label,
          learnPath: t.learn_path || result[t.audience_key].learnPath,
          subject: t.subject || result[t.audience_key].subject,
          intro: t.intro || result[t.audience_key].intro,
          voucherCode: t.voucher_code || result[t.audience_key].voucherCode || '',
        };
      }
    }
  } catch (e) { /* use defaults */ }
  return result;
}