import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { usePublicHead } from "@/lib/publicSite";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, CalendarCheck } from "lucide-react";
import DrillCard from "@/components/drills/DrillCard";
import DrillFormDialog from "@/components/drills/DrillFormDialog";
import { DRILL_TYPES } from "@/lib/drillTypes";
import { todayIso } from "@/lib/safetyIntervals";

const PAGE_SIZE = 24;

export default function Drills() {
  usePublicHead({
    title: "Community Drill Directory | RallyPack",
    description:
      "Find fire, earthquake, flood and full-scale emergency drills near you. Cities, schools, businesses and community organizations list their upcoming drills so you can train before a disaster.",
    path: "/drills",
  });

  const [user, setUser] = useState(null);
  const [drills, setDrills] = useState([]);
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [type, setType] = useState("all");
  const [country, setCountry] = useState("all");
  const [region, setRegion] = useState("all");
  const [timeframe, setTimeframe] = useState("upcoming");

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      let me = null;
      try {
        me = await base44.auth.me();
      } catch (_e) {
        me = null;
      }
      if (!cancelled) setUser(me);

      // Filter options come from the listings themselves, so they only ever offer
      // values that actually return results.
      try {
        const [c, r] = await Promise.all([
          base44.entities.CommunityDrill.list({ distinct: "country_code" }),
          base44.entities.CommunityDrill.list({ distinct: "admin1_name" }),
        ]);
        if (!cancelled) {
          setCountries((c.items || []).filter(Boolean).sort());
          setRegions((r.items || []).filter(Boolean).sort());
        }
      } catch (_e) {
        /* filters simply stay empty */
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const buildQuery = useCallback(() => {
    const q = {};
    if (type !== "all") q.drill_type = type;
    if (country !== "all") q.country_code = country;
    if (region !== "all") q.admin1_name = region;
    if (timeframe === "upcoming") q.date = { $gte: todayIso() };
    if (timeframe === "past") q.date = { $lt: todayIso() };
    return q;
  }, [type, country, region, timeframe]);

  const loadFirst = useCallback(async () => {
    setLoading(true);
    const page = await base44.entities.CommunityDrill.filter(buildQuery(), {
      sort: timeframe === "past" ? "-date" : "date",
      limit: PAGE_SIZE,
    });
    setDrills(page.items);
    setCursor(page.next_cursor);
    setHasMore(page.has_more);
    setLoading(false);
  }, [buildQuery, timeframe]);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  const loadMore = async () => {
    setLoadingMore(true);
    const page = await base44.entities.CommunityDrill.filter(buildQuery(), {
      sort: timeframe === "past" ? "-date" : "date",
      limit: PAGE_SIZE,
      cursor,
    });
    setDrills((prev) => [...prev, ...page.items]);
    setCursor(page.next_cursor);
    setHasMore(page.has_more);
    setLoadingMore(false);
  };

  const requireSignIn = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const startSubmit = () => {
    if (!user) {
      requireSignIn();
      return;
    }
    setEditing(null);
    setShowForm(true);
  };

  const startEdit = (drill) => {
    setEditing(drill);
    setShowForm(true);
  };

  return (
    <div className="bg-cream min-h-screen font-sans">
      <section className="bg-[#1C1C1A] text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <CalendarCheck className="w-10 h-10 text-[#D64A2E] mx-auto mb-6" aria-hidden="true" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-sans mb-4">
            Community drill directory
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Train for a disaster before it happens
          </h1>
          <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
            Cities, schools, businesses and community organizations run evacuation drills,
            tabletop exercises and CPR training all year. Find one near you — and if your
            organization runs drills, list it here.
          </p>
          <Button onClick={startSubmit} className="mt-8 bg-[#D64A2E] hover:bg-[#be3f25] text-white gap-2">
            <Plus className="w-4 h-4" /> Submit a drill
          </Button>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div>
            <label htmlFor="drill-timeframe" className="block text-xs font-medium text-muted-foreground mb-1.5">When</label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger id="drill-timeframe"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="all">All dates</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="drill-type" className="block text-xs font-medium text-muted-foreground mb-1.5">Drill type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="drill-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {DRILL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="drill-country" className="block text-xs font-medium text-muted-foreground mb-1.5">Country</label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="drill-country"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="drill-region" className="block text-xs font-medium text-muted-foreground mb-1.5">State / province</label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger id="drill-region"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" aria-label="Loading drills" />
          </div>
        ) : drills.length === 0 ? (
          <div className="text-center py-16 border border-border rounded-lg bg-white">
            <CalendarCheck className="w-8 h-8 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
            <p className="font-medium text-foreground mb-1">No drills match those filters yet</p>
            <p className="text-sm text-muted-foreground mb-5">
              Try widening the dates or clearing a filter — or be the first to list one.
            </p>
            <Button variant="outline" onClick={startSubmit} className="gap-2">
              <Plus className="w-4 h-4" /> Submit a drill
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {drills.map((drill) => (
              <DrillCard
                key={drill.id}
                drill={drill}
                user={user}
                onRequireSignIn={requireSignIn}
                onEdit={startEdit}
                onChanged={loadFirst}
              />
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "Loading…" : "Load more drills"}
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-10 max-w-xl mx-auto leading-relaxed">
          Listings are submitted by the organizations running the drills. If something looks
          wrong, use “Flag an issue” on the listing and we'll check it against the organizer's
          own information.
        </p>
      </section>

      <DrillFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        drill={editing}
        user={user}
        onSaved={loadFirst}
      />
    </div>
  );
}