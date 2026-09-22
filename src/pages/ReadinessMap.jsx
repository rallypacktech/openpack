import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ReadinessMapView from "@/components/readiness/ReadinessMapView";
import TopAreasLists from "@/components/readiness/TopAreasLists";
import ReadinessQuizCta from "@/components/readiness/ReadinessQuizCta";
import { Globe, ChevronRight, Loader2, MapPin } from "lucide-react";

const LEVEL_LABELS = {
  global: "Countries",
  state: "States / Territories",
  county: "Counties / Districts",
  postal: "Postal Codes",
};

const NEXT_LEVEL = {
  global: "state",
  state: "county",
  county: "postal",
};

export default function ReadinessMap() {
  const [level, setLevel] = useState("global");
  const [filters, setFilters] = useState({});
  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: "World", level: "global", filters: {} },
  ]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await base44.functions.invoke("getReadinessAverages", {
          level,
          country_name: filters.country_name || null,
          admin1_name: filters.admin1_name || null,
          admin2_name: filters.admin2_name || null,
        });
        if (!cancelled && res.data) setData(res.data);
      } catch (e) {
        console.error("Failed to load readiness data:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [level, JSON.stringify(filters)]);

  const handleDrillDown = (loc) => {
    const nextLevel = NEXT_LEVEL[level];
    if (!nextLevel) return;
    const nextFilters = { ...filters };
    if (level === "global") nextFilters.country_name = loc.name;
    else if (level === "state") nextFilters.admin1_name = loc.name;
    else if (level === "county") nextFilters.admin2_name = loc.name;
    setFilters(nextFilters);
    setLevel(nextLevel);
    setBreadcrumbs([
      ...breadcrumbs,
      { label: loc.name, level: nextLevel, filters: nextFilters },
    ]);
  };

  const handleBreadcrumbClick = (crumb, idx) => {
    setBreadcrumbs(breadcrumbs.slice(0, idx + 1));
    setFilters(crumb.filters);
    setLevel(crumb.level);
  };

  return (
    <div className="min-h-screen bg-cream font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground mb-2">
            <Globe className="w-3.5 h-3.5" />
            Neighborhood Readiness
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-3">
            How prepared is your community?
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            See how average readiness scores compare across the world. Drill down
            from country to postal code to find out where your neighborhood stands.
          </p>
        </div>

        {/* Global stats bar */}
        {data && (
          <div className="flex flex-wrap gap-6 sm:gap-10 mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-xs uppercase tracking-widest font-sans text-muted-foreground mb-1">
                Global Average
              </p>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {data.global_average}%
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-sans text-muted-foreground mb-1">
                Total Responses
              </p>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {data.total_responses}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-sans text-muted-foreground mb-1">
                Current View
              </p>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {LEVEL_LABELS[level]}
              </p>
            </div>
          </div>
        )}

        {/* Breadcrumbs */}
        <nav
          className="flex flex-wrap items-center gap-1 mb-6 text-sm font-sans"
          aria-label="Drill-down navigation"
        >
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 mx-0.5" />
              )}
              <button
                onClick={() => handleBreadcrumbClick(crumb, idx)}
                className={`px-2 py-1 rounded transition-colors ${
                  idx === breadcrumbs.length - 1
                    ? "text-foreground font-medium bg-foreground/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {crumb.label}
              </button>
            </React.Fragment>
          ))}
        </nav>

        {/* Map + Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="h-[400px] sm:h-[500px] flex items-center justify-center bg-card border border-border rounded-lg">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <ReadinessMapView
                  locations={data?.locations || []}
                  onDrillDown={handleDrillDown}
                  level={level}
                />
                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#16a34a]"></div>
                    <span className="text-muted-foreground">Ready (70%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                    <span className="text-muted-foreground">Gaps (40–69%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#dc2626]"></div>
                    <span className="text-muted-foreground">
                      Not Ready (&lt;40%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>Marker size = number of responses</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Top 5 lists */}
          <div>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <TopAreasLists
                top5Best={data?.top5_best || []}
                top5Worst={data?.top5_worst || []}
                onSelect={handleDrillDown}
                level={level}
              />
            )}
          </div>
        </div>

        {/* Quiz CTA */}
        <ReadinessQuizCta />

        {/* Empty state */}
        {!loading && data && data.locations.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground font-sans">
              No quiz responses in this area yet. Be the first —{" "}
              <a
                href="/ReadinessQuiz"
                className="text-primary underline hover:opacity-80"
              >
                take the readiness quiz
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}