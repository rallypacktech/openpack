import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const resources = [
      // Federal Agencies
      {
        name: "FEMA - Federal Emergency Management Agency",
        type: "federal_agency",
        phone: "1-800-621-3362",
        website: "https://www.fema.gov",
        description: "Federal disaster assistance, recovery programs, and emergency preparedness resources",
        service_area: "National - All 50 States",
        available_24_7: true
      },
      {
        name: "FEMA Disaster Assistance Helpline",
        type: "federal_agency",
        phone: "1-800-621-3362",
        website: "https://www.disasterassistance.gov",
        description: "Apply for FEMA disaster assistance, check application status, and get help with your application",
        service_area: "National",
        available_24_7: true
      },
      {
        name: "National Flood Insurance Program (NFIP)",
        type: "insurance",
        phone: "1-877-336-2627",
        website: "https://www.floodsmart.gov",
        description: "Federally-backed flood insurance for homeowners, renters, and businesses",
        service_area: "National",
        available_24_7: false
      },

      // Major Relief Organizations
      {
        name: "American Red Cross",
        type: "relief_organization",
        phone: "1-800-733-2767",
        website: "https://www.redcross.org",
        description: "Emergency shelter, food, relief supplies, health services, and mental health support",
        service_area: "National",
        available_24_7: true
      },
      {
        name: "Salvation Army Emergency Disaster Services",
        type: "relief_organization",
        phone: "1-800-SAL-ARMY (1-800-725-2769)",
        website: "https://www.salvationarmyusa.org",
        description: "Food, shelter, emotional and spiritual care during disasters",
        service_area: "National",
        available_24_7: true
      },
      {
        name: "Team Rubicon",
        type: "relief_organization",
        phone: "1-310-640-8787",
        website: "https://teamrubiconusa.org",
        description: "Veteran-led disaster response organization providing relief operations",
        service_area: "National",
        available_24_7: false
      },
      {
        name: "All Hands and Hearts",
        type: "relief_organization",
        phone: "1-617-564-4301",
        website: "https://www.allhandsandhearts.org",
        description: "Volunteer-powered disaster relief and rebuilding",
        service_area: "National and International",
        available_24_7: false
      },

      // Insurance Companies with Disaster Hotlines
      {
        name: "State Farm Disaster Hotline",
        type: "insurance",
        phone: "1-800-SF-CLAIM (1-800-732-5246)",
        website: "https://www.statefarm.com",
        description: "Report claims and get disaster assistance from State Farm Insurance",
        service_area: "National",
        available_24_7: true
      },
      {
        name: "Allstate Disaster Hotline",
        type: "insurance",
        phone: "1-800-54-STORM (1-800-547-8676)",
        website: "https://www.allstate.com",
        description: "Allstate catastrophe claims and disaster assistance",
        service_area: "National",
        available_24_7: true
      },
      {
        name: "USAA Catastrophe Hotline",
        type: "insurance",
        phone: "1-800-531-8722",
        website: "https://www.usaa.com",
        description: "USAA members disaster claims and emergency assistance",
        service_area: "National (USAA Members)",
        available_24_7: true
      },
      {
        name: "Farmers Insurance Catastrophe Team",
        type: "insurance",
        phone: "1-800-435-7764",
        website: "https://www.farmers.com",
        description: "File disaster claims and get emergency support",
        service_area: "National",
        available_24_7: true
      },

      // Mental Health & Crisis Support
      {
        name: "SAMHSA Disaster Distress Helpline",
        type: "mental_health",
        phone: "1-800-985-5990",
        website: "https://www.samhsa.gov/find-help/disaster-distress-helpline",
        description: "24/7 crisis counseling and support for people experiencing emotional distress related to disasters",
        service_area: "National",
        available_24_7: true
      },
      {
        name: "Crisis Text Line",
        type: "mental_health",
        phone: "Text HOME to 741741",
        website: "https://www.crisistextline.org",
        description: "Free 24/7 text-based mental health crisis support",
        service_area: "National",
        available_24_7: true
      },

      // Financial Assistance
      {
        name: "Small Business Administration (SBA) Disaster Loans",
        type: "financial_assistance",
        phone: "1-800-659-2955",
        website: "https://www.sba.gov/funding-programs/disaster-assistance",
        description: "Low-interest disaster loans for businesses, homeowners, and renters",
        service_area: "National",
        available_24_7: false
      },
      {
        name: "United Way 211 Helpline",
        type: "relief_organization",
        phone: "211",
        website: "https://www.211.org",
        description: "Connect with local disaster relief, food banks, shelters, and emergency services",
        service_area: "National - Local Resources",
        available_24_7: true
      },

      // Local Emergency Services
      {
        name: "Local Emergency Services (9-1-1)",
        type: "local_emergency",
        phone: "911",
        website: "https://www.911.gov",
        description: "Immediate emergency assistance - police, fire, medical",
        service_area: "National - Local Response",
        available_24_7: true
      },
      {
        name: "Non-Emergency Police",
        type: "local_emergency",
        phone: "311 or local non-emergency number",
        website: "",
        description: "Non-emergency police services and information",
        service_area: "Local",
        available_24_7: true
      }
    ];

    await base44.asServiceRole.entities.DisasterResource.bulkCreate(resources);

    return Response.json({ 
      success: true, 
      message: `Successfully seeded ${resources.length} disaster resources`
    });

  } catch (error) {
    console.error("Error seeding disaster resources:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});