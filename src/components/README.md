# Role-Based Route Protection

This directory contains components for implementing role-based access control (RBAC) in your React application.

## Components

### 1. ProtectedRoute

Basic authentication protection - only checks if user is logged in.

```jsx
import ProtectedRoute from "./components/ProtectedRoute";

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>;
```

### 2. RoleProtectedRoute

Advanced role-based protection with customizable fallback behavior.

```jsx
import RoleProtectedRoute from "./components/RoleProtectedRoute";

<Route
  path="/admin-only"
  element={
    <RoleProtectedRoute
      allowedRoles={["admin"]}
      fallbackPath="/dashboard"
      showAccessDenied={false}
    >
      <AdminPage />
    </RoleProtectedRoute>
  }
/>;
```

**Props:**

- `allowedRoles`: Array of roles that can access the route
- `fallbackPath`: Where to redirect unauthorized users (default: "/dashboard")
- `showAccessDenied`: Show access denied page instead of redirecting (default: false)

### 3. RouteGuard (Predefined Guards)

Convenient predefined route guards for common role combinations.

```jsx
import { AdminOnly, AdminOrManager, EmployeeOrAbove } from "./components/RouteGuard";

// Admin only
<Route
  path="/employee"
  element={
    <AdminOnly>
      <Employee />
    </AdminOnly>
  }
/>

// Admin or Manager
<Route
  path="/settings"
  element={
    <AdminOrManager>
      <Settings />
    </AdminOrManager>
  }
/>

// Employee or above (any authenticated user)
<Route
  path="/profile"
  element={
    <EmployeeOrAbove>
      <Profile />
    </EmployeeOrAbove>
  }
/>
```

### 4. AccessDenied

Customizable access denied page component.

```jsx
import AccessDenied from "./components/AccessDenied";

<AccessDenied
  title="Custom Title"
  message="Custom message here"
  buttonText="Go Back"
  onButtonClick={() => history.goBack()}
/>;
```

## Usage Examples

### Basic Role Protection

```jsx
// Only admins can access
<Route
  path="/admin"
  element={
    <AdminOnly>
      <AdminPanel />
    </AdminOnly>
  }
/>
```

### Custom Role Combinations

```jsx
// Multiple specific roles
<Route
  path="/management"
  element={
    <CustomRoleGuard allowedRoles={["admin", "manager", "supervisor"]}>
      <ManagementPanel />
    </CustomRoleGuard>
  }
/>
```

### Show Access Denied Instead of Redirect

```jsx
// Show access denied page
<Route
  path="/restricted"
  element={
    <RoleProtectedRoute allowedRoles={["admin"]} showAccessDenied={true}>
      <RestrictedPage />
    </RoleProtectedRoute>
  }
/>
```

## Role Hierarchy

The system supports these roles (defined in your User model):

- `admin`: Full access to all features
- `employee`: Basic access to dashboard and clock in/out
- `manager`: Access to management features (if you add this role)

## Best Practices

1. **Use predefined guards** when possible for consistency
2. **Set appropriate fallback paths** for better UX
3. **Consider showing access denied** for important restricted areas
4. **Group routes by access level** in your App.js for better organization
5. **Test with different user roles** to ensure protection works correctly

## Security Notes

- Role checking happens on the client side for UX
- Always implement server-side role validation for API endpoints
- The role information comes from your AuthContext
- Users cannot bypass role restrictions by manipulating client-side code
