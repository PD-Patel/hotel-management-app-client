import "./App.css";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import ProtectedRoute from "./components/ProtectedRoute";
import PayMethodProtectedRoute from "./components/PayMethodProtectedRoute";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/Home";

import ClockInOut from "./pages/ClockInOut";
import PayrollHistory from "./pages/PayrollHistory";
import EmployeePayroll from "./pages/EmployeePayroll";

import RoleBasedRedirect from "./components/RoleBasedRedirect";

import DebugUser from "./pages/DebugUser";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/clock" element={<ClockInOut />} />

            {/* Protected root route - redirects based on user role */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Accessible to all authenticated users */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <PayMethodProtectedRoute
                    allowedPayMethods={["hourly", "hourly_cash"]}
                    fallbackPath="/housekeeping-employee"
                  >
                    <Home />
                  </PayMethodProtectedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/frontdesk"
              element={<RoleBasedRedirect fallbackPath="/home" />}
            />

            <Route
              path="/housekeeping"
              element={<RoleBasedRedirect fallbackPath="/home" />}
            />

            <Route
              path="/housekeeping-employee"
              element={<RoleBasedRedirect fallbackPath="/home" />}
            />

            <Route
              path="/dashboard"
              element={<RoleBasedRedirect fallbackPath="/home" />}
            />

            <Route
              path="/employee-payroll"
              element={<RoleBasedRedirect fallbackPath="/home" />}
            />

            {/* Admin-only Routes - Redirect employees to home */}
            <Route
              path="/employee"
              element={<RoleBasedRedirect fallbackPath="/home" />}
            />

            <Route
              path="/payroll"
              element={<RoleBasedRedirect fallbackPath="/home" />}
            />

            <Route
              path="/payroll/history"
              element={<RoleBasedRedirect fallbackPath="/home" />}
            />

            <Route
              path="/employee/add"
              element={<RoleBasedRedirect fallbackPath="/home" />}
            />

            <Route
              path="/employee/edit/:id"
              element={<RoleBasedRedirect fallbackPath="/home" />}
            />
            <Route
              path="/clock-logs"
              element={
                <ProtectedRoute>
                  <PayMethodProtectedRoute
                    allowedPayMethods={["hourly", "hourly_cash"]}
                    fallbackPath="/housekeeping-employee"
                  >
                    <RoleBasedRedirect fallbackPath="/home" />
                  </PayMethodProtectedRoute>
                </ProtectedRoute>
              }
            />

            {/* Admin and Manager Routes - Redirect employees to home */}
            <Route
              path="/settings/geolocation"
              element={<RoleBasedRedirect fallbackPath="/home" />}
            />

            {/* Room Management - Admin Only - Redirect employees to home */}
            <Route
              path="/settings/room-management"
              element={<RoleBasedRedirect fallbackPath="/home" />}
            />

            {/* User Management - Admin Only - Redirect employees to home */}
            <Route
              path="/users"
              element={<RoleBasedRedirect fallbackPath="/home" />}
            />

            {/* Test Route */}
            <Route path="/test" element={<div>Test Route Working!</div>} />

            {/* Debug Route - Temporary */}
            <Route
              path="/debug-user"
              element={
                <ProtectedRoute>
                  <DebugUser />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
