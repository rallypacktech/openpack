/* global pendo */
import React, { createContext, useState, useContext, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { appParams } from "@/lib/app-params";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      // Check if user is authenticated via the SDK
      try {
        if (appParams.token) {
          await checkUserAuth();
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
        }
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error("App state check failed:", appError);
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setAuthError({
        type: "unknown",
        message: error.message || "An unexpected error occurred",
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const identifyPendoUser = async (currentUser) => {
    try {
      let profile = null;
      let subscription = null;

      try {
        const [profiles, subscriptions] = await Promise.all([
          base44.entities.UserProfile.filter({ created_by: currentUser.email }),
          base44.entities.BusinessSubscription.list(),
        ]);
        profile = profiles[0] || null;
        subscription = subscriptions[0] || null;
      } catch (_e) {
        // Continue with auth token data only
      }

      const pendoPayload = {
        visitor: {
          id: currentUser.id,
          email: currentUser.email,
          full_name: currentUser.full_name,
          role: currentUser.role,
          displayName: profile?.display_name,
          city: profile?.city,
          stateProvince: profile?.state_province,
          country: profile?.country,
          femaRegion: profile?.fema_region,
          climateZone: profile?.climate_zone,
          notificationMethod: profile?.notification_method,
          currentStatus: profile?.current_status,
          statusUpdatedAt: profile?.status_updated_at,
          householdSize: profile?.household_size,
          hasChildren: profile?.has_children,
          hasPets: profile?.has_pets,
          onboardingCompleted: profile?.onboarding_completed,
          defaultHomePage: profile?.default_home_page,
          termsAgreedVersion: profile?.terms_agreed_version,
          termsAgreedDate: profile?.terms_agreed_date,
          lastActive: profile?.last_active,
          emergencyCountries: profile?.emergency_countries,
          statusAlertChannels: profile?.status_alert_channels,
        },
      };

      if (subscription) {
        pendoPayload.account = {
          id: subscription.id,
          name: subscription.organization_name,
          tier: subscription.tier,
          status: subscription.status,
          maxFirstAidKits: subscription.max_first_aid_kits,
          maxMembers: subscription.max_members,
          alertIncidentsIncluded: subscription.alert_incidents_included,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          chainOfCommandNotifications:
            subscription.chain_of_command_notifications,
          evacuationPlanEnabled: subscription.evacuation_plan_enabled,
          alertSendingEnabled: subscription.alert_sending_enabled,
        };
      }

      pendo.identify(pendoPayload);
    } catch (_e) {
      // Pendo identification is non-critical
    }
  };

  const checkUserAuth = async () => {
    try {
      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);

      // Identify user with Pendo (non-blocking)
      identifyPendoUser(currentUser);
    } catch (error) {
      console.error("User auth check failed:", error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);

      // If user auth fails, it might be an expired token
      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: "auth_required",
          message: "Authentication required",
        });
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    pendo.clearSession();
    setUser(null);
    setIsAuthenticated(false);

    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    // Use the SDK's redirectToLogin method
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        logout,
        navigateToLogin,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
