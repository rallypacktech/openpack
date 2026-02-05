/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminProductSuggestions from './pages/AdminProductSuggestions';
import AdminProducts from './pages/AdminProducts';
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
import Shopping from './pages/Shopping';
import TermsAndConditions from './pages/TermsAndConditions';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminProductSuggestions": AdminProductSuggestions,
    "AdminProducts": AdminProducts,
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
    "Shopping": Shopping,
    "TermsAndConditions": TermsAndConditions,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};