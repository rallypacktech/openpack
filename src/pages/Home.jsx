import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Shield, Users, Package, AlertTriangle, Cloud, Heart, MapPin, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = React.useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          navigate(createPageUrl("Dashboard"));
        } else {
          setAuthChecked(true);
        }
      } catch (e) {
        // Not logged in, stay on home page
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGetStarted = () => {
    base44.auth.redirectToLogin(window.location.pathname);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-600">RallyPack</span>
              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">BETA</span>
            </div>
            <Button onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Be Ready for Anything,<br />
            <span className="text-blue-600">Wherever Life Takes You</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your family's emergency preparedness companion. Track supplies, plan meet spots, 
            protect your pets, and stay informed—all in one secure place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGetStarted} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
            >
              Get Started Free
            </Button>
            <Link to={createPageUrl("LearnMore")}>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            ✓ Always free  ✓ Your data stays private  ✓ No credit card required
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Stay Prepared
          </h2>
          <p className="text-lg text-gray-600">
            Built for adventurers, travelers, and families who value safety
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Emergency Caches */}
          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Your Gear</h3>
              <p className="text-gray-600">
                Organize go-bags, car kits, and home supplies. Track expiration dates 
                so you're always ready when it matters.
              </p>
            </CardContent>
          </Card>

          {/* Weather Alerts */}
          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Weather Alerts</h3>
              <p className="text-gray-600">
                Get personalized alerts for severe weather at your home and destinations. 
                Stay ahead of storms while camping or traveling.
              </p>
            </CardContent>
          </Card>

          {/* Pet Safety */}
          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pet Emergency Info</h3>
              <p className="text-gray-600">
                Store microchip numbers, vet contacts, and medical needs. 
                Keep your furry family members safe in any situation.
              </p>
            </CardContent>
          </Card>

          {/* Family Coordination */}
          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Family Coordination</h3>
              <p className="text-gray-600">
                Set emergency meet spots, share contact info, and keep medical 
                details organized for everyone.
              </p>
            </CardContent>
          </Card>

          {/* Location Tracking */}
          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Location Support</h3>
              <p className="text-gray-600">
                Monitor weather for your home address, vacation spots, 
                or anywhere your adventures take you.
              </p>
            </CardContent>
          </Card>

          {/* Offline Access */}
          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Cloud className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Works Offline</h3>
              <p className="text-gray-600">
                Access critical emergency info even without internet. 
                Perfect for remote camping or during power outages.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Data. Your Privacy. Your Control.
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              We use enterprise-grade encryption and never sell your information. 
              Your family's safety data stays private and secure.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <div className="font-semibold">AES-256 Encryption</div>
              </div>
              <div>
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <div className="font-semibold">SOC 2 Compliant</div>
              </div>
              <div>
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <div className="font-semibold">GDPR & CCPA Ready</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Early Stage Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              🚀 We're Growing With You
            </h3>
            <p className="text-gray-700 max-w-2xl mx-auto mb-4">
              RallyPack is in early beta, which means we're actively building new features 
              and listening to our community. Your feedback helps shape the future of emergency preparedness!
            </p>
            <p className="text-sm text-gray-600">
              Join now to get lifetime early-adopter benefits and help us build something amazing together.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join adventurers and families who are taking control of their emergency preparedness.
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-lg px-12 py-6"
          >
            Create Your Free Account
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Set up in under 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-blue-600">RallyPack</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 RallyPack. Your emergency preparedness companion.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}