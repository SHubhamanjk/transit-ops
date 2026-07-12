import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login/Login';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard/Dashboard';
import Fleet from '../pages/Fleet/Fleet';
import Drivers from '../pages/Drivers/Drivers';
import Trips from '../pages/Trips/Trips';
import Maintenance from '../pages/Maintenance/Maintenance';
import Fuel from '../pages/Fuel/Fuel';
import Analytics from '../pages/Analytics/Analytics';
import Settings from '../pages/Settings/Settings';

// Simple Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="fleet" element={<Fleet />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="trips" element={<Trips />} />
        {/* Placeholders for other routes */}
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="fuel" element={<Fuel />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
