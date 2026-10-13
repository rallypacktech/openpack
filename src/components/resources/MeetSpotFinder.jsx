import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, ExternalLink } from "lucide-react";

// Real nearby places come from OpenStreetMap. One request per user action,
// cached for a day — no AI, no map tiles, no polling.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_PREFIX = "rp_nearby_places_";
const RADIUS_M = 10000;
const MAX_PER_DIRECTION = 3;

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const KIND_LABELS = {
  community_centre: "Community centre",
  library: "Library",
  school: "School",
  fire_station: "Fire station",
  townhall: "Town hall",
  place_of_worship: "Place of worship",
  hospital: "Hospital",
  police: "Police station",
  park: "Park",
  playground: "Playground",
  sports_centre: "Sports centre",
  nature_reserve: "Nature reserve",
};

function buildQuery(lat, lon) {
  return (
    `[out:json][timeout:25];(` +
    `nwr["amenity"~"^(community_centre|library|school|fire_station|townhall|place_of_worship|hospital|police)$"](around:${RADIUS_M},${lat},${lon});` +
    `nwr["leisure"~"^(park|playground|sports_centre|nature_reserve)$"](around:${RADIUS_M},${lat},${lon});` +
    `);out center 80;`
  );
}

const toRadians = (d) => (d * Math.PI) / 180;

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function directionFrom(lat1, lon1, lat2, lon2) {
  const y = Math.sin(toRadians(lon2 - lon1)) * Math.cos(toRadians(lat2));
  const x =
    Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
    Math.sin(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.cos(toRadians(lon2 - lon1));
  const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  if (bearing >= 315 || bearing < 45) return "North";
  if (bearing < 135) return "East";
  if (bearing < 225) return "South";
  return "West";
}

function parseElements(elements, home) {
  return elements
    .filter((el) => el.tags && el.tags.name)
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (lat == null || lon == null) return null;
      const kind = el.tags.amenity || el.tags.leisure;
      return {
        id: `${el.type}/${el.id}`,
        name: el.tags.name,
        kindLabel: KIND_LABELS[kind] || "Place",
        address: [
          el.tags["addr:housenumber"],
          el.tags["addr:street"],
          el.tags["addr:city"],
        ]
          .filter(Boolean)
          .join(" "),
        latitude: lat,
        longitude: lon,
        distanceKm: distanceKm(home.lat, home.lon, lat, lon),
        direction: directionFrom(home.lat, home.lon, lat, lon),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export default function MeetSpotFinder({ homeCoords, missingDirections, onSelect, onManual }) {
  const [places, setPlaces] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const findPlaces = async () => {
    if (!homeCoords) return;
    setError("");
    const cacheKey = `${CACHE_PREFIX}${homeCoords.lat.toFixed(2)}_${homeCoords.lon.toFixed(2)}`;

    try {
      const cached = JSON.parse(sessionStorage.getItem(cacheKey) || "null");
      if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
        setPlaces(cached.places);
        return;
      }
    } catch (_e) {
      /* cache unavailable */
    }

    setLoading(true);
    const query = buildQuery(homeCoords.lat, homeCoords.lon);
    let found = null;

    for (const endpoint of ENDPOINTS) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(query)}`,
        });
        if (!res.ok) continue;
        const data = await res.json();
        found = parseElements(data.elements || [], homeCoords);
        break;
      } catch (_e) {
        /* try the next mirror */
      }
    }

    setLoading(false);

    if (!found) {
      setError(
        "Couldn't reach the map data service just now. Try again, or add a spot manually.",
      );
      return;
    }

    try {
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({ at: Date.now(), places: found }),
      );
    } catch (_e) {
      /* cache unavailable */
    }
    setPlaces(found);
  };

  useEffect(() => {
    findPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!homeCoords) {
    return (
      <div className="border border-dashed border-border rounded p-5">
        <p className="text-sm font-sans text-foreground font-medium mb-1">
          We need your home location first
        </p>
        <p className="text-sm font-sans text-muted-foreground mb-3">
          Add your home address in Settings and we'll show real places near you.
        </p>
        <Button variant="outline" size="sm" onClick={onManual}>
          Add a spot manually
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border border-border rounded p-6 flex items-center gap-3">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span className="text-sm font-sans text-muted-foreground">
          Looking for real places near your home…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-border rounded p-5">
        <p className="text-sm font-sans text-muted-foreground mb-3">{error}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={findPlaces}>
            Try again
          </Button>
          <Button variant="outline" size="sm" onClick={onManual}>
            Add a spot manually
          </Button>
        </div>
      </div>
    );
  }

  const groups = missingDirections.map((direction) => ({
    direction,
    items: (places || [])
      .filter((p) => p.direction === direction)
      .slice(0, MAX_PER_DIRECTION),
  }));

  return (
    <div className="border border-border rounded">
      <div className="p-5 border-b border-border">
        <h3 className="font-sans font-semibold text-sm text-foreground">
          Real places near you
        </h3>
        <p className="text-xs font-sans text-muted-foreground mt-1">
          Pick one to fill each direction. You'll confirm the details before it's
          saved — check the place is safe and reachable for everyone.
        </p>
      </div>

      <div className="divide-y divide-border">
        {groups.map(({ direction, items }) => (
          <div key={direction} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-sans font-semibold text-xs uppercase tracking-widest text-foreground">
                {direction}
              </h4>
              <span className="text-xs font-sans text-muted-foreground">
                {items.length > 0
                  ? `${items.length} nearby`
                  : "nothing found"}
              </span>
            </div>

            {items.length === 0 ? (
              <p className="text-xs font-sans text-muted-foreground">
                No named places found in this direction. You can add one
                manually.
              </p>
            ) : (
              <ul className="space-y-2">
                {items.map((place) => (
                  <li
                    key={place.id}
                    className="flex items-start justify-between gap-3 bg-secondary/40 rounded p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-sans font-medium text-sm text-foreground truncate">
                        {place.name}
                      </p>
                      <p className="text-xs font-sans text-muted-foreground mt-0.5">
                        {place.kindLabel} · {place.distanceKm.toFixed(1)} km away
                      </p>
                      {place.address && (
                        <p className="text-xs font-sans text-muted-foreground mt-0.5 truncate">
                          {place.address}
                        </p>
                      )}
                      <a
                        href={`https://www.openstreetmap.org/${place.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-sans text-primary hover:underline mt-1"
                      >
                        <MapPin className="w-3 h-3" /> View on map
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-xs"
                      onClick={() => onSelect(place)}
                    >
                      Use this
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="p-5 border-t border-border flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-sans text-muted-foreground">
          Place data © OpenStreetMap contributors
        </p>
        <Button variant="ghost" size="sm" onClick={onManual}>
          Add a spot manually
        </Button>
      </div>
    </div>
  );
}