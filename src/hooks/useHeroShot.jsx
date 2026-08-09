import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { HERO_SHOTS } from "@/lib/heroShots";

// Returns the hero background image URL for a page: a stored admin override if
// one exists, otherwise the default from the registry. Renders the default
// synchronously on first paint (no layout flash) and swaps in the override
// once it loads.
export function useHeroShot(pageKey) {
  const entry = HERO_SHOTS.find((h) => h.page_key === pageKey);
  const defaultUrl = entry?.default_url || "";
  const [url, setUrl] = useState(defaultUrl);

  useEffect(() => {
    let active = true;
    base44.entities.SiteAsset.filter({ page_key: pageKey }, "-updated_date", 1)
      .then((records) => {
        if (active && records[0]?.image_url) setUrl(records[0].image_url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pageKey]);

  return url;
}