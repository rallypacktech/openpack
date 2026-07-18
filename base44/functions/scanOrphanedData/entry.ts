import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const sr = base44.asServiceRole;

    // Load all entities needed for cross-referencing
    const [users, caches, cacheItems, firstAidLocations, firstAidItems, notifications, familyMembers, pets, meetSpots, evacuationDestinations] = await Promise.all([
      sr.entities.User.list(),
      sr.entities.EmergencyCache.list(),
      sr.entities.CacheItem.list(),
      sr.entities.FirstAidKitLocation.list(),
      sr.entities.FirstAidItem.list(),
      sr.entities.Notification.list(),
      sr.entities.FamilyMember.list(),
      sr.entities.Pet.list(),
      sr.entities.MeetSpot.list(),
      sr.entities.EvacuationDestination.list(),
    ]);

    const validUserIds = new Set(users.map(u => u.id));
    const cacheIds = new Set(caches.map(c => c.id));

    // Helper: only flag records with a real user UUID that no longer exists
    // (excludes service-role records like "service_..." which are system-generated)
    const isOrphanedByUser = (record) => {
      const cid = record.created_by_id;
      if (!cid) return false;
      if (cid.startsWith('service_')) return false; // system-generated, not orphaned
      return !validUserIds.has(cid);
    };

    // 1. CacheItems whose cache_id doesn't match any EmergencyCache
    const orphanedCacheItems = cacheItems.filter(ci => !cacheIds.has(ci.cache_id));

    // 2. FirstAidKitLocations whose emergency_cache_id doesn't match any EmergencyCache
    const orphanedFirstAidLocations = firstAidLocations.filter(loc => !cacheIds.has(loc.emergency_cache_id));

    // 3. Records whose created_by_id is a real user that no longer exists
    const orphanedNotifications = notifications.filter(isOrphanedByUser);
    const orphanedFamilyMembers = familyMembers.filter(isOrphanedByUser);
    const orphanedPets = pets.filter(isOrphanedByUser);
    const orphanedMeetSpots = meetSpots.filter(isOrphanedByUser);
    const orphanedEvacDestinations = evacuationDestinations.filter(isOrphanedByUser);

    const result = {
      orphaned_cache_items: orphanedCacheItems.slice(0, 50).map(ci => ({
        id: ci.id,
        item_name: ci.item_name,
        cache_id: ci.cache_id,
        created_by_id: ci.created_by_id,
        created_date: ci.created_date
      })),
      orphaned_first_aid_locations: orphanedFirstAidLocations.slice(0, 50).map(loc => ({
        id: loc.id,
        emergency_cache_id: loc.emergency_cache_id,
        created_by_id: loc.created_by_id,
        created_date: loc.created_date
      })),
      orphaned_notifications: orphanedNotifications.slice(0, 50).map(n => ({
        id: n.id,
        title: n.title,
        recipient_email: n.recipient_email,
        created_by_id: n.created_by_id,
        created_date: n.created_date
      })),
      orphaned_family_members: orphanedFamilyMembers.slice(0, 50).map(fm => ({
        id: fm.id,
        name: fm.name || 'Unknown',
        created_by_id: fm.created_by_id,
        created_date: fm.created_date
      })),
      orphaned_pets: orphanedPets.slice(0, 50).map(p => ({
        id: p.id,
        name: p.name,
        species: p.species,
        created_by_id: p.created_by_id,
        created_date: p.created_date
      })),
      orphaned_meet_spots: orphanedMeetSpots.slice(0, 50).map(ms => ({
        id: ms.id,
        name: ms.name || 'Unknown',
        created_by_id: ms.created_by_id,
        created_date: ms.created_date
      })),
      orphaned_evacuation_destinations: orphanedEvacDestinations.slice(0, 50).map(ed => ({
        id: ed.id,
        name: ed.name,
        created_by_id: ed.created_by_id,
        created_date: ed.created_date
      })),
      summary: {
        cache_items: orphanedCacheItems.length,
        first_aid_locations: orphanedFirstAidLocations.length,
        notifications: orphanedNotifications.length,
        family_members: orphanedFamilyMembers.length,
        pets: orphanedPets.length,
        meet_spots: orphanedMeetSpots.length,
        evacuation_destinations: orphanedEvacDestinations.length,
        total: orphanedCacheItems.length + orphanedFirstAidLocations.length + orphanedNotifications.length +
               orphanedFamilyMembers.length + orphanedPets.length + orphanedMeetSpots.length + orphanedEvacDestinations.length
      }
    };

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});