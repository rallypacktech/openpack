import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Globe, PawPrint, Users, Home, Loader2, ExternalLink } from "lucide-react";

const SHELTER_TYPE_META = {
  people: { label: "People Shelter", icon: Users, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  small_animal: { label: "Small Animal Shelter", icon: PawPrint, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  large_animal: { label: "Livestock / Large Animal Shelter", icon: Home, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
  mixed: { label: "People & Animal Shelter", icon: PawPrint, color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
};

const RESOURCE_TYPE_META = {
  animal_shelter: { label: "Animal Shelter / Rescue", color: "text-amber-700", bg: "bg-amber-50" },
  livestock_shelter: { label: "Livestock Shelter", color: "text-green-700", bg: "bg-green-50" },
  volunteer_org: { label: "Volunteer Organization", color: "text-blue-700", bg: "bg-blue-50" },
  relief_organization: { label: "Relief Organization", color: "text-red-700", bg: "bg-red-50" },
  local_emergency: { label: "Local Emergency", color: "text-orange-700", bg: "bg-orange-50" },
  federal_agency: { label: "Federal Agency", color: "text-gray-700", bg: "bg-gray-50" },
  insurance: { label: "Insurance", color: "text-purple-700", bg: "bg-purple-50" },
  mental_health: { label: "Mental Health", color: "text-teal-700", bg: "bg-teal-50" },
  financial_assistance: { label: "Financial Assistance", color: "text-emerald-700", bg: "bg-emerald-50" },
};

export default function LocalShelters() {
  const [shelters, setShelters] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [shelterData, resourceData] = await Promise.all([
        base44.entities.Shelter.list("-created_date", 200),
        base44.entities.DisasterResource.list("-created_date", 200),
      ]);
      setShelters(shelterData);
      setResources(resourceData);
    } catch (e) {
      console.error("Error loading shelters:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const openShelters = shelters.filter(s => s.is_open);
  const generalShelters = shelters.filter(s => !s.is_open);

  return (
    <div className="space-y-6">
      {/* Open Shelters */}
      {openShelters.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h3 className="font-serif text-lg font-bold text-foreground">Currently Open Shelters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openShelters.map(shelter => (
              <ShelterCard key={shelter.id} shelter={shelter} />
            ))}
          </div>
        </div>
      )}

      {/* All Shelters (general reference) */}
      <div>
        <h3 className="font-serif text-lg font-bold text-foreground mb-1">Shelter Directory</h3>
        <p className="text-sm text-muted-foreground font-sans mb-4">
          Known shelter locations in our database. These are activated during emergencies — check with local authorities for current availability.
        </p>
        {generalShelters.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No shelters in the database yet.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generalShelters.map(shelter => (
              <ShelterCard key={shelter.id} shelter={shelter} />
            ))}
          </div>
        )}
      </div>

      {/* Organizations & Contacts */}
      {resources.length > 0 && (
        <div>
          <h3 className="font-serif text-lg font-bold text-foreground mb-1">Organizations & Contacts</h3>
          <p className="text-sm text-muted-foreground font-sans mb-4">
            Emergency response organizations, animal rescue groups, and volunteer opportunities by area.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ShelterCard({ shelter }) {
  const meta = SHELTER_TYPE_META[shelter.shelter_type] || SHELTER_TYPE_META.people;
  const Icon = meta.icon;

  return (
    <Card className={`border ${meta.border}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon className={`w-4 h-4 ${meta.color}`} />
            {shelter.name}
          </CardTitle>
          {shelter.is_open && (
            <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">OPEN</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {shelter.shelter_type && (
          <Badge variant="outline" className={`text-xs ${meta.bg} ${meta.color}`}>{meta.label}</Badge>
        )}
        <div className="flex items-start gap-2 text-xs text-muted-foreground font-sans">
          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{shelter.address}{shelter.city ? `, ${shelter.city}` : ""}{shelter.state ? `, ${shelter.state}` : ""}</span>
        </div>
        {shelter.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <a href={`tel:${shelter.phone}`} className="hover:text-primary">{shelter.phone}</a>
          </div>
        )}
        {shelter.animal_types && (
          <p className="text-xs text-amber-700 font-sans"><strong>Animals:</strong> {shelter.animal_types}</p>
        )}
        {shelter.pets_allowed && !shelter.animal_types && (
          <p className="text-xs text-green-700 font-sans">✓ Pets allowed</p>
        )}
        {shelter.notes && (
          <p className="text-xs text-muted-foreground font-sans bg-muted/30 rounded p-2">{shelter.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ResourceCard({ resource }) {
  const meta = RESOURCE_TYPE_META[resource.type] || { label: resource.type, color: "text-gray-700", bg: "bg-gray-50" };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{resource.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <Badge variant="outline" className={`text-xs ${meta.bg} ${meta.color}`}>{meta.label}</Badge>
        {resource.service_area && (
          <p className="text-xs text-muted-foreground font-sans flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {resource.service_area}
          </p>
        )}
        {resource.phone && (
          <div className="flex items-center gap-2 text-xs font-sans">
            <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
            <a href={`tel:${resource.phone}`} className="font-semibold text-primary hover:underline">{resource.phone}</a>
          </div>
        )}
        {resource.website && (
          <a href={resource.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 font-sans">
            <Globe className="w-3 h-3" /> Visit website <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {resource.description && (
          <p className="text-xs text-muted-foreground font-sans leading-relaxed">{resource.description}</p>
        )}
      </CardContent>
    </Card>
  );
}