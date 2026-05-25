import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all products missing a description
    const allProducts = await base44.asServiceRole.entities.ProductRecommendation.list();
    const missing = allProducts.filter(p => !p.description || p.description.trim() === '');

    if (missing.length === 0) {
      return Response.json({ updated: 0, message: 'All products already have descriptions.' });
    }

    let updated = 0;
    for (const product of missing) {
      const prompt = `Write a brief 2-3 sentence product description for an emergency preparedness item called "${product.item_name}". 
It belongs to the "${product.category}" category and is intended for a "${product.cache_type.replace('_', ' ')}" emergency kit.
Focus on why it's essential for emergencies, what it does, and any key features. Be practical and concise.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      if (result && typeof result === 'string' && result.trim().length > 0) {
        await base44.asServiceRole.entities.ProductRecommendation.update(product.id, {
          description: result.trim()
        });
        updated++;
      }
    }

    return Response.json({ updated, total_missing: missing.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});