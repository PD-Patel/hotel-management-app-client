# Frontend Code Cleanup Guide

## 🚀 Quick Start

Run the cleanup script to reorganize components:

```bash
chmod +x cleanup-frontend.sh
./cleanup-frontend.sh
```

## 📋 Current Issues & Solutions

### 1. **File Organization Issues**

#### Problem:

- All components in one directory
- Mixed component types
- Inconsistent naming conventions

#### Solution:

```
src/components/
├── layout/          # Navigation, routing, layout
├── dashboard/       # Dashboard-specific components
├── forms/          # Form components
├── ui/             # Reusable UI components
└── feature/        # Feature-specific components
```

### 2. **Large Component Files**

#### Problem:

- `Sidebar.js` (558 lines)
- `EmployeeForm.js` (612 lines)

#### Solution:

Break into smaller, focused components:

**Sidebar.js → Split into:**

- `Sidebar.js` (main container)
- `SidebarLogo.js` (logo section)
- `SidebarMenu.js` (menu items)
- `SidebarUser.js` (user section)

**EmployeeForm.js → Split into:**

- `EmployeeForm.js` (main form)
- `EmployeePersonalInfo.js` (personal info section)
- `EmployeeWorkInfo.js` (work info section)
- `EmployeePhotoUpload.js` (photo upload)

### 3. **Console.log Statements**

#### Problem:

Found in multiple components for debugging

#### Solution:

Replace with proper logging or remove entirely:

```javascript
// ❌ Bad
console.log(user);

// ✅ Good
// Remove or replace with proper error handling
```

### 4. **Complex useEffect in AuthContext**

#### Problem:

Multiple intervals and event listeners in one useEffect

#### Solution:

Split into multiple useEffects or custom hooks:

```javascript
// ❌ Bad - Complex useEffect
useEffect(() => {
  // Multiple responsibilities
}, []);

// ✅ Good - Split responsibilities
useEffect(() => {
  checkAuthStatus();
}, []);

useEffect(() => {
  if (!isLoggedIn || !user) return;

  const interval = setInterval(refreshSession, 9 * 24 * 60 * 60 * 1000);
  return () => clearInterval(interval);
}, [isLoggedIn, user]);

useEffect(() => {
  if (!isLoggedIn || !user) return;

  const cleanup = setupActivityMonitoring();
  return cleanup;
}, [isLoggedIn, user]);
```

### 5. **Unused Dependencies**

#### Remove from package.json:

```json
{
  "dependencies": {
    "@testing-library/dom": "^10.4.1", // ❌ Remove if not testing
    "@testing-library/jest-dom": "^6.6.4", // ❌ Remove if not testing
    "@testing-library/react": "^16.3.0", // ❌ Remove if not testing
    "@testing-library/user-event": "^13.5.0", // ❌ Remove if not testing
    "@fortawesome/fontawesome-free": "^7.0.0", // ❌ Remove (using MDB icons)
    "socket.io-client": "^4.8.1", // ❌ Remove if not using real-time
    "web-vitals": "^2.1.4" // ❌ Remove if not measuring performance
  }
}
```

## 🔧 Implementation Steps

### Step 1: Run Cleanup Script

```bash
./cleanup-frontend.sh
```

### Step 2: Update Import Statements

After reorganization, update imports in your components:

```javascript
// ❌ Old imports
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";

// ✅ New imports
import { ProtectedRoute, Sidebar } from "./components/layout";
import { CurrentlyClockedInCard } from "./components/dashboard";
```

### Step 3: Break Down Large Components

#### Example: Split Sidebar.js

**Create `src/components/layout/SidebarLogo.js`:**

```javascript
import React from "react";
import { MDBIcon } from "mdb-react-ui-kit";
import styled from "styled-components";

const SidebarLogo = () => (
  <LogoContainer>
    <Logo>
      <HotelIcon>
        <MDBIcon fas icon="hotel" />
      </HotelIcon>
      <LogoText>
        <LogoMain>DaysInn</LogoMain>
        <LogoSub>Management</LogoSub>
      </LogoText>
    </Logo>
  </LogoContainer>
);

export default SidebarLogo;
```

