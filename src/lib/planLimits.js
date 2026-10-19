import { base44 } from "@/api/base44Client";

// Backend functions are unavailable on the current plan and answer with a
// payment-required (402) error. These helpers let a flow recognise that case and
// finish on a client-side path instead of showing the visitor a raw error.

export function isPlanLimitError(error) {
  if (!error) return false;
  const status =
    error.status || error.statusCode || error.response?.status;
  if (status === 402) return true;
  const text = [
    error.message,
    error.detail,
    error.error,
    error.data?.message,
    error.data?.error,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return (
    text.includes("402") ||
    text.includes("payment required") ||
    text.includes("subscription required") ||
    text.includes("backend function")
  );
}

/**
 * Call a backend function, falling back to a client-side path when the plan does
 * not include backend functions. Returns { data, usedFallback }.
 */
export async function invokeWithFallback(functionName, payload, fallback) {
  try {
    const res = await base44.functions.invoke(functionName, payload);
    return { data: res?.data ?? null, usedFallback: false };
  } catch (error) {
    if (!isPlanLimitError(error)) throw error;
    const data = fallback ? await fallback() : null;
    return { data, usedFallback: true };
  }
}