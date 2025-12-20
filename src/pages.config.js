import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Resources from './pages/Resources';
import Emergency from './pages/Emergency';
import Offline from './pages/Offline';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Settings": Settings,
    "Resources": Resources,
    "Emergency": Emergency,
    "Offline": Offline,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};