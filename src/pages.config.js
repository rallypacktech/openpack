import AdminProductSuggestions from './pages/AdminProductSuggestions';
import AdminRecommendations from './pages/AdminRecommendations';
import CacheDetail from './pages/CacheDetail';
import CheckoutCancel from './pages/CheckoutCancel';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Dashboard from './pages/Dashboard';
import Emergency from './pages/Emergency';
import Home from './pages/Home';
import LearnMore from './pages/LearnMore';
import Offline from './pages/Offline';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import TermsAndConditions from './pages/TermsAndConditions';
import AdminProducts from './pages/AdminProducts';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminProductSuggestions": AdminProductSuggestions,
    "AdminRecommendations": AdminRecommendations,
    "CacheDetail": CacheDetail,
    "CheckoutCancel": CheckoutCancel,
    "CheckoutSuccess": CheckoutSuccess,
    "Dashboard": Dashboard,
    "Emergency": Emergency,
    "Home": Home,
    "LearnMore": LearnMore,
    "Offline": Offline,
    "PrivacyPolicy": PrivacyPolicy,
    "Resources": Resources,
    "Settings": Settings,
    "TermsAndConditions": TermsAndConditions,
    "AdminProducts": AdminProducts,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};