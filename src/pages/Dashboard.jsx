import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Package, MapPin, Plus } from "lucide-react";
import WeatherCard from "../components/dashboard/WeatherCard";
import StatsCard from "../components/dashboard/StatsCard";
import NotificationsList from "../components/dashboard/NotificationsList";
import QuickActions from "../components/dashboard/QuickActions";
import PreparednessTips from "../components/dashboard/PreparednessTips";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [caches, setCaches] = useState([]);
  const [meetSpots, setMeetSpots] = useState([]);
  const [firstAidItems, setFirstAidItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      
      // Use secure backend functions for data access
      const [profileData, cachesResponse, spotsResponse, firstAidData, notifData, allRecs, pets, familyData] = await Promise.all([
        base44.entities.UserProfile.list(),
        base44.functions.invoke('getCaches'),
        base44.functions.invoke('getMeetSpots'),
        base44.entities.FirstAidItem.list(),
        base44.entities.Notification.list("-created_date", 10),
        base44.entities.ProductRecommendation.filter({ active: true }, "-priority", 3),
        base44.entities.Pet.list(),
        base44.entities.FamilyMember.list()
      ]);

      const cachesData = cachesResponse.data.caches;
      const filteredSpots = spotsResponse.data.spots;

      if (profileData.length > 0) {
        setUserProfile(profileData[0]);
        // Fetch weather if location is set
        if (profileData[0].latitude && profileData[0].longitude) {
          fetchWeather(profileData[0].latitude, profileData[0].longitude, profileData[0].country);
        }
      }
      
      setCaches(cachesData);
      setMeetSpots(filteredSpots);
      setFirstAidItems(firstAidData);
      setFamilyMembers(familyData);
      setUserEmail(user.email);

      // If no notifications, add top recommendations
      if (notifData.length === 0) {
        const familyTypes = ['person'];
        pets.forEach(pet => {
          const petType = pet.species?.toLowerCase();
          if (petType && !familyTypes.includes(petType)) {
            familyTypes.push(petType);
          }
        });

        const relevantRecs = allRecs.filter(rec => {
          if (rec.family_member_types && rec.family_member_types.length > 0) {
            return rec.family_member_types.some(type => familyTypes.includes(type?.toLowerCase()));
          }
          return true;
        }).slice(0, 3);

        const recNotifications = relevantRecs.map(rec => ({
          id: `rec_${rec.id}`,
          title: `Recommended: ${rec.item_name}`,
          message: rec.description || `Consider adding this to your emergency cache`,
          type: "info",
          read: false,
          recommendation: rec
        }));

        setNotifications(recNotifications);
      } else {
        setNotifications(notifData);
        
        // Check for evacuation notices in notifications
        const hasEvacuationNotice = notifData.some(notif => 
          notif.title.toLowerCase().includes('evacuation') || 
          notif.message.toLowerCase().includes('evacuation') ||
          notif.type === 'alert'
        );
        if (hasEvacuationNotice) {
          setEmergencyMode(true);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lon, country) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=1`
      );
      const data = await response.json();
      
      if (data.current) {
        const weatherCodes = {
          0: "Clear sky",
          1: "Mainly clear",
          2: "Partly cloudy",
          3: "Overcast",
          45: "Foggy",
          48: "Depositing rime fog",
          51: "Light drizzle",
          53: "Moderate drizzle",
          55: "Dense drizzle",
          61: "Slight rain",
          63: "Moderate rain",
          65: "Heavy rain",
          71: "Slight snow",
          73: "Moderate snow",
          75: "Heavy snow",
          77: "Snow grains",
          80: "Slight rain showers",
          81: "Moderate rain showers",
          82: "Violent rain showers",
          95: "Thunderstorm",
          96: "Thunderstorm with hail"
        };

        // Check if user is in United States to use Fahrenheit
        const isUS = country && (country.toLowerCase().includes("united states") || country.toLowerCase() === "usa");
        const tempUnit = isUS ? "°F" : "°C";

        // Convert Celsius to Fahrenheit if needed
        const convertTemp = (celsius) => {
          if (isUS) {
            return Math.round((celsius * 9/5) + 32);
          }
          return Math.round(celsius);
        };

        setWeather({
          temperature: convertTemp(data.current.temperature_2m),
          feelsLike: convertTemp(data.current.apparent_temperature),
          description: weatherCodes[data.current.weather_code] || "Unknown",
          wind: `${Math.round(data.current.wind_speed_10m)} km/h`,
          humidity: `${Math.round(data.current.relative_humidity_2m)}%`,
          precipitation: `${data.current.precipitation} mm`,
          cloudCover: `${data.current.cloud_cover}%`,
          highLow: data.daily ? `H: ${convertTemp(data.daily.temperature_2m_max[0])}${tempUnit} / L: ${convertTemp(data.daily.temperature_2m_min[0])}${tempUnit}` : null,
          unit: tempUnit
        });

        // Generate alerts based on weather conditions
        const generatedAlerts = [];
        const code = data.current.weather_code;
        const windSpeed = data.current.wind_speed_10m;
        const precipitation = data.current.precipitation;
        
        // Severe weather alerts
        if (code >= 95) {
          generatedAlerts.push({
            title: "Thunderstorm Warning",
            message: "Severe thunderstorm detected in your area. Move to safe shelter immediately.",
            severity: "danger"
          });
          setEmergencyMode(true);
        }
        
        // Heavy rain/snow alerts
        if ((code >= 63 && code <= 65) || (code >= 73 && code <= 75)) {
          generatedAlerts.push({
            title: code >= 70 ? "Heavy Snow Alert" : "Heavy Rain Alert",
            message: `Heavy ${code >= 70 ? 'snowfall' : 'rainfall'} may cause flooding or hazardous conditions.`,
            severity: "warning"
          });
        }
        
        // High wind alert
        if (windSpeed > 50) {
          generatedAlerts.push({
            title: "High Wind Warning",
            message: `Strong winds at ${Math.round(windSpeed)} km/h. Secure outdoor items.`,
            severity: "warning"
          });
        }
        
        // Active precipitation
        if (precipitation > 5) {
          generatedAlerts.push({
            title: "Active Precipitation",
            message: `Heavy precipitation detected: ${precipitation} mm. Exercise caution.`,
            severity: "warning"
          });
        }
        
        setAlerts(generatedAlerts);
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  const expiringItems = firstAidItems.filter(item => {
    if (!item.expiration_date) return false;
    const expDate = new Date(item.expiration_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expDate <= thirtyDaysFromNow;
  });

  const primaryMeetSpot = meetSpots.find(spot => spot.is_primary);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Emergency View - Simplified for crisis situations
  if (emergencyMode) {
    return (
      <div className="min-h-screen bg-red-50">
        {/* Emergency Header */}
        <div className="bg-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">⚠️ EMERGENCY MODE</h1>
                <p className="text-red-100 mt-1">Critical alerts active in your area</p>
              </div>
              <button
                onClick={() => setEmergencyMode(false)}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg text-sm"
              >
                Exit Emergency View
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Active Alerts */}
          {alerts.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-4 border-red-500">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Active Alerts</h2>
              <div className="space-y-3">
                {alerts.map((alert, idx) => (
                  <div key={idx} className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                    <h3 className="font-bold text-lg text-red-900">{alert.title}</h3>
                    <p className="text-red-800 mt-1">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evacuation Notifications */}
          {notifications.filter(n => n.type === 'alert' || n.title.toLowerCase().includes('evacuation')).length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-4 border-orange-500">
              <h2 className="text-2xl font-bold text-orange-600 mb-4">Evacuation Notices</h2>
              <div className="space-y-3">
                {notifications
                  .filter(n => n.type === 'alert' || n.title.toLowerCase().includes('evacuation'))
                  .map((notif, idx) => (
                    <div key={idx} className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <h3 className="font-bold text-lg text-orange-900">{notif.title}</h3>
                      <p className="text-orange-800 mt-1">{notif.message}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Primary Meet Spot */}
          {primaryMeetSpot && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-500">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">📍 Primary Meeting Point</h2>
              <div className="text-lg">
                <p className="font-bold text-gray-900 text-2xl">{primaryMeetSpot.name}</p>
                {primaryMeetSpot.address && (
                  <p className="text-gray-700 mt-2">{primaryMeetSpot.address}</p>
                )}
                {primaryMeetSpot.description && (
                  <p className="text-gray-600 mt-3">{primaryMeetSpot.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => navigate(createPageUrl("Resources"))}
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-xl font-bold shadow-lg"
            >
              📦 View Emergency Caches
            </button>
            <button
              onClick={() => navigate(createPageUrl("Resources") + "?tab=meetspots")}
              className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-xl font-bold shadow-lg"
            >
              🗺️ All Meet Spots
            </button>
            <button
              onClick={() => navigate(createPageUrl("Resources") + "?tab=firstaid")}
              className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-lg text-xl font-bold shadow-lg"
            >
              🏥 First Aid Supplies
            </button>
            <button
              onClick={() => navigate(createPageUrl("Emergency"))}
              className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-xl font-bold shadow-lg"
            >
              📞 Emergency Contacts
            </button>
          </div>

          {/* Weather Info */}
          {weather && (
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-300">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Current Weather</h2>
              <div className="grid grid-cols-2 gap-4 text-lg">
                <div>
                  <span className="text-gray-600">Temperature:</span>
                  <span className="font-bold ml-2">{weather.temperature}{weather.unit}</span>
                </div>
                <div>
                  <span className="text-gray-600">Conditions:</span>
                  <span className="font-bold ml-2">{weather.description}</span>
                </div>
                <div>
                  <span className="text-gray-600">Wind:</span>
                  <span className="font-bold ml-2">{weather.wind}</span>
                </div>
                <div>
                  <span className="text-gray-600">Precipitation:</span>
                  <span className="font-bold ml-2">{weather.precipitation}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Onboarding Flow - Guide new users through setup
  const needsAddress = !userProfile || !userProfile.street_address;
  const needsFamilySetup = !needsAddress && familyMembers.length === 0;
  const needsMeetSpots = !needsAddress && !needsFamilySetup && meetSpots.length === 0;
  
  // Check if user has any caches they actually own (not just samples)
  const userOwnedCaches = caches.filter(cache => cache.created_by === userEmail);
  const needsCaches = !needsAddress && !needsFamilySetup && !needsMeetSpots && userOwnedCaches.length === 0;
  const isOnboarding = needsAddress || needsFamilySetup || needsMeetSpots || needsCaches;

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to RallyPack</h1>
            <p className="text-gray-500 mt-1">Let's get you prepared in 3 simple steps</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center ${needsAddress ? 'text-blue-600' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${needsAddress ? 'bg-blue-100' : 'bg-green-100'} mr-2`}>
                  {needsAddress ? '1' : '✓'}
                </div>
                <span className="font-medium text-sm">Address</span>
              </div>
              <div className={`flex items-center ${needsFamilySetup ? 'text-blue-600' : needsAddress ? 'text-gray-400' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${needsFamilySetup ? 'bg-blue-100' : needsAddress ? 'bg-gray-100' : 'bg-green-100'} mr-2`}>
                  {needsAddress ? '2' : needsFamilySetup ? '2' : '✓'}
                </div>
                <span className="font-medium text-sm">Family</span>
              </div>
              <div className={`flex items-center ${needsMeetSpots ? 'text-blue-600' : (needsAddress || needsFamilySetup) ? 'text-gray-400' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${needsMeetSpots ? 'bg-blue-100' : (needsAddress || needsFamilySetup) ? 'bg-gray-100' : 'bg-green-100'} mr-2`}>
                  {(needsAddress || needsFamilySetup) ? '3' : needsMeetSpots ? '3' : '✓'}
                </div>
                <span className="font-medium text-sm">Meet Spots</span>
              </div>
              <div className={`flex items-center ${needsCaches ? 'text-blue-600' : (needsAddress || needsFamilySetup || needsMeetSpots) ? 'text-gray-400' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${needsCaches ? 'bg-blue-100' : (needsAddress || needsFamilySetup || needsMeetSpots) ? 'bg-gray-100' : 'bg-green-100'} mr-2`}>
                  {(needsAddress || needsFamilySetup || needsMeetSpots) ? '4' : needsCaches ? '4' : '✓'}
                </div>
                <span className="font-medium text-sm">Caches</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: needsAddress ? '25%' : needsFamilySetup ? '50%' : needsMeetSpots ? '75%' : '100%' }}
              />
            </div>
          </div>

          {/* Step 1: Add Address */}
          {needsAddress && (
            <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-blue-500">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📍</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Add Your Primary Address</h2>
                <p className="text-gray-600">
                  Start by adding your home address. This helps us provide local weather alerts, personalized disaster preparedness recommendations, and region-specific emergency resources.
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Why this matters:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Real-time weather alerts and severe weather warnings</li>
                    <li>• FEMA region-specific disaster preparedness guidance</li>
                    <li>• Localized emergency supply recommendations</li>
                    <li>• Nearby shelter and resource location information</li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate(createPageUrl("Settings"))}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg text-lg font-bold shadow-lg transition-colors"
                >
                  Add Your Address Now
                </button>
                <p className="text-sm text-gray-500 text-center">
                  💡 You can update your address anytime in <strong>Settings</strong>
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Add Family Members */}
          {needsFamilySetup && !needsAddress && (
            <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-purple-500">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👨‍👩‍👧‍👦</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 2: Add Your Family Members</h2>
                <p className="text-gray-600">
                  Add everyone in your household. This helps us personalize your emergency plans and supply recommendations.
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Why this matters:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Tailored supply recommendations for your family size</li>
                    <li>• Medical needs tracking for each person</li>
                    <li>• Emergency contact information all in one place</li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate(createPageUrl("Settings"))}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg text-lg font-bold shadow-lg transition-colors"
                >
                  Add Family Members Now
                </button>
                <p className="text-sm text-gray-500 text-center">
                  💡 You can add or update family members anytime in <strong>Settings</strong>
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Add Meet Spots */}
          {needsMeetSpots && !needsAddress && !needsFamilySetup && (
            <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-green-500">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📍</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 3: Define Your Meet Spots</h2>
                <p className="text-gray-600">
                  Set up safe meeting locations where your family can reunite during an emergency. FEMA recommends having spots in all four cardinal directions.
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Why this matters:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Ensures everyone knows where to go in a crisis</li>
                    <li>• Multiple locations for different emergency scenarios</li>
                    <li>• Peace of mind knowing your family has a plan</li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate(createPageUrl("Resources") + "?tab=meetspots")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg text-lg font-bold shadow-lg transition-colors"
                >
                  Set Up Meet Spots Now
                </button>
                <p className="text-sm text-gray-500 text-center">
                  💡 You can manage meet spots anytime in <strong>Resources → Meet Spots tab</strong>
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Build Caches */}
          {needsCaches && !needsAddress && !needsFamilySetup && !needsMeetSpots && (
            <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-orange-500">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📦</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 4: Build Your Emergency Caches</h2>
                <p className="text-gray-600">
                  Create organized supply caches (Go Bag, Car Kit, Home Supplies) to ensure you're ready for any situation.
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Why this matters:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Track what supplies you have and what you need</li>
                    <li>• Get personalized recommendations based on your family</li>
                    <li>• Monitor expiration dates and stay prepared</li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate(createPageUrl("Resources"))}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-lg text-lg font-bold shadow-lg transition-colors"
                >
                  Create Your First Cache
                </button>
                <p className="text-sm text-gray-500 text-center">
                  💡 You can manage caches anytime in <strong>Resources → Caches tab</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Normal Dashboard View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Emergency Dashboard</h1>
          <p className="text-gray-500 mt-1">Stay prepared and informed with your personalized emergency management hub</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weather Card */}
            <WeatherCard weather={weather} alerts={alerts} />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                title="Caches"
                count={caches.length}
                subtitle={caches.length > 0 ? `${caches[0]?.name || "Emergency Kit"} - Updated recently` : "No caches yet"}
                icon={Package}
                onView={() => navigate(createPageUrl("Resources"))}
                completionPercent={caches.length > 0 ? Math.round((caches[0].items?.length || 0) / 20 * 100) : 0}
              />
              <StatsCard
                title="Meet Spots"
                count={meetSpots.length}
                subtitle={primaryMeetSpot ? `Primary: ${primaryMeetSpot.name}` : meetSpots.length > 0 ? "Set up directional coverage" : "No meet spots set"}
                icon={MapPin}
                onView={() => navigate(createPageUrl("Resources") + "?tab=meetspots")}
              />
              <StatsCard
                title="First Aid Tracker"
                count={firstAidItems.length}
                subtitle={expiringItems.length > 0 ? `${expiringItems.length} items expiring within 30 days` : "All items in good condition"}
                icon={Plus}
                onView={() => navigate(createPageUrl("Resources") + "?tab=firstaid")}
              />
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Preparedness Tips */}
            <PreparednessTips />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <NotificationsList 
              notifications={notifications} 
              onViewAll={() => {}} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}