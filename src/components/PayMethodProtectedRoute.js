import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const PayMethodProtectedRoute = ({
  children,
  allowedPayMethods = [],
  fallbackPath = "/housekeeping-employee",
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.payMethod && !allowedPayMethods.includes(user.payMethod)) {
      console.log(
        `User with payMethod "${user.payMethod}" not allowed on this page. Redirecting to ${fallbackPath}`
      );
      navigate(fallbackPath, { replace: true });
    }
  }, [user, allowedPayMethods, fallbackPath, navigate]);

  // Don't render children if user's payMethod is not allowed
  if (user && user.payMethod && !allowedPayMethods.includes(user.payMethod)) {
    return null; // Will redirect via useEffect
  }

  return children;
};

export default PayMethodProtectedRoute;



