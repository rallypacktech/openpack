import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AffiliatePartnerPolicy from './pages/AffiliatePartnerPolicy';
import Feedback from './pages/Feedback';
import Donate from './pages/Donate';
import TrackedItems from './pages/TrackedItems';
import BusinessDashboard from './pages/BusinessDashboard';

const { Pages, Layout } = pagesConfig;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Pages that do NOT require authentication
const PUBLIC_PAGES = new Set([
  'Home', 'PrivacyPolicy', 'TermsAndConditions', 'ConfidentialityAgreement',
  'EULA', 'LearnMore', 'ReadinessQuiz', 'Shopping'
]);

const AuthenticatedApp = () => {
  return (
    <Routes>
      {/* Auth routes — always public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public misc pages */}
      <Route path="/AffiliatePartnerPolicy" element={<AffiliatePartnerPolicy />} />
      <Route path="/Feedback" element={<Feedback />} />
      <Route path="/Donate" element={<LayoutWrapper currentPageName="Donate"><Donate /></LayoutWrapper>} />

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
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

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