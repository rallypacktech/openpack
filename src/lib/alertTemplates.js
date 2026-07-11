// Unified alert message templates — one template per incident type × event level.
// Used by both the frontend (preview) and backend functions (dispatch).
// The backend wraps the same title+body for both email (HTML) and Telegram (Markdown).

export const INCIDENT_TYPES = [
  { id: 'wildfire', label: 'Wildfire', icon: '🔥', description: 'Active wildfire threatening the area' },
  { id: 'flood', label: 'Flood', icon: '🌊', description: 'Flooding or flash flood event' },
  { id: 'hurricane', label: 'Hurricane / Tropical Storm', icon: '🌀', description: 'Hurricane or tropical storm' },
  { id: 'tornado', label: 'Tornado', icon: '🌪️', description: 'Tornado watch or warning' },
  { id: 'earthquake', label: 'Earthquake', icon: '🌍', description: 'Earthquake event' },
  { id: 'severe_weather', label: 'Severe Weather', icon: '⛈️', description: 'Thunderstorm, ice, or extreme temperatures' },
  { id: 'evacuation', label: 'Evacuation Order', icon: '🚗', description: 'Mandatory or voluntary evacuation' },
  { id: 'shelter_open', label: 'Shelter Opened', icon: '🏠', description: 'Emergency shelter now open' },
  { id: 'shelter_close', label: 'Shelter Closing', icon: '🔒', description: 'Emergency shelter closing' },
  { id: 'active_shooter', label: 'Active Threat', icon: '🚨', description: 'Active shooter or threat situation' },
  { id: 'custom', label: 'Custom Message', icon: '📢', description: 'Organization-specific alert' },
];

