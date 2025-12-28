import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { 
  LayoutDashboard, 
  Package, 
  AlertTriangle, 
  WifiOff, 
  Settings, 
  LogOut,
  Menu,
  X,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setAuthChecked(true);
      } catch (e) {
        // Not logged in - redirect to Home if on protected page
        const publicPages = ["Home", "PrivacyPolicy", "TermsAndConditions", "LearnMore"];
        if (!publicPages.includes(currentPageName)) {
          window.location.href = createPageUrl("Home");
        } else {
          setAuthChecked(true);
        }
      }
    };
    loadUser();
  }, [currentPageName]);

  const publicPages = ["Home", "PrivacyPolicy", "TermsAndConditions", "LearnMore"];
  const isPublicPage = publicPages.includes(currentPageName);
  const isAdmin = user?.role === "admin";

  // Show loading while checking auth on protected pages
  if (!authChecked && !isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
    { name: "Resources", page: "Resources", icon: Package },
    { name: "Emergency", page: "Emergency", icon: AlertTriangle },
    { name: "Offline", page: "Offline", icon: WifiOff },
    { name: "Settings", page: "Settings", icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ name: "Admin", page: "AdminRecommendations", icon: Users });
  }

  const handleLogout = () => {
    base44.auth.logout();
  };

  const NavLinks = ({ onClick }) => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.page}
          to={createPageUrl(item.page)}
          onClick={onClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            currentPageName === item.page
              ? "bg-blue-50 text-blue-600 font-medium"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <item.icon className="w-5 h-5" />
          <span>{item.name}</span>
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - only show nav for authenticated users */}
      {user && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-600">RallyPack</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLinks />
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </Button>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col gap-2 mt-8">
                    <NavLinks onClick={() => setMobileMenuOpen(false)} />
                    <hr className="my-4" />
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        </header>
      )}

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer - only show for authenticated users */}
      {user && (
        <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-blue-600">RallyPack</span>
              </div>
              <p className="text-gray-600 text-sm">
                Your comprehensive emergency preparedness platform. Stay ready, stay connected.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <div className="space-y-2">
                <Link to={createPageUrl("PrivacyPolicy")} className="block text-sm text-gray-600 hover:text-blue-600">
                  Privacy Policy
                </Link>
                <Link to={createPageUrl("TermsAndConditions")} className="block text-sm text-gray-600 hover:text-blue-600">
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
            <p>© 2025 RallyPack. All rights reserved. | Ages 13+</p>
            <p className="mt-1">GDPR & CCPA Compliant | SOC 2 Type I | AES-256 Encrypted</p>
          </div>
        </div>
        </footer>
      )}
    </div>
  );
}