import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import { AlertTriangle, MapPin } from "lucide-react";
import L from "leaflet";

// Custom colored markers
function makeIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

const meetSpotIcon = makeIcon("#10b981");
const cacheIcon = makeIcon("#f59e0b");

export default function OfflineMap({ meetSpots = [], caches = [], isOnline }) {
  const spotPoints = meetSpots.filter(s => s.latitude && s.longitude);
  const cachePoints = caches.filter(c => c.latitude && c.longitude);
  const allPoints = [
    ...spotPoints.map(s => ({ ...s, _type: "meetspot" })),
    ...cachePoints.map(c => ({ ...c, _type: "cache" })),
  ];

  if (allPoints.length === 0) {
    return (
      <div className="border border-border rounded-lg bg-muted flex items-center justify-center h-48 text-sm text-muted-foreground font-sans gap-2">
        <MapPin className="w-4 h-4" />
        No GPS coordinates saved — add lat/lng to meet spots or caches to see them here.
      </div>
    );
  }

  const center = [allPoints[0].latitude, allPoints[0].longitude];

  // Compute bounds for fitting map
  const lats = allPoints.map(p => p.latitude);
  const lngs = allPoints.map(p => p.longitude);
  const bounds = allPoints.length > 1
    ? [[Math.min(...lats) - 0.01, Math.min(...lngs) - 0.01], [Math.max(...lats) + 0.01, Math.max(...lngs) + 0.01]]
    : null;

  return (
    <div className="space-y-2">
      {!isOnline && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 font-sans">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Offline — map tiles may not load, but your saved coordinates are listed below the map.
        </div>
      )}

      <div className="rounded-lg overflow-hidden border border-border" style={{ height: 300 }}>
        <MapContainer
          center={center}
          zoom={bounds ? undefined : 12}
          bounds={bounds || undefined}
          boundsOptions={{ padding: [40, 40] }}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          {spotPoints.map((spot) => (
            <Marker key={spot.id} position={[spot.latitude, spot.longitude]} icon={meetSpotIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{spot.name}</p>
                  {spot.is_primary && <p className="text-emerald-600 text-xs">⭐ Primary Rally Point</p>}
                  {spot.address && <p className="text-gray-600 text-xs mt-1">{spot.address}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
          {cachePoints.map((cache) => (
            <Marker key={cache.id} position={[cache.latitude, cache.longitude]} icon={cacheIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{cache.name}</p>
                  <p className="text-gray-500 text-xs capitalize">{cache.cache_type?.replace("_", " ")}</p>
                  {cache.location && <p className="text-gray-600 text-xs mt-1">{cache.location}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-sans text-muted-foreground px-1">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Meet Spots</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Caches</span>
      </div>

      {/* Offline coordinate fallback */}
      {!isOnline && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {allPoints.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-sans bg-muted rounded px-3 py-2">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${p._type === "meetspot" ? "bg-emerald-500" : "bg-amber-500"}`} />
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{p.name}</p>
                <p className="text-muted-foreground font-mono">{p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}</p>
                <a
                  href={`https://maps.google.com/?q=${p.latitude},${p.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Open in Maps
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}