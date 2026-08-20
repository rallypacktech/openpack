import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Count before deleting for reporting
    const pending = await base44.asServiceRole.entities.EmailQueue.filter({ status: 'pending' });
    const cleared = pending.length;

    if (cleared > 0) {
      await base44.asServiceRole.entities.EmailQueue.deleteMany({ status: 'pending' });
    }

    return Response.json({
      success: true,
      cleared,
      message: cleared === 0
        ? 'No pending queued emails to clear.'
        : `Cleared ${cleared} stale pending email(s) from the queue.`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}