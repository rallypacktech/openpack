// Shared geolocation helper for the readiness quiz map.
// Used by saveQuizResult so every result carries country/state/county/postal +
// lat/lng for map aggregation. Location comes from the postal code the quiz
// taker enters — never from IP geolocation or a free-text address.
// Plain module — no Deno.serve; import and reuse.

// Geocode a postal code using Nominatim OpenStreetMap (free, HTTPS, no key).
// `countryCode` is an optional ISO 3166-1 alpha-2 hint that disambiguates
// postal codes shared across countries.
// `hints` (optional) adds city/state context so a postal code that exists in
// more than one country resolves to the right one.
export async function geolocateByPostalCode(postalCode, countryCode, hints = {}) {
  const postal = (postalCode || '').toString().trim();
  if (!postal) return null;

  const hint = (countryCode || '').toString().trim().toUpperCase();
  const fallback = {
    country_code: hint || null,
    country_name: null,
    admin1_name: null,
    admin2_name: null,
    postal_code: postal,
    latitude: null,
    longitude: null,
  };

  try {
    const params = new URLSearchParams({
      postalcode: postal,
      format: 'json',
      addressdetails: '1',
      limit: '1',
    });
    if (hint) params.set('countrycodes', hint.toLowerCase());
    if (hints.city) params.set('city', String(hints.city).trim());
    if (hints.state) params.set('state', String(hints.state).trim());

    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'RallyPack/1.0 (beta@rallypack.tech)' },
    });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return fallback;

    const hit = data[0];
    const addr = hit.address || {};
    return {
      country_code: addr.country_code ? addr.country_code.toUpperCase() : hint || null,
      country_name: addr.country || null,
      admin1_name: addr.state || addr.region || addr.province || null,
      admin2_name: addr.county || addr.city || addr.town || addr.municipality || null,
      postal_code: addr.postcode || postal,
      latitude: hit.lat ? parseFloat(hit.lat) : null,
      longitude: hit.lon ? parseFloat(hit.lon) : null,
    };
  } catch (e) {
    return fallback;
  }
}