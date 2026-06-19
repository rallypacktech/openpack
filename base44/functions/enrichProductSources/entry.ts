import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Canonical org names this catalog recognizes
const KNOWN_ORGS = [
  "FEMA", "Red Cross", "CDC", "American Heart Association", "Ready.gov",
  "DHS", "OSHA", "CODE3", "AAEP", "USDA/APHIS", "SART", "NOAA",
  "Best Friends Animal Society", "Local Emergency Management",
];

// Normalize casing / common variants to a canonical org name (or null if unknown)
function normalizeOrg(raw) {
  if (!raw) return null;
  const v = String(raw).trim().toLowerCase();
  if (!v) return null;
  if (v.includes("red cross")) return "Red Cross";
  if (v === "code3" || v === "code 3") return "CODE3";
  if (v.includes("ready")) return "Ready.gov";
  if (v.includes("usda") || v.includes("aphis")) return "USDA/APHIS";
  if (v.includes("heart")) return "American Heart Association";
  if (v === "osha") return "OSHA";
  const match = KNOWN_ORGS.find(o => o.toLowerCase() === v);
  return match || null;
}

function uniqueNormalized(orgs) {
  const out = [];
  for (const o of orgs || []) {
    const n = normalizeOrg(o);
    if (n && !out.includes(n)) out.push(n);
  }
  return out;
}

// OSHA-recommended emergency/safety items to ensure exist in the catalog
const OSHA_ITEMS = [
  { item_name: "ABC fire extinguisher", category: "tools", cache_type: "general", is_required: true },
  { item_name: "First aid kit", category: "medical", cache_type: "go_bag", is_required: true },
  { item_name: "N95 respirator masks", category: "medical", cache_type: "go_bag" },
  { item_name: "Safety goggles", category: "tools", cache_type: "go_bag" },
  { item_name: "Heavy-duty work gloves", category: "tools", cache_type: "go_bag" },
  { item_name: "Fire blanket", category: "tools", cache_type: "general" },
  { item_name: "Reflective safety vest", category: "clothing", cache_type: "go_bag" },
  { item_name: "Emergency eye wash", category: "medical", cache_type: "general" },
  { item_name: "Hard hat", category: "tools", cache_type: "general" },
  { item_name: "Ear plugs (hearing protection)", category: "hygiene", cache_type: "go_bag" },
  { item_name: "Smoke and carbon monoxide detector", category: "tools", cache_type: "general", is_required: true },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const seedOSHA = body.seedOSHA !== false;
    const skip = Number(body.skip) || 0;
    const limit = Number(body.limit) || 50;

    const allProducts = await base44.asServiceRole.entities.ProductRecommendation.list();
    const byName = {};
    for (const p of allProducts) byName[(p.item_name || "").trim().toLowerCase()] = p;

    let oshaCreated = 0;
    let oshaTagged = 0;

    // ── Seed OSHA items (only on first page) ──────────────────────────────
    if (seedOSHA && skip === 0) {
      for (const item of OSHA_ITEMS) {
        const existing = byName[item.item_name.trim().toLowerCase()];
        if (existing) {
          const merged = uniqueNormalized([...(existing.source_organizations || []), existing.source_organization, "OSHA"]);
          const before = uniqueNormalized([...(existing.source_organizations || []), existing.source_organization]);
          if (merged.length !== before.length) {
            await base44.asServiceRole.entities.ProductRecommendation.update(existing.id, { source_organizations: merged });
            oshaTagged++;
          }
        } else {
          await base44.asServiceRole.entities.ProductRecommendation.create({
            item_name: item.item_name,
            category: item.category,
            cache_type: item.cache_type,
            quantity: 1,
            family_member_types: ["person"],
            fema_regions: [],
            disaster_types: [],
            is_required: !!item.is_required,
            active: true,
            source_organizations: ["OSHA"],
            priority: item.is_required ? 55 : 15,
          });
          oshaCreated++;
        }
      }
    }

    // ── Enrich a batch of existing products with missing orgs ─────────────
    const batch = allProducts.slice(skip, skip + limit);
    let enriched = 0;

    if (batch.length > 0) {
      const itemList = batch.map(p => ({
        id: p.id,
        name: p.item_name,
        category: p.category,
        for: (p.family_member_types || []).join(",") || "person",
      }));

      const llmResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an emergency-preparedness expert. For each product below, list which of these official organizations publish guidance that recommends this item for emergency preparedness. ONLY choose from this exact list: ${KNOWN_ORGS.join(", ")}.

Rules:
- Only include an organization if it is well-established that they recommend this category of item (e.g. FEMA/Red Cross/Ready.gov for general go-bag staples; OSHA for workplace safety/PPE items like fire extinguishers, first aid kits, respirators, goggles, gloves, hard hats; CDC/American Heart Association for medical; AAEP/USDA/APHIS/SART for equine/livestock; Best Friends Animal Society for pets; NOAA for weather/flood; CDC for hygiene/medical).
- Be conservative — do not invent endorsements. If unsure, return fewer orgs.
- Use the EXACT names from the list.

Products:
${JSON.stringify(itemList)}`,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  orgs: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
      });

      const resultMap = {};
      for (const r of (llmResult?.results || [])) resultMap[r.id] = r.orgs || [];

      for (const product of batch) {
        const existing = uniqueNormalized([...(product.source_organizations || []), product.source_organization]);
        const suggested = uniqueNormalized(resultMap[product.id] || []);
        const merged = [...existing];
        for (const o of suggested) if (!merged.includes(o)) merged.push(o);

        // Update if we added orgs OR cleaned up duplicate/legacy casing
        const changed = merged.length !== (product.source_organizations || []).length
          || merged.some((o, i) => o !== (product.source_organizations || [])[i]);
        if (changed && merged.length > 0) {
          await base44.asServiceRole.entities.ProductRecommendation.update(product.id, { source_organizations: merged });
          enriched++;
        }
      }
    }

    const nextSkip = skip + limit;
    const hasMore = nextSkip < allProducts.length;

    return Response.json({
      total: allProducts.length,
      processed: Math.min(nextSkip, allProducts.length),
      enriched,
      oshaCreated,
      oshaTagged,
      hasMore,
      nextSkip: hasMore ? nextSkip : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});