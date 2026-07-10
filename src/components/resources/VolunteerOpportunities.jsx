import React, { useState } from "react";
import { ExternalLink, Heart, ChevronDown, ChevronUp, Globe, MapPin } from "lucide-react";

const VOLUNTEER_ORGS = [
  {
    name: "American Red Cross",
    icon: "🔴",
    country: ["USA"],
    focus: "Human disaster response, sheltering, blood services, mental health",
    url: "https://www.redcross.org/volunteer.html",
    signupUrl: "https://www.redcross.org/volunteer.html",
    description: "The American Red Cross deploys volunteers across the U.S. for disaster sheltering, feeding, cleanup, and mental health support. Join a local chapter to train and respond.",
    roles: ["Disaster shelter volunteer", "Mass care feeding", "Mental health support", "Emergency communications"],
  },
  {
    name: "Canadian Red Cross",
    icon: "🍁",
    country: ["Canada"],
    focus: "Disaster response, sheltering, and family reunification across Canada",
    url: "https://www.redcross.ca/volunteer",
    signupUrl: "https://www.redcross.ca/volunteer",
    description: "The Canadian Red Cross mobilizes volunteers across provinces for emergency shelter, food distribution, registration and inquiry (family reunification), and psychosocial support.",
    roles: ["Emergency shelter operations", "Disaster registration & reunification", "Food distribution", "Psychosocial support"],
  },
  {
    name: "Cruz Roja Mexicana",
    icon: "🇲🇽",
    country: ["Mexico"],
    focus: "Emergency medical response, disaster relief, and search & rescue across Mexico",
    url: "https://www.cruzrojamexicana.org.mx/voluntarios",
    signupUrl: "https://www.cruzrojamexicana.org.mx/voluntarios",
    description: "Cruz Roja Mexicana coordinates emergency medical response, search and rescue, disaster relief, and blood services throughout Mexico. Volunteers are integral to rapid disaster deployment.",
    roles: ["Emergency medical response", "Search & rescue", "Disaster relief", "Blood donation drives"],
  },
  {
    name: "Operation HOPE",
    icon: "🤝",
    country: ["USA"],
    focus: "Financial recovery, economic literacy, and disaster financial assistance",
    url: "https://operationhope.org/volunteer/",
    signupUrl: "https://operationhope.org/volunteer/",
    description: "Operation HOPE deploys volunteers to disaster-impacted communities to help survivors navigate FEMA applications, insurance claims, and financial recovery planning.",
    roles: ["Financial recovery coaching", "FEMA application assistance", "Community education", "Disaster response centers"],
  },
  {
    name: "Best Friends Animal Society",
    icon: "🐾",
    country: ["USA"],
    focus: "Animal emergency sheltering, rescue, and reunification during disasters",
    url: "https://bestfriends.org/volunteer",
    signupUrl: "https://bestfriends.org/volunteer",
    description: "Best Friends Animal Society deploys emergency response teams to set up animal shelters during disasters, rescue displaced animals, and reunite pets with owners.",
    roles: ["Emergency animal sheltering", "Animal rescue & transport", "Pet reunification", "Foster care during disasters"],
  },
  {
    name: "Oregon Humane Society",
    icon: "🐕",
    country: ["USA"],
    focus: "Animal emergency response and disaster preparedness in the Pacific Northwest",
    url: "https://oregonhumane.org/volunteer/",
    signupUrl: "https://oregonhumane.org/volunteer/",
    description: "Oregon Humane Society runs a disaster relief program that deploys volunteers during wildfires, floods, and other emergencies in the Pacific Northwest to assist displaced animals.",
    roles: ["Animal disaster shelter volunteer", "Wildlife intake assistance", "Temporary foster care", "Animal transport"],
  },
  {
    name: "DART Command Center",
    icon: "🦺",
    country: ["USA", "Canada"],
    focus: "Animal search & rescue, emergency sheltering, and technical animal rescue",
    url: "https://dartcc.org/volunteer",
    signupUrl: "https://dartcc.org/volunteer",
    description: "DART deploys Disaster Animal Response Teams during emergencies to conduct animal search and rescue, set up temporary shelters, and coordinate with local emergency management.",
    roles: ["Animal search & rescue", "Technical animal rescue", "Temporary shelter operations", "Incident command support"],
  },
  {
    name: "Team Rubicon",
    icon: "🔧",
    country: ["USA", "Canada"],
    focus: "Veteran-led disaster response — debris removal, construction, and emergency operations",
    url: "https://teamrubiconusa.org/volunteer/",
    signupUrl: "https://teamrubiconusa.org/volunteer/",
    description: "Team Rubicon unites military veterans with first responders to rapidly deploy disaster response teams. They specialize in debris clearing, home mucking, and rebuilding operations.",
    roles: ["Debris removal & chainsaw ops", "Mucking & gutting", "Construction & roofing", "Medical triage support"],
  },
  {
    name: "Americorps / FEMA Corps",
    icon: "🏛️",
    country: ["USA"],
    focus: "Full-time disaster response deployment nationwide — FEMA-partnered",
    url: "https://americorps.gov/serve/americorps/americorps-national/americorps-national-opportunity-types/fema-corps",
    signupUrl: "https://americorps.gov/serve/americorps/americorps-national/americorps-national-opportunity-types/fema-corps",
    description: "FEMA Corps places AmeriCorps members in year-long disaster response assignments — helping survivors, running disaster recovery centers, and supporting FEMA operations nationwide.",
    roles: ["Community outreach", "Disaster recovery centers", "Individual assistance intake", "Supply chain & logistics"],
  },
  {
    name: "Humane Society of the United States (HSUS)",
    icon: "🐾",
    country: ["USA"],
    focus: "Animal cruelty response, disaster animal relief, and large-scale rescue",
    url: "https://www.humanesociety.org/volunteer",
    signupUrl: "https://www.humanesociety.org/volunteer",
    description: "HSUS Disaster Animal Response deploys trained volunteers during hurricanes, floods, wildfires, and other large-scale disasters to assist with animal rescue, sheltering, and reunification.",
    roles: ["Disaster animal rescue", "Emergency sheltering", "Cruelty investigations support", "Animal reunification"],
  },
  {
    name: "National VOAD (Voluntary Orgs Active in Disaster)",
    icon: "🌐",
    country: ["USA", "Canada", "Mexico"],
    focus: "Coordination network connecting 80+ national disaster relief organizations",
    url: "https://www.nvoad.org",
    signupUrl: "https://www.nvoad.org/get-involved/",
    description: "National VOAD is the umbrella organization that coordinates all major U.S. disaster relief groups. Their directory helps you find local chapter volunteer opportunities with any member organization.",
    roles: ["Find local member orgs", "Community preparedness coalitions", "Long-term disaster recovery", "Interfaith & community support"],
  },
  {
    name: "Find a Local COAD (Community Organizations Active in Disaster)",
    icon: "📍",
    country: ["USA"],
    focus: "Local networks of nonprofits, faith-based groups, and civic orgs for community-level disaster recovery",
    url: "https://www.nvoad.org/local-affiliates/",
    signupUrl: "https://www.nvoad.org/local-affiliates/",
    description: "A COAD is a local coalition of churches, nonprofits, community groups, and small businesses that work together before, during, and after disasters. Find your county or state COAD to volunteer at the community level — closer to the people who need help most.",
    roles: ["Pre-disaster community preparedness", "Local volunteer coordination", "Donations & goods distribution", "Long-term recovery committee member"],
  },
  {
    name: "NIFC Wildland Fire Support & Prevention",
    icon: "🔥",
    country: ["USA"],
    focus: "Wildland fire information, preparedness, and community wildfire defense",
    url: "https://www.nifc.gov",
    signupUrl: "https://www.nifc.gov/fire-information/nfn",
    description: "The National Interagency Fire Center (NIFC) coordinates wildland fire response across federal agencies. While NIFC itself deploys professional firefighters, community members can volunteer through Firewise USA (community wildfire mitigation), local fire departments, and Rangeland Fire Protection Associations. Check the NIFC outlook to know when your area is at elevated risk.",
    roles: ["Firewise USA community wildfire mitigation", "Volunteer fire department", "Rangeland Fire Protection Association", "Community wildfire preparedness planning"],
  },
];

const COUNTRY_FILTERS = ["All", "USA", "Canada", "Mexico"];

export default function VolunteerOpportunities() {
  const [countryFilter, setCountryFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const filtered = countryFilter === "All"
    ? VOLUNTEER_ORGS
    : VOLUNTEER_ORGS.filter((o) => o.country.includes(countryFilter));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Volunteer Opportunities</h2>
        <p className="text-muted-foreground font-sans text-sm max-w-2xl">
          The best time to volunteer is before a disaster. These organizations need trained helpers year-round — and deploy them when emergencies strike across the U.S., Canada, and Mexico.
        </p>
      </div>

      {/* Country Filter */}
      <div className="flex gap-2 flex-wrap">
        {COUNTRY_FILTERS.map((c) => (
          <button
            key={c}
            onClick={() => setCountryFilter(c)}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-semibold border transition-colors ${
              countryFilter === c
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