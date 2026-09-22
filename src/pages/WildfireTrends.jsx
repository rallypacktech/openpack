import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Share2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import KeyNumbersBand from "@/components/wildfire/KeyNumbersBand";
import YearTrendChart from "@/components/wildfire/YearTrendChart";
import CountryLeaders from "@/components/wildfire/CountryLeaders";
import CauseDistribution from "@/components/wildfire/CauseDistribution";
import HolidayProximity from "@/components/wildfire/HolidayProximity";
import CountryActivityLists from "@/components/wildfire/CountryActivityLists";
import SourceNote from "@/components/public/SourceNote";
import PublicSources from "@/components/public/PublicSources";
import PublicCtaLadder from "@/components/public/PublicCtaLadder";
import { usePublicHead, publicUrl } from "@/lib/publicSite";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function pctOf(report, name) {
  const total = (report.cause_distribution || []).reduce((s, c) => s + c.value, 0) || 1;
  const d = (report.cause_distribution || []).find((c) => c.name === name);
  return d ? Math.round((d.value / total) * 100) : 0;
}

function pctBuckets(report, names) {
  const total = (report.cause_distribution || []).reduce((s, c) => s + c.value, 0) || 1;
  const sum = (report.cause_distribution || []).filter((c) => names.includes(c.name)).reduce((s, c) => s + c.value, 0);
  return Math.round((sum / total) * 100);
}

