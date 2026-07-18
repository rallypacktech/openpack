import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

// Supabase configuration
const SUPABASE_URL = Deno.env.get("supapublish");
const SUPABASE_KEY = Deno.env.get("supasecret");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Hash function for user ID — salt sourced from environment variable for security
async function hashData(data) {
  const salt = Deno.env.get("HASH_SALT");
  if (!salt) {
    throw new Error("HASH_SALT environment variable is not configured");
  }
  const encoder = new TextEncoder();
  const dataWithSalt = encoder.encode(data + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataWithSalt);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hashedUserId = await hashData(user.id);
    const hashedEmail = await hashData(user.email);

    // Fetch pets before deletion
    const pets = await base44.entities.Pet.list();

    // Update Supabase pet records to mark as orphaned (owner deleted account)
    // Keep microchip info and last known owner data
    if (pets.length > 0) {
      for (const pet of pets) {
        const hashedPetId = await hashData(pet.id);
        
        await supabase
          .from('pets')
          .upsert({
            id: hashedPetId,
            user_id: hashedUserId,
            name: pet.name,
            species: pet.species,
            breed: pet.breed || null,
            microchip_number: pet.microchip_number || null,
            last_known_owner_name: user.full_name,
            last_known_owner_email: hashedEmail,
            owner_address: null, // Could fetch from UserProfile if needed
            account_deleted: true,
            account_deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    }

    // Delete all user entities from Base44
    const [profiles, familyMembers, caches, cacheItems, meetSpots, firstAidItems, notifications] = await Promise.all([
      base44.entities.UserProfile.list(),
      base44.entities.FamilyMember.list(),
      base44.entities.EmergencyCache.list(),
      base44.entities.CacheItem.list(),
      base44.entities.MeetSpot.list(),
      base44.entities.FirstAidItem.list(),
      base44.entities.Notification.list()
    ]);

    // Snapshot all user data to DeletionQueue (90-day retention for recovery)
    const now = new Date();
    const purgeAfter = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    try {
      await base44.asServiceRole.entities.DeletionQueue.create({
        deleted_user_email: user.email,
        deleted_user_id: user.id,
        deleted_user_name: user.full_name || user.email,
        data_snapshot: {
          user_profile: profiles[0] || null,
          family_members: familyMembers,
          pets: pets,
          emergency_caches: caches,
          cache_items: cacheItems,
          meet_spots: meetSpots,
          first_aid_items: firstAidItems,
          notifications: notifications,
        },
        deleted_at: now.toISOString(),
        purge_after: purgeAfter.toISOString(),
        restored: false,
      });
    } catch (snapshotError) {
      console.error("Failed to create deletion queue entry:", snapshotError);
    }

    // Delete all records
    await Promise.all([
      ...profiles.map(p => base44.asServiceRole.entities.UserProfile.delete(p.id)),
      ...familyMembers.map(m => base44.asServiceRole.entities.FamilyMember.delete(m.id)),
      ...pets.map(p => base44.asServiceRole.entities.Pet.delete(p.id)),
      ...caches.map(c => base44.asServiceRole.entities.EmergencyCache.delete(c.id)),
      ...cacheItems.map(i => base44.asServiceRole.entities.CacheItem.delete(i.id)),
      ...meetSpots.map(s => base44.asServiceRole.entities.MeetSpot.delete(s.id)),
      ...firstAidItems.map(i => base44.asServiceRole.entities.FirstAidItem.delete(i.id)),
      ...notifications.map(n => base44.asServiceRole.entities.Notification.delete(n.id))
    ]);

    // Delete user profile from Supabase (except pet records)
    await supabase.from('user_profiles').delete().eq('user_id', hashedUserId);
    await supabase.from('family_members').delete().eq('user_id', hashedUserId);
    await supabase.from('notifications').delete().eq('user_id', hashedUserId);

    return Response.json({ 
      success: true,
      message: 'Account deleted successfully. Pet microchip records retained for emergency purposes.',
      pets_retained: pets.length
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});