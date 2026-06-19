import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        try {
            const user = await base44.auth.me();
            if (user?.role !== 'admin') {
                return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
            }
        } catch {
            // No auth = scheduled/service call, allow through
        }

        const body = await req.json().catch(() => ({}));
        const index = body.index ?? 0;

        const all = await base44.asServiceRole.entities.ProductRecommendation.list(null, 500);
        // Only process active products missing a price
        const targets = all.filter(rec => rec.active && (!rec.price_cents || rec.price_cents === 0));
        const total = targets.length;

        if (total === 0 || index >= total) {
            return Response.json({ success: true, updated: 0, processed: 0, total, hasMore: false, nextIndex: null });
        }

        const rec = targets[index];
        let updated = 0;
        let itemError = null;

        try {
            const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: `Estimate a typical retail price in US dollars for this emergency preparedness product:

Item name: "${rec.item_name}"
Category: ${rec.category}
Kit type: ${rec.cache_type}
${rec.affiliate_link ? `Product URL for reference: ${rec.affiliate_link}` : ''}

Return an estimated price in cents as an integer (e.g. $19.99 = 1999). Use typical Amazon/retail pricing for this type of item. Do not return null — always give a reasonable estimate.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        price_cents: { type: "number" }
                    }
                }
            });

            if (llmResponse.price_cents && llmResponse.price_cents > 0) {
                await base44.asServiceRole.entities.ProductRecommendation.update(rec.id, {
                    price_cents: Math.round(llmResponse.price_cents)
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
            item: rec.item_name
        });

    } catch (error) {
        console.error("Error updating affiliate prices:", error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});