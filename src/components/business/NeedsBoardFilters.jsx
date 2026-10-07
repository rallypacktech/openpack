import React from "react";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import FilterChipGroup from "@/components/business/FilterChipGroup";
import NeedsLocationDrilldown from "@/components/business/NeedsLocationDrilldown";

export const SPECIES_OPTIONS = [
  { value: "general", label: "General / Community" },
  { value: "equine", label: "Equine" },
  { value: "canine", label: "Canine" },
  { value: "feline", label: "Feline" },
  { value: "infant", label: "Infant & Child" },
  { value: "avian", label: "Avian" },
  { value: "reptile", label: "Reptile" },
  { value: "livestock", label: "Livestock" },
  { value: "wildfire", label: "Wildfire" },
  { value: "flood", label: "Flood" },
  { value: "hurricane", label: "Hurricane" },
  { value: "tornado", label: "Tornado" },
  { value: "hoa", label: "HOA / Neighborhood" },
  { value: "commercial_property", label: "Commercial Property" },
  { value: "insurance_broker", label: "Insurance" },
  { value: "fire_safety", label: "Fire & Life Safety" },
];

export const CATEGORY_OPTIONS = [
  { value: "supplies", label: "Supplies" },
  { value: "volunteers", label: "Volunteers" },
  { value: "equipment", label: "Equipment" },
  { value: "space", label: "Space" },
  { value: "transport", label: "Transport" },
  { value: "food", label: "Food" },
  { value: "medical", label: "Medical" },
  { value: "other", label: "Other" },
];

export const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "claimed", label: "Claimed" },
  { value: "filled", label: "Filled" },
];

export const URGENCY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export const EMPTY_NEEDS_FILTERS = {
  country_name: "",
  admin1_name: "",
  admin2_name: "",
  postal_code: "",
  species: [],
  categories: [],
  statuses: [],
  urgencies: [],
};

export function countActiveFilters(filters) {
  return (
    [filters.country_name, filters.admin1_name, filters.admin2_name, filters.postal_code].filter(Boolean).length +
    filters.species.length +
    filters.categories.length +
    filters.statuses.length +
    filters.urgencies.length
  );
}

export default function NeedsBoardFilters({ needs, filters, onChange, onClear }) {
  const active = countActiveFilters(filters);

  const toggle = (key, value) => {
    const list = filters[key];
    onChange({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  return (
    <div className="border border-border rounded-lg p-4 mb-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          {active > 0 && <span className="text-primary">({active})</span>}
        </span>
        {active > 0 && (
          <Button size="sm" variant="ghost" onClick={onClear} className="h-7 gap-1 text-xs">
            <X className="w-3 h-3" /> Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <NeedsLocationDrilldown needs={needs} filters={filters} onChange={onChange} />

        <FilterChipGroup
          label="Species / Audience"
          options={SPECIES_OPTIONS}
          selected={filters.species}
          onToggle={(v) => toggle("species", v)}
        />
        <FilterChipGroup
          label="Request type"
          options={CATEGORY_OPTIONS}
          selected={filters.categories}
          onToggle={(v) => toggle("categories", v)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FilterChipGroup
            label="Status"
            options={STATUS_OPTIONS}
            selected={filters.statuses}
            onToggle={(v) => toggle("statuses", v)}
          />
          <FilterChipGroup
            label="Urgency"
            options={URGENCY_OPTIONS}
            selected={filters.urgencies}
            onToggle={(v) => toggle("urgencies", v)}
          />
        </div>
      </div>
    </div>
  );
}