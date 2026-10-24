import React, { useState } from "react";
import { ExternalLink, Heart, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { CONTINENTS, VOLUNTEER_ORGS } from "@/lib/volunteerOrgs";

const REGION_FILTERS = ["All", ...CONTINENTS];

export default function VolunteerOpportunities() {
  const [regionFilter, setRegionFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const filtered = regionFilter === "All"
    ? VOLUNTEER_ORGS
    : VOLUNTEER_ORGS.filter((o) => o.continent === regionFilter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Volunteer Opportunities</h2>
        <p className="text-muted-foreground font-sans text-sm max-w-2xl">
          The best time to volunteer is before a disaster. These organizations need trained helpers year-round and deploy them when emergencies strike — from a local chapter in your own country to international response teams.
        </p>
      </div>

      {/* Regional Filter */}
      <div className="flex gap-2 flex-wrap">
        {REGION_FILTERS.map((c) => (
          <button
            key={c}
            onClick={() => setRegionFilter(c)}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-semibold border transition-colors ${
              regionFilter === c
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((org) => {
          const isOpen = expanded === org.name;
          return (
            <div key={org.name} className="border border-border rounded bg-card overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : org.name)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{org.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-sans font-semibold text-foreground text-sm">{org.name}</p>
                      <div className="flex gap-1">
                        {org.country.map((c) => (
                          <span key={c} className="text-[10px] font-sans font-semibold bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{c}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-sans line-clamp-1">{org.focus}</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />}
              </button>

              {isOpen && (
                <div className="border-t border-border px-5 pb-5 pt-4">
                  <p className="text-sm text-muted-foreground font-sans mb-4">{org.description}</p>
                  <div className="mb-4">
                    <p className="text-xs font-semibold font-sans text-foreground uppercase tracking-wider mb-2">Common Volunteer Roles</p>
                    <ul className="space-y-1">
                      {org.roles.map((r) => (
                        <li key={r} className="flex items-center gap-2 text-sm font-sans text-muted-foreground">
                          <Heart className="w-3 h-3 text-primary flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a
                    href={org.signupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-foreground text-background font-sans font-semibold text-xs px-4 py-2 rounded hover:bg-foreground/90 transition-colors"
                  >
                    <Globe className="w-3 h-3" /> Sign Up to Volunteer
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded p-4">
        <p className="text-sm font-sans text-foreground">
          <strong>💡 Tip:</strong> Many of these organizations offer free training when you sign up to volunteer — you'll build real skills while helping your community.
        </p>
      </div>
    </div>
  );
}