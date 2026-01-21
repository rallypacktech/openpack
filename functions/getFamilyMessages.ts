import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get family members where user is the creator (their family)
    const myFamilyMembers = await base44.entities.FamilyMember.filter({ created_by: user.email });
    
    // Get family members where user is linked as emergency contact
    const linkedFamilyMembers = await base44.asServiceRole.entities.FamilyMember.filter({ 
      linked_user_id: user.id 
    });

    // Collect all relevant user IDs (family network)
    const familyUserIds = new Set([user.id]);
    
    // Add creators of family members where I'm linked
    linkedFamilyMembers.forEach(fm => {
      const creatorEmail = fm.created_by;
      familyUserIds.add(creatorEmail);
    });

    // Get all messages sent by or to anyone in the family network
    const allMessages = await base44.asServiceRole.entities.FamilyMessage.list('-created_date', 100);
    
    const relevantMessages = allMessages.filter(msg => 
      msg.sender_id === user.id || 
      msg.receiver_id === user.id ||
      msg.receiver_id === 'family' ||
      familyUserIds.has(msg.sender_id) ||
      familyUserIds.has(msg.receiver_id)
    );

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