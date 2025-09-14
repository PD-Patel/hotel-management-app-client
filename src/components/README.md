# Frontend Components Organization

## Component Structure

### Layout Components (`/layout`)

- `Sidebar.js` - Main navigation sidebar
- `ProtectedRoute.js` - Route protection wrapper
- `RoleProtectedRoute.js` - Role-based route protection
- `RouteGuard.js` - Route guard utilities

### Dashboard Components (`/dashboard`)

- `currentlyClockedInCard.js` - Currently clocked in display
- `EmployeeHoursDashboardCard.js` - Employee hours summary
- `HoursCard.js` - Hours display card
- `TotalEmployeeCard.js` - Total employee count
- `TotalPayRollAmountCard.js` - Payroll amount display

### Form Components (`/forms`)

- `EmployeeForm.js` - Employee creation/editing form

### UI Components (`/ui`)

- `Alert.js` - Alert/notification component
- `AccessDenied.js` - Access denied message
- `GreetingNote.js` - Greeting display

### Feature Components (`/feature`)

- `housekeeping/` - Housekeeping-specific components
- `rooms/` - Room management components

## Coding Standards

### File Naming

- Use PascalCase for all component files (e.g., `CurrentlyClockedInCard.js`)
- Use descriptive names that indicate the component's purpose

### Component Structure

- Keep components under 200 lines when possible
- Extract complex logic into custom hooks
- Use TypeScript-style prop validation with PropTypes or TypeScript

### State Management

- Use React hooks (useState, useEffect, useContext)
- Keep state as local as possible
- Use context for global state (auth, user preferences)

### Styling

- Use styled-components for component-specific styles
- Follow consistent spacing and typography
- Use CSS variables for theme values

### Performance

- Memoize expensive calculations with useMemo
- Use useCallback for event handlers passed to child components
- Implement React.memo for components that re-render frequently

## Best Practices

1. **Single Responsibility**: Each component should have one clear purpose
2. **Props Interface**: Define clear prop interfaces
3. **Error Boundaries**: Implement error boundaries for critical sections
4. **Loading States**: Always show loading states for async operations
5. **Accessibility**: Include ARIA labels and keyboard navigation
6. **Testing**: Write tests for complex logic and user interactions
