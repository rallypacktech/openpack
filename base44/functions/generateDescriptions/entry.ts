import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const index = body.index ?? 0;

        const all = await base44.asServiceRole.entities.ProductRecommendation.list(null, 500);
        // Only active products missing a description
        const targets = all.filter(p => p.active && (!p.description || p.description.trim() === ''));
        const total = targets.length;

        if (total === 0 || index >= total) {
            return Response.json({ success: true, updated: 0, total, hasMore: false, nextIndex: null });
        }

        const product = targets[index];
        let updated = 0;
        let itemError = null;

        try {
            const prompt = `Write a brief 2-3 sentence product description for an emergency preparedness item called "${product.item_name}". 
It belongs to the "${product.category}" category and is intended for a "${product.cache_type.replace('_', ' ')}" emergency kit.
Focus on why it's essential for emergencies, what it does, and any key features. Be practical and concise.`;

            const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
            if (result && typeof result === 'string' && result.trim().length > 0) {
                await base44.asServiceRole.entities.ProductRecommendation.update(product.id, {
                    description: result.trim()
                });
                updated = 1;
            }
        } catch (err) {
            itemError = err.message;
        }

        const hasMore = index + 1 < total;
        return Response.json({
            success: true,
            updated,
            error: itemError,
            processed: 1,
            total,
            hasMore,
            nextIndex: hasMore ? index + 1 : null,
            item: product.item_name
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});