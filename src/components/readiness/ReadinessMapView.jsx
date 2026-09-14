import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function scoreToColor(score) {
  if (score >= 70) return "#16a34a";
  if (score >= 40) return "#f59e0b";
  return "#dc2626";
}

function countToRadius(count) {
  return Math.min(28, Math.max(8, 6 + Math.sqrt(count) * 2.5));
}

function FlyToController({ locations }) {
  const map = useMap();
  useEffect(() => {
    const valid = (locations || []).filter((l) => l.latitude && l.longitude);
    if (valid.length === 0) return;
    if (valid.length === 1) {
      map.setView([valid[0].latitude, valid[0].longitude], 6, { animate: true });
    } else {
      const bounds = valid.map((l) => [l.latitude, l.longitude]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8, animate: true });
    }
  }, [locations]);
  return null;
}

export default function ReadinessMapView({ locations, onDrillDown, level }) {
  return (
    <div className="h-[400px] sm:h-[500px] rounded-lg overflow-hidden border border-border relative z-0">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        worldCopyJump={true}
        minZoom={1}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <FlyToController locations={locations} />
        {(locations || []).map((loc, idx) => {
          if (!loc.latitude || !loc.longitude) return null;
          const color = scoreToColor(loc.avg_score);
          return (
            <CircleMarker
              key={`${loc.name}-${idx}`}
              center={[loc.latitude, loc.longitude]}
              radius={countToRadius(loc.count)}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.6, weight: 2 }}
              eventHandlers={{ click: () => onDrillDown(loc) }}
            >
              <Popup>
                <div className="text-sm space-y-1">
                  <strong className="text-base block">{loc.name}</strong>
                  <p className="text-gray-600">
                    Average readiness: <strong>{loc.avg_score}%</strong>
                  </p>
                  <p className="text-gray-600">
                    {loc.count} {loc.count === 1 ? "response" : "responses"}
                  </p>
                  {level !== "postal" && (
                    <p className="text-blue-600 mt-1 font-medium">
                      Click to drill down →
                    </p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}