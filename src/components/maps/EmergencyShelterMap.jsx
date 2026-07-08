import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, PawPrint, Heart, Building2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icon for shelters
const shelterIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%232563eb'%3E%3Cpath d='M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z'/%3E%3C/svg%3E",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Custom icon for parks/meetup spots
const parkIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%2316a34a'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/%3E%3Ccircle cx='12' cy='9' r='2.5' fill='white'/%3E%3C/svg%3E",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function EmergencyShelterMap({ 
  shelters = [], 
  rallyPoints = [], 
  userLocation = null,
  showRadius = false,
  radiusKm = 40 
}) {
  const [center, setCenter] = useState([39.8283, -98.5795]); // Center of USA
  const [zoom, setZoom] = useState(4);

  useEffect(() => {
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      setCenter([userLocation.latitude, userLocation.longitude]);
      setZoom(12);
    } else if (rallyPoints.length > 0 && rallyPoints[0].latitude) {
      setCenter([rallyPoints[0].latitude, rallyPoints[0].longitude]);
      setZoom(12);
    } else if (shelters.length > 0 && shelters[0].latitude) {
      setCenter([shelters[0].latitude, shelters[0].longitude]);
      setZoom(11);
    }
  }, [userLocation, shelters, rallyPoints]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Emergency Locations Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* User Location */}
            {userLocation && userLocation.latitude && userLocation.longitude && (
              <>
                <Marker 
                  position={[userLocation.latitude, userLocation.longitude]}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>Your Location</strong>
                      {userLocation.address && <p className="text-gray-600 mt-1">{userLocation.address}</p>}
                    </div>
                  </Popup>
                </Marker>
                
                {/* Radius Circle */}
                {showRadius && (
                  <Circle
                    center={[userLocation.latitude, userLocation.longitude]}
                    radius={radiusKm * 1000} // Convert km to meters
                    pathOptions={{ 
                      color: "blue", 
                      fillColor: "blue", 
                      fillOpacity: 0.1,
                      weight: 2,
                      dashArray: "5, 5"
                    }}
                  />
                )}
              </>
            )}

            {/* Emergency Shelters */}
            {shelters.map((shelter) => {
              if (!shelter.latitude || !shelter.longitude) return null;
              return (
                <Marker
                  key={shelter.id}
                  position={[shelter.latitude, shelter.longitude]}
                  icon={shelterIcon}
                >
                  <Popup maxWidth={300}>
                    <div className="text-sm space-y-2">
                      <div>
                        <strong className="text-base">{shelter.name}</strong>
                        <div className="flex gap-1 mt-1">
                          {shelter.is_open ? (
                            <Badge className="bg-green-100 text-green-700 text-xs">Open</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-700 text-xs">Closed</Badge>
                          )}
                          {shelter.pets_allowed && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs flex items-center gap-1">
                              <PawPrint className="w-3 h-3" /> Pets OK
                            </Badge>
                          )}
                          {shelter.medical_services && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 text-xs flex items-center gap-1">
                              <Heart className="w-3 h-3" /> Medical
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-gray-600">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <div>
                            {shelter.address}<br />
                            {shelter.city}, {shelter.state} {shelter.zip_code}
                          </div>
                        </div>
                      </div>
                      {shelter.capacity && (
                        <div className="text-gray-600">
                          Capacity: {shelter.current_occupancy || 0}/{shelter.capacity} people
                        </div>
                      )}
                      {shelter.phone && (
                        <div className="text-gray-600">
                          📞 <a href={`tel:${shelter.phone}`} className="text-blue-600 hover:underline">{shelter.phone}</a>
                        </div>
                      )}
                      {shelter.distance && (
                        <div className="text-blue-600 font-medium">
                          {shelter.distance} km away
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Rally Points / Parks / Meeting Spots */}
            {rallyPoints.map((point, idx) => {
              if (!point.latitude || !point.longitude) return null;
              return (
                <Marker
                  key={`rally-${idx}`}
                  position={[point.latitude, point.longitude]}
                  icon={parkIcon}
                >
                  <Popup maxWidth={300}>
                    <div className="text-sm space-y-2">
                      <div>
                        <strong className="text-base">{point.name}</strong>
                        {point.type && (
                          <Badge className="ml-2 bg-green-100 text-green-700 text-xs">
                            {point.type}
                          </Badge>
                        )}
                      </div>
                      {point.address && (
                        <div className="text-gray-600 flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{point.address}</span>
                        </div>
                      )}
                      {point.description && (
                        <p className="text-gray-600">{point.description}</p>
                      )}
                      {point.distance && (
                        <div className="text-green-600 font-medium">
                          {point.distance.toFixed(1)} km away
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-gray-700">Emergency Shelters</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            <span className="text-gray-700">Rally Points / Parks</span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-red-600" />
              <span className="text-gray-700">Your Location</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}