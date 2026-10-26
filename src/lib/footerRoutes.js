// Public routes linked from the site footer — the sweep in the Translation
// Studio walks every one of them so no footer page is left uncollected.
// Keep this list in step with the footer links rendered in src/Layout.jsx.
export const FOOTER_ROUTES = [
  { path: "/wildfire", label: "Wildfire" },
  { path: "/hurricane", label: "Hurricane" },
  { path: "/flood", label: "Flood" },
  { path: "/tornado", label: "Tornado" },

  { path: "/equine", label: "Equine" },
  { path: "/canine", label: "Canine" },
  { path: "/feline", label: "Feline" },
  { path: "/infant", label: "Infant" },
  { path: "/avian", label: "Avian" },
  { path: "/reptile", label: "Reptile" },
  { path: "/livestock", label: "Livestock" },

  { path: "/PrivacyPolicy", label: "Privacy Policy" },
  { path: "/TermsAndConditions", label: "Terms & Conditions" },
  { path: "/EULA", label: "End User License Agreement" },
  { path: "/ConfidentialityAgreement", label: "Confidentiality Agreement" },

  { path: "/about", label: "About Us" },
  { path: "/Feedback", label: "Send Feedback" },
  { path: "/AffiliatePartnerPolicy", label: "Affiliate & Partner Policy" },

  { path: "/global-compliance", label: "Global Compliance" },
  { path: "/responder-training", label: "Responder Training" },
  { path: "/volunteer", label: "Volunteer" },
  { path: "/drills", label: "Drill Directory" },
  { path: "/business-compliance", label: "Compliance Hub" },

  { path: "/faq", label: "Preparedness FAQ" },
  { path: "/ReadinessQuiz", label: "Readiness Quiz" },
  { path: "/compliance-quiz", label: "Business Compliance Check" },
  { path: "/readiness-map", label: "Readiness Map" },
  { path: "/trend-reports", label: "Trend Reports" },
  { path: "/sitemap", label: "Sitemap" },
];

// The languages this sweep collects and translates.
export const SWEEP_LOCALES = ["es", "es-419", "fr", "fr-CA", "it", "de", "zh-Hant", "bg"];