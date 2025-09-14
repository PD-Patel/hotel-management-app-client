import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Dashboard from "../pages/Dashboard";
import Employee from "../pages/Employee/Employee";
import AddEmployee from "../pages/Employee/AddEmployee";
import EditEmployee from "../pages/Employee/EditEmployee";
import ClockLogs from "../pages/ClockLogs";
import Users from "../pages/Users/Users";
import GeolocationPage from "../pages/settings/GeolocationPage";
import RoomManagementPage from "../pages/settings/RoomManagementPage";
import Payroll from "../pages/Payroll";
import PayrollHistory from "../pages/PayrollHistory";
import EmployeePayroll from "../pages/EmployeePayroll";
import Frontdesk from "../pages/Frontdesk";
import Housekeeping from "../pages/Housekeeping";
import HousekeepingEmployeePage from "../pages/housekeeping/HousekeepingEmployeePage";

const RoleBasedRedirect = ({ fallbackPath }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      // If fallbackPath is provided, use it for non-admin users
      if (fallbackPath) {
        // Special case: housekeeping employees can access their page
        if (
          user.role === "housekeeping" &&
          location.pathname === "/housekeeping-employee"
        ) {
          return; // Allow access, no redirect
        }

        // Special case: all employees can access their payroll page
        if (location.pathname === "/employee-payroll") {
          console.log(
            "RoleBasedRedirect: Allowing access to employee-payroll for user:",
            user.role
          );
          return; // Allow access, no redirect
        }

        // For other routes, check role as before
        if (user.role === "admin" || user.role === "manager") {
          // Admin stays on current route, no redirect needed
          return;
        } else if (user.role === "frontdesk" || user.role === "housekeeping") {
          // Frontdesk and housekeeping users can access certain pages
          return;
        } else if (user.payMethod === "per_room_rate") {
          // Per room rate employees should go to housekeeping page, not home
          navigate("/housekeeping-employee", { replace: true });
        } else {
          // Other users get redirected to fallback path
          navigate(fallbackPath, { replace: true });
        }
      } else {
        // Default behavior for root route
        if (user.role === "admin" || user.role === "manager") {
          navigate("/dashboard", { replace: true });
        } else if (user.role === "frontdesk") {
          navigate("/frontdesk", { replace: true });
        } else if (user.role === "housekeeping") {
          navigate("/housekeeping-employee", { replace: true });
        } else if (user.payMethod === "per_room_rate") {
          // Per room rate employees go to housekeeping page instead of home
          navigate("/housekeeping-employee", { replace: true });
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
  if (
    user &&
    (user.role === "admin" ||
      user.role === "manager" ||
      user.role === "frontdesk" ||
      user.role === "housekeeping" ||
      user.payMethod === "per_room_rate")
  ) {
    const path = location.pathname;

    // Return the appropriate component based on the route
    if (path === "/dashboard") {
      return <Dashboard />;
    } else if (path === "/employee") {
      return <Employee />;
    } else if (path === "/employee/add") {
      return <AddEmployee />;
    } else if (path.startsWith("/employee/edit/")) {
      return <EditEmployee />;
    } else if (path === "/clock-logs") {
      // Per room rate employees shouldn't access clock logs
      if (user.payMethod === "per_room_rate") {
        navigate("/housekeeping-employee", { replace: true });
        return null;
      }
      return <ClockLogs />;
    } else if (path === "/users") {
      return <Users />;
    } else if (path === "/settings/geolocation") {
      return <GeolocationPage />;
    } else if (path === "/settings/room-management") {
      return <RoomManagementPage />;
    } else if (path === "/payroll") {
      return <Payroll />;
    } else if (path === "/payroll/history") {
      return <PayrollHistory />;
    } else if (path === "/frontdesk") {
      return <Frontdesk />;
    } else if (path === "/housekeeping") {
      return <Housekeeping />;
    } else if (path === "/housekeeping-employee") {
      return <HousekeepingEmployeePage />;
    } else if (path === "/employee-payroll") {
      return <EmployeePayroll />;
    }

    // No matching route found
    return null;
  }

  // Special case for housekeeping employees and per_room_rate employees to access their page
  if (
    user &&
    location.pathname === "/housekeeping-employee" &&
    (user.role === "housekeeping" || user.payMethod === "per_room_rate")
  ) {
    // Temporary debug display
    return (
      <div style={{ padding: "20px", fontFamily: "monospace" }}>
        <h2>Debug: Housekeeping Employee Route</h2>
        <p>User ID: {user.id}</p>
        <p>User Role: {user.role}</p>
        <p>User Site ID: {user.siteId}</p>
        <hr />
        <h3>Full User Object:</h3>
        <pre>{JSON.stringify(user, null, 2)}</pre>
        <hr />
        <h3>HousekeepingEmployee Component:</h3>
        <HousekeepingEmployeePage />
      </div>
    );
  }

  // Special case for employees to access their payroll page
  if (user && location.pathname === "/employee-payroll") {
    if (
      user.role === "frontdesk" ||
      user.role === "housekeeping" ||
      user.payMethod === "per_room_rate"
    ) {
      return <EmployeePayroll />;
    } else {
      // Admin/Manager can also access employee payroll for viewing
      return <EmployeePayroll />;
    }
  }

  // For non-admin users, this should not render (they get redirected)
  return null;
};

export default RoleBasedRedirect;
