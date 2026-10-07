// Allow-list of retail / nonprofit hosts an affiliate link may point at.
// Shared by the approval flow and the link-check automation so a submitted URL
// is validated the same way everywhere it can enter the catalog.
export const ALLOWED_AFFILIATE_DOMAINS = [
  'amazon.com', 'amazon.ca', 'amazon.co.uk', 'amazon.de', 'amazon.fr',
  'target.com', 'walmart.com', 'costco.com', 'homedepot.com', 'lowes.com',
  'rei.com', 'cabelas.com', 'basspro.com', 'tractorsupply.com',
  'ebay.com', 'etsy.com', 'wayfair.com', 'acehardware.com',
  'chewy.com', 'petco.com', 'petsmart.com',
  'redcross.org', 'fema.gov', 'ready.gov',
];

// True only for an https URL on an allowed host, with no embedded credentials.
export function isAllowedAffiliateUrl(urlStr) {
  if (typeof urlStr !== 'string' || !urlStr.trim()) return false;
  try {
    const url = new URL(urlStr.trim());
    // Reject URLs with embedded credentials (SSRF / open-redirect hardening)
    if (url.username || url.password) return false;
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    return url.protocol === 'https:' &&
      ALLOWED_AFFILIATE_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

// Returns the trimmed URL when it is safe to store or open, otherwise null.
export function safeAffiliateUrl(urlStr) {
  return isAllowedAffiliateUrl(urlStr) ? String(urlStr).trim() : null;
}