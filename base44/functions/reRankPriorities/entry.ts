import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Priority weight by source organization — reflects authority and breadth of emergency guidance
const ORG_WEIGHTS = {
  "FEMA":                       30,
  "Red Cross":                  25,
  "CDC":                        20,
  "American Heart Association": 20,
  "Ready.gov":                  15,
  "DHS":                        15,
  "OSHA":                       15,
  "ANSI":                       12,
  "CODE3":                      10,
  "AAEP":                       12,
  "USDA/APHIS":                 12,
  "NOAA":                       10,
  "Best Friends Animal Society": 8,
  "Local Emergency Management":  5,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const products = await base44.asServiceRole.entities.ProductRecommendation.list();
    let updated = 0;

    for (const product of products) {
      const orgs = product.source_organizations?.length
        ? product.source_organizations
        : product.source_organization ? [product.source_organization] : [];

      const maxOrgWeight = orgs.reduce((max, org) => Math.max(max, ORG_WEIGHTS[org] || 0), 0);
      const requiredBonus = product.is_required ? 40 : 0;
      const newPriority = maxOrgWeight + requiredBonus;

      await base44.asServiceRole.entities.ProductRecommendation.update(product.id, { priority: newPriority });
      updated++;
    }

    return Response.json({ updated, message: `Re-ranked ${updated} products` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});