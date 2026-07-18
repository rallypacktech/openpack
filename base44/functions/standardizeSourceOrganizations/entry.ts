import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    // Standardize duplicate org name variants
    const ORG_NORMALIZE = {
      'Code3': 'CODE3',
      'REI': 'REI Co-op',
    };

    // Sierra Club Ten Essentials — items matching these patterns get tagged
    const SIERRA_CLUB_PATTERNS = [
      /\bmap\b|\bcompass\b|\bgps\b/i,
      /sunscreen|sunglasses|sun.?hat/i,
      /flashlight|headlamp|lantern|torch/i,
      /first.?aid|bandage|tourniquet|antiseptic|gauze|medical kit/i,
      /\bfire\b|matches|lighter|firestarter|fire starter/i,
      /multi.?tool|multitool|\bknife\b|pliers|duct.?tape|\bwhistle\b/i,
      /food|energy.?bar|trail.?mix|jerky|ration|protein.?bar|meal.?ready/i,
      /\bwater\b|hydration|purif|filter|canteen|\bbottle\b/i,
      /shelter|\btent\b|\btarp\b|space.?blanket|emergency.?blanket|sleeping.?bag/i,
      /jacket|rain.?gear|rain.?poncho|\bboot\b|sturdy.?shoe|warm.?cloth|extra.?cloth|\bglove/i,
    ];

    function shouldTagSierraClub(itemName) {
      return SIERRA_CLUB_PATTERNS.some(p => p.test(itemName || ''));
    }

    function normalizeOrgs(orgs) {
      const normalized = new Set();
      (orgs || []).forEach(o => {
        const mapped = ORG_NORMALIZE[o] || o;
        normalized.add(mapped);
      });
      return Array.from(normalized);
    }

    function defaultOrgsForCategory(category) {
      switch (category) {
        case 'water': return ['FEMA', 'CDC', 'EPA'];
        case 'food': return ['FEMA', 'USDA/APHIS'];
        case 'medical': return ['Red Cross', 'CDC', 'American Heart Association'];
        case 'tools': return ['FEMA', 'OSHA'];
        case 'clothing': return ['FEMA', 'Red Cross'];
        case 'documents': return ['FEMA', 'Ready.gov'];
        case 'communication': return ['NOAA', 'FEMA'];
        case 'hygiene': return ['CDC', 'Red Cross'];
        default: return ['FEMA'];
      }
    }

    const all = await base44.asServiceRole.entities.ProductRecommendation.list('-priority', 500);

    let normalized = 0, migrated = 0, tagged = 0, sierraClubTagged = 0, totalUpdated = 0;
    const sampleUpdates = [];

    for (const rec of all) {
      const updates_needed = {};

      // Start with current source_organizations (normalized)
      let orgs = normalizeOrgs(rec.source_organizations || []);
      const originalOrgs = rec.source_organizations || [];

      if (JSON.stringify(orgs) !== JSON.stringify(originalOrgs)) {
        normalized++;
      }

      // Migrate legacy source_organization into the array
      if (rec.source_organization) {
        const legacyNormalized = ORG_NORMALIZE[rec.source_organization] || rec.source_organization;
        if (!orgs.includes(legacyNormalized)) {
          orgs.push(legacyNormalized);
          migrated++;
        }
      }

      // Tag untagged items with default orgs based on category
      if (orgs.length === 0) {
        orgs = defaultOrgsForCategory(rec.category);
        tagged++;
      }

      // Add Sierra Club to Ten Essentials items
      if (shouldTagSierraClub(rec.item_name) && !orgs.includes('Sierra Club')) {
        orgs.push('Sierra Club');
        sierraClubTagged++;
      }

      if (JSON.stringify(orgs) !== JSON.stringify(originalOrgs)) {
        updates_needed.source_organizations = orgs;
      }

      if (Object.keys(updates_needed).length > 0) {
        await base44.asServiceRole.entities.ProductRecommendation.update(rec.id, updates_needed);
        totalUpdated++;
        if (sampleUpdates.length < 20) {
          sampleUpdates.push({ id: rec.id, name: rec.item_name, orgs });
        }
      }
    }

    return Response.json({
      success: true,
      total_processed: all.length,
      normalized_count: normalized,
      migrated_count: migrated,
      newly_tagged_count: tagged,
      sierra_club_tagged_count: sierraClubTagged,
      total_updated: totalUpdated,
      sample_updates: sampleUpdates,
    });
  } catch (error) {
    console.error('standardizeSourceOrganizations error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});