import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch messages the user is authorized to see — RLS on FamilyMessage already
    // restricts reads to messages where sender_id = user.id, receiver_id = user.id,
    // or receiver_id = 'family'. Using user-scoped SDK (not asServiceRole) enforces
    // RLS and eliminates the dynamic $or/$in query injection surface.
    const relevantMessages = await base44.entities.FamilyMessage.filter({}, '-created_date', 100);

    // Get sender profiles for display names
    const senderIds = [...new Set(relevantMessages.map(m => m.sender_id))];
    const allUsers = await base44.asServiceRole.entities.User.list();
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list();
    
    const messagesWithNames = relevantMessages.map(msg => {
      const sender = allUsers.find(u => u.id === msg.sender_id);
      const senderProfile = allProfiles.find(p => p.created_by === sender?.email);
      
      return {
        ...msg,
        sender_name: senderProfile?.display_name || sender?.full_name || 'Unknown'
      };
    });

    return Response.json({ messages: messagesWithNames });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});