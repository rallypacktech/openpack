import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Map states to FEMA regions and their disaster profiles
const STATE_TO_FEMA_REGION = {
  'TX': { region: 'Texas', disasters: ['severe_storm', 'tropical_cyclone', 'wildfire', 'flood'] },
  'LA': { region: 'Gulf Coast', disasters: ['hurricane', 'tropical_cyclone', 'flood', 'severe_storm'] },
  'MS': { region: 'Gulf Coast', disasters: ['hurricane', 'tropical_cyclone', 'flood', 'severe_storm'] },
  'AL': { region: 'Gulf Coast', disasters: ['hurricane', 'tropical_cyclone', 'flood', 'severe_storm'] },
  'FL': { region: 'Gulf Coast', disasters: ['hurricane', 'tropical_cyclone', 'flood', 'severe_storm'] },
  'NC': { region: 'Southeast', disasters: ['hurricane', 'tropical_storm', 'flood', 'severe_storm'] },
  'SC': { region: 'Southeast', disasters: ['hurricane', 'tropical_storm', 'flood', 'severe_storm'] },
  'GA': { region: 'Southeast', disasters: ['hurricane', 'tropical_storm', 'flood', 'severe_storm'] },
  'VA': { region: 'Southeast', disasters: ['hurricane', 'tropical_storm', 'flood', 'severe_storm'] },
  'TN': { region: 'Southeast', disasters: ['severe_storm', 'flood', 'tornado'] },
  'KY': { region: 'Southeast', disasters: ['severe_storm', 'flood', 'tornado'] },
  'CA': { region: 'California', disasters: ['wildfire', 'earthquake', 'flood', 'drought'] },
  'OR': { region: 'Pacific Northwest', disasters: ['wildfire', 'earthquake', 'flood'] },
  'WA': { region: 'Pacific Northwest', disasters: ['wildfire', 'earthquake', 'flood'] },
  'AZ': { region: 'Southwest', disasters: ['wildfire', 'drought', 'extreme_heat'] },
  'NM': { region: 'Southwest', disasters: ['wildfire', 'drought', 'extreme_heat'] },
  'NV': { region: 'Southwest', disasters: ['wildfire', 'drought', 'extreme_heat'] },
  'UT': { region: 'Southwest', disasters: ['wildfire', 'drought', 'extreme_heat'] },
  'CO': { region: 'Rocky Mountain', disasters: ['wildfire', 'flood', 'severe_storm'] },
  'WY': { region: 'Rocky Mountain', disasters: ['wildfire', 'flood', 'severe_storm'] },
  'MT': { region: 'Rocky Mountain', disasters: ['wildfire', 'flood', 'severe_storm'] },
  'ID': { region: 'Rocky Mountain', disasters: ['wildfire', 'flood', 'severe_storm'] },
  'OK': { region: 'Southern Plains', disasters: ['tornado', 'severe_storm', 'flood', 'drought'] },
  'KS': { region: 'Southern Plains', disasters: ['tornado', 'severe_storm', 'flood'] },
  'AR': { region: 'Southern Plains', disasters: ['tornado', 'severe_storm', 'flood'] },
  'MO': { region: 'Midwest', disasters: ['tornado', 'severe_storm', 'flood'] },
  'IA': { region: 'Midwest', disasters: ['tornado', 'severe_storm', 'flood'] },
  'NE': { region: 'Midwest', disasters: ['tornado', 'severe_storm', 'flood'] },
  'SD': { region: 'Midwest', disasters: ['tornado', 'severe_storm', 'flood', 'blizzard'] },
  'ND': { region: 'Midwest', disasters: ['tornado', 'severe_storm', 'flood', 'blizzard'] },
  'MN': { region: 'Midwest', disasters: ['tornado', 'severe_storm', 'flood', 'blizzard'] },
  'WI': { region: 'Midwest', disasters: ['tornado', 'severe_storm', 'flood', 'blizzard'] },
  'IL': { region: 'Midwest', disasters: ['tornado', 'severe_storm', 'flood'] },
  'IN': { region: 'Midwest', disasters: ['tornado', 'severe_storm', 'flood'] },
  'MI': { region: 'Midwest', disasters: ['severe_storm', 'flood', 'blizzard'] },
  'OH': { region: 'Midwest', disasters: ['tornado', 'severe_storm', 'flood'] },
  'NY': { region: 'Northeast', disasters: ['hurricane', 'blizzard', 'flood', 'severe_storm'] },
  'PA': { region: 'Northeast', disasters: ['severe_storm', 'flood', 'blizzard'] },
  'NJ': { region: 'Northeast', disasters: ['hurricane', 'flood', 'severe_storm'] },
  'CT': { region: 'Northeast', disasters: ['hurricane', 'blizzard', 'flood'] },
  'MA': { region: 'Northeast', disasters: ['hurricane', 'blizzard', 'flood'] },
  'RI': { region: 'Northeast', disasters: ['hurricane', 'blizzard', 'flood'] },
  'VT': { region: 'Northeast', disasters: ['blizzard', 'flood', 'severe_storm'] },
  'NH': { region: 'Northeast', disasters: ['blizzard', 'flood', 'severe_storm'] },
  'ME': { region: 'Northeast', disasters: ['blizzard', 'flood', 'severe_storm'] },
  'DE': { region: 'Northeast', disasters: ['hurricane', 'flood', 'severe_storm'] },
  'MD': { region: 'Northeast', disasters: ['hurricane', 'flood', 'severe_storm'] },
  'WV': { region: 'Northeast', disasters: ['severe_storm', 'flood'] },
  'AK': { region: 'Alaska', disasters: ['earthquake', 'blizzard', 'extreme_cold', 'wildfire'] },
  'HI': { region: 'Hawaii', disasters: ['hurricane', 'tropical_cyclone', 'volcano', 'earthquake'] },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { state } = await req.json();

    if (!state) {
      return Response.json({ error: 'State required' }, { status: 400 });
    }

    const stateCode = state.toUpperCase();
    const regionData = STATE_TO_FEMA_REGION[stateCode] || { 
      region: 'Other', 
      disasters: ['severe_storm', 'flood'] 
    };

    return Response.json({
      fema_region: regionData.region,
      disaster_types: regionData.disasters
    });

  } catch (error) {
    console.error("Error determining FEMA region:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});