export const EVENT_LEVELS = [
  { id: 'advisory', label: 'Advisory', color: 'blue', description: 'Be aware — information only', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'watch', label: 'Watch', color: 'yellow', description: 'Be prepared — conditions favorable', badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { id: 'warning', label: 'Warning', color: 'orange', description: 'Take action — event occurring or imminent', badgeClass: 'bg-orange-100 text-orange-800 border-orange-300' },
  { id: 'critical', label: 'Critical', color: 'red', description: 'Immediate action required — life-threatening', badgeClass: 'bg-red-100 text-red-800 border-red-300' },
];

// Incident types available based on delegation type
export const SHELTER_PROVIDER_INCIDENTS = ['shelter_open', 'shelter_close', 'evacuation', 'severe_weather', 'custom'];
export const CONTRACTED_ORG_INCIDENTS = INCIDENT_TYPES.map(t => t.id);

export function getAvailableIncidentTypes(delegation) {
  if (!delegation) return [];
  if (delegation.is_contracted) return CONTRACTED_ORG_INCIDENTS;
  if (delegation.provides_shelters) return SHELTER_PROVIDER_INCIDENTS;
  return SHELTER_PROVIDER_INCIDENTS;
}

export function getIncidentType(id) {
  return INCIDENT_TYPES.find(t => t.id === id) || INCIDENT_TYPES[INCIDENT_TYPES.length - 1];
}

export function getEventLevel(id) {
  return EVENT_LEVELS.find(l => l.id === id) || EVENT_LEVELS[0];
}

// The core template matrix — generates a title and body for each combination.
// {area} and {org_name} are replaced at generation time.
// Custom instructions are appended if provided.
const TEMPLATES = {
  wildfire: {
    advisory: {
      title: 'Wildfire Advisory',
      body: 'A wildfire advisory has been issued for {area}. Stay informed and monitor local conditions. No immediate action required, but review your go-bag and evacuation routes.',
    },
    watch: {
      title: 'Wildfire Watch',
      body: 'Conditions are favorable for wildfire development in {area}. Review your evacuation plan, load your vehicle, and be ready to leave at a moment\u2019s notice.',
    },
    warning: {
      title: 'Wildfire Warning \u2014 Evacuate Now',
      body: 'A wildfire is occurring or imminent in {area}. Execute your evacuation plan immediately. Follow designated evacuation routes and do not return until cleared by authorities.',
    },
    critical: {
      title: 'CRITICAL: Wildfire Emergency',
      body: 'A life-threatening wildfire emergency is in effect for {area}. Evacuate immediately \u2014 this is not a drill. Follow evacuation routes, assist those who need help, and seek shelter outside the affected zone.',
    },
  },
  flood: {
    advisory: {
      title: 'Flood Advisory',
      body: 'A flood advisory has been issued for {area}. Be aware of potential localized flooding. Avoid low-lying areas and monitor conditions.',
    },
    watch: {
      title: 'Flood Watch',
      body: 'A flood watch is in effect for {area}. Conditions are favorable for flooding. Move valuables to higher ground, charge devices, and be prepared to evacuate if water rises.',
    },
    warning: {
      title: 'Flood Warning',
      body: 'Flooding is occurring or imminent in {area}. Move to higher ground immediately. Do not drive through flooded roads \u2014 turn around, don\u2019t drown.',
    },
    critical: {
      title: 'CRITICAL: Flash Flood Emergency',
      body: 'A life-threatening flash flood emergency is in effect for {area}. Seek higher ground immediately. Do not attempt to drive \u2014 moving water can sweep vehicles away.',
    },
  },
  hurricane: {
    advisory: {
      title: 'Tropical Storm Advisory',
      body: 'A tropical storm advisory has been issued for {area}. Secure outdoor items, charge devices, and monitor weather updates. No immediate evacuation required.',
    },
    watch: {
      title: 'Hurricane Watch',
      body: 'A hurricane watch is in effect for {area}. Hurricane conditions are possible within 48 hours. Review your evacuation plan, fuel your vehicle, and gather emergency supplies.',
    },
    warning: {
      title: 'Hurricane Warning',
      body: 'A hurricane warning is in effect for {area}. Hurricane conditions are expected within 36 hours. Complete storm preparations now and follow evacuation orders if issued.',
    },
    critical: {
      title: 'CRITICAL: Hurricane Emergency',
      body: 'A life-threatening hurricane is impacting {area}. Shelter in place in an interior room, or evacuate if ordered. Do not go outside during the eye \u2014 the storm is not over.',
    },
  },
  tornado: {
    advisory: {
      title: 'Tornado Advisory',
      body: 'A tornado advisory has been issued for {area}. Conditions could support tornado development. Identify your shelter location and stay weather-aware.',
    },
    watch: {
      title: 'Tornado Watch',
      body: 'A tornado watch is in effect for {area}. Tornadoes are possible. Review where you will take shelter \u2014 lowest floor, interior room, away from windows.',
    },
    warning: {
      title: 'Tornado Warning \u2014 Take Shelter Now',
      body: 'A tornado has been spotted or indicated by radar for {area}. Take shelter immediately in a basement or interior room on the lowest floor. Protect your head and stay away from windows.',
    },
    critical: {
      title: 'CRITICAL: Tornado Emergency',
      body: 'A confirmed destructive tornado is on the ground in {area}. This is a life-threatening situation. Take shelter immediately in the safest interior location available. Do not leave until the all-clear is given.',
    },
  },
  earthquake: {
    advisory: {
      title: 'Earthquake Advisory',
      body: 'An earthquake was felt in {area}. Check for damage, gas leaks, and structural issues. Be prepared for aftershocks.',
    },
    watch: {
      title: 'Earthquake Watch',
      body: 'Elevated seismic activity has been detected near {area}. Secure heavy furniture, review your household emergency plan, and keep shoes and a flashlight near your bed.',
    },
    warning: {
      title: 'Earthquake Warning',
      body: 'A significant earthquake has occurred near {area}. Drop, cover, and hold on if shaking continues. After shaking stops, check for injuries and gas leaks before evacuating.',
    },
    critical: {
      title: 'CRITICAL: Major Earthquake',
      body: 'A major earthquake has struck {area}. Expect significant aftershocks. Check for injuries, gas leaks, and structural damage. Evacuate damaged buildings. Listen to authorities for shelter and aid locations.',
    },
  },
  severe_weather: {
    advisory: {
      title: 'Severe Weather Advisory',
      body: 'A severe weather advisory has been issued for {area}. Monitor conditions and be prepared for changing weather. Limit outdoor activities if possible.',
    },
    watch: {
      title: 'Severe Weather Watch',
      body: 'A severe weather watch is in effect for {area}. Thunderstorms, high winds, or extreme temperatures are possible. Secure outdoor items and stay weather-aware.',
    },
    warning: {
      title: 'Severe Weather Warning',
      body: 'Severe weather is occurring or imminent in {area}. Seek shelter indoors, avoid travel, and stay away from windows. Monitor local weather broadcasts for updates.',
    },
    critical: {
      title: 'CRITICAL: Extreme Weather Emergency',
      body: 'A life-threatening extreme weather event is in effect for {area}. Seek shelter immediately. Do not travel. If you lose power, use emergency supplies and stay indoors until conditions improve.',
    },
  },
  evacuation: {
    advisory: {
      title: 'Evacuation Advisory',
      body: 'An evacuation advisory has been issued for {area}. Prepare to evacuate if conditions worsen. Load your go-bag, fuel your vehicle, and plan your route.',
    },
    watch: {
      title: 'Voluntary Evacuation',
      body: 'A voluntary evacuation has been recommended for {area}. If you need extra time to leave (medical needs, livestock, large family), evacuate now. Others should be ready to leave quickly.',
    },
    warning: {
      title: 'Mandatory Evacuation Order',
      body: 'A mandatory evacuation has been ordered for {area}. Leave immediately using designated evacuation routes. Take your go-bag, pets, and essential medications. Do not delay.',
    },
    critical: {
      title: 'CRITICAL: Immediate Evacuation',
      body: 'An immediate, life-threatening evacuation has been ordered for {area}. Leave RIGHT NOW. Do not gather belongings \u2014 take only what is at hand. Follow evacuation routes and seek shelter outside the affected zone.',
    },
  },
  shelter_open: {
    advisory: {
      title: 'Shelter Information',
      body: 'An emergency shelter is being prepared in {area}. It is not yet open but will be available soon. Monitor for the opening announcement.',
    },
    watch: {
      title: 'Shelter Standby',
      body: 'An emergency shelter in {area} is on standby and may open shortly. If you may need sheltering, plan your route to the location now.',
    },
    warning: {
      title: 'Shelter Now Open',
      body: 'An emergency shelter is now open in {area}. The shelter is accepting evacuees. Bring your go-bag, medications, and identification. Pets may be accommodated \u2014 check on arrival.',
    },
    critical: {
      title: 'CRITICAL: Emergency Shelter Open',
      body: 'An emergency shelter is open in {area} for those displaced by the current emergency. If you cannot safely shelter in place, proceed to the shelter immediately. Bring essentials and medications.',
    },
  },
  shelter_close: {
    advisory: {
      title: 'Shelter Closing Notice',
      body: 'The emergency shelter in {area} will begin winding down operations. Plan for transition to longer-term housing if needed.',
    },
    watch: {
      title: 'Shelter Preparing to Close',
      body: 'The emergency shelter in {area} is preparing to close within 24 hours. If you are currently sheltering there, make arrangements for transition. Staff can connect you with recovery resources.',
    },
    warning: {
      title: 'Shelter Closing Today',
      body: 'The emergency shelter in {area} is closing today. All evacuees must depart by the announced time. Transition assistance and recovery resources are available on-site \u2014 ask shelter staff before leaving.',
    },
    critical: {
      title: 'Shelter Closed',
      body: 'The emergency shelter in {area} has closed. If you still need assistance, contact {org_name} or call 211 for recovery resources and longer-term housing support.',
    },
  },
  active_shooter: {
    advisory: {
      title: 'Security Advisory',
      body: 'A security advisory has been issued for {area}. Be aware of your surroundings and report suspicious activity. No confirmed threat at this time.',
    },
    watch: {
      title: 'Security Alert \u2014 Shelter in Place',
      body: 'A security alert is in effect for {area}. There may be an active threat in the area. Shelter in place, lock doors, and stay away from windows. Monitor official channels for updates.',
    },
    warning: {
      title: 'Active Threat \u2014 Lock Down Now',
      body: 'An active threat has been reported in {area}. Lock down immediately: secure doors, turn off lights, silence phones, and hide out of sight. Do not open doors for anyone unless verified by law enforcement. Call 911 if safe to do so.',
    },
    critical: {
      title: 'CRITICAL: Active Shooter',
      body: 'An active shooter situation is in progress in {area}. Run, hide, fight \u2014 in that order. If you can escape safely, do so now. If you cannot escape, hide and barricade. As a last resort, defend yourself. Call 911 when safe.',
    },
  },
  custom: {
    advisory: {
      title: '{org_name} \u2014 Advisory',
      body: '{custom_message}',
    },
    watch: {
      title: '{org_name} \u2014 Watch',
      body: '{custom_message}',
    },
    warning: {
      title: '{org_name} \u2014 Warning',
      body: '{custom_message}',
    },
    critical: {
      title: 'CRITICAL: {org_name} Alert',
      body: '{custom_message}',
    },
  },
};

/**
 * Generate a unified alert message (title + body) for a given incident type and event level.
 * The same output is used for both email and Telegram.
 *
 * @param {string} incidentType - e.g. 'wildfire', 'flood', 'custom'
 * @param {string} eventLevel - 'advisory', 'watch', 'warning', 'critical'
 * @param {object} params - { area, org_name, instructions, custom_message }
 * @returns {{ title: string, body: string }}
 */
export function generateAlertMessage(incidentType, eventLevel, params = {}) {
  const typeTemplates = TEMPLATES[incidentType] || TEMPLATES.custom;
  const template = typeTemplates[eventLevel] || typeTemplates.advisory;

  let title = template.title || 'Alert';
  let body = template.body || '';

  const area = params.area || 'the affected area';
  const orgName = params.org_name || 'RallyPack';
  const customMessage = params.custom_message || '';

  title = title.replace(/\{org_name\}/g, orgName);
  body = body
    .replace(/\{area\}/g, area)
    .replace(/\{org_name\}/g, orgName)
    .replace(/\{custom_message\}/g, customMessage);

  // Append custom instructions if provided and not a custom message type
  if (params.instructions && params.instructions.trim() && incidentType !== 'custom') {
    body += `\n\nAdditional instructions: ${params.instructions.trim()}`;
  }

  return { title, body };
}

// Whether this event level requires dual delivery (email + Telegram)
// regardless of user notification preferences.
export function requiresDualDelivery(eventLevel) {
  return eventLevel === 'critical';
}