// Pre-identified grants RallyPack qualifies for, organized by category.
// Used to seed the LOI pipeline with relevant opportunities.
export const GRANT_LIBRARY = [
  {
    grant_name: "Building Resilient Infrastructure and Communities (BRIC)",
    funder_name: "FEMA / DHS",
    grant_category: "emergency_admin",
    grant_url: "https://www.fema.gov/bric",
    amount_requested: 600000,
    priority: "high",
    loi_sections: {
      need: "Communities lack accessible, unified tools for disaster preparedness, leaving vulnerable populations underprepared for emergencies.",
      approach: "RallyPack provides a free, open-source preparedness platform with personalized go-bag tracking, multi-channel emergency alerts, and family readiness planning.",
      impact: "We aim to increase household preparedness rates by 40% in 5 target counties, serving 50,000 residents over 24 months.",
      budget_summary: "$600K over 24 months: platform development (40%), community outreach (30%), county integration partnerships (20%), evaluation (10%).",
      org_capacity: "RallyPack operates a production platform with multi-channel alert delivery (Telegram, email, Discord), wildfire incident tracking across 20+ countries, and partnerships with county emergency management offices."
    }
  },
  {
    grant_name: "Flood Mitigation Assistance Program",
    funder_name: "FEMA",
    grant_category: "remote_disaster_relief",
    grant_url: "https://www.fema.gov/flood-mitigation-assistance",
    amount_requested: 300000,
    priority: "medium",
    loi_sections: {
      need: "Flood-prone communities need real-time alert infrastructure and household evacuation planning tools.",
      approach: "RallyPack's multi-channel alert system delivers NWS-sourced flood warnings via Telegram, email, and Discord, with offline-accessible evacuation plans.",
      impact: "Expand flood alert coverage to 10 high-risk counties, reaching 100,000 residents with timely evacuation guidance.",
      budget_summary: "$300K over 18 months: alert infrastructure scaling (50%), county onboarding (30%), multilingual support (20%).",
      org_capacity: "Existing NWS CAP alert ingestion pipeline, Telegram bot serving active users, and a proven county alert delegation framework."
    }
  },
  {
    grant_name: "Google.org Impact Challenge on Climate",
    funder_name: "Google.org",
    grant_category: "emergency_tech",
    grant_url: "https://www.google.org/climate",
    amount_requested: 1000000,
    priority: "high",
    loi_sections: {
      need: "Wildfire response lacks unified, real-time data tooling that reaches households directly, including rural and underserved communities.",
      approach: "RallyPack integrates NASA FIRMS, NIFC, Copernicus EFFIS, and global CAP feeds into a single citizen-facing alert and preparedness platform.",
      impact: "Reduce wildfire alert latency by 60% for 200,000 users across fire-prone regions in the US, EU, and Australia.",
      budget_summary: "$1M over 24 months: satellite data integration (35%), AI-driven risk personalization (30%), multilingual expansion (20%), evaluation (15%).",
      org_capacity: "Live ingestion of NASA FIRMS, Copernicus EFFIS, and NWS national alerts; wildfire history database spanning 20+ countries; holiday-firework correlation analytics."
    }
  },
  {
    grant_name: "AI for Humanitarian Action",
    funder_name: "Microsoft AI for Good",
    grant_category: "emergency_tech",
    grant_url: "https://www.microsoft.com/ai/ai-for-humanitarian-action",
    amount_requested: 250000,
    priority: "high",
    loi_sections: {
      need: "Disaster-affected families need AI-assisted preparedness recommendations tailored to their household, pets, livestock, and climate zone.",
      approach: "RallyPack uses LLM-driven recommendations for go-bag contents, evacuation destinations, and ration calculations personalized by family composition and hazard profile.",
      impact: "Deliver personalized readiness plans to 75,000 households, improving readiness quiz scores by an average of 25 points.",
      budget_summary: "$250K over 12 months: LLM recommendation engine (50%), species-specific content (30%), impact measurement (20%).",
      org_capacity: "Production readiness quiz with scoring, species-specific preparedness pages (equine, canine, feline, infant, avian, reptile, livestock), and an active affiliate product recommendation pipeline."
    }
  },
  {
    grant_name: "Disaster Response Program",
    funder_name: "NetHope",
    grant_category: "remote_disaster_relief",
    grant_url: "https://nethope.org/disaster-response",
    amount_requested: 150000,
    priority: "medium",
    loi_sections: {
      need: "Field responders and affected families need a low-bandwidth, offline-capable preparedness and status-sharing tool.",
      approach: "RallyPack's offline mode bundles emergency manuals, shelter maps, and family status broadcasting via Telegram and Discord — accessible on low-end devices.",
      impact: "Deploy offline-preparedness kits to 5 disaster-affected regions, serving 25,000 residents during active response.",
      budget_summary: "$150K over 12 months: offline PWA optimization (40%), multilingual manuals (30%), partner deployments (30%).",
      org_capacity: "PWA with offline caching, 7 embedded emergency manuals with print-to-PDF, and family status alerts across Telegram, Discord, email, and Threads."
    }
  },
  {
    grant_name: "Public Health Emergency Preparedness Cooperative Agreement",
    funder_name: "CDC / ASPR",
    grant_category: "public_health_prep",
    grant_url: "https://www.cdc.gov/phpr/coopagreements.htm",
    amount_requested: 400000,
    priority: "medium",
    loi_sections: {
      need: "Households lack accessible first-aid tracking and medical supply preparedness tools integrated with public health emergency channels.",
      approach: "RallyPack's first-aid kit tracker and expiration monitoring, combined with multilingual emergency contact directories, close the household medical preparedness gap.",
      impact: "Improve household medical preparedness compliance by 35% across 15 counties, tracking 10,000 first-aid kits.",
      budget_summary: "$400K over 24 months: first-aid tracker expansion (40%), public health alert integration (30%), community training (30%).",
      org_capacity: "First-aid kit location tracking with item-level expiration monitoring, monthly inventory reminder automations, and a business-tier multi-kit management dashboard."
    }
  },
  {
    grant_name: "Resilient Communities Fund",
    funder_name: "Robert Wood Johnson Foundation",
    grant_category: "community_resilience",
    grant_url: "https://www.rwjf.org",
    amount_requested: 350000,
    priority: "medium",
    loi_sections: {
      need: "Marginalized communities — including non-English speakers, rural residents, and pet/livestock owners — face disproportionate disaster risk due to lack of tailored preparedness resources.",
      approach: "RallyPack delivers culturally and species-aware preparedness: multilingual alerts, pet evacuation planning, livestock logistics, and a free readiness quiz.",
      impact: "Reach 40,000 underserved residents in 8 counties with localized, inclusive preparedness tools.",
      budget_summary: "$350K over 18 months: multilingual expansion (40%), community partner onboarding (35%), equity-focused evaluation (25%).",
      org_capacity: "Species-specific pages (equine, livestock, infant), livestock logistics planner with trailer and evacuation destination tracking, and a country-aware emergency number directory."
    }
  },
  {
    grant_name: "AWS Disaster Response Program",
    funder_name: "Amazon Web Services",
    grant_category: "emergency_tech",
    grant_url: "https://aws.amazon.com/government-education/disaster-response",
    amount_requested: 120000,
    priority: "low",
    loi_sections: {
      need: "Disaster alert infrastructure requires scalable, reliable cloud capacity to surge during multi-region emergencies.",
      approach: "RallyPack's alert pipeline (NWS, AEMET, global CAP feeds) needs elastic cloud credits to maintain sub-minute alert delivery during peak disaster events.",
      impact: "Sustain 99.9% alert delivery uptime across 3 concurrent regional disasters, serving 500,000 users.",
      budget_summary: "$120K in AWS credits over 24 months: compute scaling (50%), data storage (30%), CDN and edge delivery (20%).",
      org_capacity: "Production alert pipeline with secure automations, webhook-validated endpoints, and a multi-database architecture already deployed on cloud infrastructure."
    }
  }
];

