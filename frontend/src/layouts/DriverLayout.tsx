import React, { useState } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/TransitOpsLOGO.webp';
import './DriverLayout.css';

const DriverLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNav = (filter: string) => {
    setSearchParams({ filter });
    setIsMenuOpen(false);
  };

  const currentFilter = searchParams.get('filter') || 'DISPATCHED';

  return (
    <div className="driver-layout">
      {/* Top Navigation */}
      <header className="driver-header">
        <div className="driver-header-left">
          <img src={logo} alt="TransitOps" className="driver-header-logo" />
          <span className="driver-header-title">TransitOps</span>
        </div>
        <button className="driver-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Hamburger Menu Overlay */}
      {isMenuOpen && (
        <div className="driver-menu-overlay">
          <div className="driver-menu-content">
            <div className="driver-menu-user">
              <div className="driver-menu-avatar"><User size={24} /></div>
              <div>
                <div className="driver-menu-name">{user?.name}</div>
                <div className="driver-menu-role">Driver Portal</div>
              </div>
            </div>
            <nav className="driver-nav-links">
              <button 
                className={`driver-nav-link ${currentFilter === 'DRAFT' ? 'active' : ''}`}
                onClick={() => handleNav('DRAFT')}
              >
                Assigned Trips
              </button>
              <button 
                className={`driver-nav-link ${currentFilter === 'DISPATCHED' ? 'active' : ''}`}
                onClick={() => handleNav('DISPATCHED')}
              >
                Active Trips
              </button>
              <button 
                className={`driver-nav-link ${currentFilter === 'COMPLETED' ? 'active' : ''}`}
                onClick={() => handleNav('COMPLETED')}
              >
                Past Trips
              </button>
              <button 
                className={`driver-nav-link ${currentFilter === 'CANCELLED' ? 'active' : ''}`}
                onClick={() => handleNav('CANCELLED')}
              >
                Cancelled Trips
              </button>
            </nav>
            <div className="driver-menu-footer">
              <button className="driver-logout-btn" onClick={handleLogout}>
                <LogOut size={20} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="driver-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DriverLayout;
