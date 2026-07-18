import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, id, data } = await req.json();

    if (action === 'create') {
      const record = await base44.asServiceRole.entities.ProductRecommendation.create(data);
      return Response.json({ success: true, record });
    }

    if (action === 'update') {
      await base44.asServiceRole.entities.ProductRecommendation.update(id, data);
      return Response.json({ success: true });
    }

    if (action === 'delete') {
      await base44.asServiceRole.entities.ProductRecommendation.delete(id);
      return Response.json({ success: true });
    }

    if (action === 'toggle_active') {
      const items = await base44.asServiceRole.entities.ProductRecommendation.filter({ id });
      const current = items[0];
      if (!current) return Response.json({ error: 'Not found' }, { status: 404 });
      await base44.asServiceRole.entities.ProductRecommendation.update(id, { active: !current.active });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});