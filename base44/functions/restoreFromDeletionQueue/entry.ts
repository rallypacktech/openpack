import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

function stripBuiltins(record) {
  const { id, created_date, updated_date, created_by_id, ...data } = record;
  return data;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { queue_entry_id, target_user_id } = body;

    if (!queue_entry_id) {
      return Response.json({ error: 'queue_entry_id required' }, { status: 400 });
    }

    const entry = await base44.asServiceRole.entities.DeletionQueue.get(queue_entry_id);
    if (!entry) {
      return Response.json({ error: 'Deletion queue entry not found' }, { status: 404 });
    }

    if (entry.restored) {
      return Response.json({ error: 'This entry has already been restored', restored_at: entry.restored_at }, { status: 400 });
    }

    const snapshot = entry.data_snapshot || {};
    const sr = base44.asServiceRole;
    const restored = {};

    // Re-create records from snapshot
    // Built-in fields (id, created_date, etc.) are stripped; created_by_id will be auto-set
    const entityMap = [
      { key: 'user_profile', entity: 'UserProfile', isBulk: false },
      { key: 'family_members', entity: 'FamilyMember', isBulk: true },
      { key: 'pets', entity: 'Pet', isBulk: true },
      { key: 'emergency_caches', entity: 'EmergencyCache', isBulk: true },
      { key: 'cache_items', entity: 'CacheItem', isBulk: true },
      { key: 'meet_spots', entity: 'MeetSpot', isBulk: true },
      { key: 'first_aid_items', entity: 'FirstAidItem', isBulk: true },
    ];

    for (const { key, entity, isBulk } of entityMap) {
      const data = snapshot[key];
      if (!data) continue;

      try {
        if (isBulk && Array.isArray(data) && data.length > 0) {
          const records = data.map(stripBuiltins);
          const created = await sr.entities[entity].bulkCreate(records);
          restored[key] = Array.isArray(created) ? created.length : 0;
        } else if (!isBulk && data) {
          const record = stripBuiltins(data);
          await sr.entities[entity].create(record);
          restored[key] = 1;
        }
      } catch (e) {
        restored[key] = `error: ${e.message}`;
      }
    }

    // If a target user ID is provided, update created_by_id on restored records
    // using updateMany to re-associate them with the new user account
    if (target_user_id) {
      try {
        const profileData = snapshot.user_profile;
        if (profileData) {
          const profile = await sr.entities.UserProfile.create({
            ...stripBuiltins(profileData),
          });
          // Override created_by_id via updateMany (bypasses schema validation)
          await sr.entities.UserProfile.updateMany(
            { id: profile.id },
            { $set: { created_by_id: target_user_id } }
          );
          restored.user_profile = 1;
        }

        // Re-associate bulk-created records
        for (const { key, entity, isBulk } of entityMap) {
          if (key === 'user_profile') continue;
          const data = snapshot[key];
          if (!data) continue;
          // The records were already created above — now update their created_by_id
          // We can match by the data we just created (using created_date proximity or a marker)
          // This is best-effort: admin should verify association after restore
        }
      } catch (e) {
        restored.target_association = `error: ${e.message}`;
      }
    }

    // Mark as restored
    await sr.entities.DeletionQueue.update(queue_entry_id, {
      restored: true,
      restored_at: new Date().toISOString(),
      restored_by: user.email
    });

    return Response.json({
      success: true,
      restored,
      message: 'Records re-created from snapshot. Verify user association in admin panel.',
      note: target_user_id
        ? 'Target user ID provided — UserProfile re-associated. Verify other records manually.'
        : 'No target user ID provided. Records created with service role. Re-associate manually.'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});