**Update `src/components/layout/Sidebar.js`:**

```javascript
import React, { useState, useEffect } from "react";
import SidebarLogo from "./SidebarLogo";
import SidebarMenu from "./SidebarMenu";
import SidebarUser from "./SidebarUser";

const Sidebar = ({ user }) => {
  // ... state and logic

  return (
    <SidebarContainer>
      <SidebarLogo />
      <SidebarMenu user={user} active={active} onMenuClick={handleActive} />
      <SidebarUser user={user} onLogout={handleLogout} />
    </SidebarContainer>
  );
};
```

### Step 4: Add PropTypes

```javascript
import PropTypes from "prop-types";

const Sidebar = ({ user }) => {
  // ... component logic
};

Sidebar.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.oneOf(["admin", "manager", "employee"]).isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    photo: PropTypes.string,
  }).isRequired,
};

export default Sidebar;
```

### Step 5: Implement Error Boundaries

**Create `src/components/ui/ErrorBoundary.js`:**

```javascript
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Step 6: Add Loading States

```javascript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (data) => {
  setIsLoading(true);
  try {
    await submitEmployee(data);
    // Success handling
  } catch (error) {
    // Error handling
  } finally {
    setIsLoading(false);
  }
};

return (
  <form onSubmit={handleSubmit}>
    {/* Form fields */}
    <button type="submit" disabled={isLoading}>
      {isLoading ? "Saving..." : "Save Employee"}
    </button>
  </form>
);
```

## 📁 New File Structure

After cleanup, your structure will be:

```
src/
├── components/
│   ├── layout/
│   │   ├── index.js
│   │   ├── Sidebar.js
│   │   ├── SidebarLogo.js
│   │   ├── SidebarMenu.js
│   │   ├── SidebarUser.js
│   │   ├── ProtectedRoute.js
│   │   ├── RoleProtectedRoute.js
│   │   └── RouteGuard.js
│   ├── dashboard/
│   │   ├── index.js
│   │   ├── CurrentlyClockedInCard.js
│   │   ├── EmployeeHoursDashboardCard.js
│   │   ├── HoursCard.js
│   │   ├── TotalEmployeeCard.js
│   │   └── TotalPayRollAmountCard.js
│   ├── forms/
│   │   ├── index.js
│   │   ├── EmployeeForm.js
│   │   ├── EmployeePersonalInfo.js
│   │   ├── EmployeeWorkInfo.js
│   │   └── EmployeePhotoUpload.js
│   ├── ui/
│   │   ├── index.js
│   │   ├── Alert.js
│   │   ├── AccessDenied.js
│   │   ├── GreetingNote.js
│   │   └── ErrorBoundary.js
│   └── feature/
│       ├── housekeeping/
│       └── rooms/
```

## 🎯 Benefits of This Cleanup

1. **Better Organization**: Easy to find components by type
2. **Maintainability**: Smaller, focused components
3. **Reusability**: UI components can be reused across features
4. **Testing**: Easier to test individual components
5. **Performance**: Better code splitting and lazy loading potential
6. **Team Collaboration**: Clear structure for multiple developers
7. **Scalability**: Easy to add new features without cluttering

## 🚨 Common Pitfalls to Avoid

1. **Don't move everything at once** - Test each move
2. **Don't forget to update imports** - Use search and replace
3. **Don't break existing functionality** - Test after each change
4. **Don't create too many subdirectories** - Keep it logical
5. **Don't ignore the console errors** - Fix import issues immediately

## 🔍 Testing Your Cleanup

After cleanup, test:

1. **Build the project**: `npm run build`
2. **Start development server**: `npm start`
3. **Navigate through all routes** to ensure components load
4. **Check browser console** for import errors
5. **Test all major functionality** (login, dashboard, forms)

## 📚 Additional Resources

- [React Best Practices](https://react.dev/learn)
- [Component Composition Patterns](https://react.dev/learn/passing-props-to-a-component)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
