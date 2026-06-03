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
import { lazy } from 'react';
import __Layout from './Layout.jsx';

const AdminMonitor = lazy(() => import('./pages/AdminMonitor'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const CacheDetail = lazy(() => import('./pages/CacheDetail'));
const CheckoutCancel = lazy(() => import('./pages/CheckoutCancel'));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'));
const ConfidentialityAgreement = lazy(() => import('./pages/ConfidentialityAgreement'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EULA = lazy(() => import('./pages/EULA'));
const Emergency = lazy(() => import('./pages/Emergency'));
const Home = lazy(() => import('./pages/Home'));
const LearnMore = lazy(() => import('./pages/LearnMore'));
const Offline = lazy(() => import('./pages/Offline'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const ReadinessQuiz = lazy(() => import('./pages/ReadinessQuiz'));
const Resources = lazy(() => import('./pages/Resources'));
const Settings = lazy(() => import('./pages/Settings'));
const Shopping = lazy(() => import('./pages/Shopping'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));

export const PAGES = {
    "AdminMonitor": AdminMonitor,
    "AdminProducts": AdminProducts,
    "CacheDetail": CacheDetail,
    "CheckoutCancel": CheckoutCancel,
    "CheckoutSuccess": CheckoutSuccess,
    "ConfidentialityAgreement": ConfidentialityAgreement,
    "Dashboard": Dashboard,
    "EULA": EULA,
    "Emergency": Emergency,
    "Home": Home,
    "LearnMore": LearnMore,
    "Offline": Offline,
    "PrivacyPolicy": PrivacyPolicy,
    "ReadinessQuiz": ReadinessQuiz,
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