// Public, no-login, SEO-indexed 10-year wildfire trend report for press,
// municipalities, and AI crawlers.
//
// The hero, the disclosure, the water statement, the methodology and the source
// list are static — they render before the report data arrives, so the page
// carries real, readable content even for crawlers that never run the fetch.
export default function WildfireTrends() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  usePublicHead({
    title: "10 Years of Global Wildfires — RallyPack Trend Report",
    description:
      "A ten-year open-data look at recorded wildfire trends, causes, burned area and the firework-holiday correlation — with full methodology and primary sources.",
    path: "/wildfire-trends",
    type: "article",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("getPublicWildfireReport", {});
        setReport(res.data);
      } catch (e) {
        setError(e.response?.data?.error || e.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const jsonLd = useMemo(() => {
    if (!report) return null;
    const years = report.by_year || [];
    return {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "RallyPack 10-Year Global Wildfire Trend Report",
      description: `Recorded wildfire incidents ${years[0]?.year}–${years[years.length - 1]?.year}: ${report.totals.total_incidents} fires across ${report.totals.countries_affected} countries, ${new Intl.NumberFormat("en-US").format(report.totals.total_hectares)} hectares burned.`,
      creator: { "@type": "Organization", name: "RallyPack", url: publicUrl("/") },
      isAccessibleForFree: true,
      keywords: "wildfire, wildfire trends, preparedness, disaster data, fire statistics",
      distribution: years.map((y) => `${y.year}: ${y.count} fires, ${y.hectares} ha`).join("; "),
      dateModified: report.data_as_of,
    };
  }, [report]);

  const handleShare = async () => {
    try {
      // Share the public host, never the preview or internal host.
      await navigator.clipboard.writeText(publicUrl("/wildfire-trends"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      setCopied(false);
    }
  };

  const humanPct = report ? pctBuckets(report, ["Human Activity", "Agricultural", "Power/Infrastructure"]) : null;
  const invPct = report ? pctOf(report, "Under Investigation") : null;

  return (
    <div className="bg-cream">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {/* Full report as machine-readable JSON for AI/crawlers — not rendered for end users. */}
      {report && (
        <script type="application/json" data-rallypack-wildfire-report dangerouslySetInnerHTML={{ __html: JSON.stringify(report) }} />
      )}

      {/* Hero — static, renders immediately */}
      <div className="bg-foreground text-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <p className="text-xs uppercase tracking-widest text-cream/60 font-sans mb-3">RallyPack Climate Data Report</p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold leading-tight">10 Years of Global Wildfires</h1>
          <p className="mt-4 text-base sm:text-lg text-cream/80 font-sans max-w-2xl">
            A transparent, open-data look at recorded wildfire trends, causes, and the firework-holiday correlation —
            built to inform prevention policy and press coverage.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={handleShare} variant="outline" size="sm" className="bg-transparent text-cream border-cream/30 hover:bg-cream/10">
              <Share2 className="w-4 h-4 mr-1.5" /> {copied ? "Link copied" : "Share this report"}
            </Button>
            {report && <span className="text-xs text-cream/60 font-sans">Data as of {fmtDate(report.data_as_of)}</span>}
          </div>
        </div>
      </div>

      {/* Scope disclosure — static */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-secondary/60 border border-border rounded-md p-4 max-w-4xl">
          <p className="text-xs text-foreground font-sans">
            <strong>What this report counts:</strong> large and notable wildfire incidents reported by national and
            state fire agencies (for example, fires tracked by the US National Interagency Fire Center and CAL FIRE) —
            not every fire response. Official incident counts are far higher: in 2026, US firefighters alone have
            responded to tens of thousands of wildfires, most of them small and contained quickly, while only the
            largest ~100 appear here at any given time. Use this report to compare large-fire trends, causes, and
            burned area — never as a total count of wildfires.
          </p>
        </div>
      </div>

      {loading && (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">Unable to load the live figures for this report.</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <p className="text-xs text-muted-foreground mt-4">
            The methodology, water-stress findings and sources below do not depend on the live feed.
          </p>
        </div>
      )}

      {report && (
        <>
          <KeyNumbersBand totals={report.totals} causeDistribution={report.cause_distribution} />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
            <Section title="Fires per year" takeaway={`${report.totals.total_incidents.toLocaleString()} recorded wildfires across ${report.totals.countries_affected} countries. Spikes in 2017–2018 and 2024–2025 align with major fire seasons and the 2023–2024 El Niño.`}>
              <YearTrendChart byYear={report.by_year} />
              {report.totals.fires_missing_hectares > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  <strong className="text-foreground">Note:</strong> {report.totals.fires_missing_hectares.toLocaleString()} of {report.totals.total_incidents.toLocaleString()} recorded fires ({report.totals.pct_missing_hectares}%) have no reported burn area and are excluded from the hectares line — the area trend is therefore a conservative lower bound, not a complete total.
                </p>
              )}
              {report.spikes?.map((s, i) => (
                <p key={i} className="text-xs text-muted-foreground mt-3"><strong className="text-foreground">{s.years}:</strong> {s.note}</p>
              ))}
              <p className="text-xs text-muted-foreground mt-3">
                <strong className="text-foreground">Note:</strong> The earliest bar (1971) is a single long-burning industrial gas-field fire that has been active continuously since that year — it predates the 10-year window and is shown for completeness, not as a wildfire-season indicator.
              </p>
            </Section>

            <Section title="Where fires concentrate" takeaway="The countries with the most recorded fires differ from those with the most hectares burned — a sign of data-source bias and differing fire regimes.">
              <CountryLeaders topByCount={report.top_countries_by_count} topByHectares={report.top_countries_by_hectares} />
            </Section>

            <Section title="Causes" takeaway={`${invPct}% of causes remain under investigation. Of those resolved, human activity — including arson, negligence, and agricultural burning — dominates over lightning.`}>
              <CauseDistribution causeDistribution={report.cause_distribution} />
            </Section>

            <Section title="Fireworks and holidays" takeaway={`${report.holiday_proximity?.pct_24h?.toFixed(1)}% of fires in firework-holiday countries started within 24 hours of a holiday with public fireworks.`}>
              <HolidayProximity hp={report.holiday_proximity} />
            </Section>

            <Section title="Coverage gaps" takeaway="Many countries appear only in 2024–2025, and dozens have no recorded incidents — a reminder that absence in this dataset often means limited visibility, not absence of fire.">
              <CountryActivityLists newlyActive={report.newly_active_countries} zeroActivity={report.zero_activity_countries} />
            </Section>
          </div>
        </>
      )}

      {/* Water stress — static */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <section className="border-t border-border pt-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-sans mb-3">Wildfire and water</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-4 leading-tight max-w-3xl">
            Fire and water stress reinforce each other.
          </h2>
          <div className="max-w-3xl space-y-4">
            <p className="text-sm sm:text-base text-foreground/80 font-sans leading-relaxed">
              Drought, heat and wind dry vegetation and make fires harder to control. During major incidents, water
              sources and municipal systems may be strained, while fire ash and sediment can contaminate watersheds and
              increase treatment costs afterward. Prepare for evacuation and outages without assuming water, hydrants,
              shelters or outside assistance will remain available.
            </p>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              <strong className="text-foreground">Keep the scale honest:</strong> wildfire suppression water use is a
              local, incident-scale strain, not a driver of regional drought. Regional water scarcity is shaped mainly by
              climate-driven precipitation deficits, heat-driven evaporation, agriculture and municipal and industrial
              demand. The risk is compounding rather than causal — a drought-stressed water system has less resilience at
              exactly the moment a wildfire creates urgent operational and recovery demands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border mt-8 max-w-4xl">
            <div className="bg-card p-6">
              <h3 className="font-serif text-lg font-bold text-foreground mb-2">For households</h3>
              <ul className="text-sm text-muted-foreground font-sans leading-relaxed space-y-1.5 list-disc pl-4">
                <li>Store water for your household size, medical needs and animals.</li>
                <li>Plan separately for water-dependent medication, infant feeding, livestock and sanitation.</li>
                <li>Know whether your well pump or filtration system needs electricity.</li>
                <li>Protect stored drinking water from smoke, ash and contamination.</li>
                <li>Never treat hoses, pools or hydrants as a substitute for evacuation.</li>
              </ul>
            </div>
            <div className="bg-card p-6">
              <h3 className="font-serif text-lg font-bold text-foreground mb-2">For municipalities</h3>
              <ul className="text-sm text-muted-foreground font-sans leading-relaxed space-y-1.5 list-disc pl-4">
                <li>Map water sources, pressure zones, hydrants, storage and vulnerable pumps.</li>
                <li>Pre-arrange tenders, portable tanks, backup power and mutual-aid agreements.</li>
                <li>Protect upstream watersheds through fuel treatment and post-fire monitoring.</li>
                <li>Model simultaneous peak demand from fire, evacuation, heat and outages.</li>
                <li>Communicate that drinking-water systems cannot suppress a fast-moving wildfire at community scale.</li>
              </ul>
            </div>
          </div>

          <SourceNote topics={["water"]} className="mt-6" />
        </section>
      </div>

      {/* Methodology — static */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <div className="border-t border-border pt-6">
          <div className="flex items-start gap-2 text-xs text-muted-foreground font-sans max-w-3xl">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-foreground">Methodology.</strong> Figures reflect large and notable wildfire
              incidents recorded by RallyPack{report ? ` across ${report.totals.countries_affected} countries` : ""},
              sourced from national and state fire agencies — small, quickly contained fire responses are intentionally
              excluded, so counts here are much lower than official all-incident totals. Causes are canonicalized for
              display; raw labels are preserved on each record. Fires that smoulder and re-ignite may be recorded as
              separate incidents, which can inflate counts — no records were modified to produce this report. Hectares
              represent burned area across recorded incidents, not a global total.{" "}
              {report ? `Human-caused share is ${humanPct}%. Data as of ${fmtDate(report.data_as_of)}. ` : ""}
              The 1971 data point reflects a single continuously burning industrial gas-field fire, included for
              completeness.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <PublicSources
          topics={["wildfire", "water"]}
          intro="Every figure on this report traces back to the agency that produced it. Where RallyPack's own counts are used, the scope of those counts is stated in the methodology above."
        />
      </div>

      <PublicCtaLadder contextLabel="Turn the data into a plan" />
    </div>
  );
}

function Section({ title, takeaway, children }) {
  return (
    <section>
      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground mb-5 max-w-3xl">{takeaway}</p>
      {children}
    </section>
  );
}