import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { loadAllActiveIncidents, buildReport } from '../../shared/wildfireAggregate.ts';

// Public, unauthenticated endpoint: returns the full 10-year wildfire
// aggregate for the public trend-report page and for AI/search crawlers.
// No auth.me() guard — treat as a public read endpoint.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    const incidents = await loadAllActiveIncidents(base44);

    let holidays = [];
    try {
      holidays = await base44.asServiceRole.entities.HolidayFireworkDisplay.list('-date', 500);
    } catch (e) {
      // holidays optional — report still works without them
    }

    const report = buildReport(incidents, holidays);
    return Response.json(report);
  } catch (error) {
    console.error('getPublicWildfireReport error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}