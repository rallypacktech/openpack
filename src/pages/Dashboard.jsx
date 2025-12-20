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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, cachesData, spotsData, firstAidData, notifData] = await Promise.all([
        base44.entities.UserProfile.list(),
        base44.entities.EmergencyCache.list(),
        base44.entities.MeetSpot.list(),
        base44.entities.FirstAidItem.list(),
        base44.entities.Notification.list("-created_date", 10)
      ]);

      if (profileData.length > 0) {
        setUserProfile(profileData[0]);
        // Fetch weather if location is set
        if (profileData[0].latitude && profileData[0].longitude) {
          fetchWeather(profileData[0].latitude, profileData[0].longitude);
        }
      }
      
      setCaches(cachesData);
      setMeetSpots(spotsData);
      setFirstAidItems(firstAidData);
      setNotifications(notifData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
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

        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          feelsLike: Math.round(data.current.apparent_temperature),
          description: weatherCodes[data.current.weather_code] || "Unknown",
          wind: `${Math.round(data.current.wind_speed_10m)} km/h`
        });

        // Generate sample alerts based on weather
        const generatedAlerts = [];
        if (data.current.weather_code >= 95) {
          generatedAlerts.push({
            title: "Thunderstorm Warning",
            message: "Severe thunderstorm in your area. Seek shelter.",
            severity: "danger"
          });
        }
        if (data.current.weather_code >= 61 && data.current.weather_code <= 65) {
          generatedAlerts.push({
            title: "Flood Warning",
            message: "Possible overflow of river banks.",
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
              />
              <StatsCard
                title="Meet Spots"
                count={meetSpots.length}
                subtitle={primaryMeetSpot ? `${primaryMeetSpot.name} - ${primaryMeetSpot.address || "Primary"}` : "No meet spots set"}
                icon={MapPin}
                onView={() => navigate(createPageUrl("Resources"))}
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