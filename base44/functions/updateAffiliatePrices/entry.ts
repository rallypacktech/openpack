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
        const index = body.index ?? 0; // which single item to process

        // Fetch all active products with links (ids + affiliate_link only via filter)
        const all = await base44.asServiceRole.entities.ProductRecommendation.list(null, 500);
        const withLinks = all.filter(rec => rec.active && rec.affiliate_link);
        const total = withLinks.length;

        if (total === 0) {
            return Response.json({ success: true, updated: 0, processed: 0, total: 0, hasMore: false, nextIndex: null });
        }

        if (index >= total) {
            return Response.json({ success: true, updated: 0, processed: 0, total, hasMore: false, nextIndex: null });
        }

        const rec = withLinks[index];
        let updated = 0;
        let error = null;

        try {
            const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: `Visit this product page and find the current sale/listing price:

${rec.affiliate_link}

Product: ${rec.item_name}

Return only the current price in cents as an integer (e.g. $19.99 = 1999). If you cannot determine the price, return null.`,
                add_context_from_internet: true,
                model: "gemini_3_flash",
                response_json_schema: {
                    type: "object",
                    properties: {
                        price_cents: { type: "number" }
                    }
                }
            });

            if (llmResponse.price_cents && llmResponse.price_cents > 0 && llmResponse.price_cents !== rec.price_cents) {
                await base44.asServiceRole.entities.ProductRecommendation.update(rec.id, {
                    price_cents: llmResponse.price_cents
                });
                updated = 1;
            }
        } catch (err) {
            error = err.message;
        }

        const hasMore = index + 1 < total;
        return Response.json({
            success: true,
            updated,
            error,
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