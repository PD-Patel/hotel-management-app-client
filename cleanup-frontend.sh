#!/bin/bash

echo "🧹 Starting Frontend Code Cleanup..."

# Create new directory structure
echo "📁 Creating new component directory structure..."
mkdir -p src/components/layout
mkdir -p src/components/dashboard
mkdir -p src/components/forms
mkdir -p src/components/ui
mkdir -p src/components/feature

# Move layout components
echo "📦 Moving layout components..."
mv src/components/Sidebar.js src/components/layout/
mv src/components/ProtectedRoute.js src/components/layout/
mv src/components/RoleProtectedRoute.js src/components/layout/
mv src/components/RouteGuard.js src/components/layout/

# Move dashboard components
echo "📊 Moving dashboard components..."
mv src/components/currentlyClockedInCard.js src/components/dashboard/
mv src/components/EmployeeHoursDashboardCard.js src/components/dashboard/
mv src/components/HoursCard.js src/components/dashboard/
mv src/components/TotalEmployeeCard.js src/components/dashboard/
mv src/components/TotalPayRollAmountCard.js src/components/dashboard/

# Move form components
echo "📝 Moving form components..."
mv src/components/EmployeeForm.js src/components/forms/

# Move UI components
echo "🎨 Moving UI components..."
mv src/components/Alert.js src/components/ui/
mv src/components/AccessDenied.js src/components/ui/
mv src/components/GreetingNote.js src/components/ui/

# Move feature components
echo "🔧 Moving feature components..."
mv src/components/housekeeping src/components/feature/
mv src/components/rooms src/components/feature/

# Rename files to follow PascalCase convention
echo "✏️ Renaming files to PascalCase..."
cd src/components/dashboard
mv currentlyClockedInCard.js CurrentlyClockedInCard.js
cd ../..

# Update imports in App.js
echo "🔗 Updating imports in App.js..."
sed -i '' 's|./components/ProtectedRoute|./components/layout/ProtectedRoute|g' src/App.js
sed -i '' 's|./components/RoleBasedRedirect|./components/layout/RoleBasedRedirect|g' src/App.js

# Create index files for easier imports
echo "📋 Creating index files for easier imports..."

cat > src/components/layout/index.js << 'EOF'
export { default as Sidebar } from './Sidebar';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as RoleProtectedRoute } from './RoleProtectedRoute';
export { default as RouteGuard } from './RouteGuard';
export { default as RoleBasedRedirect } from '../RoleBasedRedirect';
EOF

cat > src/components/dashboard/index.js << 'EOF'
export { default as CurrentlyClockedInCard } from './CurrentlyClockedInCard';
export { default as EmployeeHoursDashboardCard } from './EmployeeHoursDashboardCard';
export { default as HoursCard } from './HoursCard';
export { default as TotalEmployeeCard } from './TotalEmployeeCard';
export { default as TotalPayRollAmountCard } from './TotalPayRollAmountCard';
EOF

cat > src/components/forms/index.js << 'EOF'
export { default as EmployeeForm } from './EmployeeForm';
EOF

cat > src/components/ui/index.js << 'EOF'
export { default as Alert } from './Alert';
export { default as AccessDenied } from './AccessDenied';
export { default as GreetingNote } from './GreetingNote';
EOF

# Clean up package.json - remove unused dependencies
echo "🧹 Cleaning up package.json..."
echo "Consider removing these unused dependencies:"
echo "  - @testing-library/* (if not writing tests)"
echo "  - @fortawesome/fontawesome-free (using MDB icons instead)"
echo "  - socket.io-client (if not using real-time features)"
echo "  - web-vitals (if not measuring performance)"

echo "✅ Frontend cleanup completed!"
echo ""
echo "Next steps:"
echo "1. Update import statements in your components"
echo "2. Remove console.log statements"
echo "3. Break down large components (Sidebar.js, EmployeeForm.js)"
echo "4. Add PropTypes or TypeScript for better type safety"
echo "5. Implement error boundaries"
echo "6. Add loading states for async operations"
