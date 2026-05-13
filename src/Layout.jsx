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
  LogIn,
  Menu,
  X,
  Users,
  Radio,
  Building2,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AccessibilityProvider from "./components/AccessibilityProvider";

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
        const publicPages = ["Home", "PrivacyPolicy", "TermsAndConditions", "LearnMore", "ReadinessQuiz", "Shopping"];
        if (!publicPages.includes(currentPageName)) {
          window.location.href = createPageUrl("Home");
        } else {
          setAuthChecked(true);
        }
      }
    };
    loadUser();
  }, [currentPageName]);

  const publicPages = ["Home", "PrivacyPolicy", "TermsAndConditions", "LearnMore", "ReadinessQuiz", "Shopping"];
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
    { name: "Tracking", page: "TrackedItems", icon: Radio, requiresAuth: true },
    { name: "Shopping", page: "Shopping", icon: Package, requiresAuth: false },
    { name: "Emergency", page: "Emergency", icon: AlertTriangle, requiresAuth: true },
    { name: "Offline", page: "Offline", icon: WifiOff, requiresAuth: true },
    { name: "Settings", page: "Settings", icon: Settings, requiresAuth: true },
    { name: "Business", page: "BusinessDashboard", icon: Building2, requiresAuth: true },
  ];

  if (isAdmin) {
    allNavItems.push(
      { name: "Products", page: "AdminProducts", icon: Package, requiresAuth: true },
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
        return (
          <Link
            key={item.page}
            to={createPageUrl(item.page)}
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors font-sans ${
              currentPageName === item.page
                ? "bg-foreground/5 text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-current={currentPageName === item.page ? "page" : undefined}
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
                <Link to={user ? createPageUrl("Dashboard") : createPageUrl("Home")} className="flex items-center gap-2" aria-label="RallyPack Home">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <span className="font-serif text-lg font-bold text-foreground block mb-2">RallyPack</span>
                  <p className="text-muted-foreground text-sm font-sans">
                    Free, open-source emergency preparedness.
                  </p>
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
                    <Link to="/Feedback" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Send Feedback</Link>
                    <Link to="/AffiliatePartnerPolicy" className="block text-sm text-muted-foreground hover:text-foreground font-sans transition-colors">Affiliate & Partner Policy</Link>
                  </nav>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest font-sans font-semibold text-muted-foreground mb-3">Follow Us</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <a href="https://instagram.com/rallypackgear" target="_blank" rel="noopener noreferrer" aria-label="Instagram @rallypackgear" className="text-muted-foreground hover:text-foreground transition-colors">
                      {/* Instagram icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <circle cx="12" cy="12" r="4"/>
                        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                      </svg>
                    </a>
                    <a href="https://www.facebook.com/profile.php?id=61583589766031" target="_blank" rel="noopener noreferrer" aria-label="Facebook rallypack" className="text-muted-foreground hover:text-foreground transition-colors">
                      {/* Facebook icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                      </svg>
                    </a>
                    <a href="https://pixelfed.social/rallypack" target="_blank" rel="noopener noreferrer" aria-label="Pixelfed rallypack" className="text-muted-foreground hover:text-foreground transition-colors">
                      {/* Camera/Pixelfed icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
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