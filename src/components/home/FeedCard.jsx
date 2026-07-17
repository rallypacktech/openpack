import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FeedCard({ image, imageAlt, eyebrow, title, description, ctaLabel, ctaLink, ctaAction, reversed, children }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-0">
      <div className={`relative aspect-[4/3] md:aspect-auto md:min-h-[420px] overflow-hidden ${reversed ? 'md:order-2' : ''}`}>
        <img src={image} alt={imageAlt || ''} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className={`flex items-center px-6 py-12 md:p-16 bg-[#F5F0E8] ${reversed ? 'md:order-1' : ''}`}>
        <div className="max-w-sm mx-auto w-full">
          {eyebrow && <p className="text-[10px] uppercase tracking-[0.3em] text-[#D64A2E] font-sans mb-3">{eyebrow}</p>}
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1C1C1A] mb-4 leading-tight">{title}</h2>
          {description && <p className="text-sm text-[#1C1C1A]/60 font-sans leading-relaxed mb-6">{description}</p>}
          {children}
          {ctaLabel && ctaLink && (
            <Link to={ctaLink}>
              <button className="inline-flex items-center gap-2 bg-[#D64A2E] text-white font-sans font-semibold px-7 py-3.5 hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase">
                {ctaLabel} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          )}
          {ctaLabel && !ctaLink && ctaAction && (
            <button onClick={ctaAction} className="inline-flex items-center gap-2 bg-[#D64A2E] text-white font-sans font-semibold px-7 py-3.5 hover:bg-[#be3f25] transition-colors text-xs tracking-widest uppercase">
              {ctaLabel} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}