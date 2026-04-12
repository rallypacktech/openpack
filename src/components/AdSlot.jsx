import React from "react";

/**
 * AdSlot — placeholder for Google AdSense units.
 * Replace data-ad-* attributes with your actual AdSense values.
 * size: "banner" | "rectangle" | "leaderboard" | "sidebar"
 */
export default function AdSlot({ size = "rectangle", className = "", label = true }) {
  const sizes = {
    banner: { w: "100%", h: "90px", text: "Advertisement — 728×90" },
    rectangle: { w: "300px", h: "250px", text: "Advertisement — 300×250" },
    leaderboard: { w: "100%", h: "90px", text: "Advertisement — Leaderboard" },
    sidebar: { w: "300px", h: "600px", text: "Advertisement — 300×600" },
  };

  const s = sizes[size] || sizes.rectangle;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && (
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-sans">
          Sponsored
        </p>
      )}
      <div
        className="bg-secondary/60 border border-border flex items-center justify-center text-muted-foreground text-xs font-sans rounded"
        style={{ width: s.w, maxWidth: "100%", height: s.h }}
        aria-label="Advertisement"
      >
        {/* TODO: Replace with <ins class="adsbygoogle"> tag when AdSense is live */}
        <span className="opacity-40">{s.text}</span>
      </div>
    </div>
  );
}