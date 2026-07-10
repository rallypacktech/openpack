import React from "react";
import { Circle, Marker, Popup } from "react-leaflet";
import L from "leaflet";

/**
 * Renders outlook regions as dashed circles with markers on a Leaflet map.
 * Must be rendered inside a <MapContainer>.
 *
 * Props:
 * - regions: array of { id, label, latitude, longitude, radius_km, description? }
 * - color: hex color string (e.g. "#f97316")
 * - icon: emoji string for the marker
 * - badgeText: text shown in the popup badge
 * - badgeClass: Tailwind classes for the badge
 * - descriptionFallback: text shown if a region has no description
 * - sourceLabel: text shown at the bottom of the popup
 */
export default function OutlookOverlay({ regions, color, icon, badgeText, badgeClass, descriptionFallback, sourceLabel }) {
  if (!regions || regions.length === 0) return null;
  return regions.map((region) => (
    <React.Fragment key={region.id}>
      <Circle
        center={[region.latitude, region.longitude]}
        radius={region.radius_km * 1000}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.12, weight: 1.5, dashArray: "6 4" }}
      />
      <Marker
        position={[region.latitude, region.longitude]}
        icon={L.divIcon({
          className: "",
          html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:13px;">${icon}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })}
      >
        <Popup maxWidth={280}>
          <div className="text-sm space-y-1">
            <p className="font-bold text-gray-900">{region.label}</p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded border font-medium ${badgeClass}`}>
              {badgeText}
            </span>
            {(region.description || descriptionFallback) && (
              <p className="text-xs text-gray-700 mt-1 leading-relaxed">{region.description || descriptionFallback}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{sourceLabel}</p>
          </div>
        </Popup>
      </Marker>
    </React.Fragment>
  ));
}