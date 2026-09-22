import React from "react";
import { Link } from "react-router-dom";
import { PUBLIC_PAGE_GROUPS } from "@/lib/publicPages";
import { usePublicHead } from "@/lib/publicSite";
import PublicCtaLadder from "@/components/public/PublicCtaLadder";

export default function Sitemap() {
  usePublicHead({
    title: "Sitemap | RallyPack",
    description:
      "Every public page on RallyPack — hazard guides, species plans, readiness tools, the wildfire trend report, organization features and legal pages.",
    path: "/sitemap",
  });

  return (
    <div className="bg-cream min-h-screen font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">
          RallyPack
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
          Sitemap
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mb-12">
          Every public page, grouped by what it covers. All of it is free and needs no account.
        </p>

        <div className="space-y-12">
          {PUBLIC_PAGE_GROUPS.map((g) => (
            <section key={g.group}>
              <h2 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4 pb-3 border-b border-border">
                {g.group}
              </h2>
              <ul className="space-y-4">
                {g.pages.map((p) => (
                  <li key={p.path}>
                    <Link
                      to={p.path}
                      className="font-serif text-lg font-semibold text-foreground underline decoration-dotted underline-offset-4 hover:text-primary transition-colors"
                    >
                      {p.label}
                    </Link>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">{p.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <PublicCtaLadder contextLabel="Start with the quiz" />
    </div>
  );
}