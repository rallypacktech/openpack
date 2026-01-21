import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, message_type, receiver_id } = await req.json();

    // Create the message
    const message = await base44.entities.FamilyMessage.create({
      sender_id: user.id,
      receiver_id: receiver_id || 'family',
      content,
      message_type: message_type || 'general',
      read_by: [user.id]
    });

    // If this is a status message, update user's profile status
    if (message_type === 'status_safe' || message_type === 'status_needs_assistance') {
      const status = message_type === 'status_safe' ? 'safe' : 'needs_assistance';
      
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, {
          current_status: status,
          status_updated_at: new Date().toISOString()
        });
      } else {
        await base44.entities.UserProfile.create({
          current_status: status,
          status_updated_at: new Date().toISOString()
        });
      }
    }

    return Response.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});