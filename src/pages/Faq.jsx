import React from "react";
import { FAQ_TOPICS, PUBLIC_FAQ } from "@/lib/publicFaq";
import { usePublicHead, publicUrl } from "@/lib/publicSite";
import PublicCtaLadder from "@/components/public/PublicCtaLadder";

export default function Faq() {
  usePublicHead({
    title: "Emergency Preparedness FAQ | RallyPack",
    description:
      "Direct answers on how long to prepare for, family meeting points, year-round wildfire risk, animal evacuation, flood and tornado safety, and what insurance does not cover.",
    path: "/faq",
  });

  const allQuestions = FAQ_TOPICS.flatMap((t) =>
    (PUBLIC_FAQ[t.key] || []).map((i) => ({ ...i, topic: t.label }))
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: publicUrl("/faq"),
    mainEntity: allQuestions.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: i.detail ? `${i.a} ${i.detail}` : i.a,
      },
    })),
  };

  return (
    <div className="bg-cream min-h-screen font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">
          Emergency Preparedness
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
          Frequently asked questions
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mb-8">
          Straight answers on how long to prepare for, who goes where, and what actually keeps a
          household safe — drawn from FEMA, Red Cross, NIFC, NOAA, USGS and NFPA guidance.
        </p>

        <nav aria-label="FAQ topics" className="flex flex-wrap gap-2 mb-12">
          {FAQ_TOPICS.map((t) => (
            <a
              key={t.key}
              href={`#${t.key}`}
              className="text-xs font-sans px-3 py-1.5 border border-border rounded text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              {t.label}
            </a>
          ))}
        </nav>

        <div className="space-y-14">
          {FAQ_TOPICS.map((t) => (
            <section key={t.key} id={t.key} className="scroll-mt-20">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-6 pb-3 border-b border-border">
                {t.label}
              </h2>
              <dl className="space-y-8">
                {(PUBLIC_FAQ[t.key] || []).map((item) => (
                  <div key={item.q}>
                    <dt className="font-serif text-lg sm:text-xl font-semibold text-foreground leading-snug mb-2">
                      {item.q}
                    </dt>
                    <dd className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                      <p>{item.a}</p>
                      {item.detail && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-xs uppercase tracking-widest text-primary hover:opacity-80">
                            More detail
                          </summary>
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                        </details>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>

      <PublicCtaLadder contextLabel="Put the answers to work" />
    </div>
  );
}