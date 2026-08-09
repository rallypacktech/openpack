import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const PURGE_DAYS = 90;

function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const ba = enc.encode(a);
  const bb = enc.encode(b);
  if (ba.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i];
  return diff === 0;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    // Authorization: require an admin user OR a timing-safe shared automation secret.
    const secretHeader = req.headers.get('x-automation-secret') || '';
    const expectedSecret = Deno.env.get('AUTOMATION_SECRET') || '';
    let authorized = !!expectedSecret && timingSafeEqual(secretHeader, expectedSecret);
    if (!authorized) {
      try {
        const me = await base44.auth.me();
        if (me && me.role === 'admin') authorized = true;
      } catch {
        /* not authenticated */
      }
    }
    if (!authorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

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