// Shared geolocation helpers for the readiness quiz map.
// Used by saveQuizResult (geolocate at save time) so every result carries
// country/state/county/postal + lat/lng for map aggregation.
// Plain module — no Deno.serve; import and reuse.

// Extract the client IP from request headers (handles proxies/load balancers).
export function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return null;
}

// Geolocate by IP using ipwho.is (free, HTTPS, no API key).
// Returns country/state/county/lat/lng. Postal is often inaccurate from IP.
export async function geolocateByIp(ip) {
  try {
    const url = ip ? `https://ipwho.is/${ip}` : 'https://ipwho.is/';
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    if (!data.success) return null;
    return {
      country_code: data.country_code ? data.country_code.toUpperCase() : null,
      country_name: data.country || null,
      admin1_name: data.region || null,
      admin2_name: data.city || null,
      postal_code: data.postal || null,
      latitude: typeof data.latitude === 'number' ? data.latitude : null,
      longitude: typeof data.longitude === 'number' ? data.longitude : null,
    };
  } catch (e) {
    return null;
  }
}

// Geolocate by address using Nominatim OpenStreetMap (free, HTTPS, no key).
// Falls back to profile field values if geocoding returns no hit.
export async function geolocateByAddress(profile) {
  const fallback = {
    country_code: null,
    country_name: profile?.country || null,
    admin1_name: profile?.state_province || null,
    admin2_name: profile?.city || null,
    postal_code: profile?.postal_code || null,
    latitude: null,
    longitude: null,
  };
  try {
    const parts = [
      profile?.street_address,
      profile?.city,
      profile?.state_province,
      profile?.postal_code,
      profile?.country,
    ].filter(Boolean);
    if (parts.length === 0) return fallback;
    const q = encodeURIComponent(parts.join(', '));
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&addressdetails=1&limit=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'RallyPack/1.0 (beta@rallypack.tech)' } });
    const data = await res.json();
    if (!data || data.length === 0) return fallback;
    const hit = data[0];
    const addr = hit.address || {};
    return {
      country_code: addr.country_code ? addr.country_code.toUpperCase() : null,
      country_name: addr.country || profile?.country || null,
      admin1_name: addr.state || profile?.state_province || null,
      admin2_name: addr.county || addr.city || profile?.city || null,
      postal_code: addr.postcode || profile?.postal_code || null,
      latitude: hit.lat ? parseFloat(hit.lat) : null,
      longitude: hit.lon ? parseFloat(hit.lon) : null,
    };
  } catch (e) {
    return fallback;
  }
}