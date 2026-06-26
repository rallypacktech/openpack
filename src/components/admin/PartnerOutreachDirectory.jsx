import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, ExternalLink, Mail, Building2, Shield, HeartPulse,
  PawPrint, Hotel, DollarSign, HandHeart, Copy, Check
} from "lucide-react";

const CATEGORIES = [
  { key: "all", label: "All", icon: Building2 },
  { key: "gov", label: "Government", icon: Shield },
  { key: "relief", label: "Relief Orgs", icon: HandHeart },
  { key: "animal", label: "Animal Welfare", icon: PawPrint },
  { key: "hotel", label: "Hotels", icon: Hotel },
  { key: "insurance", label: "Insurance", icon: HeartPulse },
  { key: "financial", label: "Financial Relief", icon: DollarSign },
];

const DIRECTORY = [
  // Government Emergency Response
  { name: "FEMA", category: "gov", desc: "Federal Emergency Management Agency — disaster response and preparedness", url: "https://www.fema.gov/about/partnerships", contact: "Partnerships page for government and nonprofit coordination" },
  { name: "Ready.gov", category: "gov", desc: "National public service campaign for disaster preparedness", url: "https://www.ready.gov/partners", contact: "Partner resources and outreach programs" },
  { name: "Department of Homeland Security (DHS)", category: "gov", desc: "Federal homeland security and emergency management", url: "https://www.dhs.gov/partnerships", contact: "Private sector partnership and engagement" },
  { name: "CDC Emergency Preparedness", category: "gov", desc: "Health emergency preparedness and response", url: "https://www.cdc.gov/phpr/partners/index.html", contact: "Public health partnership programs" },
  { name: "NOAA / NWS", category: "gov", desc: "Weather forecasting and severe weather alerts", url: "https://www.weather.gov/partners/", contact: "Weather-Ready Nation Ambassador program" },
  { name: "OSHA", category: "gov", desc: "Worker safety during emergencies and disaster response", url: "https://www.osha.gov/emergency-preparedness", contact: "Emergency preparedness and response resources" },
  { name: "ANSI", category: "gov", desc: "Standards development for emergency equipment and safety", url: "https://www.ansi.org/about/partnerships", contact: "Standards partnerships and committees" },

  // Relief Organizations
  { name: "American Red Cross", category: "relief", desc: "Disaster relief, sheltering, and preparedness training", url: "https://www.redcross.org/volunteer/become-a-volunteer.html", contact: "Volunteer and corporate partnership opportunities" },
  { name: "Salvation Army", category: "relief", desc: "Emergency disaster services and mass feeding", url: "https://salvationarmyusa.org/usn/careers/volunteer/", contact: "Emergency Disaster Services volunteer intake" },
  { name: "United Way", category: "relief", desc: "Community disaster recovery and 211 helpline", url: "https://www.unitedway.org/get-involved/volunteer", contact: "Volunteer and partnership portal" },
  { name: "Team Rubicon", category: "relief", desc: "Veteran-led disaster response organization", url: "https://teamrubiconusa.org/volunteer/", contact: "Volunteer registration for disaster deployment" },
  { name: "Feeding America", category: "relief", desc: "Food bank network with disaster response capability", url: "https://www.feedingamerica.org/volunteer", contact: "Partner agency and volunteer programs" },
  { name: "Catholic Charities USA", category: "relief", desc: "Disaster recovery and long-term case management", url: "https://www.catholiccharitiesusa.org/get-involved/", contact: "Disaster response partnership" },
  { name: "Samaritan's Purse", category: "relief", desc: "Christian relief organization for disaster response", url: "https://www.samaritanspurse.org/our-ministry/us-disaster-relief/", contact: "US Disaster Relief volunteer program" },
  { name: "NVOAD (National VOAD)", category: "relief", desc: "Coalition of disaster recovery organizations", url: "https://www.nvoad.org/members/", contact: "Member organizations and partnerships" },
  { name: "Americares", category: "relief", desc: "Health-focused disaster relief and medicine distribution", url: "https://www.americares.org/get-involved/", contact: "Partnership and volunteer portal" },
  { name: "Convoy of Hope", category: "relief", desc: "Disaster response and food distribution", url: "https://www.convoyofhope.org/volunteer/", contact: "Volunteer and partner opportunities" },

  // Animal Welfare
  { name: "AAEP", category: "animal", desc: "American Association of Equine Practitioners — equine emergency preparedness", url: "https://aaep.org/guidelines/disaster-preparedness", contact: "Disaster preparedness guidelines and equine veterinary network" },
  { name: "USDA/APHIS Animal Care", category: "animal", desc: "Animal emergency response and livestock evacuation guidance", url: "https://www.aphis.usda.gov/aphis/ourfocus/animalwelfare/SA_EMERGENCY_RESPONSE", contact: "Animal emergency response programs" },
  { name: "SART (State Animal Response Teams)", category: "animal", desc: "State-level animal emergency response teams", url: "https://sartusa.org/about-sart/", contact: "State coordinators and volunteer registration" },
  { name: "Best Friends Animal Society", category: "animal", desc: "Pet rescue and sheltering during disasters", url: "https://bestfriends.org/get-involved/volunteer", contact: "Volunteer and partner shelter network" },
  { name: "ASPCA Disaster Response", category: "animal", desc: "Animal rescue and recovery during disasters", url: "https://www.aspca.org/get-involved/volunteer", contact: "Disaster response team volunteer programs" },
  { name: "CODE3", category: "animal", desc: "Emergency response education and preparedness", url: "https://code3partners.org/contact/", contact: "Partnership inquiry form" },
  { name: "Humane Society of the United States", category: "animal", desc: "Animal disaster response team", url: "https://www.humanesociety.org/resources/animal-disaster-response", contact: "Animal Rescue Team volunteer program" },

  // Hotels with Disaster / Emergency Programs
  { name: "Wyndham Hotels & Resorts", category: "hotel", desc: "Wyndham's disaster relief program provides discounted rooms for evacuees", url: "https://www.wyndhamhotels.com/about-us/wyndham-citizen", contact: "Wyndham's Citizen program and community partnerships" },
  { name: "Marriott International", category: "hotel", desc: "Disaster relief partnerships with Red Cross and World Central Kitchen", url: "https://www.marriott.com/about/corporate-responsibility/sustainability-and-social-impact.mi", contact: "Serve 360 social impact and disaster relief programs" },
  { name: "Hilton Hotels", category: "hotel", desc: "Disaster relief and Team Member Volunteer program", url: "https://about.hilton.com/en/corporate-responsibility/", contact: "Travel with Purpose program and community partnerships" },
  { name: "IHG Hotels & Resorts", category: "hotel", desc: "Journey to Tomorrow — community resilience and disaster relief", url: "https://www.ihg.com/content/us/en/about/journey-to-tomorrow", contact: "Community engagement and disaster response partnerships" },
  { name: "Choice Hotels International", category: "hotel", desc: "Rooms for Relief — emergency lodging for evacuees", url: "https://www.choicehotels.com/about/our-stories", contact: "Community partnerships and disaster relief programs" },
  { name: "Extended Stay America", category: "hotel", desc: "Extended-stay lodging for displaced families", url: "https://www.extendedstayamerica.com/about-us/", contact: "Corporate partnerships for disaster housing" },
  { name: "Airbnb Open Homes", category: "hotel", desc: "Free temporary housing for disaster evacuees and relief workers", url: "https://www.airbnb.org/", contact: "Airbnb.org nonprofit partnership program" },

  // Insurance Companies with Catastrophe Response
  { name: "State Farm", category: "insurance", desc: "Catastrophe response teams and disaster claims centers", url: "https://www.statefarm.com/claims/catastrophe", contact: "Catastrophe response and community resilience programs" },
  { name: "Allstate", category: "insurance", desc: "Mobile catastrophe claim centers and disaster recovery", url: "https://www.allstate.com/claims/catastrophe-information.html", contact: "Catastrophe response and recovery support" },
  { name: "Farmers Insurance", category: "insurance", desc: "Mobile claim centers (MOOCS) for disaster areas", url: "https://www.farmers.com/claims/catastrophe/", contact: "Catastrophe response team and partnerships" },
  { name: "Liberty Mutual", category: "insurance", desc: "Disaster response and community resilience programs", url: "https://www.libertymutual.com/about-us/corporate-responsibility", contact: "Corporate responsibility and disaster partnerships" },
  { name: "Travelers Insurance", category: "insurance", desc: "Catastrophe response and disaster resource centers", url: "https://www.travelers.com/resources/cat/", contact: "Catastrophe response and industry partnerships" },
  { name: "USAA", category: "insurance", desc: "Catastrophe response for military families", url: "https://www.usaa.com/insurance/catastrophe/", contact: "Military family disaster support programs" },

  // Financial Relief Organizations
  { name: "FEMA Individual Assistance", category: "financial", desc: "Federal disaster grants for individuals and families", url: "https://www.fema.gov/assistance/individual", contact: "Individual Assistance program and partner outreach" },
  { name: "SB A Disaster Assistance", category: "financial", desc: "Low-interest disaster loans for businesses and homeowners", url: "https://www.sba.gov/business-guide/manage-your-business/prepare-emergencies/disaster-loans", contact: "SBA Office of Disaster Assistance partnerships" },
  { name: "Center for Disaster Philanthropy", category: "financial", desc: "Strategic philanthropy for disaster recovery", url: "https://disasterphilanthropy.org/about-us/partners/", contact: "Partnership and funder coordination" },
  { name: "Direct Relief", category: "financial", desc: "Medical and financial aid for disaster-affected communities", url: "https://www.directrelief.org/get-involved/", contact: "Corporate and foundation partnerships" },
  { name: "Disaster Recovery Fund (Candid)", category: "financial", desc: "Philanthropic database of disaster recovery funding", url: "https://candid.org/explore-issues/disaster-relief", contact: "Funder network and grantmaking partnerships" },
  { name: "Operation HOPE", category: "financial", desc: "Financial literacy and disaster recovery coaching", url: "https://operationhope.org/get-involved/", contact: "Disaster recovery and financial wellness partnerships" },
  { name: "Crisis Assistance Ministry", category: "financial", desc: "Financial assistance for families in crisis", url: "https://www.crisisassistance.org/how-we-help/", contact: "Community partnership and referral network" },
];

