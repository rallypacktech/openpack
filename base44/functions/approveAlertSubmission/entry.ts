import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin approves or rejects an alert submission.
// Only admins can call this function.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json();
    const { submission_id, action, admin_notes } = body;

    if (!submission_id || !action || !['approve', 'reject'].includes(action)) {
      return Response.json({ error: 'submission_id and action (approve/reject) are required' }, { status: 400 });
    }

    const submissions = await base44.asServiceRole.entities.AlertSubmission.filter({ id: submission_id });
    if (submissions.length === 0) {
      return Response.json({ error: 'Submission not found' }, { status: 404 });
    }

    const submission = submissions[0];
    if (submission.status !== 'pending_review') {
      return Response.json({ error: `Submission is already ${submission.status}` }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const updated = await base44.asServiceRole.entities.AlertSubmission.update(submission_id, {
      status: newStatus,
      approved_by: user.email,
      approved_at: new Date().toISOString(),
      admin_notes: admin_notes || '',
    });

    return Response.json({
      success: true,
      submission: updated,
      message: action === 'approve'
        ? 'Alert approved. The organization can now dispatch it from their dashboard.'
        : 'Alert rejected. The organization has been notified.',
    });
  } catch (error) {
    console.error('approveAlertSubmission error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});