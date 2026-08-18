import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { haversineKm } from "@/lib/nifcOutlook";

const RADIUS_KM = 300;

function fireIcon(severity) {
  const color =
    severity === "catastrophic" ? "#7f1d1d"
    : severity === "major" ? "#ea580c"
    : severity === "moderate" ? "#ca8a04"
    : "#16a34a";
  return L.divIcon({
    className: "",
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:11px;">🔥</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function anchorIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:26px;height:26px;border-radius:50%;background:#1C1C1A;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:12px;">📍</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function fmt(n) {
  if (!n) return "0";
  return n.toLocaleString();
}

// Live wildfire incident map scoped to the org's evacuation-plan assembly
// points. Falls back to the user's selected emergency countries, then global.
export default function EvacuationIncidentMap({ plans = [], emergencyCountries = [] }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.WildfireIncident.list("-start_date", 500);
        setIncidents(data.filter((i) => !i.is_merged_away));
      } catch (e) {
        console.error("EvacuationIncidentMap load error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const anchors = useMemo(
    () =>
      plans
        .filter((p) => p.assembly_point_latitude && p.assembly_point_longitude)
        .map((p) => ({
          lat: p.assembly_point_latitude,
          lng: p.assembly_point_longitude,
          name: p.plan_name || "Assembly point",
        })),
    [plans]
  );

  const scoped = useMemo(() => {
    const mapped = incidents.filter((i) => i.latitude && i.longitude);
    if (anchors.length > 0) {
      return mapped.filter((i) =>
        anchors.some((a) => haversineKm(a.lat, a.lng, i.latitude, i.longitude) <= RADIUS_KM)
      );
    }
    if (emergencyCountries.length > 0) {
      return mapped.filter((i) => emergencyCountries.includes(i.country_code));
    }
    return mapped;
  }, [incidents, anchors, emergencyCountries]);

  const scopeLabel =
    anchors.length > 0
      ? `near ${anchors.length} evacuation plan location(s)`
      : emergencyCountries.length > 0
      ? "your selected countries"
      : "worldwide";

  const center = anchors[0]
    ? [anchors[0].lat, anchors[0].lng]
    : scoped[0]
    ? [scoped[0].latitude, scoped[0].longitude]
    : [37.5, -120];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Live Incident Map — {scopeLabel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-muted border-t-foreground rounded-full animate-spin" />
          </div>
        ) : scoped.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            No mapped wildfire incidents {scopeLabel}. Add evacuation plan locations to focus the map.
          </p>
        ) : (
          <>
            <div style={{ height: 380, borderRadius: 8, overflow: "hidden" }} className="border border-border">
              <MapContainer
                center={center}
                zoom={anchors.length > 0 ? 7 : 5}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap"
                />
                {anchors.map((a, i) => (
                  <Marker key={`a-${i}`} position={[a.lat, a.lng]} icon={anchorIcon()}>
                    <Popup>
                      <strong>{a.name}</strong>
                      <br />
                      Evacuation assembly point
                    </Popup>
                  </Marker>
                ))}
                {scoped.map((inc) => (
                  <Marker key={inc.id} position={[inc.latitude, inc.longitude]} icon={fireIcon(inc.severity)}>
                    <Popup>
                      <div style={{ minWidth: 180 }}>
                        <strong>{inc.incident_name}</strong>
                        <br />
                        {inc.admin2_name}, {inc.admin1_name}, {inc.country_code}
                        <br />
                        Started: {inc.start_date}
                        <br />
                        Burned: {fmt(Math.round(inc.hectares_burned))} ha
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {scoped.length} incident(s) shown {scopeLabel}
              {anchors.length > 0 ? ` (within ${RADIUS_KM} km of plan locations).` : "."}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}