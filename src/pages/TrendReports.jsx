import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Info } from "lucide-react";
import ReportCard from "@/components/trends/ReportCard";
import { compactMoney } from "@/components/trends/FloodKeyNumbers";
import PublicSources from "@/components/public/PublicSources";
import PublicCtaLadder from "@/components/public/PublicCtaLadder";
import { usePublicHead, publicUrl } from "@/lib/publicSite";

const fmt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n || 0));

// Index of RallyPack's public disaster trend reports. Every card links to a
// report that is actually published — nothing here is a placeholder.
export default function TrendReports() {
  const [wildfire, setWildfire] = useState(null);
  const [flood, setFlood] = useState(null);
  const [loading, setLoading] = useState(true);

  usePublicHead({
    title: "Disaster Trend Reports — RallyPack",
    description:
      "Free, open-data reports on wildfire and flood trends: where they happen, what they cost and what the data does not show. Built for press, municipalities and planners.",
    path: "/trend-reports",
    type: "website",
  });

  useEffect(() => {
    (async () => {
      const [w, f] = await Promise.allSettled([
        base44.functions.invoke("getPublicWildfireReport", {}),
        base44.functions.invoke("getPublicFloodReport", {}),
      ]);
      if (w.status === "fulfilled") setWildfire(w.value.data);
      if (f.status === "fulfilled") setFlood(f.value.data);
      setLoading(false);
    })();
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "RallyPack Disaster Trend Reports",
    description:
      "Open-data reports on disaster trends, published free for press, municipalities and planners.",
    url: publicUrl("/trend-reports"),
    isPartOf: { "@type": "WebSite", name: "RallyPack", url: publicUrl("/") },
  };

  const fireYears = wildfire?.by_year || [];
  const floodTotals = flood?.totals;

  return (
    <div className="bg-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="bg-foreground text-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <p className="text-xs uppercase tracking-widest text-cream/60 font-sans mb-3">RallyPack Data</p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold leading-tight">Disaster Trend Reports</h1>
          <p className="mt-4 text-base sm:text-lg text-cream/80 font-sans max-w-2xl">
            What official records actually show about wildfires and floods — including the gaps, the double-counting we
            remove, and the parts nobody can measure yet. Free to read, quote and republish.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid md:grid-cols-2 gap-6">
          <ReportCard
            to="/wildfire-trends"
            kicker="Wildfire"
            title="10 Years of Global Wildfires"
            summary="Recorded large-fire incidents, causes, burned area, and the firework-holiday correlation — with the limits of each number stated plainly."
            loading={loading}
            stat={wildfire ? fmt(wildfire.totals?.total_incidents) : "—"}
            statLabel={
              fireYears.length > 0 ? `recorded fires, ${fireYears[0]?.year}–${fireYears[fireYears.length - 1]?.year}` : "recorded fires"
            }
          />
          <ReportCard
            to="/flood-trends"
            kicker="Flood"
            title="Floods, on the record"
            summary="Where flooding repeats, what it costs, how often a named storm is behind it, and which datasets the picture rests on."
            loading={loading}
            stat={floodTotals ? fmt(floodTotals.total_events) : "—"}
            statLabel={floodTotals?.events_with_damage > 0 ? `recorded floods · ${compactMoney(floodTotals.total_damage_usd)} reported damage` : "recorded flood events"}
          />
        </div>

        <section className="mt-12 border-t border-border pt-8">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-3">How these reports are built</h2>
          <ul className="space-y-2 max-w-3xl text-sm font-sans text-muted-foreground leading-relaxed list-disc pl-5">
            <li>Every figure comes from a government or intergovernmental dataset — nothing is estimated or modelled.</li>
            <li>Records describing the same event are merged, so one disaster is never counted twice; merged records are kept for audit.</li>
            <li>Each report states its own coverage gaps, because a missing record is not proof that nothing happened.</li>
            <li>Damage is shown in the currency year the source published it, never adjusted.</li>
            <li>Hazard types are tracked separately — hurricane-driven flooding is reported inside the flood report, not added to storm totals.</li>
          </ul>
          <div className="flex items-start gap-2 text-xs text-muted-foreground font-sans mt-5">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Reports are rebuilt from the source data and republished automatically as new records are reviewed and added.</p>
          </div>
        </section>

        <div className="mt-12">
          <PublicSources
            topics={["wildfire", "flood"]}
            intro="The agencies behind every dataset used in these reports."
          />
        </div>
      </div>

      <PublicCtaLadder contextLabel="Turn the data into a plan" />
    </div>
  );
}