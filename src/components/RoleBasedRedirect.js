import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Dashboard from "../pages/Dashboard";
import Employee from "../pages/Employee/Employee";
import AddEmployee from "../pages/Employee/AddEmployee";
import ClockLogs from "../pages/ClockLogs";
import Users from "../pages/Users/Users";
import GeolocationPage from "../pages/settings/GeolocationPage";
import RoomManagementPage from "../pages/settings/RoomManagementPage";
import Payroll from "../pages/Payroll";
import Frontdesk from "../pages/Frontdesk";
import Housekeeping from "../pages/Housekeeping";
import HousekeepingEmployee from "../pages/HousekeepingEmployee";

const RoleBasedRedirect = ({ fallbackPath }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      console.log("RoleBasedRedirect - User data:", {
        id: user.id,
        role: user.role,
        position: user.position,
        siteId: user.siteId,
        pathname: location.pathname,
      });

      // If fallbackPath is provided, use it for non-admin users
      if (fallbackPath) {
        // Special case: housekeeping employees can access their page
        if (
          user.position === "housekeeping" &&
          location.pathname === "/housekeeping-employee"
        ) {
          console.log("Allowing housekeeping employee access");
          return; // Allow access, no redirect
        }

        // For other routes, check role as before
        if (user.role === "admin" || user.role === "manager") {
          // Admin stays on current route, no redirect needed
          return;
        } else {
          // Non-admin users get redirected to fallback path
          console.log("Redirecting non-admin user to:", fallbackPath);
          navigate(fallbackPath, { replace: true });
        }
      } else {
        // Default behavior for root route
        if (user.role === "admin" || user.role === "manager") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      }
    }
  }, [user, isLoading, navigate, fallbackPath, location.pathname]);

  // Show loading while determining redirect
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  // If no fallbackPath, this is the root route redirect component
  if (!fallbackPath) {
    return null;
  }

  // For routes with fallbackPath, show appropriate content for authorized users
  if (user && (user.role === "admin" || user.role === "manager")) {
    const path = location.pathname;

    // Return the appropriate component based on the route
    switch (path) {
      case "/dashboard":
        return <Dashboard />;
      case "/employee":
        return <Employee />;
      case "/employee/add":
        return <AddEmployee />;
      case "/clock-logs":
        return <ClockLogs />;
      case "/users":
        return <Users />;
      case "/settings/geolocation":
        return <GeolocationPage />;
      case "/settings/room-management":
        return <RoomManagementPage />;
      case "/payroll":
        return <Payroll />;
      case "/frontdesk":
        return <Frontdesk />;
      case "/housekeeping":
        return <Housekeeping />;
      case "/housekeeping-employee":
        return <HousekeepingEmployee />;
      default:
        return null;
    }
  }

  // Special case for housekeeping employees to access their page
  if (user && location.pathname === "/housekeeping-employee") {
    console.log("Rendering HousekeepingEmployee component - DEBUG MODE");
    console.log("Full user object:", user);

    // Temporary debug display
    return (
      <div style={{ padding: "20px", fontFamily: "monospace" }}>
        <h2>Debug: Housekeeping Employee Route</h2>
        <p>User ID: {user.id}</p>
        <p>User Role: {user.role}</p>
        <p>User Position: {user.position}</p>
        <p>User Site ID: {user.siteId}</p>
        <hr />
        <h3>Full User Object:</h3>
        <pre>{JSON.stringify(user, null, 2)}</pre>
        <hr />
        <h3>HousekeepingEmployee Component:</h3>
        <HousekeepingEmployee />
      </div>
    );
  }

  console.log(
    "No component rendered, user:",
    user?.position,
    "pathname:",
    location.pathname
  );
  // For non-admin users, this should not render (they get redirected)
  return null;
};

export default RoleBasedRedirect;
