import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Resources from './pages/Resources';
import Emergency from './pages/Emergency';
import Offline from './pages/Offline';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import CacheDetail from './pages/CacheDetail';
import AdminRecommendations from './pages/AdminRecommendations';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Settings": Settings,
    "Resources": Resources,
    "Emergency": Emergency,
    "Offline": Offline,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsAndConditions": TermsAndConditions,
    "CacheDetail": CacheDetail,
    "AdminRecommendations": AdminRecommendations,
    "CheckoutSuccess": CheckoutSuccess,
    "CheckoutCancel": CheckoutCancel,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};