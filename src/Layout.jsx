import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { useActivityHeartbeat } from "@/hooks/useActivityHeartbeat";
import { COUNTRY_EMERGENCY_DATA } from "@/components/settings/CountryEmergencySettings";
import { 
  LayoutDashboard, 
  Package, 
  AlertTriangle, 
  WifiOff, 
  Settings, 
  LogOut,
  LogIn,
  Menu,
  X,
  Users,
  Building2,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AccessibilityProvider from "./components/AccessibilityProvider";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useActivityHeartbeat();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        // Load profile silently to get emergency_countries
        const profiles = await base44.entities.UserProfile.filter({ created_by: userData.email });
        if (profiles.length > 0) setProfile(profiles[0]);
        setAuthChecked(true);
      } catch (e) {
        // Not logged in - redirect to Home if on protected page
        const publicPages = ["Home", "PrivacyPolicy", "TermsAndConditions", "LearnMore", "ReadinessQuiz", "Shopping", "Equine", "Canine", "Feline", "Infant", "Avian", "Reptile", "Livestock", "BusinessOnboarding", "Donate", "AffiliatePartnerPolicy", "Feedback"];
        if (!publicPages.includes(currentPageName)) {
          window.location.href = createPageUrl("Home");
        } else {
          setAuthChecked(true);
        }
      }
    };
    loadUser();
  }, [currentPageName]);

  const publicPages = ["Home", "PrivacyPolicy", "TermsAndConditions", "LearnMore", "ReadinessQuiz", "Shopping", "Equine", "Canine", "Feline", "Infant", "Avian", "Reptile", "Livestock", "BusinessOnboarding", "Donate", "AffiliatePartnerPolicy", "Feedback"];
  const isPublicPage = publicPages.includes(currentPageName);
  const isAdmin = user?.role === "admin";

  // Show loading while checking auth on protected pages
  if (!authChecked && !isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" role="status" aria-label="Loading"></div>
      </div>
    );
  }

  const allNavItems = [
    { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard, requiresAuth: true },
    { name: "Resources", page: "Resources", icon: Package, requiresAuth: true },
    { name: "Shopping", page: "Shopping", icon: Package, requiresAuth: false },
    { name: "Emergency", page: "Emergency", icon: AlertTriangle, requiresAuth: true },
    { name: "Offline", page: "Offline", icon: WifiOff, requiresAuth: true },
    { name: "Settings", page: "Settings", icon: Settings, requiresAuth: true },
    { name: "Business", page: "BusinessDashboard", publicPage: "BusinessOnboarding", icon: Building2, requiresAuth: false },
  ];

  if (isAdmin) {
    allNavItems.push(
      { name: "Monitor", page: "AdminMonitor", icon: Users, requiresAuth: true }
    );
  }

  const handleLogout = () => {
    base44.auth.logout();
  };

  const NavLinks = ({ onClick }) => (
    <>
      {allNavItems.map((item) => {
        const isLocked = item.requiresAuth && !user;
        if (isLocked) {
          return (
            <button
              key={item.page}
              onClick={() => { base44.auth.redirectToLogin(createPageUrl(item.page)); if (onClick) onClick(); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-sans text-muted-foreground/50 cursor-pointer hover:text-muted-foreground transition-colors"
              title="Sign in to access this feature"
            >
              <item.icon className="w-4 h-4" aria-hidden="true" />
              <span>{item.name}</span>
              <Lock className="w-3 h-3 ml-0.5 opacity-60" aria-hidden="true" />
            </button>
          );
        }
        const targetPage = !user && item.publicPage ? item.publicPage : item.page;
        const isActive = currentPageName === item.page || currentPageName === item.publicPage;
        return (
          <Link
            key={item.page}
            to={createPageUrl(targetPage)}
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors font-sans ${
              isActive
                ? "bg-foreground/5 text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className="w-4 h-4" aria-hidden="true" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-cream font-sans">
        {/* Skip to content */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded focus:text-sm focus:font-semibold">
          Skip to main content
        </a>

        {/* Header — always visible */}
        {authChecked && (
          <header className="bg-white border-b border-border sticky top-0 z-50" role="banner">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-14">
                {/* Logo */}
                <Link to={user ? createPageUrl("Dashboard") : "/"} className="flex items-center gap-2" aria-label="RallyPack Home">
                  <span className="font-serif text-xl font-bold text-foreground tracking-tight">RallyPack</span>
                </Link>

                <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
                  <NavLinks />
                </nav>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                  {user ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-sans"
                      aria-label="Log out of your account"
                    >
                      <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                      Log out
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => base44.auth.redirectToLogin()}
                      className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-sans"
                      aria-label="Log in to your account"
                    >
                      <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                      Log in
                    </Button>
                  )}

                  {/* Mobile Menu */}
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                        <Menu className="w-6 h-6" aria-hidden="true" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-72" aria-label="Mobile navigation">
                      <nav className="flex flex-col gap-2 mt-8">
                        <NavLinks onClick={() => setMobileMenuOpen(false)} />
                        <hr className="my-4" />
                        {user ? (
                          <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="flex items-center gap-2"
                            aria-label="Log out of your account"
                          >
                            <LogOut className="w-4 h-4" aria-hidden="true" />
                            Log Out
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => base44.auth.redirectToLogin()}
                            className="flex items-center gap-2"
                            aria-label="Log in to your account"
                          >
                            <LogIn className="w-4 h-4" aria-hidden="true" />
                            Log In / Sign Up
                          </Button>
                        )}
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main id="main-content" role="main">{children}</main>

        {/* Footer */}
        {authChecked && (
          <footer className="bg-white border-t border-border mt-auto" role="contentinfo">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <span className="font-serif text-lg font-bold text-foreground block mb-2">RallyPack</span>
                  <p className="text-muted-foreground text-sm font-sans">
                    Free, open-source emergency preparedness.
                  </p>
                </div>

                <div>
                  <nav className="space-y-2" aria-label="Climate resources">
                    <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground mb-2">Climate</h3>
                    <Link to="/wildfire" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Wildfire</Link>
                    <Link to="/hurricane" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Hurricane</Link>
                    <Link to="/flood" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Flood</Link>
                    <Link to="/tornado" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Tornado</Link>
                    <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground mb-2 mt-4">By Species</h3>
                    <Link to="/equine" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Equine</Link>
                    <Link to="/canine" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Canine</Link>
                    <Link to="/feline" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Feline</Link>
                    <Link to="/infant" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Infant</Link>
                    <Link to="/avian" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Avian</Link>
                    <Link to="/reptile" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Reptile</Link>
                    <Link to="/livestock" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Livestock</Link>
                  </nav>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground mb-3">Legal</h3>
                  <nav className="space-y-2" aria-label="Legal navigation">
                    <Link to={createPageUrl("PrivacyPolicy")} className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Privacy Policy</Link>
                    <Link to={createPageUrl("TermsAndConditions")} className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Terms & Conditions</Link>
                    <Link to={createPageUrl("EULA")} className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">End User License Agreement</Link>
                    <Link to={createPageUrl("ConfidentialityAgreement")} className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Confidentiality Agreement</Link>
                  </nav>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground mb-3">Contact</h3>
                  <nav className="space-y-2" aria-label="Contact navigation">
                    <Link to="/about" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">About Us</Link>
                    <Link to="/Feedback" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Send Feedback</Link>
                    <Link to="/AffiliatePartnerPolicy" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Affiliate & Partner Policy</Link>
                  </nav>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground mb-3">Follow Us</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <a href="https://instagram.com/rallypackgear" target="_blank" rel="noopener noreferrer" aria-label="Instagram @rallypackgear" className="text-muted-foreground hover:text-foreground transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <circle cx="12" cy="12" r="4"/>
                        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                      </svg>
                    </a>
                    <a href="https://facebook.com/rallypackgear" target="_blank" rel="noopener noreferrer" aria-label="Facebook @rallypackgear" className="text-muted-foreground hover:text-foreground transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z"/>
                      </svg>
                    </a>
                    <a href="https://threads.net/@rallypackgear" target="_blank" rel="noopener noreferrer" aria-label="Threads @rallypackgear" className="text-muted-foreground hover:text-foreground transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16.3 11.3c-.1-.1-.2-.1-.3-.2-.2-2.3-1.4-3.6-3.5-3.7h-.3c-1.2 0-2.3.5-2.9 1.4l1.1.8c.5-.7 1.2-.8 1.8-.8h.2c1.4.1 2 .9 2.1 2.3-.6-.1-1.2-.2-1.9-.1-2 .1-3.3 1.3-3.2 2.9 0 .8.4 1.5 1.1 2 .6.4 1.4.6 2.2.5 1-.1 1.8-.6 2.3-1.3.5-.7.7-1.5.7-2.6.7.4 1.2.9 1.5 1.6.5 1.1.6 2.9-.9 4.4-1.3 1.3-2.9 1.9-5.3 1.9-2.6 0-4.6-.8-5.9-2.4C4.4 16 3.8 13.7 3.8 11c0-2.7.6-5 1.9-6.6C7 2.8 9 2 11.6 2c2.7 0 4.7.8 6 2.4.6.8 1.1 1.7 1.4 2.9l1.5-.4c-.3-1.4-1-2.6-1.7-3.5C17.1 1.3 14.7.4 11.6.4h-.1C8.5.4 6.2 1.4 4.5 3.4 3 5.3 2.2 7.9 2.2 11c0 3.1.8 5.7 2.3 7.6 1.7 2 4 3 6.9 3h.1c2.7 0 4.7-.7 6.3-2.3 2.1-2 2-4.6 1.3-6.1-.5-1.2-1.5-2-2.8-2.5-.1 0-.2-.1-.3-.1zM10.8 15c-.4 0-.8-.2-1-.4-.2-.2-.3-.4-.3-.7 0-.5.4-.8 1.1-.9h.4c.5 0 1 .1 1.5.2-.2 1.4-.9 1.8-1.7 1.8z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-border mt-8 pt-6 text-center">
                <div className="inline-flex items-center gap-2 bg-secondary text-foreground px-3 py-1.5 rounded text-xs font-sans font-medium mb-4">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  BETA — Features may change
                </div>

                {/* Emergency services notice */}
                {(() => {
                  const countries = profile?.emergency_countries || [];
                  if (countries.length === 0) {
                    return (
                      <p className="text-xs text-muted-foreground font-sans mb-3">
                        🚨 In an emergency, <strong>contact your local emergency services</strong> immediately.
                      </p>
                    );
                  }
                  return (
                    <div className="mb-3 text-xs text-muted-foreground font-sans">
                      <p className="font-semibold text-foreground mb-1">🚨 Emergency numbers for your selected countries:</p>
                      {countries.map((code) => {
                        const data = COUNTRY_EMERGENCY_DATA[code];
                        if (!data) return null;
                        return (
                          <p key={code} className="mt-0.5">
                            <strong>{data.name}:</strong> {data.combined}
                            {data.police !== data.combined && ` (Police: ${data.police})`}
                            {data.fire !== data.combined && ` (Fire: ${data.fire})`}
                            {data.ambulance !== data.combined && ` (Ambulance: ${data.ambulance})`}
                          </p>
                        );
                      })}
                    </div>
                  );
                })()}

                <p className="text-xs text-muted-foreground font-sans mb-1">
                  Feedback: <a href="mailto:beta@rallypack.tech" className="text-foreground hover:underline">beta@rallypack.tech</a>
                </p>
                <p className="text-xs text-muted-foreground font-sans">© 2026 RallyPack · MIT License · GDPR & CCPA Compliant</p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </AccessibilityProvider>
  );
}