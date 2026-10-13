/* global pendo */
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Navigation,
  Star,
  Info,
  ChevronDown,
  Compass,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { base44 } from "@/api/base44Client";
import MeetSpotFinder from "./MeetSpotFinder";
import MeetSpotFormDialog from "./MeetSpotFormDialog";

const DIRECTIONS = ["North", "East", "South", "West"];

const emptyForm = {
  name: "",
  address: "",
  street_address: "",
  city: "",
  state_province: "",
  postal_code: "",
  country: "",
  latitude: "",
  longitude: "",
  description: "",
  is_primary: false,
};

export default function MeetSpotsList({ spots, onAdd, onUpdate, onDelete }) {
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [userHomeCoords, setUserHomeCoords] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);
  const [finderOpen, setFinderOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [extrasLoaded, setExtrasLoaded] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [rallyPoints, setRallyPoints] = useState([]);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUserEmail(user.email);

      const profiles = await base44.entities.UserProfile.filter({
        created_by: user.email,
      });
      if (profiles.length > 0 && profiles[0].latitude && profiles[0].longitude) {
        setUserHomeCoords({
          lat: profiles[0].latitude,
          lon: profiles[0].longitude,
        });
      }
    };
    loadUser();
  }, []);

  // Community/regional suggestions load only if the user opens them.
  useEffect(() => {
    if (!extrasOpen || extrasLoaded || !userHomeCoords) return;
    setExtrasLoaded(true);
    base44.functions
      .invoke("recommendMeetSpots")
      .then((res) => setRecommendations(res.data.recommendations || []))
      .catch((e) => console.error("Error loading recommendations:", e));
    base44.functions
      .invoke("getCommunityRallyPoints", {
        latitude: userHomeCoords.lat,
        longitude: userHomeCoords.lon,
        radius: 25,
      })
      .then((res) => setRallyPoints(res.data.rallyPoints || []))
      .catch((e) => console.error("Error loading rally points:", e));
  }, [extrasOpen, extrasLoaded, userHomeCoords]);

  const getDirection = (spotLat, spotLon) => {
    if (!userHomeCoords || !spotLat || !spotLon) return null;
    const lat1 = (userHomeCoords.lat * Math.PI) / 180;
    const lat2 = (spotLat * Math.PI) / 180;
    const lon1 = (userHomeCoords.lon * Math.PI) / 180;
    const lon2 = (spotLon * Math.PI) / 180;
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
    if (bearing >= 315 || bearing < 45) return "North";
    if (bearing < 135) return "East";
    if (bearing < 225) return "South";
    return "West";
  };

  const coveredDirections = new Set();
  spots.forEach((spot) => {
    const dir = getDirection(spot.latitude, spot.longitude);
    if (dir) coveredDirections.add(dir);
  });
  const missingDirections = DIRECTIONS.filter((d) => !coveredDirections.has(d));

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingSpot(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (spot) => {
    setEditingSpot(spot);
    setFormData({
      name: spot.name || "",
      address: spot.address || "",
      street_address: spot.address?.split(",")[0]?.trim() || "",
      city: "",
      state_province: "",
      postal_code: "",
      country: "",
      latitude: spot.latitude?.toString() || "",
      longitude: spot.longitude?.toString() || "",
      description: spot.description || "",
      is_primary: spot.is_primary || false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const data = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    };

    if (editingSpot) {
      await onUpdate(editingSpot.id, data);
    } else {
      await onAdd(data);
      if (typeof pendo !== "undefined") {
        pendo.track("meet_spot_created", {
          name: data.name,
          is_primary: !!data.is_primary,
          has_coordinates: !!(data.latitude && data.longitude),
          source: editingSpot ? "edit" : "manual",
        });
      }
    }
    setDialogOpen(false);
    resetForm();
  };

  // A real place picked from the map opens the same form, prefilled for review.
  const handleSelectPlace = (place) => {
    setEditingSpot(null);
    setFormData({
      ...emptyForm,
      name: place.name,
      address: place.address || "",
      street_address: place.address || "",
      latitude: place.latitude.toString(),
      longitude: place.longitude.toString(),
      description: `${place.kindLabel}, ${place.distanceKm.toFixed(1)} km ${place.direction} of home.`,
    });
    setDialogOpen(true);
  };

  const handleAddFromRallyPoints = async (rallyPoint) => {
    const data = {
      name: rallyPoint.name,
      address: rallyPoint.address,
      latitude: rallyPoint.latitude,
      longitude: rallyPoint.longitude,
      description:
        rallyPoint.description || "Recommended rally point from FEMA",
      is_primary: false,
    };
    await onAdd(data);
    if (typeof pendo !== "undefined") {
      pendo.track("meet_spot_created", {
        name: data.name,
        is_primary: false,
        has_coordinates: !!(data.latitude && data.longitude),
        source: "rally_point",
      });
    }
  };

  const hasExtras = recommendations.length > 0 || rallyPoints.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Meeting Spots
          </h2>
          <TooltipProvider>
            <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setTooltipOpen(!tooltipOpen)}
                  className="text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label="How to choose meeting spots"
                >
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-sm p-4">
                <div className="space-y-3 text-sm font-sans">
                  <p className="font-semibold">
                    Why one spot isn't enough
                  </p>
                  <p className="text-muted-foreground">
                    An emergency can block any single route, so FEMA recommends
                    a spot in each direction from your home.
                  </p>
                  <div>
                    <p className="font-medium mb-1">Near home (quick exits)</p>
                    <p className="text-muted-foreground">
                      A neighbour's yard, street corner, or nearby park.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Further out (evacuations)</p>
                    <p className="text-muted-foreground">
                      A friend's home, community centre, library, or rest area.
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                    Source: FEMA Basic Preparedness Guidelines
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm font-sans text-muted-foreground mt-1">
          Choose safe, well-known places that everyone in your household can
          reach — one in each direction from home.
        </p>
      </div>

      {/* Coverage review */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-sans font-semibold text-sm text-foreground">
              Directional coverage
            </h3>
            <span className="text-xs font-sans text-muted-foreground">
              {coveredDirections.size} of 4 covered
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DIRECTIONS.map((dir) => {
              const covered = coveredDirections.has(dir);
              return (
                <div
                  key={dir}
                  className={`flex items-center gap-2 rounded border px-3 py-2 ${
                    covered
                      ? "border-primary/30 bg-primary/5"
                      : "border-dashed border-border"
                  }`}
                >
                  <Compass
                    className={`w-4 h-4 shrink-0 ${
                      covered ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-sm font-sans ${
                      covered
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {dir}
                  </span>
                  {covered && (
                    <span className="ml-auto text-xs text-primary">✓</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs font-sans text-muted-foreground mt-3">
            {missingDirections.length === 0
              ? "All four directions covered."
              : `Still needed: ${missingDirections.join(", ")}`}
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={() => setFinderOpen((open) => !open)}
          className="bg-foreground text-background hover:bg-foreground/90 font-sans"
        >
          <MapPin className="w-4 h-4 mr-2" />
          {finderOpen ? "Hide nearby places" : "Find places near me"}
        </Button>
        <Button variant="outline" onClick={openAddDialog} className="font-sans">
          <Plus className="w-4 h-4 mr-2" />
          Add a spot manually
        </Button>
      </div>

      {finderOpen && (
        <MeetSpotFinder
          homeCoords={userHomeCoords}
          missingDirections={
            missingDirections.length > 0 ? missingDirections : DIRECTIONS
          }
          onSelect={handleSelectPlace}
          onManual={openAddDialog}
        />
      )}

      {/* Saved spots */}
      <div>
        <h3 className="font-sans font-semibold text-sm text-foreground mb-3">
          Your meeting spots
        </h3>
        {spots && spots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spots.map((spot) => {
              const isOwner = spot.created_by === currentUserEmail;
              const direction = getDirection(spot.latitude, spot.longitude);
              return (
                <Card
                  key={spot.id}
                  className={spot.is_primary ? "ring-1 ring-primary" : ""}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h4 className="font-sans font-semibold text-foreground truncate">
                          {spot.name}
                        </h4>
                        {spot.is_primary && (
                          <Star className="w-4 h-4 text-gold fill-current shrink-0" />
                        )}
                        {!isOwner && (
                          <Badge variant="outline" className="shrink-0">
                            Pack member
                          </Badge>
                        )}
                      </div>
                      {isOwner && (
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(spot)}
                            aria-label={`Edit ${spot.name}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(spot.id)}
                            className="text-destructive hover:text-destructive"
                            aria-label={`Delete ${spot.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {direction && (
                      <Badge
                        variant="outline"
                        className="mb-2 bg-primary/5 text-foreground border-primary/30"
                      >
                        {direction}
                      </Badge>
                    )}

                    {spot.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground font-sans mb-1">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{spot.address}</span>
                      </div>
                    )}

                    {spot.latitude && spot.longitude && (
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${spot.latitude}&mlon=${spot.longitude}#map=15/${spot.latitude}/${spot.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline font-sans"
                      >
                        <Navigation className="w-4 h-4 shrink-0" />
                        <span>
                          {spot.latitude.toFixed(4)}°, {spot.longitude.toFixed(4)}°
                        </span>
                      </a>
                    )}

                    {spot.description && (
                      <p className="text-sm text-muted-foreground font-sans mt-2">
                        {spot.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <MapPin className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-sans font-medium text-foreground mb-1">
                No meeting spots yet
              </p>
              <p className="text-sm font-sans text-muted-foreground">
                Add one in each direction — North, East, South, and West.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Extra guidance, tucked away so it doesn't compete with the main task */}
      <Collapsible open={extrasOpen} onOpenChange={setExtrasOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${extrasOpen ? "rotate-180" : ""}`}
            />
            More suggestions &amp; guidance
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          {rallyPoints.length > 0 && (
            <div>
              <h3 className="font-sans font-semibold text-sm text-foreground mb-2">
                Community rally points near you
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rallyPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="border border-border rounded p-4 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-sans font-medium text-sm text-foreground">
                        {point.name}
                      </p>
                      {point.address && (
                        <p className="text-xs font-sans text-muted-foreground mt-0.5">
                          {point.address}
                        </p>
                      )}
                      {point.distance != null && (
                        <p className="text-xs font-sans text-muted-foreground mt-0.5">
                          {point.distance.toFixed(1)} km away
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-xs"
                      onClick={() => handleAddFromRallyPoints(point)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="border-l-2 border-primary bg-secondary/40 rounded-r p-4"
                >
                  <p className="font-sans font-medium text-sm text-foreground mb-1">
                    {rec.title}
                  </p>
                  <p className="text-sm font-sans text-muted-foreground">
                    {rec.description}
                  </p>
                  {rec.suggestions && rec.suggestions.length > 0 && (
                    <ul className="text-sm font-sans text-muted-foreground mt-2 space-y-1">
                      {rec.suggestions.map((suggestion, i) => (
                        <li key={i}>• {suggestion}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {extrasOpen && !hasExtras && (
            <p className="text-sm font-sans text-muted-foreground">
              {userHomeCoords
                ? "No community or regional suggestions right now."
                : "Add your home address in Settings to see community suggestions for your area."}
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>

      <MeetSpotFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingSpot={editingSpot}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
      />
    </div>
  );
}