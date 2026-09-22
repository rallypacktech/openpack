// Every public page, grouped for the sitemap page and the footer navigation.
export const PUBLIC_PAGE_GROUPS = [
  {
    group: "Preparedness",
    pages: [
      { path: "/", label: "Home", description: "Free, open-source emergency preparedness for families and organizations." },
      { path: "/ReadinessQuiz", label: "Readiness Quiz", description: "Score your household plan in three minutes — no account required." },
      { path: "/readiness-map", label: "Readiness Map", description: "See how average preparedness compares from country down to postal code." },
      { path: "/faq", label: "FAQ", description: "Direct answers to the questions people ask most about preparing for disasters." },
    ],
  },
  {
    group: "Hazard guides",
    pages: [
      { path: "/wildfire", label: "Wildfire", description: "Evacuation levels, defensible space and smoke planning for fire-prone regions." },
      { path: "/hurricane", label: "Hurricane", description: "Evacuation zones, storm surge and seven-day supply planning." },
      { path: "/flood", label: "Flood", description: "Flash-flood response, flood zones and insurance documentation." },
      { path: "/tornado", label: "Tornado", description: "Shelter locations, warning lead times and vehicle safety." },
      { path: "/wildfire-trends", label: "Wildfire Trend Report", description: "Ten years of open wildfire data — causes, burned area and holiday ignitions." },
    ],
  },
  {
    group: "Species & family",
    pages: [
      { path: "/equine", label: "Equine", description: "Horse evacuation, transport and stabling plans." },
      { path: "/canine", label: "Canine", description: "Dog evacuation kits, carriers and identification." },
      { path: "/feline", label: "Feline", description: "Cat carriers, medication and low-stress evacuation." },
      { path: "/infant", label: "Infants", description: "Formula, feeding, medication and diaper planning for evacuations." },
      { path: "/avian", label: "Avian", description: "Bird carriers, temperature control and evacuation planning." },
      { path: "/reptile", label: "Reptiles", description: "Heat, power and transport planning for reptiles and amphibians." },
      { path: "/livestock", label: "Livestock", description: "Large-animal transport, destinations and mutual aid." },
    ],
  },
  {
    group: "Organizations",
    pages: [
      { path: "/BusinessOnboarding", label: "RallyPack for Business", description: "Track kits, AEDs, certifications and fire safety across your organization." },
      { path: "/global-compliance", label: "Global Compliance", description: "Fire and life-safety requirements by country." },
      { path: "/responder-training", label: "Responder Training", description: "Incident command terminology and field reference guides." },
      { path: "/Shopping", label: "Equipment Shop", description: "Recommended preparedness equipment by cache type." },
    ],
  },
  {
    group: "About",
    pages: [
      { path: "/about", label: "About Us", description: "Why RallyPack exists and how it is funded." },
      { path: "/Donate", label: "Donate", description: "Support free, open-source preparedness for everyone." },
      { path: "/Feedback", label: "Send Feedback", description: "Tell us what is missing or wrong." },
      { path: "/sitemap", label: "Sitemap", description: "Every public page on RallyPack, in one place." },
    ],
  },
  {
    group: "Legal",
    pages: [
      { path: "/PrivacyPolicy", label: "Privacy Policy", description: "What we collect, how it is stored, and your rights." },
      { path: "/TermsAndConditions", label: "Terms & Conditions", description: "The terms that govern your use of RallyPack." },
      { path: "/ConfidentialityAgreement", label: "Confidentiality Agreement", description: "How confidential information is handled." },
      { path: "/EULA", label: "End User License Agreement", description: "License terms for the RallyPack application." },
      { path: "/AffiliatePartnerPolicy", label: "Affiliate & Partner Policy", description: "How affiliate links and partner recommendations work." },
    ],
  },
];