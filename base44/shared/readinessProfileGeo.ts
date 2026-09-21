import { geolocateByPostalCode } from './readinessGeo.ts';
import { COUNTRY_NAMES } from './wildfireCountries.ts';

// Display name → ISO 3166-1 alpha-2, so a profile's country can disambiguate a
// postal code that also exists elsewhere (e.g. 93510 exists in the US and Ukraine).
const CODE_BY_NAME = {};
for (const [code, name] of Object.entries(COUNTRY_NAMES)) {
  CODE_BY_NAME[String(name).toLowerCase()] = code;
}

function countryCodeFromName(name) {
  if (!name) return null;
  const key = String(name).trim().toLowerCase();
  if (key.length === 2 && COUNTRY_NAMES[key.toUpperCase()]) return key.toUpperCase();
  return CODE_BY_NAME[key] || null;
}

// Builds the QuizResult location fields from the postal code saved on a user's
// account. Quiz results saved before the taker signed up carry no location, so
// the account's postal code is what places them on the readiness map — by
// county/territory, state/province and country.
export async function geoFieldsFromProfile(profile) {
  const postal = (profile?.postal_code || '').toString().trim();
  if (!postal) return null;

  const geo = await geolocateByPostalCode(postal, countryCodeFromName(profile?.country), {
    city: profile?.city,
    state: profile?.state_province,
  });
  if (!geo) return null;

  return {
    country_code: geo.country_code || null,
    country_name: geo.country_name || null,
    admin1_name: geo.admin1_name || null,
    admin2_name: geo.admin2_name || null,
    postal_code: geo.postal_code || postal,
    latitude: typeof geo.latitude === 'number' ? geo.latitude : null,
    longitude: typeof geo.longitude === 'number' ? geo.longitude : null,
  };
}

// Drops the cached readiness-map aggregates so a newly located result appears
// immediately instead of waiting out the cache TTL.
export async function clearReadinessMapCache(base44) {
  try {
    const rows = await base44.asServiceRole.entities.ReportCache.filter({});
    for (const r of rows) {
      if ((r.cache_key || '').startsWith('readiness_avg_')) {
        await base44.asServiceRole.entities.ReportCache.delete(r.id);
      }
    }
  } catch (e) { /* cache clearing is best-effort */ }
}