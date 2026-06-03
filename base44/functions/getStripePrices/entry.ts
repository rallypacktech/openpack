import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const stripe = new Stripe(Deno.env.get('Stripe'));

        // Fetch all active prices with their product info
        const prices = await stripe.prices.list({
            active: true,
            expand: ['data.product'],
            limit: 100,
        });

        // Return structured price data
        const priceData = prices.data
            .filter(p => p.product && !p.product.deleted)
            .map(p => ({
                id: p.id,
                unit_amount: p.unit_amount,
                currency: p.currency,
                recurring: p.recurring,
                product: {
                    id: p.product.id,
                    name: p.product.name,
                    description: p.product.description,
                    metadata: p.product.metadata,
                },
            }));

        return Response.json({ prices: priceData });
    } catch (error) {
        console.error('getStripePrices error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});