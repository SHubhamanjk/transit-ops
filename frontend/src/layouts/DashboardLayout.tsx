import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import './DashboardLayout.css';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  
  // Format the path to get a title (e.g., "/fleet" -> "Fleet")
  const pageTitle = location.pathname.split('/')[1];
  const formattedTitle = pageTitle ? pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1) : 'Dashboard';

  return (
    <div className="layout-container">
      {/* 1. Left sidebar */}
      <Sidebar />
      
      <div className="layout-main">
        {/* 2. Main header of the app */}
        <Navbar />
        
        {/* 3. Navigation header section of the sidebars options */}
        <div className="layout-page-header">
          <h1 className="page-title">{formattedTitle}</h1>
          {/* Optional Action Items could go here, passed down via context or portal, or handled per page */}
        </div>
        
        {/* 4. Main contents layout */}
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
