import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Share2, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloodKeyNumbers, { compactMoney } from "@/components/trends/FloodKeyNumbers";
import FloodYearChart from "@/components/trends/FloodYearChart";
import FloodStateLeaders from "@/components/trends/FloodStateLeaders";
import FloodHazardMix from "@/components/trends/FloodHazardMix";
import FloodSevereList from "@/components/trends/FloodSevereList";
import SourceNote from "@/components/public/SourceNote";
import PublicSources from "@/components/public/PublicSources";
import PublicCtaLadder from "@/components/public/PublicCtaLadder";
import { usePublicHead, publicUrl } from "@/lib/publicSite";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function Section({ title, takeaway, children }) {
  return (
    <section>
      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">{title}</h2>
      {takeaway && <p className="text-sm text-muted-foreground mb-5 max-w-3xl">{takeaway}</p>}
      {children}
    </section>
  );
}

// Public, no-login flood trend report. The hero, the scope disclosure, the
// methodology and the source list are static, so the page carries real content
// for crawlers even before the live figures arrive.
export default function FloodTrends() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  usePublicHead({
    title: "Flood Trends — RallyPack Disaster Data Report",
    description:
      "An open-data look at recorded flood events: where they happen, what they cost, how often hurricanes drive them, and what the coverage gaps are.",
    path: "/flood-trends",
    type: "article",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("getPublicFloodReport", {});
        setReport(res.data);
      } catch (e) {
        setError(e.response?.data?.error || e.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isEmpty = report && (report.totals?.total_events || 0) === 0;

  const jsonLd = useMemo(() => {
    if (!report || isEmpty) return null;
    const y = report.years || {};
    return {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "RallyPack Flood Trend Report",
      description: `Recorded flood events ${y.from ?? ""}–${y.to ?? ""}: ${report.totals.total_events} floods across ${report.totals.states_affected} states and regions, ${report.totals.total_deaths} deaths, ${compactMoney(report.totals.total_damage_usd)} in reported damage.`,
      creator: { "@type": "Organization", name: "RallyPack", url: publicUrl("/") },
      isAccessibleForFree: true,
      license: "https://opensource.org/license/mit",
      keywords: "flood, flood trends, flood damage, disaster data, preparedness, flood statistics",
      temporalCoverage: `${y.from}/${y.to}`,
      distribution: [
        {
          "@type": "DataDownload",
          name: "RallyPack Flood Trend Report",
          contentUrl: publicUrl("/flood-trends"),
          encodingFormat: "text/html",
        },
      ],
      dateModified: report.data_as_of,
    };
  }, [report, isEmpty]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl("/flood-trends"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <div className="bg-cream">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      )}
      {report && (
        <script
          type="application/json"
          data-rallypack-flood-report
          dangerouslySetInnerHTML={{ __html: JSON.stringify(report).replace(/</g, "\\u003c") }}
        />
      )}

      <div className="bg-foreground text-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <Link
            to="/trend-reports"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-cream/60 hover:text-cream font-sans mb-5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All trend reports
          </Link>
          <p className="text-xs uppercase tracking-widest text-cream/60 font-sans mb-3">RallyPack Disaster Data Report</p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold leading-tight">Floods, on the record</h1>
          <p className="mt-4 text-base sm:text-lg text-cream/80 font-sans max-w-2xl">
            What official flood records actually show — where flooding repeats, what it costs, how often a hurricane is
            behind it, and where the data simply runs out.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="bg-transparent text-cream border-cream/30 hover:bg-cream/10"
            >
              <Share2 className="w-4 h-4 mr-1.5" /> {copied ? "Link copied" : "Share this report"}
            </Button>
            {report && <span className="text-xs text-cream/60 font-sans">Data as of {fmtDate(report.data_as_of)}</span>}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-secondary/60 border border-border rounded-md p-4 max-w-4xl">
          <p className="text-xs text-foreground font-sans">
            <strong>What this report counts:</strong> flood events that a government agency formally recorded — FEMA
            disaster declarations and NOAA Storm Events in the United States, plus EM-DAT and DesInventar records where
            they are added. A town can flood badly and still never appear here, because no declaration was made or no
            record was filed. Treat these figures as a floor for impact and a map of where records exist, never as a
            complete count of flooding.
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
            The methodology and sources below do not depend on the live feed.
          </p>
        </div>
      )}

      {isEmpty && (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">This report is being populated</h2>
          <p className="text-sm text-muted-foreground font-sans">
            No verified flood records have been imported yet. Each record is checked against its source before it is
            published here, so the report stays empty until the first dataset has been reviewed — nothing is estimated
            or filled in.
          </p>
        </div>
      )}

      {report && !isEmpty && (
        <>
          <FloodKeyNumbers totals={report.totals} />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
            <Section
              title="Floods per year"
              takeaway={`${report.totals.total_events.toLocaleString()} recorded floods between ${report.years.from} and ${report.years.to}. Bars are events; the line is reported damage in the dollars of the year each event happened.`}
            >
              <FloodYearChart byYear={report.by_year} />
              {report.coverage?.years_without_data?.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  <strong className="text-foreground">Gap:</strong> no records exist for{" "}
                  {report.coverage.years_without_data.join(", ")}. A flat or missing year reflects missing records, not
                  an absence of flooding.
                </p>
              )}
            </Section>

            <Section
              title="Where floods concentrate"
              takeaway="The places that flood most often are rarely the places that report the most damage — frequency and cost are two different stories."
            >
              <FloodStateLeaders topByCount={report.top_states_by_count} topByDamage={report.top_states_by_damage} />
            </Section>

            <Section
              title="What kind of flooding, and whose records"
              takeaway={`${report.totals.pct_hurricane}% of the recorded floods were driven by a named storm. The right-hand column shows how much of this picture rests on each dataset.`}
            >
              <FloodHazardMix hazardMix={report.hazard_mix} sourceMix={report.source_mix} />
            </Section>

            <Section
              title="Largest reported events"
              takeaway="Ranked by reported damage. One event can be declared across many areas, so a single storm may appear more than once."
            >
              <FloodSevereList events={report.most_severe} />
            </Section>

            <Section
              title="Coverage"
              takeaway={`${report.totals.states_affected} states and regions and ${report.totals.countries_affected} countries are represented. ${report.coverage?.us_only ? "Every record here is American — international flooding is not yet in this report." : "Records come from multiple countries, but the mix is uneven."}`}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {(report.by_country || []).map((c) => (
                  <div key={c.name} className="flex items-baseline justify-between border-b border-border py-2">
                    <span className="text-sm font-sans text-foreground truncate">{c.name}</span>
                    <span className="text-sm font-sans tabular-nums text-muted-foreground">
                      {c.count.toLocaleString()} floods
                    </span>
                  </div>
                ))}
              </div>
              <SourceNote topics={["flood"]} className="mt-5" />
            </Section>
          </div>
        </>
      )}

      {/* Preparation — static, always readable */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <section className="border-t border-border pt-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-sans mb-3">What the trend means for you</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-4 leading-tight max-w-3xl">
            Flooding is the most widespread disaster in this record — and mostly not where people expect it.
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            <div className="bg-card p-6">
              <h3 className="font-serif text-lg font-bold text-foreground mb-2">For households</h3>
              <ul className="text-sm text-muted-foreground font-sans leading-relaxed space-y-1.5 list-disc pl-4">
                <li>Check your address on the official flood map, then plan for water higher than the map shows.</li>
                <li>Most flood deaths happen in vehicles — never drive through standing water.</li>
                <li>Keep documents, medication and a phone battery above expected water level.</li>
                <li>Standard home insurance does not cover flooding; separate coverage usually has a waiting period.</li>
              </ul>
            </div>
            <div className="bg-card p-6">
              <h3 className="font-serif text-lg font-bold text-foreground mb-2">For municipalities</h3>
              <ul className="text-sm text-muted-foreground font-sans leading-relaxed space-y-1.5 list-disc pl-4">
                <li>Map repeat-loss properties, not just the regulatory floodplain.</li>
                <li>Pre-position signage, pumps, sand and shelter capacity before forecasts lock in.</li>
                <li>Plan for culverts, drains and roads that fail below the mapped flood level.</li>
                <li>Track your own uncompensated losses — unrecorded damage never shows up in a report like this one.</li>
              </ul>
            </div>
          </div>
          <SourceNote topics={["flood"]} className="mt-6" />
        </section>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <div className="border-t border-border pt-6">
          <div className="flex items-start gap-2 text-xs text-muted-foreground font-sans max-w-3xl">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-foreground">Methodology.</strong> One row is one recorded flood record as its
              source published it. FEMA declarations are counted per declared area; NOAA Storm Events are counted per
              notable event; records that describe the same event are merged so impacts are not double-counted, and
              merged records stay in the database for audit. Deaths, injuries and affected people are the source's own
              direct figures — never modelled. Damage is kept in the dollars of the year reported and is not
              inflation-adjusted; zero means the source published no figure, not that there was no damage.{report ? ` Data as of ${fmtDate(report.data_as_of)}.` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <PublicSources
          topics={["flood"]}
          intro="Every figure on this report traces back to the agency that produced the record. Where RallyPack's own counts are used, the scope of those counts is stated in the methodology above."
        />
      </div>

      <PublicCtaLadder contextLabel="Turn the data into a plan" />
    </div>
  );
}