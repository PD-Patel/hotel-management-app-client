import React from "react";
import RoleProtectedRoute from "./RoleProtectedRoute";

// Predefined route guards for common role combinations
export const AdminOnly = ({ children, fallbackPath = "/dashboard" }) => (
  <RoleProtectedRoute allowedRoles={["admin"]} fallbackPath={fallbackPath}>
    {children}
  </RoleProtectedRoute>
);

export const AdminOrManager = ({ children, fallbackPath = "/dashboard" }) => (
  <RoleProtectedRoute
    allowedRoles={["admin", "manager"]}
    fallbackPath={fallbackPath}
  >
    {children}
  </RoleProtectedRoute>
);

export const EmployeeOrAbove = ({ children, fallbackPath = "/dashboard" }) => (
  <RoleProtectedRoute
    allowedRoles={["admin", "manager", "frontdesk", "housekeeping"]}
    fallbackPath={fallbackPath}
  >
    {children}
  </RoleProtectedRoute>
);

// Custom role guard for specific roles
export const CustomRoleGuard = ({
  children,
  allowedRoles,
  fallbackPath = "/dashboard",
}) => (
  <RoleProtectedRoute allowedRoles={allowedRoles} fallbackPath={fallbackPath}>
    {children}
  </RoleProtectedRoute>
);

// Route guard with access denied message
export const AdminOnlyWithMessage = ({
  children,
  fallbackPath = "/dashboard",
}) => (
  <RoleProtectedRoute
    allowedRoles={["admin"]}
    fallbackPath={fallbackPath}
    showAccessDenied={true}
  >
    {children}
  </RoleProtectedRoute>
);
