import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message_id } = await req.json();

    const message = await base44.entities.FamilyMessage.filter({ id: message_id });
    
    if (message.length === 0) {
      return Response.json({ error: 'Message not found' }, { status: 404 });
    }

    const readBy = message[0].read_by || [];
    if (!readBy.includes(user.id)) {
      readBy.push(user.id);
      await base44.entities.FamilyMessage.update(message_id, { read_by: readBy });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error marking message read:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});