import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, type Role } from '../context/AuthContext';
import Login from '../pages/Login/Login';
import DashboardLayout from '../layouts/DashboardLayout';
import DriverLayout from '../layouts/DriverLayout';
import Dashboard from '../pages/Dashboard/Dashboard';
import DriverDashboard from '../pages/DriverApp/DriverDashboard';
import Fleet from '../pages/Fleet/Fleet';
import Drivers from '../pages/Drivers/Drivers';
import Trips from '../pages/Trips/Trips';
import Maintenance from '../pages/Maintenance/Maintenance';
import Fuel from '../pages/Fuel/Fuel';
import Analytics from '../pages/Analytics/Analytics';
import Settings from '../pages/Settings/Settings';

// Simple Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: Role[] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) return <div style={{padding: '24px'}}>Loading...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If they are a driver trying to access admin, send to driver dash
    if (user.role === 'DRIVER') return <Navigate to="/driver/dashboard" replace />;
    // Otherwise send to admin dash
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin Web Portal */}
      <Route path="/" element={
        <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST', 'SAFETY_OFFICER']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="fleet" element={<Fleet />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="trips" element={<Trips />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="fuel" element={<Fuel />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Mobile Driver Portal */}
      <Route path="/driver" element={
        <ProtectedRoute allowedRoles={['DRIVER']}>
          <DriverLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/driver/dashboard" replace />} />
        <Route path="dashboard" element={<DriverDashboard />} />
        {/* Placeholder for driver trips/profile */}
        <Route path="trips" element={<div style={{padding: '16px'}}>My Trips Coming Soon</div>} />
        <Route path="profile" element={<div style={{padding: '16px'}}>My Profile Coming Soon</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
