// Primary-source registry for public pages.
//
// Every statistic RallyPack publishes publicly is attributed to the agency that
// produced it, so press, municipalities and answer engines can follow the claim
// back to its origin. Keys map to page topics; `getSources` merges and de-dupes.
export const PUBLIC_SOURCES = {
  wildfire: [
    {
      name: "FEMA",
      provided: "Evacuation and shelter-in-place planning considerations, including the 72-hour minimum sustainment benchmark and planning horizons up to 14 days",
      url: "https://www.fema.gov/sites/default/files/2020-07/planning-considerations-evacuation-and-shelter-in-place.pdf",
    },
    {
      name: "US National Interagency Fire Center (NIFC)",
      provided: "Large-fire incident data, national wildland fire outlook and human-caused ignition periods",
      url: "https://www.nifc.gov/",
    },
    {
      name: "CAL FIRE",
      provided: "California incident, cause and structure-loss data",
      url: "https://www.fire.ca.gov/",
    },
    {
      name: "Copernicus EFFIS",
      provided: "European forest fire information system — burned area and fire danger",
      url: "https://effis.jrc.ec.europa.eu/",
    },
    {
      name: "NFPA",
      provided: "Fireworks ignition estimates and home fire loss data",
      url: "https://www.nfpa.org/",
    },
    {
      name: "US Drought Monitor / Drought.gov",
      provided: "Drought conditions and wildfire-management sector data",
      url: "https://www.drought.gov/sectors/wildfire-management",
    },
    {
      name: "US Forest Service",
      provided: "Drought interactions with wildfire, water sources and suppression logistics",
      url: "https://research.fs.usda.gov/",
    },
    {
      name: "USGS",
      provided: "Post-fire water quality, sediment and watershed impacts",
      url: "https://water.usgs.gov/vizlab/fire-hydro/index.html",
    },
    {
      name: "NOAA",
      provided: "Seasonal climate patterns including El Niño and La Niña effects on fire weather",
      url: "https://www.noaa.gov/",
    },
    {
      name: "American Red Cross",
      provided: "Household and evacuation preparedness guidance",
      url: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html",
    },
  ],
  water: [
    {
      name: "Drought.gov (National Integrated Drought Information System)",
      provided: "Drought conditions and the wildfire-management sector, including how dry fuels raise the probability of large fires",
      url: "https://www.drought.gov/sectors/wildfire-management",
    },
    {
      name: "US Forest Service",
      provided: "How reduced water sources affect wildfire spread and force suppression crews to move water farther",
      url: "https://research.fs.usda.gov/",
    },
    {
      name: "USGS",
      provided: "Post-fire ash, sediment and debris impacts on surface-water quality, reservoir storage and treatment costs",
      url: "https://water.usgs.gov/vizlab/fire-hydro/index.html",
    },
    {
      name: "UCLA Luskin Center for Innovation",
      provided: "Water-system capacity and expectations during wildfire response, and drought-driven trade-offs in emergency storage",
      url: "https://innovation.luskin.ucla.edu/",
    },
  ],
  hurricane: [
    {
      name: "NOAA National Hurricane Center",
      provided: "Atlantic and Eastern Pacific storm tracks, watches and warnings",
      url: "https://www.nhc.noaa.gov/",
    },
    {
      name: "National Weather Service",
      provided: "Storm surge, wind and coastal flood forecasting",
      url: "https://www.weather.gov/",
    },
    {
      name: "FEMA",
      provided: "Hurricane evacuation and shelter planning guidance",
      url: "https://www.ready.gov/hurricanes",
    },
    {
      name: "American Red Cross",
      provided: "Household preparedness and evacuation guidance",
      url: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html",
    },
  ],
  flood: [
    {
      name: "FEMA",
      provided: "Flood zone mapping, evacuation and flood insurance guidance",
      url: "https://www.fema.gov/flood-maps",
    },
    {
      name: "NOAA National Water Prediction Service",
      provided: "River forecasts and flood warnings",
      url: "https://water.noaa.gov/",
    },
    {
      name: "USGS",
      provided: "Streamflow, flood frequency and water-level data",
      url: "https://www.usgs.gov/mission-areas/water-resources",
    },
    {
      name: "American Red Cross",
      provided: "Flood preparedness and evacuation guidance",
      url: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html",
    },
  ],
  tornado: [
    {
      name: "NOAA Storm Prediction Center",
      provided: "Severe weather outlooks and tornado risk categories",
      url: "https://www.spc.noaa.gov/",
    },
    {
      name: "National Weather Service",
      provided: "Tornado watches, warnings and shelter guidance",
      url: "https://www.weather.gov/",
    },
    {
      name: "FEMA",
      provided: "Tornado safe-room and shelter-in-place guidance",
      url: "https://www.ready.gov/tornadoes",
    },
    {
      name: "American Red Cross",
      provided: "Tornado preparedness and recovery guidance",
      url: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html",
    },
  ],
  species: [
    {
      name: "FEMA",
      provided: "Pet and service-animal planning for evacuations and shelters",
      url: "https://www.ready.gov/pets",
    },
    {
      name: "American Red Cross",
      provided: "Pet disaster preparedness and evacuation guidance",
      url: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/pet-disaster-preparedness.html",
    },
    {
      name: "ASPCA",
      provided: "Household animal evacuation planning and supply guidance",
      url: "https://www.aspca.org/pet-care/general-pet-care/disaster-preparedness",
    },
    {
      name: "AVMA",
      provided: "Veterinary and animal-agency disaster resources",
      url: "https://www.avma.org/resources-tools/animal-health-and-welfare/disaster-preparedness",
    },
    {
      name: "USDA APHIS",
      provided: "Livestock movement, sheltering and animal-health guidance during disasters",
      url: "https://www.aphis.usda.gov/",
    },
  ],
  readiness: [
    {
      name: "FEMA",
      provided: "Household preparedness planning considerations",
      url: "https://www.ready.gov/plan",
    },
    {
      name: "American Red Cross",
      provided: "Household readiness and evacuation guidance",
      url: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html",
    },
    {
      name: "CDC",
      provided: "Public-health preparedness guidance for households and vulnerable groups",
      url: "https://www.cdc.gov/preparedness/",
    },
  ],
};

/** Merge sources for several topics, de-duplicated by agency name. */
export function getSources(topics = []) {
  const seen = new Set();
  const out = [];
  topics.forEach((topic) => {
    (PUBLIC_SOURCES[topic] || []).forEach((s) => {
      if (seen.has(s.name)) return;
      seen.add(s.name);
      out.push(s);
    });
  });
  return out;
}