// Browser-side mirror of base44/shared/affiliateUrl.ts.
//
// The authoritative check happens server-side when a suggestion is approved.
// This guard is defense-in-depth for the render/click sinks, so a link that
// reached the catalog before validation existed (or through any other path)
// can never be opened as a trusted "Buy Now" action.
//
// Keep ALLOWED_AFFILIATE_DOMAINS in sync with base44/shared/affiliateUrl.ts.
export const ALLOWED_AFFILIATE_DOMAINS = [
  "amazon.com", "amazon.ca", "amazon.co.uk", "amazon.de", "amazon.fr",
  "target.com", "walmart.com", "costco.com", "homedepot.com", "lowes.com",
  "rei.com", "cabelas.com", "basspro.com", "tractorsupply.com",
  "ebay.com", "etsy.com", "wayfair.com", "acehardware.com",
  "chewy.com", "petco.com", "petsmart.com",
  "redcross.org", "fema.gov", "ready.gov",
];

// True only for an https URL on an allowed host, with no embedded credentials.
export function isAllowedAffiliateUrl(urlStr) {
  if (typeof urlStr !== "string" || !urlStr.trim()) return false;
  try {
    const url = new URL(urlStr.trim());
    if (url.username || url.password) return false;
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    return (
      url.protocol === "https:" &&
      ALLOWED_AFFILIATE_DOMAINS.some(
        (d) => hostname === d || hostname.endsWith("." + d),
      )
    );
  } catch {
    return false;
  }
}