// Recognition awards RallyPack qualifies for, across all categories.
export const AWARD_LIBRARY = [
  {
    grant_name: "AWS Pathfinder Award",
    funder_name: "Amazon Web Services",
    grant_category: "emergency_tech",
    opportunity_type: "award",
    grant_url: "https://aws.amazon.com/startups/pathfinder",
    amount_requested: 0,
    priority: "high",
    loi_sections: {
      need: "Emergency tech innovators need visibility and cloud infrastructure support to scale life-saving alert and preparedness platforms.",
      approach: "RallyPack delivers a multi-feed wildfire and severe-weather alert platform reaching households across 20+ countries with sub-minute latency.",
      impact: "Recognized as a leading climate-tech innovator, expanding reach to 500,000 users through AWS infrastructure credits and visibility.",
      budget_summary: "Recognition + AWS credits + technical mentorship (non-monetary award).",
      org_capacity: "Production platform with NASA FIRMS, Copernicus EFFIS, NWS, and global CAP ingestion; multi-channel alert delivery; 20+ country wildfire database."
    }
  },
  {
    grant_name: "FEMA Individual and Community Preparedness Award",
    funder_name: "FEMA",
    grant_category: "emergency_admin",
    opportunity_type: "award",
    grant_url: "https://www.fema.gov/emergency-managers/individuals-communities/awards",
    amount_requested: 0,
    priority: "high",
    loi_sections: {
      need: "Individuals and community organizations leading grassroots preparedness innovation deserve national recognition to amplify their impact.",
      approach: "RallyPack empowers households with free, accessible, multilingual preparedness tools including go-bag tracking, readiness quizzes, and family status alerts.",
      impact: "Recognized nationally as a model for individual and community preparedness innovation, inspiring replication in 50+ counties.",
      budget_summary: "Recognition award (non-monetary); national visibility and FEMA partnership opportunities.",
      org_capacity: "Free open-source platform serving active users across multiple countries with county-level emergency management partnerships."
    }
  },
  {
    grant_name: "Disaster Response Innovation Award",
    funder_name: "Global Disaster Preparedness Center",
    grant_category: "remote_disaster_relief",
    opportunity_type: "award",
    grant_url: "https://preparecenter.org",
    amount_requested: 0,
    priority: "medium",
    loi_sections: {
      need: "Field-tested disaster response innovations need a platform to scale and be recognized by the global humanitarian community.",
      approach: "RallyPack's offline-capable PWA delivers emergency manuals, shelter maps, and family status broadcasting via Telegram and Discord in low-bandwidth environments.",
      impact: "Recognized as a scalable disaster response innovation, deployed to 5 additional disaster-affected regions within 12 months.",
      budget_summary: "Recognition + network access to humanitarian partners (non-monetary).",
      org_capacity: "PWA with offline caching, 7 embedded emergency manuals, and multi-channel family status alerts already deployed in active disasters."
    }
  },
  {
    grant_name: "Public Health Preparedness Hero Award",
    funder_name: "ASTHO / CDC Foundation",
    grant_category: "public_health_prep",
    opportunity_type: "award",
    grant_url: "https://www.cdcfoundation.org",
    amount_requested: 0,
    priority: "medium",
    loi_sections: {
      need: "Public health preparedness champions advancing household medical readiness deserve recognition to drive broader adoption.",
      approach: "RallyPack's first-aid kit tracker with expiration monitoring and monthly inventory reminders closes the household medical preparedness gap.",
      impact: "Recognized as a public health preparedness innovator, expanding first-aid tracking to 15 counties and 10,000 kits.",
      budget_summary: "Recognition + CDC Foundation partnership opportunities (non-monetary).",
      org_capacity: "First-aid kit location tracking with item-level expiration monitoring and automated monthly inventory reminders already in production."
    }
  },
  {
    grant_name: "Community Resilience Innovation Award",
    funder_name: "Robert Wood Johnson Foundation",
    grant_category: "community_resilience",
    opportunity_type: "award",
    grant_url: "https://www.rwjf.org",
    amount_requested: 0,
    priority: "medium",
    loi_sections: {
      need: "Community resilience innovations addressing equity gaps in disaster preparedness deserve recognition to attract scaling investment.",
      approach: "RallyPack delivers culturally and species-aware preparedness: multilingual alerts, pet/livestock evacuation planning, and a free readiness quiz.",
      impact: "Recognized as a leading community resilience innovation, reaching 40,000 underserved residents across 8 counties.",
      budget_summary: "Recognition + RWJF network access (non-monetary).",
      org_capacity: "Species-specific preparedness pages (equine, livestock, infant), livestock logistics planner, and country-aware emergency number directory."
    }
  },
  {
    grant_name: "Tech for Good Award",
    funder_name: "NTEN / TechSoup",
    grant_category: "other",
    opportunity_type: "award",
    grant_url: "https://www.nten.org",
    amount_requested: 0,
    priority: "low",
    loi_sections: {
      need: "Nonprofit technology projects delivering measurable social good need recognition to sustain and scale their impact.",
      approach: "RallyPack is a free, open-source disaster preparedness platform built for equity, accessibility, and multilingual reach.",
      impact: "Recognized as a Tech for Good leader, attracting volunteer contributors and pro-bono partnerships.",
      budget_summary: "Recognition + TechSoup product donation eligibility (non-monetary).",
      org_capacity: "Open-source MIT-licensed platform with active beta users, GDPR/CCPA compliance, and accessibility-first design including high-contrast and reduced-motion modes."
    }
  }
];

export const GRANT_CATEGORY_LABELS = {
  emergency_admin: "Emergency Admin",
  remote_disaster_relief: "Remote Disaster Relief",
  emergency_tech: "Emergency Tech",
  public_health_prep: "Public Health Prep",
  community_resilience: "Community Resilience",
  other: "Other"
};

export const LOI_STAGES = [
  { key: "identified", label: "Identified", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { key: "drafting", label: "Drafting", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { key: "internal_review", label: "Internal Review", color: "bg-purple-100 text-purple-800 border-purple-300" },
  { key: "submitted", label: "Submitted", color: "bg-cyan-100 text-cyan-800 border-cyan-300" },
  { key: "awarded", label: "Awarded", color: "bg-green-100 text-green-800 border-green-300" },
  { key: "declined", label: "Declined", color: "bg-red-100 text-red-800 border-red-300" },
  { key: "archived", label: "Archived", color: "bg-gray-100 text-gray-600 border-gray-300" }
];

export const PRIORITY_LABELS = {
  high: { label: "High", color: "text-red-600" },
  medium: { label: "Medium", color: "text-amber-600" },
  low: { label: "Low", color: "text-gray-500" }
};