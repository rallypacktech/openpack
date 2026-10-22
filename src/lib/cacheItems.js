import { base44 } from "@/api/base44Client";

// First aid is a tag on an ordinary cache item, never a cache of its own.
export const FIRST_AID_TAG = "first_aid";

export function isFirstAid(item) {
  return Array.isArray(item?.tags) && item.tags.includes(FIRST_AID_TAG);
}

// Files a catalog product into one of the user's caches as an ordinary cache
// item. Re-adding the same product to the same cache updates the existing item
// rather than duplicating it.
export async function addProductToCache({ rec, cacheId, expirationDate }) {
  const items = await base44.entities.CacheItem.filter({ cache_id: cacheId });
  const existing = items.find((i) => i.recommendation_id === rec.id);

  const payload = {
    cache_id: cacheId,
    item_name: rec.item_name,
    quantity: rec.quantity || 1,
    category: rec.category || "other",
    tags: rec.tags || [],
    recommendation_id: rec.id,
  };
  if (expirationDate) payload.expiration_date = expirationDate;

  if (existing) {
    await base44.entities.CacheItem.update(existing.id, payload);
  } else {
    await base44.entities.CacheItem.create(payload);
  }

  // Deliberately "manually_added": filing an item by hand is not a confirmed
  // purchase, and only a verified checkout may record one.
  const progress = await base44.entities.UserCacheProgress.filter({
    recommendation_id: rec.id,
    cache_id: cacheId,
  });
  const progressPayload = {
    recommendation_id: rec.id,
    cache_id: cacheId,
    status: "manually_added",
    ...(expirationDate ? { expiration_date: expirationDate } : {}),
  };
  if (progress.length > 0) {
    await base44.entities.UserCacheProgress.update(
      progress[0].id,
      progressPayload,
    );
  } else {
    await base44.entities.UserCacheProgress.create(progressPayload);
  }
}

// Remembers the product a shopper left for so we can offer to file it into a
// cache when they come back. Nothing is created unless they return and confirm.
const PENDING_KEY = "rallypack_pending_product";
const PENDING_TTL_MS = 6 * 60 * 60 * 1000;

export function rememberPendingProduct(rec) {
  try {
    localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ id: rec.id, at: Date.now() }),
    );
  } catch {
    /* storage unavailable — the prompt is a convenience, not a requirement */
  }
}

export function takePendingProduct() {
  let raw = null;
  try {
    raw = localStorage.getItem(PENDING_KEY);
    if (raw) localStorage.removeItem(PENDING_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const pending = JSON.parse(raw);
    if (!pending?.id || Date.now() - (pending.at || 0) > PENDING_TTL_MS) {
      return null;
    }
    return pending.id;
  } catch {
    return null;
  }
}

export function clearPendingProduct() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* nothing to clear */
  }
}