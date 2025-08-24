import React, { createContext, useContext, useState, useEffect } from "react";
import { getUser } from "../services/getUser";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState(null);

  useEffect(() => {
    checkAuthStatus();

    // Set up automatic session refresh every 9 days (before the 10-day expiration)
    const sessionRefreshInterval = setInterval(() => {
      if (isLoggedIn && user) {
        refreshSession();
      }
    }, 9 * 24 * 60 * 60 * 1000); // 9 days in milliseconds

    // Set up activity-based session refresh
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    let lastActivity = Date.now();

    const handleUserActivity = () => {
      lastActivity = Date.now();
    };

    // Add activity listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Check for user activity every hour and refresh session if active
    const activityCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      // If user was active in the last 2 hours, refresh session
      if (isLoggedIn && user && timeSinceLastActivity < 2 * 60 * 60 * 1000) {
        refreshSession();
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => {
      clearInterval(sessionRefreshInterval);
      clearInterval(activityCheckInterval);
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, []); // Remove dependencies to prevent infinite loop

  const refreshSession = async () => {
    try {
      const response = await api.post("/auth/refresh-session");
      if (response.data && response.data.user) {
        setUser(response.data.user);
        // Set new session expiry (10 days from now)
        setSessionExpiry(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000));
        console.log("Session refreshed successfully");
      }
    } catch (error) {
      console.error("Session refresh failed:", error);
      // If refresh fails, user might need to log in again
      logout();
    }
  };

  const checkAuthStatus = async () => {
    try {
      // Since we're using httpOnly cookies, we don't need to check localStorage
      // The cookie will be automatically sent with the request
      const userData = await getUser();
      if (userData && userData.firstName) {
        setUser(userData);
        setIsLoggedIn(true);
        // Set session expiry to 10 days from now (approximate)
        setSessionExpiry(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000));
      } else {
        // Invalid user data, clear everything
        setIsLoggedIn(false);
        setUser(null);
        setSessionExpiry(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsLoggedIn(false);
      setUser(null);
      setSessionExpiry(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    // Set session expiry to 10 days from now
    setSessionExpiry(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000));
    // Token is stored in httpOnly cookie by the server
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear the cookie
      await api.get("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
      setSessionExpiry(null);
    }
  };

  const value = {
    isLoggedIn,
    user,
    isLoading,
    sessionExpiry,
    login,
    logout,
    checkAuthStatus,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
