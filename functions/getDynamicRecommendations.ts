import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cacheId } = await req.json();

    if (!cacheId) {
      return Response.json({ error: 'Cache ID required' }, { status: 400 });
    }

    // Get user profile for FEMA region
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    const userProfile = profiles[0];

    // Get cache details
    const caches = await base44.entities.EmergencyCache.list();
    const cache = caches.find(c => c.id === cacheId);

    if (!cache) {
      return Response.json({ error: 'Cache not found' }, { status: 404 });
    }

    // Determine cache type from name
    const cacheName = cache.name.toLowerCase();
    const cacheType = cacheName.includes("go bag") || cacheName.includes("gobag") ? "go_bag" :
                     cacheName.includes("automobile") || cacheName.includes("auto") || cacheName.includes("car") ? "automobile" : 
                     "general";

    // Get family members and pets to determine needs
    const [familyMembers, pets] = await Promise.all([
      base44.entities.FamilyMember.filter({ created_by: user.email }),
      base44.entities.Pet.filter({ created_by: user.email })
    ]);

    const familyTypes = ['person']; // Always include person
    const petSizes = new Set();
    pets.forEach(pet => {
      const petType = pet.species.toLowerCase();
      if (!familyTypes.includes(petType)) {
        familyTypes.push(petType);
      }
      if (pet.size) petSizes.add(pet.size);
    });

    // Get all recommendations
    const allRecommendations = await base44.entities.ProductRecommendation.filter({ active: true }, "-priority");

    // Filter recommendations based on:
    // 1. Cache type
    // 2. FEMA region (if specified)
    // 3. Family member types (if specified)
    const filteredRecs = allRecommendations.filter(rec => {
      // Cache type must match
      if (rec.cache_type !== cacheType && rec.cache_type !== "general") {
        return false;
      }

      // If rec specifies FEMA regions, user's region must match
      if (rec.fema_regions && rec.fema_regions.length > 0) {
        if (!userProfile || !userProfile.fema_region) {
          return false; // Skip region-specific items if user has no region
        }
        if (!rec.fema_regions.includes(userProfile.fema_region)) {
          return false;
        }
      }

      // If rec specifies family member types, at least one must match
      if (rec.family_member_types && rec.family_member_types.length > 0) {
        const hasMatch = rec.family_member_types.some(type => 
          familyTypes.includes(type.toLowerCase())
        );
        if (!hasMatch) {
          return false;
        }
      }

      // If rec specifies pet sizes, user must have a pet of that size
      if (rec.pet_sizes && rec.pet_sizes.length > 0) {
        const hasSizeMatch = rec.pet_sizes.some(size => petSizes.has(size));
        if (!hasSizeMatch) {
          return false;
        }
      }

      return true;
    });

    // Get existing items and user progress
    const [existingItems, userProgress] = await Promise.all([
      base44.entities.CacheItem.filter({ cache_id: cacheId }),
      base44.entities.UserCacheProgress.filter({ cache_id: cacheId })
    ]);

    // Build progress map
    const progressMap = {};
    userProgress.forEach(p => {
      progressMap[p.recommendation_id] = p;
    });

    // Filter out dismissed, purchased, or manually added recommendations
    const relevantRecs = filteredRecs.filter(rec => {
      const progress = progressMap[rec.id];
      
      if (progress && ['dismissed', 'purchased', 'manually_added'].includes(progress.status)) {
        return false;
      }

      // Check if item exists and is not expired
      const existingItem = existingItems.find(item => 
        item.item_name.toLowerCase().includes(rec.item_name.toLowerCase()) ||
        rec.item_name.toLowerCase().includes(item.item_name.toLowerCase())
      );
      
      if (existingItem) {
        if (!existingItem.expiration_date) return false;
        const expDate = new Date(existingItem.expiration_date);
        if (expDate >= new Date()) return false; // Not expired
      }
      
      return true;
    });

    return Response.json({ 
      recommendations: relevantRecs,
      userProgress: progressMap
    });

  } catch (error) {
    console.error("Error getting dynamic recommendations:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});