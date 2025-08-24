import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AccessDenied from "./AccessDenied";

const RoleProtectedRoute = ({
  children,
  allowedRoles,
  fallbackPath = "/dashboard",
  showAccessDenied = false,
}) => {
  const { isLoggedIn, isLoading, user } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (showAccessDenied) {
      return (
        <AccessDenied
          title="Access Denied"
          message={`You don't have permission to access this page. Required roles: ${allowedRoles.join(
            ", "
          )}. Your role: ${user.role}.`}
        />
      );
    }
    // User doesn't have the required role, redirect to fallback path
    return <Navigate to={fallbackPath} replace />;
  }

  // Render children if authenticated and has required role
  return children;
};

export default RoleProtectedRoute;
