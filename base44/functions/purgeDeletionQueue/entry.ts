import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const PURGE_DAYS = 90;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const entries = await sr.entities.DeletionQueue.list();
    const now = new Date();

    const toPurge = entries.filter(e =>
      !e.restored && e.purge_after && new Date(e.purge_after) < now
    );

    let purged = 0;
    for (const entry of toPurge) {
      await sr.entities.DeletionQueue.delete(entry.id);
      purged++;
    }

    const remaining = entries.length - purged;

    return Response.json({
      success: true,
      purged,
      remaining,
      message: purged > 0
        ? `${purged} deletion queue entries permanently purged (past ${PURGE_DAYS}-day retention).`
        : 'No entries due for purge.'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});