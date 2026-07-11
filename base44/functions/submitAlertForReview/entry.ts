import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Business submits an emergency alert for admin review.
// Verifies the user has an active AlertDelegation and a subscription that allows alert sending.
// Stores the generated unified message (title + body) on the submission for admin review.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      incident_type,
      event_level,
      target_area,
      instructions,
      custom_message,
      generated_title,
      generated_body,
    } = body;

    if (!incident_type || !event_level) {
      return Response.json({ error: 'incident_type and event_level are required' }, { status: 400 });
    }

    // Check for an active AlertDelegation for this user
    const delegations = await base44.asServiceRole.entities.AlertDelegation.filter({
      authorized_email: user.email,
      is_active: true,
    });

    if (delegations.length === 0) {
      return Response.json({
        error: 'You are not authorized to submit emergency alerts. An admin must grant your organization alert delegation access first.',
      }, { status: 403 });
    }

    const delegation = delegations[0];

    // Verify the linked subscription is active and allows alert sending
    const subs = await base44.asServiceRole.entities.BusinessSubscription.filter({
      id: delegation.subscription_id,
    });
    const subscription = subs.length > 0 ? subs[0] : null;

    if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
      return Response.json({ error: 'Your organization subscription is not active.' }, { status: 403 });
    }

    if (!subscription.alert_sending_enabled) {
      return Response.json({
        error: 'Your subscription tier does not include emergency alert sending. Upgrade to Professional or Enterprise to submit alerts.',
      }, { status: 403 });
    }

    // Verify the incident type is allowed for this delegation type
    const shelterIncidents = ['shelter_open', 'shelter_close', 'evacuation', 'severe_weather', 'custom'];
    const allowedIncidents = delegation.is_contracted
      ? ['wildfire', 'flood', 'hurricane', 'tornado', 'earthquake', 'severe_weather', 'evacuation', 'shelter_open', 'shelter_close', 'active_shooter', 'custom']
      : shelterIncidents;

    if (!allowedIncidents.includes(incident_type)) {
      return Response.json({
        error: `Your organization is not authorized to send "${incident_type}" alerts. ${delegation.is_contracted ? 'Contracted' : 'Shelter provider'} organizations can send: ${allowedIncidents.join(', ')}.`,
      }, { status: 403 });
    }

    // For custom incident type, require a custom message
    if (incident_type === 'custom' && !custom_message?.trim()) {
      return Response.json({ error: 'A custom message is required for custom incident type.' }, { status: 400 });
    }

    // Create the submission
    const submission = await base44.asServiceRole.entities.AlertSubmission.create({
      organization_name: delegation.organization_name,
      subscription_id: delegation.subscription_id,
      delegation_id: delegation.id,
      incident_type,
      event_level,
      target_area: target_area || '',
      instructions: instructions || '',
      custom_message: custom_message || '',
      generated_title: generated_title || `${incident_type} ${event_level}`,
      generated_body: generated_body || custom_message || '',
      status: 'pending_review',
      payment_status: 'not_required',
      submitted_by_email: user.email,
    });

    return Response.json({
      success: true,
      submission,
      message: 'Alert submitted for admin review. You will be notified once it is approved.',
    });
  } catch (error) {
    console.error('submitAlertForReview error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});