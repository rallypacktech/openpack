import React from "react";
import { ChevronRight, Globe } from "lucide-react";

const FIELD_BY_LEVEL = {
  country: "country_name",
  state: "admin1_name",
  county: "admin2_name",
  postal: "postal_code",
};

const LEVEL_LABEL = {
  country: "Country",
  state: "State / territory",
  county: "County / district",
  postal: "Postal code",
};

export default function NeedsLocationDrilldown({ needs, filters, onChange }) {
  const level = !filters.country_name
    ? "country"
    : !filters.admin1_name
      ? "state"
      : !filters.admin2_name
        ? "county"
        : "postal";
  const field = FIELD_BY_LEVEL[level];

  // Options come from the needs actually on the board, narrowed by whatever
  // location level has already been chosen — the same drill-down as the Readiness Map.
  const scoped = needs.filter(
    (n) =>
      (!filters.country_name || n.country_name === filters.country_name) &&
      (!filters.admin1_name || n.admin1_name === filters.admin1_name) &&
      (!filters.admin2_name || n.admin2_name === filters.admin2_name)
  );

  const options = Array.from(new Set(scoped.map((n) => n[field]).filter(Boolean))).sort((a, b) =>
    String(a).localeCompare(String(b))
  );

  const breadcrumbs = [
    { label: "World", patch: { country_name: "", admin1_name: "", admin2_name: "", postal_code: "" } },
    ...(filters.country_name
      ? [{ label: filters.country_name, patch: { admin1_name: "", admin2_name: "", postal_code: "" } }]
      : []),
    ...(filters.admin1_name
      ? [{ label: filters.admin1_name, patch: { admin2_name: "", postal_code: "" } }]
      : []),
    ...(filters.admin2_name ? [{ label: filters.admin2_name, patch: { postal_code: "" } }] : []),
  ];

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground mb-2">
        <Globe className="w-3.5 h-3.5" /> Location
      </div>

      <nav className="flex flex-wrap items-center gap-1 mb-2 text-xs font-sans" aria-label="Needs location drill-down">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/50" />}
            <button
              type="button"
              onClick={() => onChange(crumb.patch)}
              className={`px-2 py-1 rounded transition-colors ${
                idx === breadcrumbs.length - 1
                  ? "text-foreground font-medium bg-foreground/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {crumb.label}
            </button>
          </React.Fragment>
        ))}
      </nav>

      {options.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No {LEVEL_LABEL[level].toLowerCase()} recorded for needs in this area.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {options.map((option) => {
            const count = scoped.filter((n) => n[field] === option).length;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange({ [field]: option })}
                className="text-xs px-2.5 py-1 rounded border border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/40 font-sans transition-colors"
              >
                {option} <span className="text-muted-foreground/70">({count})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}