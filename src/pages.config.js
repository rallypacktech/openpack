import AdminRecommendations from './pages/AdminRecommendations';
import CacheDetail from './pages/CacheDetail';
import CheckoutCancel from './pages/CheckoutCancel';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Dashboard from './pages/Dashboard';
import Emergency from './pages/Emergency';
import Offline from './pages/Offline';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import TermsAndConditions from './pages/TermsAndConditions';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminRecommendations": AdminRecommendations,
    "CacheDetail": CacheDetail,
    "CheckoutCancel": CheckoutCancel,
    "CheckoutSuccess": CheckoutSuccess,
    "Dashboard": Dashboard,
    "Emergency": Emergency,
    "Offline": Offline,
    "PrivacyPolicy": PrivacyPolicy,
    "Resources": Resources,
    "Settings": Settings,
    "TermsAndConditions": TermsAndConditions,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};