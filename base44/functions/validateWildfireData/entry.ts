import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  loadAllActiveIncidents,
  findSmoulderCandidates,
  groupCauseVariants,
  findHectaresOutliers,
  findPre2016,
  findMissingGeo,
  findMissingHectares,
  findMissingContainment,
} from '../../shared/wildfireAggregate.ts';

// Admin-only, read-only validation report over the full active WildfireIncident
// set. Flags suspected issues (smoulder double-counts, fragmented cause labels,
// hectares outliers, pre-2016 strays, missing geo/hectares/containment) with
// IDs so the admin can act via existing merge/edit tools. NEVER writes.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const incidents = await loadAllActiveIncidents(base44);

    const smoulder = findSmoulderCandidates(incidents);
    const causeVariants = groupCauseVariants(incidents);
    const hectaresOutliers = findHectaresOutliers(incidents);
    const pre2016 = findPre2016(incidents);
    const missingGeo = findMissingGeo(incidents);
    const missingHectares = findMissingHectares(incidents);
    const missingContainment = findMissingContainment(incidents);

    return Response.json({
      summary: {
        total_active: incidents.length,
        smoulder_candidates: smoulder.length,
        cause_buckets: causeVariants.length,
        hectares_unit_swap_suspects: hectaresOutliers.unit_swap_suspects.length,
        hectares_huge_suspects: hectaresOutliers.huge_suspects.length,
        pre_2016: pre2016.length,
        missing_geo: missingGeo.length,
        missing_hectares: missingHectares.length,
        missing_containment: missingContainment.length,
      },
      smoulder_candidates: smoulder.slice(0, 200),
      cause_variants: causeVariants,
      hectares_unit_swap_suspects: hectaresOutliers.unit_swap_suspects,
      hectares_huge_suspects: hectaresOutliers.huge_suspects,
      pre_2016: pre2016,
      missing_geo: missingGeo.slice(0, 200),
      missing_hectares: missingHectares.slice(0, 200),
      missing_containment: missingContainment.slice(0, 200),
      data_as_of: new Date().toISOString(),
    });
  } catch (error) {
    console.error('validateWildfireData error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}