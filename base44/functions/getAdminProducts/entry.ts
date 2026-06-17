import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [products, suggestions] = await Promise.all([
      base44.asServiceRole.entities.ProductRecommendation.list('-priority', 500),
      base44.asServiceRole.entities.ProductRecommendationSuggestion.list('-created_date', 500)
    ]);

    return Response.json({ products, suggestions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});