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

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function setMeta(name, content, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

// Public, no-login, SEO-indexed 10-year wildfire trend report for press,
// municipalities, and AI crawlers.
export default function WildfireTrends() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

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
      creator: { "@type": "Organization", name: "RallyPack", url: "https://www.rallypack.org" },
      isAccessibleForFree: true,
      keywords: "wildfire, wildfire trends, preparedness, disaster data, fire statistics",
      distribution: years.map((y) => `${y.year}: ${y.count} fires, ${y.hectares} ha`).join("; "),
      dateModified: report.data_as_of,
    };
  }, [report]);

  // Dynamic SEO head: title, description, Open Graph, canonical — so press and
  // AI crawlers see report-specific metadata without polluting index.html.
  useEffect(() => {
    if (!report) return;
    const t = report.totals;
    const title = "10 Years of Global Wildfires — RallyPack Trend Report";
    const desc = `${t.total_incidents.toLocaleString()} recorded wildfires across ${t.countries_affected} countries. Open-data trend report on causes, hectares burned, and the firework-holiday correlation.`;
    document.title = title;
    setMeta("description", desc);
    setMeta("og:title", title, true);
    setMeta("og:description", desc, true);
    setMeta("og:type", "article", true);
    setLink("canonical", "https://www.rallypack.org/wildfire-trends");
    return () => {
      // restore is left to other pages' own head management
    };
  }, [report]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Unable to load the wildfire report.</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  const humanPct = pctBuckets(report, ["Human Activity", "Agricultural", "Power/Infrastructure"]);
  const invPct = pctOf(report, "Under Investigation");

  return (
    <div className="bg-cream">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {/* Full report as machine-readable JSON for AI/crawlers — not rendered for end users. */}
      <script type="application/json" data-rallypack-wildfire-report dangerouslySetInnerHTML={{ __html: JSON.stringify(report) }} />

      {/* Hero */}
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
            <span className="text-xs text-cream/60 font-sans">Data as of {fmtDate(report.data_as_of)}</span>
          </div>
        </div>
      </div>

      <KeyNumbersBand totals={report.totals} causeDistribution={report.cause_distribution} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <Section title="Fires per year" takeaway={`${report.totals.total_incidents.toLocaleString()} recorded wildfires across ${report.totals.countries_affected} countries. Spikes in 2017–2018 and 2024–2025 align with major fire seasons and the 2023–2024 El Niño.`}>
          <YearTrendChart byYear={report.by_year} />
          {report.spikes?.map((s, i) => (
            <p key={i} className="text-xs text-muted-foreground mt-3"><strong className="text-foreground">{s.years}:</strong> {s.note}</p>
          ))}
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

        {/* Methodology footnote */}
        <div className="border-t border-border pt-6">
          <div className="flex items-start gap-2 text-xs text-muted-foreground font-sans max-w-3xl">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-foreground">Methodology.</strong> Figures reflect all active (non-merged) wildfire
              incidents recorded by RallyPack across {report.totals.countries_affected} countries. Causes are canonicalized
              for display; raw labels are preserved on each record. Fires that smoulder and re-ignite may be recorded as
              separate incidents, which can inflate counts — no records were modified to produce this report. Hectares
              represent burned area across recorded incidents, not a global total. Human-caused share is {humanPct}%.
              Data as of {fmtDate(report.data_as_of)}.
            </p>
          </div>
        </div>

      </div>
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