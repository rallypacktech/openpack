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
        const skip = body.skip || 0;
        const limit = body.limit || 5; // Small batches to avoid timeout

        const all = await base44.asServiceRole.entities.ProductRecommendation.filter({ active: true });
        const withLinks = all.filter(rec => rec.affiliate_link);
        const batch = withLinks.slice(skip, skip + limit);

        const updated = [];
        const errors = [];

        for (const rec of batch) {
            try {
                const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt: `Visit this product page and find the current sale/listing price:

${rec.affiliate_link}

Product: ${rec.item_name}

Return only the current price in cents (e.g. $19.99 = 1999). If you cannot determine the price, return null.`,
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
                    updated.push({ id: rec.id, name: rec.item_name, old: rec.price_cents, new: llmResponse.price_cents });
                }
            } catch (err) {
                errors.push({ id: rec.id, name: rec.item_name, error: err.message });
            }
        }

        const hasMore = skip + limit < withLinks.length;
        return Response.json({
            success: true,
            updated: updated.length,
            errors: errors.length,
            processed: batch.length,
            total: withLinks.length,
            hasMore,
            nextSkip: hasMore ? skip + limit : null,
            details: { updated, errors }
        });

    } catch (error) {
        console.error("Error updating affiliate prices:", error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});