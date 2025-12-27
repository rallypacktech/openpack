import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

// Hash function for privacy
async function hashData(data, salt) {
    const textEncoder = new TextEncoder();
    const dataBuffer = textEncoder.encode(data + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify user is authenticated
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://kajkzaufnaalniioobqx.supabase.co";
        const supabaseKey = Deno.env.get("supasecret");
        
        if (!supabaseKey) {
            return Response.json({ error: 'Supabase credentials not configured' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch user profile data
        const profiles = await base44.entities.UserProfile.list();
        const userProfile = profiles.length > 0 ? profiles[0] : null;

        // Hash user email for privacy (using a consistent salt)
        const salt = Deno.env.get("DATA_HASH_SALT") || "default_salt_change_me";
        const hashedUserId = await hashData(user.email, salt);

        // Prepare data for Supabase (with privacy-focused hashing)
        const syncData = {
            user_id_hash: hashedUserId,
            display_name: userProfile?.display_name || user.full_name || null,
            city: userProfile?.city || null,
            state_province: userProfile?.state_province || null,
            country: userProfile?.country || null,
            notification_method: userProfile?.notification_method || null,
            synced_at: new Date().toISOString(),
            // Coordinates can be useful for aggregated analytics
            latitude: userProfile?.latitude || null,
            longitude: userProfile?.longitude || null
        };

        // Upsert to Supabase (assuming table name is 'base44_users')
        const { data, error } = await supabase
            .from('base44_users')
            .upsert(syncData, { onConflict: 'user_id_hash' });

        if (error) {
            console.error("Supabase sync error:", error);
            return Response.json({ 
                success: false, 
                error: error.message 
            }, { status: 500 });
        }

        return Response.json({ 
            success: true, 
            message: 'User data synced to Supabase',
            synced_user_hash: hashedUserId 
        });

    } catch (error) {
        console.error("Function error:", error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});