import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuthConsent from './pages/OAuthConsent';

const AffiliatePartnerPolicy = lazy(() => import('./pages/AffiliatePartnerPolicy'));
const Equine = lazy(() => import('./pages/Equine'));
const Canine = lazy(() => import('./pages/Canine'));
const Feline = lazy(() => import('./pages/Feline'));
const Infant = lazy(() => import('./pages/Infant'));
const Avian = lazy(() => import('./pages/Avian'));
const Reptile = lazy(() => import('./pages/Reptile'));
const Livestock = lazy(() => import('./pages/Livestock'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Donate = lazy(() => import('./pages/Donate'));
const TrackedItems = lazy(() => import('./pages/TrackedItems'));
const BusinessDashboard = lazy(() => import('./pages/BusinessDashboard'));
const BusinessOnboarding = lazy(() => import('./pages/BusinessOnboarding'));
const Wildfire = lazy(() => import('./pages/Wildfire'));
const About = lazy(() => import('./pages/About'));
const Hurricane = lazy(() => import('./pages/Hurricane'));
const Flood = lazy(() => import('./pages/Flood'));
const Tornado = lazy(() => import('./pages/Tornado'));
const AgentAssistant = lazy(() => import('./pages/AgentAssistant'));
const WildfireTrends = lazy(() => import('./pages/WildfireTrends'));

const { Pages, Layout } = pagesConfig;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Pages that do NOT require authentication
const PUBLIC_PAGES = new Set([
  'Home', 'PrivacyPolicy', 'TermsAndConditions', 'ConfidentialityAgreement',
  'EULA', 'ReadinessQuiz', 'Shopping'
]);

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-cream">
    <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" role="status" aria-label="Loading page" />
  </div>
);

const AuthenticatedApp = () => {
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Auth routes — always public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth/consent" element={<OAuthConsent />} />

      {/* Public misc pages */}
      <Route path="/AffiliatePartnerPolicy" element={<AffiliatePartnerPolicy />} />
      <Route path="/equine" element={<LayoutWrapper currentPageName="Equine"><Equine /></LayoutWrapper>} />
      <Route path="/canine" element={<LayoutWrapper currentPageName="Canine"><Canine /></LayoutWrapper>} />
      <Route path="/feline" element={<LayoutWrapper currentPageName="Feline"><Feline /></LayoutWrapper>} />
      <Route path="/infant" element={<LayoutWrapper currentPageName="Infant"><Infant /></LayoutWrapper>} />
      <Route path="/avian" element={<LayoutWrapper currentPageName="Avian"><Avian /></LayoutWrapper>} />
      <Route path="/reptile" element={<LayoutWrapper currentPageName="Reptile"><Reptile /></LayoutWrapper>} />
      <Route path="/livestock" element={<LayoutWrapper currentPageName="Livestock"><Livestock /></LayoutWrapper>} />
      <Route path="/Feedback" element={<Feedback />} />
      <Route path="/Donate" element={<LayoutWrapper currentPageName="Donate"><Donate /></LayoutWrapper>} />

      {/* /home redirect → Home lives at / */}
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/Home" element={<Navigate to="/" replace />} />
      <Route path="/LearnMore" element={<Navigate to="/" replace />} />
      <Route path="/learnmore" element={<Navigate to="/" replace />} />

      {/* Public pages from pagesConfig */}
      {Object.entries(Pages)
        .filter(([name]) => PUBLIC_PAGES.has(name))
        .map(([name, Page]) => (
          <Route
            key={name}
            path={name === 'Home' ? '/' : `/${name}`}
            element={<LayoutWrapper currentPageName={name}><Page /></LayoutWrapper>}
          />
        ))
      }

      {/* Protected pages */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        {Object.entries(Pages)
          .filter(([name]) => !PUBLIC_PAGES.has(name))
          .map(([name, Page]) => (
            <Route
              key={name}
              path={`/${name}`}
              element={<LayoutWrapper currentPageName={name}><Page /></LayoutWrapper>}
            />
          ))
        }
        <Route path="/TrackedItems" element={<LayoutWrapper currentPageName="TrackedItems"><TrackedItems /></LayoutWrapper>} />
          <Route path="/BusinessDashboard" element={<LayoutWrapper currentPageName="BusinessDashboard"><BusinessDashboard /></LayoutWrapper>} />
          <Route path="/AgentAssistant" element={<LayoutWrapper currentPageName="AgentAssistant"><AgentAssistant /></LayoutWrapper>} />
      </Route>

      {/* Public business onboarding */}
      <Route path="/BusinessOnboarding" element={<LayoutWrapper currentPageName="BusinessOnboarding"><BusinessOnboarding /></LayoutWrapper>} />
      <Route path="/wildfire" element={<LayoutWrapper currentPageName="Wildfire"><Wildfire /></LayoutWrapper>} />
      <Route path="/about" element={<LayoutWrapper currentPageName="About"><About /></LayoutWrapper>} />
      <Route path="/hurricane" element={<LayoutWrapper currentPageName="Hurricane"><Hurricane /></LayoutWrapper>} />
      <Route path="/flood" element={<LayoutWrapper currentPageName="Flood"><Flood /></LayoutWrapper>} />
      <Route path="/tornado" element={<LayoutWrapper currentPageName="Tornado"><Tornado /></LayoutWrapper>} />
      <Route path="/wildfire-trends" element={<LayoutWrapper currentPageName="WildfireTrends"><WildfireTrends /></LayoutWrapper>} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};


function App() {
  // Google Ads gtag bootstrap (loads once; cross-origin relay for iframe previews).
  useEffect(() => {
    if (typeof window === "undefined" || window.__gads_loaded) return;
    window.__gads_loaded = true;
    window.dataLayer = window.dataLayer || [];
    const inIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
      if (inIframe) {
        try {
          const args = Array.prototype.slice.call(arguments);
          const cmd = args[0];
          window.parent.postMessage({
            type: 'base44_gtag_event',
            event: {
              source: 'gtag',
              timestamp: new Date().toLocaleTimeString(),
              command: cmd,
              params: args.slice(1),
              type: cmd === 'event' ? (args[1] || 'event') : cmd,
            },
          }, '*');
        } catch (_e) { /* relay must not break gtag */ }
      }
    };
    const s = document.createElement('script');
    s.src = 'https://www.googletagmanager.com/gtag/js?id=AW-18405445520';
    s.async = true;
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', 'AW-18405445520', { send_page_view: false });
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App