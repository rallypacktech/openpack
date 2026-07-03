import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

// Hash function for privacy (SHA-256 with salt)
async function hashData(data, salt) {
    if (!data) return null;
    const textEncoder = new TextEncoder();
    const dataBuffer = textEncoder.encode(data + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Encrypt sensitive data using AES-GCM
async function encryptData(data, key) {
    if (!data) return null;
    const textEncoder = new TextEncoder();
    const encodedData = textEncoder.encode(data);
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
    );
    
    const result = new Uint8Array(iv.length + encryptedData.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encryptedData), iv.length);
    
    return btoa(String.fromCharCode(...result));
}

// Generate encryption key from password
async function getEncryptionKey(password) {
    const textEncoder = new TextEncoder();
    const passwordData = textEncoder.encode(password);
    const baseKey = await crypto.subtle.importKey(
        'raw',
        passwordData,
        'PBKDF2',
        false,
        ['deriveKey']
    );
    
    const salt = textEncoder.encode(Deno.env.get("PBKDF2_SALT") || password.slice(0, 16));
    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://kajkzaufnaalniioobqx.supabase.co";
        const supabaseKey = Deno.env.get("supapublish");
        
        if (!supabaseKey) {
            return Response.json({ error: 'Supabase credentials not configured' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const salt = Deno.env.get("DATA_HASH_SALT");
        const encryptionPassword = Deno.env.get("DATA_ENCRYPTION_KEY");
        if (!salt || !encryptionPassword) {
            return Response.json({ error: 'DATA_HASH_SALT and DATA_ENCRYPTION_KEY secrets must be configured before syncing.' }, { status: 500 });
        }
        const encryptionKey = await getEncryptionKey(encryptionPassword);

        const hashedUserId = await hashData(user.email, salt);

        // Sync User Profile
        const profiles = await base44.entities.UserProfile.list();
        const userProfile = profiles.length > 0 ? profiles[0] : null;

        if (userProfile) {
            const profileData = {
                user_id_hash: hashedUserId,
                display_name: await encryptData(userProfile.display_name || user.full_name, encryptionKey),
                city: userProfile.city || null,
                state_province: userProfile.state_province || null,
                country: userProfile.country || null,
                notification_method: userProfile.notification_method || null,
                latitude: userProfile.latitude ? Math.round(userProfile.latitude * 100) / 100 : null,
                longitude: userProfile.longitude ? Math.round(userProfile.longitude * 100) / 100 : null,
                synced_at: new Date().toISOString()
            };

            await supabase.from('base44_users').upsert(profileData, { onConflict: 'user_id_hash' });
        }

        // Sync Family Members (with medical data encrypted)
        const familyMembers = await base44.entities.FamilyMember.list();
        const familyData = await Promise.all(familyMembers.map(async (member) => ({
            user_id_hash: hashedUserId,
            member_id_hash: await hashData(member.id, salt),
            name_encrypted: await encryptData(member.name, encryptionKey),
            relationship: member.relationship,
            age: member.age || null,
            medical_conditions_encrypted: await encryptData(member.medical_conditions, encryptionKey),
            emergency_contact_encrypted: await encryptData(member.emergency_contact, encryptionKey),
            synced_at: new Date().toISOString()
        })));

        if (familyData.length > 0) {
            await supabase.from('base44_family_members').upsert(familyData, { onConflict: 'member_id_hash' });
        }

        // Sync Pets (with medical data encrypted)
        const pets = await base44.entities.Pet.list();
        const petsData = await Promise.all(pets.map(async (pet) => ({
            user_id_hash: hashedUserId,
            pet_id_hash: await hashData(pet.id, salt),
            name_encrypted: await encryptData(pet.name, encryptionKey),
            species: pet.species,
            breed: pet.breed || null,
            age: pet.age || null,
            microchip_encrypted: await encryptData(pet.microchip_number, encryptionKey),
            medical_conditions_encrypted: await encryptData(pet.medical_conditions, encryptionKey),
            synced_at: new Date().toISOString()
        })));

        if (petsData.length > 0) {
            await supabase.from('base44_pets').upsert(petsData, { onConflict: 'pet_id_hash' });
        }

        // Sync Notifications (content encrypted)
        const notifications = await base44.entities.Notification.list('-created_date', 50);
        const notificationsData = await Promise.all(notifications.map(async (notif) => ({
            user_id_hash: hashedUserId,
            notification_id_hash: await hashData(notif.id, salt),
            title_encrypted: await encryptData(notif.title, encryptionKey),
            message_encrypted: await encryptData(notif.message, encryptionKey),
            type: notif.type,
            read: notif.read,
            created_at: notif.created_date,
            synced_at: new Date().toISOString()
        })));

        if (notificationsData.length > 0) {
            await supabase.from('base44_notifications').upsert(notificationsData, { onConflict: 'notification_id_hash' });
        }

        // Aggregate Statistics (Anonymous, Regional Data)
        // These tables store anonymized aggregate data for emergency response planning
        
        // 1. Shelter Demand Statistics (by postal code or city)
        const allProfiles = await base44.asServiceRole.entities.UserProfile.list();
        const allFamilyMembers = await base44.asServiceRole.entities.FamilyMember.list();
        const allPets = await base44.asServiceRole.entities.Pet.list();
        
        // Group by location (postal code or city)
        const locationStats = {};
        
        for (const profile of allProfiles) {
            const locationKey = profile.postal_code || profile.city || 'unknown';
            if (!locationStats[locationKey]) {
                locationStats[locationKey] = {
                    location_identifier: locationKey,
                    city: profile.city,
                    state_province: profile.state_province,
                    country: profile.country,
                    household_count: 0,
                    estimated_people: 0,
                    estimated_pets: 0,
                    updated_at: new Date().toISOString()
                };
            }
            locationStats[locationKey].household_count++;
            
            // Count family members for this household
            const householdMembers = allFamilyMembers.filter(m => m.created_by === profile.created_by);
            locationStats[locationKey].estimated_people += householdMembers.length + 1; // +1 for account holder
            
            // Count pets for this household
            const householdPets = allPets.filter(p => p.created_by === profile.created_by);
            locationStats[locationKey].estimated_pets += householdPets.length;
        }
        
        const shelterDemandData = Object.values(locationStats);
        if (shelterDemandData.length > 0) {
            await supabase.from('aggregate_shelter_demand').upsert(shelterDemandData, { onConflict: 'location_identifier' });
        }
        
        // 2. Regional Preparedness Index
        const allCaches = await base44.asServiceRole.entities.EmergencyCache.list();
        const allFirstAid = await base44.asServiceRole.entities.FirstAidItem.list();
        const allMeetSpots = await base44.asServiceRole.entities.MeetSpot.list();
        
        const preparednessByLocation = {};
        
        for (const profile of allProfiles) {
            const locationKey = profile.postal_code || profile.city || 'unknown';
            if (!preparednessByLocation[locationKey]) {
                preparednessByLocation[locationKey] = {
                    location_identifier: locationKey,
                    city: profile.city,
                    state_province: profile.state_province,
                    country: profile.country,
                    households_with_caches: 0,
                    households_with_first_aid: 0,
                    households_with_meet_spots: 0,
                    total_households: 0,
                    preparedness_score: 0,
                    updated_at: new Date().toISOString()
                };
            }
            
            preparednessByLocation[locationKey].total_households++;
            
            const userEmail = profile.created_by;
            if (allCaches.some(c => c.created_by === userEmail)) {
                preparednessByLocation[locationKey].households_with_caches++;
            }
            if (allFirstAid.some(f => f.created_by === userEmail)) {
                preparednessByLocation[locationKey].households_with_first_aid++;
            }
            if (allMeetSpots.some(m => m.created_by === userEmail)) {
                preparednessByLocation[locationKey].households_with_meet_spots++;
            }
        }
        
        // Calculate preparedness score (0-100)
        Object.values(preparednessByLocation).forEach(loc => {
            if (loc.total_households > 0) {
                const cacheScore = (loc.households_with_caches / loc.total_households) * 40;
                const firstAidScore = (loc.households_with_first_aid / loc.total_households) * 30;
                const meetSpotScore = (loc.households_with_meet_spots / loc.total_households) * 30;
                loc.preparedness_score = Math.round(cacheScore + firstAidScore + meetSpotScore);
            }
        });
        
        const preparednessData = Object.values(preparednessByLocation);
        if (preparednessData.length > 0) {
            await supabase.from('aggregate_preparedness_index').upsert(preparednessData, { onConflict: 'location_identifier' });
        }
        
        // 3. Special Needs Projections (Aggregate counts only)
        const specialNeedsByLocation = {};
        
        for (const profile of allProfiles) {
            const locationKey = profile.postal_code || profile.city || 'unknown';
            if (!specialNeedsByLocation[locationKey]) {
                specialNeedsByLocation[locationKey] = {
                    location_identifier: locationKey,
                    city: profile.city,
                    state_province: profile.state_province,
                    country: profile.country,
                    individuals_with_medical_conditions: 0,
                    elderly_count: 0,
                    children_count: 0,
                    pets_requiring_accommodation: 0,
                    updated_at: new Date().toISOString()
                };
            }
            
            const userEmail = profile.created_by;
            const householdMembers = allFamilyMembers.filter(m => m.created_by === userEmail);
            
            householdMembers.forEach(member => {
                if (member.medical_conditions) {
                    specialNeedsByLocation[locationKey].individuals_with_medical_conditions++;
                }
                if (member.age && member.age >= 65) {
                    specialNeedsByLocation[locationKey].elderly_count++;
                }
                if (member.age && member.age < 18) {
                    specialNeedsByLocation[locationKey].children_count++;
                }
            });
            
            const householdPets = allPets.filter(p => p.created_by === userEmail);
            specialNeedsByLocation[locationKey].pets_requiring_accommodation += householdPets.length;
        }
        
        const specialNeedsData = Object.values(specialNeedsByLocation);
        if (specialNeedsData.length > 0) {
            await supabase.from('aggregate_special_needs').upsert(specialNeedsData, { onConflict: 'location_identifier' });
        }
        
        // 4. Resource Hotspots (Available emergency supplies by area)
        const resourcesByLocation = {};
        
        for (const profile of allProfiles) {
            const locationKey = profile.postal_code || profile.city || 'unknown';
            if (!resourcesByLocation[locationKey]) {
                resourcesByLocation[locationKey] = {
                    location_identifier: locationKey,
                    city: profile.city,
                    state_province: profile.state_province,
                    country: profile.country,
                    total_caches: 0,
                    total_first_aid_items: 0,
                    households_reporting_resources: 0,
                    updated_at: new Date().toISOString()
                };
            }
            
            const userEmail = profile.created_by;
            const userCaches = allCaches.filter(c => c.created_by === userEmail);
            const userFirstAid = allFirstAid.filter(f => f.created_by === userEmail);
            
            if (userCaches.length > 0 || userFirstAid.length > 0) {
                resourcesByLocation[locationKey].households_reporting_resources++;
            }
            
            resourcesByLocation[locationKey].total_caches += userCaches.length;
            resourcesByLocation[locationKey].total_first_aid_items += userFirstAid.length;
        }
        
        const resourcesData = Object.values(resourcesByLocation);
        if (resourcesData.length > 0) {
            await supabase.from('aggregate_resource_hotspots').upsert(resourcesData, { onConflict: 'location_identifier' });
        }

        // Sync versioned cache data for outage resilience
        const allCacheItems = await base44.asServiceRole.entities.CacheItem.list();
        
        for (const cache of allCaches) {
            const cacheItems = allCacheItems.filter(item => item.cache_id === cache.id);
            const hashedCacheId = await hashData(cache.id, salt);
            const hashedOwnerId = await hashData(cache.created_by, salt);
            
            const versionedCacheData = {
                cache_id_hash: hashedCacheId,
                owner_id_hash: hashedOwnerId,
                cache_name: cache.name,
                cache_location: cache.location,
                cache_description: cache.description || null,
                items: cacheItems.map(item => ({
                    item_name: item.item_name,
                    quantity: item.quantity,
                    category: item.category,
                    expiration_date: item.expiration_date || null,
                    notes: item.notes || null
                })),
                version: new Date().getTime(),
                synced_at: new Date().toISOString()
            };
            
            await supabase.from('versioned_caches').upsert(versionedCacheData, { onConflict: 'cache_id_hash' });
        }

        return Response.json({ 
            success: true, 
            message: 'All data synced to Supabase with encryption',
            synced_counts: {
                profiles: userProfile ? 1 : 0,
                family_members: familyData.length,
                pets: petsData.length,
                notifications: notificationsData.length,
                aggregate_shelter_demand: shelterDemandData.length,
                aggregate_preparedness: preparednessData.length,
                aggregate_special_needs: specialNeedsData.length,
                aggregate_resources: resourcesData.length,
                versioned_caches: allCaches.length
            }
        });

    } catch (error) {
        console.error("Sync error:", error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});