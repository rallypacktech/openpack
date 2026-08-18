import React, { useState, useEffect, lazy, Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import HazardTypeRail from "./HazardTypeRail";

// Heavy children (react-leaflet map, recharts) are lazy-loaded so they only
// enter the bundle when the Incidents tab is opened — keeping the Business
// Dashboard's initial load light.
const NifcPreparednessBanner = lazy(() => import("./NifcPreparednessBanner"));
const EvacuationIncidentMap = lazy(() => import("./EvacuationIncidentMap"));
const DuplicateFindingsCard = lazy(() => import("./DuplicateFindingsCard"));
const WildfireTimeline = lazy(() => import("@/components/admin/WildfireTimeline"));
const HolidayFireworkCorrelation = lazy(() => import("@/components/admin/HolidayFireworkCorrelation"));

function Fallback({ label = "Loading…" }) {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

// Rebuilt business "Incidents" tab. Wildfire is unlocked and tells a
// data-driven story; every other alert-settings hazard type appears as a
// locked "Coming soon" tab. One backend call fetches the admin-only
// aggregates (stats, merge audit, NIFC freshness); the chart + map + firework
// correlation fetch their own public-readable records.
export default function IncidentsHistory({ plans }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [emergencyCountries, setEmergencyCountries] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadOverview = async () => {
    try {
      const res = await base44.functions.invoke("getBusinessIncidentOverview", {});
      setOverview(res.data);
    } catch (e) {
      console.error("IncidentsHistory overview load failed:", e);
    }
  };

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      setIsAdmin(me?.role === "admin");
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) setEmergencyCountries(profiles[0].emergency_countries || []);
      } catch (e) {
        // profile optional — map falls back to global scope
      }
      await loadOverview();
      setLoading(false);
    })();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Admins can trigger a fresh NIFC pull; everyone else just re-reads.
      if (isAdmin) {
        await base44.functions.invoke("fetchNIFCActiveIncidents", {}).catch(() => {});
      }
      await loadOverview();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HazardTypeRail active="wildfire" />

      <Suspense fallback={<Fallback label="Loading preparedness outlook…" />}>
        <NifcPreparednessBanner
          nifc={overview?.nifc}
          usSeason={overview?.us_season}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      </Suspense>

      <Suspense fallback={<Fallback label="Loading incident map…" />}>
        <EvacuationIncidentMap plans={plans || []} emergencyCountries={emergencyCountries} />
      </Suspense>

      <Suspense fallback={<Fallback label="Loading data integrity…" />}>
        <DuplicateFindingsCard mergeAudit={overview?.merge_audit} />
      </Suspense>

      <Suspense fallback={<Fallback label="Loading timeline…" />}>
        <WildfireTimeline showIncidentList={true} />
      </Suspense>

      <Suspense fallback={<Fallback label="Loading firework correlation…" />}>
        <HolidayFireworkCorrelation />
      </Suspense>
    </div>
  );
}