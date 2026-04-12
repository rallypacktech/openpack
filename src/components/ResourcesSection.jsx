import React, { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp, Phone, Globe, MapPin } from "lucide-react";

const FEMA_REGIONS = [
  { region: "I — New England", states: "CT, MA, ME, NH, RI, VT", url: "https://www.fema.gov/region-1-ct-ma-me-nh-ri-vt" },
  { region: "II — NY/NJ/Caribbean", states: "NJ, NY, PR, USVI", url: "https://www.fema.gov/region-2-nj-ny-pr-vi" },
  { region: "III — Mid-Atlantic", states: "DC, DE, MD, PA, VA, WV", url: "https://www.fema.gov/region-3-dc-de-md-pa-va-wv" },
  { region: "IV — Southeast", states: "AL, FL, GA, KY, MS, NC, SC, TN", url: "https://www.fema.gov/region-4-al-fl-ga-ky-ms-nc-sc-tn" },
  { region: "V — Great Lakes", states: "IL, IN, MI, MN, OH, WI", url: "https://www.fema.gov/region-5-il-in-mi-mn-oh-wi" },
  { region: "VI — South Central", states: "AR, LA, NM, OK, TX", url: "https://www.fema.gov/region-6-ar-la-nm-ok-tx" },
  { region: "VII — Midwest", states: "IA, KS, MO, NE", url: "https://www.fema.gov/region-7-ia-ks-mo-ne" },
  { region: "VIII — Mountain", states: "CO, MT, ND, SD, UT, WY", url: "https://www.fema.gov/region-8-co-mt-nd-sd-ut-wy" },
  { region: "IX — Pacific Southwest", states: "AZ, CA, HI, NV, Pacific Islands", url: "https://www.fema.gov/region-9-az-ca-hi-nv-pacific-islands" },
  { region: "X — Pacific Northwest", states: "AK, ID, OR, WA", url: "https://www.fema.gov/region-10-ak-id-or-wa" },
];

const FEDERAL_RESOURCES = [
  { name: "FEMA Ready.gov", desc: "Official family preparedness guides, kit checklists, and disaster-specific plans.", url: "https://www.ready.gov", icon: "🏛️" },
  { name: "FEMA Disaster Declarations", desc: "Current federally declared disasters and assistance programs.", url: "https://www.fema.gov/disasters", icon: "📋" },
  { name: "FEMA Apply for Assistance", desc: "Apply for FEMA individual assistance after a declared disaster.", url: "https://www.disasterassistance.gov", icon: "💬" },
  { name: "NOAA Weather Alerts", desc: "Real-time severe weather warnings, watches, and advisories.", url: "https://www.weather.gov/alerts", icon: "⛈️" },
  { name: "American Red Cross", desc: "Shelter finder, disaster relief, and first aid training near you.", url: "https://www.redcross.org", icon: "🔴" },
  { name: "CDC Emergency Preparedness", desc: "Health-focused emergency checklists and medical preparedness.", url: "https://emergency.cdc.gov", icon: "🏥" },
  { name: "Operation HOPE Disaster Recovery", desc: "Financial recovery and assistance after disasters.", url: "https://operationhope.org", icon: "🤝" },
  { name: "211.org — Local Resources", desc: "County and city-level social services, shelters, and emergency support.", url: "https://www.211.org", icon: "📞" },
];

export default function ResourcesSection({ regionFilter = null }) {
  const [femaOpen, setFemaOpen] = useState(false);

  return (
    <section className="py-16 bg-navy/5 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-primary font-sans font-semibold mb-2">Government & Nonprofit Resources</p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground font-semibold mb-3">
            Free Help. No Red Tape.
          </h2>
          <p className="text-muted-foreground font-sans max-w-xl">
            These agencies exist to help you before, during, and after a disaster — many people never access them because they don't know they're available.
          </p>
        </div>

        {/* Federal Resources Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {FEDERAL_RESOURCES.map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 bg-card border border-border rounded p-5 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <span className="text-2xl mt-0.5 flex-shrink-0">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-sans font-semibold text-foreground text-sm">{r.name}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">{r.desc}</p>
              </div>
            </a>
          ))}
        </div>

        {/* FEMA Regions Accordion */}
        <div className="border border-border rounded bg-card">
          <button
            onClick={() => setFemaOpen(!femaOpen)}
            className="w-full flex items-center justify-between px-6 py-4 text-left font-sans"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground text-sm">Find Your FEMA Region</span>
            </div>
            {femaOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {femaOpen && (
            <div className="border-t border-border px-6 pb-6 pt-4">
              <p className="text-xs text-muted-foreground font-sans mb-4">FEMA divides the U.S. into 10 regions, each with dedicated emergency management staff and resources.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FEMA_REGIONS.map((r) => (
                  <a
                    key={r.region}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-sans text-muted-foreground hover:text-primary transition-colors py-1.5 border-b border-border/40 last:border-0 group"
                  >
                    <Globe className="w-3 h-3 flex-shrink-0 group-hover:text-primary" />
                    <div>
                      <span className="font-semibold text-foreground">Region {r.region}</span>
                      <span className="text-muted-foreground"> — {r.states}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Emergency Hotline */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 bg-primary/5 border border-primary/20 rounded p-5">
          <Phone className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="text-center sm:text-left">
            <p className="font-sans font-semibold text-foreground text-sm">
              In an active emergency, call <strong>911</strong> or the FEMA Helpline: <strong>1-800-621-3362</strong>
            </p>
            <p className="text-xs text-muted-foreground font-sans mt-0.5">TTY: 1-800-462-7585 · Mon–Sun 7am–10pm local time</p>
          </div>
        </div>
      </div>
    </section>
  );
}