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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        // Not logged in
      }
    };
    loadUser();
  }, []);

  const navItems = [
    { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
    { name: "Resources", page: "Resources", icon: Package },
    { name: "Emergency", page: "Emergency", icon: AlertTriangle },
    { name: "Offline", page: "Offline", icon: WifiOff },
    { name: "Settings", page: "Settings", icon: Settings },
  ];

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
      {/* Header */}
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

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}