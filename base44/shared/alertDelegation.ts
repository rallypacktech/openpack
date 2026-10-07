// Authorization for organization emergency alerts.
//
// A delegation row says "this organization's alerts may be sent by this person".
// Its fields are written by whoever creates the row, so the grant is decided from
// `created_by_id` — the creator the platform stamps on every record — and never
// from `granted_by`, which any writer could set to an admin's address (and the app
// publishes an admin address in its own footer).

/**
 * Verifies a delegation was granted by an admin, is still active, and that the
 * organization behind it is entitled to send alerts.
 * Returns { ok: true, subscription } or { ok: false, status, error }.
 */
export async function verifyAlertDelegation(sr, delegation) {
  if (!delegation) {
    return {
      ok: false,
      status: 403,
      error: 'You are not authorized to send emergency alerts. An admin must grant your organization alert delegation access first.',
    };
  }
  if (delegation.is_active === false) {
    return { ok: false, status: 403, error: 'Your alert delegation is no longer active.' };
  }

  // The grant itself: the row must have been created by an admin. `created_by_id` is
  // set by the platform on insert, so it cannot be chosen by the caller.
  const admins = await sr.entities.User.filter({ role: 'admin' });
  const admin = admins.find((a) => a.id && a.id === delegation.created_by_id) || null;
  if (!admin) {
    return { ok: false, status: 403, error: 'Delegation was not granted by an admin' };
  }
  // `granted_by` is an audit label only — it never grants access by itself, and a row
  // naming a different granter than the admin who created it is rejected outright.
  if (
    delegation.granted_by &&
    String(delegation.granted_by).toLowerCase() !== String(admin.email || '').toLowerCase()
  ) {
    return { ok: false, status: 403, error: 'Delegation was not granted by an admin' };
  }

  const subs = await sr.entities.BusinessSubscription.filter({ id: delegation.subscription_id });
  const subscription = subs.length > 0 ? subs[0] : null;
  if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
    return { ok: false, status: 403, error: 'Your organization subscription is not active.' };
  }
  if (!subscription.alert_sending_enabled) {
    return {
      ok: false,
      status: 403,
      error: 'Your subscription tier does not include emergency alert sending. Upgrade to Professional or Enterprise to submit alerts.',
    };
  }

  return { ok: true, subscription };
}