import { useEffect } from "react";

// Single source of truth for the public web host.
// rallypack.org is the public domain for every link, canonical tag, share URL and
// structured-data URL. rallypack.tech is internal-only and must never appear in
// public-facing output.
export const PUBLIC_SITE_URL = "https://rallypack.org";

export const PUBLIC_SITE_NAME = "RallyPack";

/** Absolute URL on the public host, e.g. publicUrl("/wildfire") */
export function publicUrl(path = "/") {
  if (!path || path === "/") return `${PUBLIC_SITE_URL}/`;
  return `${PUBLIC_SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function setMeta(attr, name, content) {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Sets the public page head — title, description, Open Graph and a canonical
 * tag pinned to the public host — so crawlers and answer engines see consistent
 * metadata for every public page.
 */
export function usePublicHead({ title, description, path, type = "website" }) {
  useEffect(() => {
    const url = publicUrl(path);
    if (title) {
      document.title = title;
      setMeta("property", "og:title", title);
    }
    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
    }
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", url);
    setCanonical(url);
  }, [title, description, path, type]);
}