import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Home, 
  Users, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  MapPin,
  Tent,
  Mountain,
  Backpack,
  Shield,
  ArrowRight
} from "lucide-react";

export default function LearnMore() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        setIsLoggedIn(!!user);
      } catch (e) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate(createPageUrl("Dashboard"));
    } else {
      base44.auth.redirectToLogin(window.location.pathname);
    }
  };
  const stats = [
    {
      value: "60%",
      label: "No emergency plan",
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      value: "40%",
      label: "Families separated",
      icon: Users,
      color: "text-orange-600"
    },
    {
      value: "75%",
      label: "Don't know relief orgs",
      icon: MapPin,
      color: "text-amber-600"
    },
    {
      value: "72hrs",
      label: "Avg. family separation",
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      value: "1 in 5",
      label: "Families turned away",
      subtitle: "Shelter Capacity Gap",
      icon: Home,
      color: "text-purple-600"
    },
    {
      value: "28",
      label: "Billion-Dollar Disasters",
      subtitle: "U.S. record in 2023",
      icon: AlertTriangle,
      color: "text-red-700"
    }
  ];

  const scenarios = [
    {
      title: "Shelter in Place",
      description: "When disasters strike, you may need to stay home for days without power, water, or supplies. Being prepared means having the essentials on hand.",
      icon: Home,
      image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&auto=format&fit=crop",
      items: ["Water & food for 72+ hours", "First aid supplies", "Battery-powered radio", "Emergency lighting"]
    },
    {
      title: "Evacuation Ready",
      description: "In emergencies like wildfires or floods, every second counts. A packed go-bag means you can leave immediately with everything critical.",
      icon: Backpack,
      image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop",
      items: ["Documents & medications", "Change of clothes", "Cash & phone charger", "Pet supplies"]
    },
    {
      title: "Outdoor Adventures",
      description: "Whether it's a weekend camping trip or a day hike, being prepared for the unexpected enhances your experience and keeps you safe.",
      icon: Mountain,
      image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&auto=format&fit=crop",
      items: ["Navigation tools", "Weather protection", "Emergency shelter", "Extra food & water"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-700 via-teal-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-8 h-8" />
            <span className="text-lg font-semibold">Why Preparedness Matters</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 max-w-3xl">
            200 Million Families Unprepared for Disasters
          </h1>
          <p className="text-xl text-emerald-50 max-w-2xl mb-8">
            During disasters, families are separated, communication fails, and relief resources are scattered. 
            This creates emotional distress, a $2B–$3.9B annual financial burden, and prolonged displacement for millions.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="bg-white text-emerald-700 hover:bg-emerald-50">
            Start Preparing Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">The Reality of Being Unprepared</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          These statistics from FEMA, American Red Cross, and NOAA paint a clear picture of why preparation isn't optional—it's essential.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <stat.icon className={`w-12 h-12 mx-auto mb-4 ${stat.color}`} />
                <div className={`text-4xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-gray-700 font-medium">{stat.label}</div>
                {stat.subtitle && (
                  <div className="text-sm text-gray-500 mt-1">{stat.subtitle}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-8 text-center">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <div className="text-5xl font-bold text-red-700 mb-2">$5K–$15K</div>
            <div className="text-xl text-gray-800 font-semibold">Average Family Cost Per Disaster</div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              The financial impact of being unprepared extends far beyond immediate needs—lost wages, temporary housing, 
              and replacing essential items add up quickly.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scenarios Section */}
      <div className="bg-gradient-to-b from-slate-50 to-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Be Ready for Any Scenario</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Whether you're sheltering at home, evacuating in an emergency, or heading into the wilderness, 
            the right preparation brings peace of mind and keeps necessities within reach.
          </p>

          <div className="space-y-8">
            {scenarios.map((scenario, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                  <div className={`relative h-64 md:h-auto ${index % 2 === 0 ? 'order-1' : 'order-2'}`}>
                    <img 
                      src={scenario.image} 
                      alt={scenario.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className={`p-8 flex flex-col justify-center ${index % 2 === 0 ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <scenario.icon className="w-6 h-6 text-emerald-700" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{scenario.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-6 text-lg">{scenario.description}</p>
                    <div className="space-y-2">
                      <div className="font-semibold text-gray-900 mb-3">Essential Items:</div>
                      {scenario.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Tent className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't Wait for an Emergency
          </h2>
          <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
            Join thousands of families who've taken control of their safety. Start building your emergency plan today—it's free, private, and could save lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="bg-white text-emerald-700 hover:bg-emerald-50">
              Get Started Free
            </Button>
          </div>
        </div>
      </div>

      {/* Sources */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            <strong>Sources:</strong> FEMA National Household Survey 2023, American Red Cross, NOAA 2023 Disasters Report
          </p>
        </div>
      </div>
    </div>
  );
}