import React from "react";
import { getFaq } from "@/lib/publicFaq";
import { publicUrl } from "@/lib/publicSite";

/**
 * On-page question-and-answer block for a public hazard or species page.
 * The direct answer is always visible; only the extra detail sits behind a
 * disclosure. Questions are also emitted as FAQPage structured data so answer
 * engines can lift them directly.
 */
export default function PageFaq({ topic, title = "Common questions", path }) {
  const items = getFaq(topic);
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: publicUrl(path || `/${topic}`),
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: i.detail ? `${i.a} ${i.detail}` : i.a,
      },
    })),
  };

  return (
    <section className="py-20 max-w-6xl mx-auto px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">Answers</p>
      <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1A] mb-12 leading-tight max-w-2xl">
        {title}
      </h2>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#D8D2C6]">
        {items.map((item) => (
          <div key={item.q} className="bg-[#F5F0E8] p-8">
            <dt className="font-sans font-semibold text-[#1C1C1A] text-base leading-snug mb-3">{item.q}</dt>
            <dd className="text-sm text-[#8A8577] leading-relaxed">
              {item.a}
              {item.detail && (
                <details className="mt-3 group">
                  <summary className="cursor-pointer text-xs font-sans uppercase tracking-widest text-[#D64A2E] hover:opacity-80">
                    More detail
                  </summary>
                  <p className="mt-2 text-sm text-[#8A8577] leading-relaxed">{item.detail}</p>
                </details>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}