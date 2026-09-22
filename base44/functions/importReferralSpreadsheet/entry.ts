import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Extracts rows from an uploaded referral spreadsheet and creates BusinessReferral
// records. Admin-only, and the extraction schema is fixed here rather than passed in.

const REFERRAL_SCHEMA = {
  type: 'object',
  properties: {
    rows: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          referee_email: { type: 'string' },
          referee_name: { type: 'string' },
          organization_name: { type: 'string' },
          referrer_name: { type: 'string' },
          referrer_email: { type: 'string' },
          audience_type: { type: 'string' },
          message: { type: 'string' },
        },
        required: ['referee_email'],
      },
    },
  },
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const fileUrl = String(body.file_url || '').trim();
    if (!fileUrl) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    const extracted = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
      file_url: fileUrl,
      json_schema: REFERRAL_SCHEMA,
    });

    if (extracted.status !== 'success') {
      return Response.json({ error: extracted.details || 'Extraction failed' }, { status: 400 });
    }

    const rows = extracted.output?.rows || (Array.isArray(extracted.output) ? extracted.output : []);

    let created = 0;
    let failed = 0;
    for (const row of rows) {
      if (!row.referee_email) {
        failed++;
        continue;
      }
      try {
        await base44.entities.BusinessReferral.create({
          referee_email: row.referee_email,
          referee_name: row.referee_name || '',
          organization_name: row.organization_name || '',
          referrer_name: row.referrer_name || '',
          referrer_email: row.referrer_email || '',
          audience_type: row.audience_type || 'general',
          message: row.message || '',
          status: 'pending',
        });
        created++;
      } catch (e) {
        failed++;
      }
    }

    return Response.json({ created, failed, total: rows.length });
  } catch (error) {
    console.error('importReferralSpreadsheet error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}