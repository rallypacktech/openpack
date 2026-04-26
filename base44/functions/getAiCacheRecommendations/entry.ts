import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Uses LLM to generate personalized product recommendations for a cache or first-aid kit,
 * considering the user's household (people + pets), region, and what they already have.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { cacheId, mode } = await req.json(); // mode: "cache" | "firstaid"

    const [profiles, familyMembers, pets] = await Promise.all([
      base44.entities.UserProfile.filter({ created_by: user.email }),
      base44.entities.FamilyMember.filter({ created_by: user.email }),
      base44.entities.Pet.filter({ created_by: user.email }),
    ]);

    const profile = profiles[0] || {};

    // Build context about household
    const householdDesc = [
      `${familyMembers.length + 1} people total (1 primary adult${familyMembers.length > 0 ? `, ${familyMembers.length} family member(s): ${familyMembers.map(m => `${m.name} (${m.relationship}${m.age ? ', age ' + m.age : ''}${m.medical_conditions ? ', medical: ' + m.medical_conditions : ''})`).join('; ')}` : ''})`,
      pets.length > 0 ? `${pets.length} pet(s): ${pets.map(p => `${p.name} the ${p.size || ''} ${p.species}${p.medical_conditions ? ' (medical: ' + p.medical_conditions + ')' : ''}`).join(', ')}` : 'no pets',
      profile.fema_region ? `FEMA ${profile.fema_region}` : '',
      profile.climate_zone ? `climate: ${profile.climate_zone}` : '',
    ].filter(Boolean).join('. ');

    let existingItems = [];
    let cacheInfo = null;

    if (mode === 'cache' && cacheId) {
      const [cacheItemsRaw, caches] = await Promise.all([
        base44.entities.CacheItem.filter({ cache_id: cacheId }),
        base44.entities.EmergencyCache.list(),
      ]);
      cacheInfo = caches.find(c => c.id === cacheId);
      existingItems = cacheItemsRaw.map(i => i.item_name);
    } else if (mode === 'firstaid') {
      const items = await base44.entities.FirstAidItem.filter({ created_by: user.email });
      existingItems = items.filter(i => i.owned).map(i => i.name);
    }

    const cacheDesc = cacheInfo
      ? `${cacheInfo.name} (type: ${cacheInfo.cache_type || 'general'}, location: ${cacheInfo.location || 'home'})`
      : mode === 'firstaid' ? 'first aid kit' : 'emergency cache';

    const prompt = `You are an emergency preparedness expert (FEMA-certified level). 
Household: ${householdDesc}.
Emergency supply context: ${cacheDesc}.
Items already present: ${existingItems.length > 0 ? existingItems.join(', ') : 'none yet'}.

Generate exactly 8 specific product recommendations that are MISSING from this ${mode === 'firstaid' ? 'first aid kit' : 'emergency cache'}.
Prioritize:
1. Critical safety gaps given the household (medical conditions, pets, children)
2. Region-specific risks
3. Items most likely to be forgotten

For each item include a realistic Amazon search query as the affiliate_search so users can find it.
Be very specific (e.g. "Pediatric liquid ibuprofen 4oz" not just "medicine").`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                item_name: { type: 'string' },
                category: { type: 'string', enum: ['water', 'food', 'medical', 'tools', 'clothing', 'documents', 'communication', 'hygiene', 'other'] },
                why: { type: 'string', description: 'Short reason specific to this household' },
                quantity: { type: 'number' },
                affiliate_search: { type: 'string', description: 'Amazon search query' },
                priority: { type: 'string', enum: ['critical', 'important', 'nice-to-have'] },
                for_whom: { type: 'string', description: 'person, child name, pet name, etc.' },
              },
            },
          },
        },
      },
    });

    return Response.json({ recommendations: result.recommendations || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});