const OUTREACH_SCRIPT = `Hello,

My name is [YOUR NAME] and I'm reaching out from RallyPack, a free, open-source emergency preparedness platform that helps families, pet owners, and organizations plan for disasters before they happen.

We're building a national network of partners — relief organizations, animal welfare groups, hotels with disaster lodging programs, insurance providers, and financial assistance organizations — to ensure families in crisis can find the resources they need in one place.

Our platform includes:
• Personalized go-bag and emergency cache planning (FEMA-aligned)
• Species-specific evacuation guidance for pets, equine, and livestock
• Business dashboards for organizations managing team safety and first aid kits
• A public partner onboarding page where organizations can be listed and referred: https://rallypack.tech/BusinessOnboarding

We'd love to explore a partnership with [ORGANIZATION NAME] — whether that's a resource listing, a referral program, a volunteer pathway, or a disaster response collaboration.

You can learn more or submit a partnership inquiry at: https://rallypack.tech/BusinessOnboarding

Thank you for the critical work you do. I look forward to connecting.

Best regards,
[YOUR NAME]
RallyPack
beta@rallypack.tech
https://rallypack.tech`;

export default function PartnerOutreachDirectory() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(OUTREACH_SCRIPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = OUTREACH_SCRIPT;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const filtered = useMemo(() => {
    return DIRECTORY.filter((org) => {
      const matchesCategory = activeCategory === "all" || org.category === activeCategory;
      const matchesSearch = !search ||
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.desc.toLowerCase().includes(search.toLowerCase()) ||
        org.contact.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    DIRECTORY.forEach((org) => { counts[org.category] = (counts[org.category] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Partner Outreach Directory</h3>
              <p className="text-sm text-gray-600">
                Public partnership and volunteer pages for emergency-response organizations, relief agencies, hotels with disaster programs, insurance carriers with catastrophe teams, and financial relief organizations.
                Use these links to reach out through proper channels — do not mass email. Build individual relationships.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copyable Outreach Script */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Partnership Outreach Script</h3>
                <p className="text-xs text-gray-500 mt-0.5">Copy and paste when filling out partnership / volunteer intake forms.</p>
              </div>
            </div>
            <Button
              onClick={handleCopy}
              size="sm"
              variant={copied ? "default" : "outline"}
              className={copied ? "bg-green-600 text-white hover:bg-green-600 flex-shrink-0" : "flex-shrink-0"}
            >
              {copied ? <><Check className="w-3.5 h-3.5 mr-1.5" />Copied!</> : <><Copy className="w-3.5 h-3.5 mr-1.5" />Copy Script</>}
            </Button>
          </div>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans bg-white border border-gray-200 rounded-md p-3 max-h-72 overflow-y-auto leading-relaxed">
{OUTREACH_SCRIPT}
          </pre>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search organizations, descriptions, or contact info..."
          className="pl-9"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const count = cat.key === "all" ? DIRECTORY.length : (categoryCounts[cat.key] || 0);
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
              <span className={`text-xs ${isActive ? "text-blue-100" : "text-gray-400"}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((org) => {
          const catConfig = CATEGORIES.find((c) => c.key === org.category);
          const Icon = catConfig?.icon || Building2;
          return (
            <Card key={org.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4.5 h-4.5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight">{org.name}</h4>
                      <Badge variant="outline" className="mt-1 text-xs">{catConfig?.label}</Badge>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">{org.desc}</p>
                <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
                  <Mail className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{org.contact}</span>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                >
                  <a href={org.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Visit Outreach Page
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No organizations match your search.</p>
        </div>
      )}

      {/* Footer note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <p className="text-xs text-amber-800">
            <strong>Outreach Best Practices:</strong> Contact organizations individually through their official partnership or volunteer pages.
            Each organization has its own intake process — cold mass emailing risks CAN-SPAM/GDPR violations and damages partner relationships.
            Track your outreach progress in the Business Referrals section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}