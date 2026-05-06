import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Package, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import WeatherCard from "../components/dashboard/WeatherCard";
import StatsCard from "../components/dashboard/StatsCard";
import NotificationsList from "../components/dashboard/NotificationsList";
import QuickActions from "../components/dashboard/QuickActions";
import PreparednessTips from "../components/dashboard/PreparednessTips";
import StructuredAddressInput from "../components/settings/StructuredAddressInput";
import ReadinessScore from "../components/dashboard/ReadinessScore";
import SafetyBeacon from "../components/dashboard/SafetyBeacon";
import FamilyMemberForm from "../components/onboarding/FamilyMemberForm";
import TermsAgreement from "../components/onboarding/TermsAgreement";
import { safeSessionGet, safeSessionSet } from "../lib/utils";

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
  const [dataLoaded, setDataLoaded] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [pets, setPets] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [familyStepCompleted, setFamilyStepCompleted] = useState(false);
  const [locationForm, setLocationForm] = useState({
    display_name: "",
    street_address: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "",
    latitude: null,
    longitude: null
  });

  const handleLocationFieldChange = (field, value) => {
    setLocationForm({
      ...locationForm,
      [field]: value
    });
  };

  const handleSaveAddress = async () => {
    try {
      console.log("Saving address:", locationForm);
      
      // Validate required fields
      if (!locationForm.street_address || !locationForm.city || !locationForm.state_province || !locationForm.postal_code || !locationForm.country) {
        alert("Please fill in all required address fields");
        return;
      }
      
      // Determine FEMA region
      let femaRegion = null;
      if (locationForm.state_province) {
        const regionResponse = await base44.functions.invoke('determineFemaRegion', {
          state: locationForm.state_province
        });
        femaRegion = regionResponse.data.fema_region;
      }
      
      // Clean and prepare data
      const cleanedData = {
        display_name: locationForm.display_name,
        street_address: locationForm.street_address,
        city: locationForm.city,
        state_province: locationForm.state_province,
        postal_code: locationForm.postal_code,
        country: locationForm.country,
        latitude: locationForm.latitude ? Number(locationForm.latitude) : undefined,
        longitude: locationForm.longitude ? Number(locationForm.longitude) : undefined,
        fema_region: femaRegion,
        has_children: familyMembers.length > 0,
        has_pets: pets.length > 0,
        household_size: 1 + familyMembers.length
      };
      
      await base44.entities.UserProfile.create(cleanedData);
      console.log("Address saved successfully");
      
      // Reload data to update state
      await loadData();
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address. Please try again.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      setUserEmail(user.email);
      
      // Load critical data for onboarding check
      const [profileData, petsData, familyData] = await Promise.all([
        base44.entities.UserProfile.filter({ created_by: user.email }),
        base44.entities.Pet.filter({ created_by: user.email }),
        base44.entities.FamilyMember.filter({ created_by: user.email })
      ]);

      if (profileData.length > 0) {
        setUserProfile(profileData[0]);
        // Fetch weather in background
        if (profileData[0].latitude && profileData[0].longitude) {
          fetchWeather(profileData[0].latitude, profileData[0].longitude, profileData[0].country);
        }
      }
      
      setFamilyMembers(familyData);
      setPets(petsData);
      setDataLoaded(true);
      setLoading(false);
      
      // Load everything else in background
      Promise.all([
        base44.functions.invoke('getCaches'),
        base44.functions.invoke('getMeetSpots'),
        base44.entities.FirstAidItem.filter({ created_by: user.email }),
        base44.entities.Notification.filter({ created_by: user.email }, "-created_date", 10),
        base44.entities.ProductRecommendation.filter({ active: true }, "-priority", 3)
      ]).then(([cachesResponse, spotsResponse, firstAidData, notifData, allRecs]) => {
        const cachesData = cachesResponse.data.caches;
        const filteredSpots = spotsResponse.data.spots;

        setCaches(cachesData);
        setMeetSpots(filteredSpots);
        setFirstAidItems(firstAidData);

        // If no notifications, add top recommendations
        if (notifData.length === 0) {
          const familyTypes = ['person'];
          petsData.forEach(pet => {
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
      });
    } catch (error) {
      console.error("Error loading data:", error);
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
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" role="status" aria-label="Loading dashboard"></div>
      </div>
    );
  }

  // Emergency View - Simplified for crisis situations
  if (emergencyMode) {
    return (
      <div className="min-h-screen bg-red-50">
        {/* Emergency Header */}
        <div className="bg-red-600 text-white" role="alert" aria-live="assertive">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">⚠️ EMERGENCY MODE</h1>
                <p className="text-red-100 mt-1">Critical alerts active in your area</p>
              </div>
              <button
                onClick={() => setEmergencyMode(false)}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg text-sm"
                aria-label="Exit emergency mode view"
              >
                Exit Emergency View
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Active Alerts */}
          {alerts.length > 0 && (
            <section className="bg-white rounded-lg shadow-lg p-6 mb-6 border-4 border-red-500" aria-labelledby="active-alerts-heading">
              <h2 id="active-alerts-heading" className="text-2xl font-bold text-red-600 mb-4">Active Alerts</h2>
              <div className="space-y-3">
                {alerts.map((alert, idx) => (
                  <div key={idx} className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500" role="alert">
                    <h3 className="font-bold text-lg text-red-900">{alert.title}</h3>
                    <p className="text-red-800 mt-1">{alert.message}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Evacuation Notifications */}
          {notifications.filter(n => n.type === 'alert' || n.title.toLowerCase().includes('evacuation')).length > 0 && (
            <section className="bg-white rounded-lg shadow-lg p-6 mb-6 border-4 border-orange-500" aria-labelledby="evacuation-notices-heading">
              <h2 id="evacuation-notices-heading" className="text-2xl font-bold text-orange-600 mb-4">Evacuation Notices</h2>
              <div className="space-y-3">
                {notifications
                  .filter(n => n.type === 'alert' || n.title.toLowerCase().includes('evacuation'))
                  .map((notif, idx) => (
                    <div key={idx} className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500" role="alert">
                      <h3 className="font-bold text-lg text-orange-900">{notif.title}</h3>
                      <p className="text-orange-800 mt-1">{notif.message}</p>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Primary Meet Spot */}
          {primaryMeetSpot && (
            <section className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-500" aria-labelledby="primary-meetspot-heading">
              <h2 id="primary-meetspot-heading" className="text-2xl font-bold text-blue-600 mb-4">📍 Primary Meeting Point</h2>
              <div className="text-lg">
                <p className="font-bold text-gray-900 text-2xl">{primaryMeetSpot.name}</p>
                {primaryMeetSpot.address && (
                  <p className="text-gray-700 mt-2">{primaryMeetSpot.address}</p>
                )}
                {primaryMeetSpot.description && (
                  <p className="text-gray-600 mt-3">{primaryMeetSpot.description}</p>
                )}
              </div>
            </section>
          )}

          {/* Quick Actions */}
          <nav className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" aria-label="Emergency quick actions">
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
          </nav>

          {/* Weather Info */}
          {weather && (
            <section className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-300" aria-labelledby="current-weather-heading">
              <h2 id="current-weather-heading" className="text-xl font-bold text-gray-800 mb-3">Current Weather</h2>
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
            </section>
          )}
        </div>
      </div>
    );
  }

  // Onboarding Flow
  const sessionTermsKey = "rallypack_terms_ack_session";
  const sessionTermsAcked = safeSessionGet(sessionTermsKey) === "true";
  const needsTermsAgreement = dataLoaded && (!sessionTermsAcked);

  // An "established" user has already added family members or has a complete address — don't force them through onboarding steps they haven't done
  const isEstablishedUser = familyMembers.length > 0;
  const needsAddress = dataLoaded && userProfile && !userProfile.street_address && !isEstablishedUser;
  const needsFamilySetup = dataLoaded && !familyStepCompleted && familyMembers.length === 0 && pets.length === 0 && !isEstablishedUser;
  const needsMeetSpots = dataLoaded && meetSpots.length === 0 && !needsAddress && !needsFamilySetup && !isEstablishedUser;
  const needsCaches = dataLoaded && caches.length === 0 && !needsAddress && !needsFamilySetup && !needsMeetSpots && !isEstablishedUser;
  const isOnboarding = !needsTermsAgreement && (needsAddress || needsFamilySetup || needsMeetSpots || needsCaches);

  if (needsTermsAgreement) {
    return (
      <TermsAgreement
        onAgree={async (version, date) => {
          try {
            safeSessionSet("rallypack_terms_ack_session", "true");
            if (userProfile) {
              await base44.entities.UserProfile.update(userProfile.id, {
                terms_agreed_version: version,
                terms_agreed_date: date
              });
            } else {
              await base44.entities.UserProfile.create({
                terms_agreed_version: version,
                terms_agreed_date: date
              });
            }
            await loadData();
          } catch (error) {
            console.error("Error recording terms agreement:", error);
          }
        }}
      />
    );
  }

  if (isOnboarding) {
    const currentStep = needsAddress ? 1 : needsFamilySetup ? 2 : needsMeetSpots ? 3 : 4;
    const progressPercent = (currentStep / 4) * 100;
    
    return (
      <div className="min-h-screen bg-cream font-sans">
        <div className="bg-white border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
            <span className="font-serif text-xl font-bold text-foreground">RallyPack</span>
            <p className="text-muted-foreground text-sm font-sans mt-0.5">Get prepared in 4 steps</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">
          {/* Progress Bar */}
          <section className="bg-white border border-border rounded p-5" aria-labelledby="onboarding-progress">
            <h2 id="onboarding-progress" className="sr-only">Onboarding Progress</h2>
            <div className="flex items-center justify-between mb-4" role="list">
              {["Address","Family","Meet Spots","Caches"].map((label, i) => {
                const stepNum = i + 1;
                const done = currentStep > stepNum;
                const active = currentStep === stepNum;
                return (
                  <div key={label} className={`flex items-center gap-1.5 text-xs font-sans ${active ? 'text-foreground font-semibold' : done ? 'text-primary' : 'text-muted-foreground'}`} role="listitem">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${active ? 'bg-foreground text-background' : done ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                      {done ? '✓' : stepNum}
                    </div>
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-secondary rounded-full h-1" role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100" aria-label={`Onboarding ${progressPercent}% complete`}>
              <div
                className="bg-foreground h-1 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="sr-only">You are on step {currentStep} of 4</p>
          </section>

          {needsAddress && (
            <article className="bg-white border border-border rounded p-7">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                  <span className="text-2xl">📍</span>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">Step 1: Add Your Home Address</h2>
                <p className="text-muted-foreground font-sans text-sm max-w-md mx-auto">
                  Your address enables localized weather alerts, tailored disaster recommendations, and nearby emergency resources.
                </p>
              </div>
              <div className="space-y-5">
                <div className="bg-secondary/50 p-4 rounded">
                  <h3 className="font-sans font-semibold text-foreground text-sm mb-2">Why it's essential:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Receive critical local weather and disaster alerts</li>
                    <li>• Get personalized recommendations for your region</li>
                    <li>• Find nearby shelters and emergency resources</li>
                  </ul>
                </div>
                
                <div className="p-6 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <Label>Your Name</Label>
                    <Input
                      value={locationForm.display_name}
                      onChange={(e) => setLocationForm({ ...locationForm, display_name: e.target.value })}
                      placeholder="e.g., John Smith"
                      className="bg-white"
                    />
                  </div>
                  
                  <StructuredAddressInput
                    formData={locationForm}
                    onFieldChange={handleLocationFieldChange}
                    onAddressSelect={(data) => setLocationForm({ ...locationForm, ...data })}
                  />
                </div>

                <Button
                  onClick={handleSaveAddress}
                  className="w-full bg-foreground text-background hover:bg-foreground/90 font-sans font-semibold py-3"
                  disabled={!locationForm.display_name || !locationForm.street_address || !locationForm.city || !locationForm.state_province}
                >
                  Save Address & Continue
                </Button>
                <p className="text-xs text-muted-foreground text-center font-sans">Update anytime in Settings</p>
              </div>
            </article>
          )}

          {/* Step 2 */}
          {needsFamilySetup && !needsAddress && (
            <article className="bg-white border border-border rounded p-7">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                  <span className="text-2xl">👨‍👩‍👧‍👦</span>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">Step 2: Add Your Family</h2>
                <p className="text-muted-foreground font-sans text-sm max-w-md mx-auto">Build your household roster so everyone gets the right supplies and stays connected.</p>
              </div>
              <div className="space-y-5">
                <div className="bg-secondary/50 p-4 rounded">
                  <h3 className="font-sans font-semibold text-foreground text-sm mb-2">Why this matters:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>Share emergency plans:</strong> Family members with emails can access your caches and meet spots</li>
                    <li>• <strong>Get personalized recommendations:</strong> Supplies tailored to your household's needs</li>
                    <li>• <strong>Track medical requirements:</strong> Keep everyone's health info organized</li>
                  </ul>
                </div>
                
                <FamilyMemberForm
                  onComplete={async (data) => {
                    try {
                      console.log("Saving family data:", data);
                      
                      // Save to database with cleaned data
                      for (const member of data.members) {
                        const cleanMember = {
                          name: member.name,
                          relationship: member.relationship,
                          age: member.age ? Number(member.age) : undefined,
                          medical_conditions: member.medical_conditions || undefined,
                          emergency_contact: member.emergency_contact || undefined,
                          link_status: member.link_status || "none"
                        };
                        await base44.entities.FamilyMember.create(cleanMember);
                      }
                      for (const pet of data.pets) {
                        const cleanPet = {
                          name: pet.name,
                          species: pet.species,
                          breed: pet.breed || undefined,
                          age: pet.age ? Number(pet.age) : undefined,
                          medical_conditions: pet.medical_conditions || undefined,
                          microchip_number: pet.microchip_number || undefined
                        };
                        await base44.entities.Pet.create(cleanPet);
                      }
                      
                      console.log("Family data saved successfully");
                      
                      // Mark step as complete and reload data
                      setFamilyStepCompleted(true);
                      await loadData();
                    } catch (error) {
                      console.error("Error saving family members and pets:", error);
                      alert("Failed to save family information. Please try again.");
                    }
                  }}
                  onSkip={async (data) => {
                    try {
                      // If there's data, save it before skipping
                      if (data && (data.members.length > 0 || data.pets.length > 0)) {
                        console.log("Saving family data before skip:", data);
                        
                        for (const member of data.members) {
                          const cleanMember = {
                            name: member.name,
                            relationship: member.relationship,
                            age: member.age ? Number(member.age) : undefined,
                            medical_conditions: member.medical_conditions || undefined,
                            emergency_contact: member.emergency_contact || undefined,
                            link_status: member.link_status || "none"
                          };
                          await base44.entities.FamilyMember.create(cleanMember);
                        }
                        for (const pet of data.pets) {
                          const cleanPet = {
                            name: pet.name,
                            species: pet.species,
                            breed: pet.breed || undefined,
                            age: pet.age ? Number(pet.age) : undefined,
                            medical_conditions: pet.medical_conditions || undefined,
                            microchip_number: pet.microchip_number || undefined
                          };
                          await base44.entities.Pet.create(cleanPet);
                        }
                        
                        console.log("Family data saved successfully");
                      }
                      
                      // Mark step as complete and reload
                      setFamilyStepCompleted(true);
                      await loadData();
                    } catch (error) {
                      console.error("Error during skip:", error);
                      alert("Failed to save family information. Please try again.");
                    }
                  }}
                />

                <p className="text-xs text-muted-foreground text-center font-sans">Update family anytime in Settings</p>
              </div>
            </article>
          )}

          {/* Step 3 */}
          {needsMeetSpots && !needsAddress && !needsFamilySetup && (
            <article className="bg-white border border-border rounded p-7">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                  <span className="text-2xl">📍</span>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">Step 3: Define Meeting Spots</h2>
                <p className="text-muted-foreground font-sans text-sm max-w-md mx-auto">When cell service fails, where will your family meet?</p>
              </div>
              <div className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded">
                  <h3 className="font-sans font-semibold text-foreground text-sm mb-2">Why it's essential:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>Cell service goes down</strong> in emergencies—you can't rely on phones</li>
                    <li>• Family members may be separated at work, school, or on the road</li>
                    <li>• Having predetermined spots in all directions prevents confusion</li>
                    <li>• FEMA recommends multiple meetup locations for different scenarios</li>
                  </ul>
                </div>
                <div className="bg-primary/5 border-l-2 border-primary p-4 rounded-r">
                  <p className="text-sm font-sans text-foreground">
                    <strong>Real scenario:</strong> During Hurricane Harvey, families couldn't contact each other for days. Those with pre-planned meeting spots reunited faster.
                  </p>
                </div>
                <button
                  onClick={() => navigate(createPageUrl("Resources") + "?tab=meetspots")}
                  className="w-full bg-foreground text-background hover:bg-foreground/90 py-3 rounded font-sans font-semibold transition-colors"
                >
                  Set Up Meeting Spots Now
                </button>
                <p className="text-xs text-muted-foreground text-center font-sans">Manage in Resources → Meet Spots</p>
              </div>
            </article>
          )}

          {/* Step 4 */}
          {needsCaches && !needsAddress && !needsFamilySetup && !needsMeetSpots && (
            <article className="bg-white border border-border rounded p-7">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                  <span className="text-2xl">📦</span>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">Step 4: Build Emergency Caches</h2>
                <p className="text-muted-foreground font-sans text-sm max-w-md mx-auto">Be prepared with the supplies that matter before you need them.</p>
              </div>
              <div className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded">
                  <h3 className="font-sans font-semibold text-foreground text-sm mb-2">Why it's essential:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>Many shelters require</strong> proof of medication and pet supplies</li>
                    <li>• Families without proper documentation get redirected or denied</li>
                    <li>• Having organized caches means you grab and go—no scrambling</li>
                    <li>• Track expiration dates so supplies are always ready</li>
                  </ul>
                </div>
                <div className="bg-primary/5 border-l-2 border-primary p-4 rounded-r">
                  <p className="text-sm font-sans text-foreground">
                    <strong>Common mistake:</strong> Arriving at shelters without pet supplies, prescriptions, or ID. These cause families to be turned away at critical moments.
                  </p>
                </div>
                <button
                  onClick={() => navigate(createPageUrl("Resources"))}
                  className="w-full bg-foreground text-background hover:bg-foreground/90 py-3 rounded font-sans font-semibold transition-colors"
                >
                  Create Your First Cache
                </button>
                <p className="text-xs text-muted-foreground text-center font-sans">Manage in Resources → Caches</p>
              </div>
            </article>
          )}
        </div>
      </div>
    );
  }

  // Normal Dashboard View
  return (
    <div className="min-h-screen bg-cream font-sans">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <p className="text-xs uppercase tracking-widest font-sans text-muted-foreground mb-0.5">Command Center</p>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Emergency Dashboard</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
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
            {/* Safety Beacon */}
            <SafetyBeacon />

            {/* Readiness Score */}
            <ReadinessScore />
            
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