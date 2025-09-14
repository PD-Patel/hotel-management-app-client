import { useEffect, useCallback, useRef } from "react";

/**
 * Custom hook for managing user session and activity monitoring
 * Extracted from AuthContext to improve code organization
 */
export const useSessionManagement = (
  isLoggedIn,
  user,
  onSessionRefresh,
  onLogout
) => {
  const lastActivityRef = useRef(Date.now());
  const sessionRefreshIntervalRef = useRef(null);
  const activityCheckIntervalRef = useRef(null);

  // Session refresh logic
  const refreshSession = useCallback(async () => {
    try {
      await onSessionRefresh();
    } catch (error) {
      console.error("Session refresh failed:", error);
      onLogout();
    }
  }, [onSessionRefresh, onLogout]);

  // Activity monitoring setup
  const setupActivityMonitoring = useCallback(() => {
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Add activity listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Return cleanup function
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, []);

  // Check if user is active and refresh session if needed
  const checkActivityAndRefresh = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // If user was active in the last 2 hours, refresh session
    if (timeSinceLastActivity < 2 * 60 * 60 * 1000) {
      refreshSession();
    }
  }, [refreshSession]);

  // Setup session refresh interval
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    // Set up automatic session refresh every 9 days
    sessionRefreshIntervalRef.current = setInterval(
      refreshSession,
      9 * 24 * 60 * 60 * 1000
    );

    return () => {
      if (sessionRefreshIntervalRef.current) {
        clearInterval(sessionRefreshIntervalRef.current);
      }
    };
  }, [isLoggedIn, user, refreshSession]);

  // Setup activity monitoring
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const cleanup = setupActivityMonitoring();

    // Check for user activity every hour
    activityCheckIntervalRef.current = setInterval(
      checkActivityAndRefresh,
      60 * 60 * 1000
    );

    return () => {
      cleanup();
      if (activityCheckIntervalRef.current) {
        clearInterval(activityCheckIntervalRef.current);
      }
    };
  }, [isLoggedIn, user, setupActivityMonitoring, checkActivityAndRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRefreshIntervalRef.current) {
        clearInterval(sessionRefreshIntervalRef.current);
      }
      if (activityCheckIntervalRef.current) {
        clearInterval(activityCheckIntervalRef.current);
      }
    };
  }, []);

  return {
    refreshSession,
    lastActivity: lastActivityRef.current,
  };
};
