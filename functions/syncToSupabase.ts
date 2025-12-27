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
    
    const salt = textEncoder.encode('RallyPackEncryptionSalt2024');
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
        const supabaseKey = Deno.env.get("supasecret");
        
        if (!supabaseKey) {
            return Response.json({ error: 'Supabase credentials not configured' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const salt = Deno.env.get("DATA_HASH_SALT") || "default_salt_change_me";
        const encryptionPassword = Deno.env.get("DATA_ENCRYPTION_KEY") || "default_encryption_key_change_me";
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
                latitude: userProfile.latitude || null,
                longitude: userProfile.longitude || null,
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

        return Response.json({ 
            success: true, 
            message: 'All data synced to Supabase with encryption',
            synced_counts: {
                profiles: userProfile ? 1 : 0,
                family_members: familyData.length,
                pets: petsData.length,
                notifications: notificationsData.length
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