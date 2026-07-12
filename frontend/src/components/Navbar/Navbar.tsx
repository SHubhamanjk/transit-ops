import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, Moon, Sun, LogOut, X } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    setIsDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login?logout=success', { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-left-actions">
        {onMenuClick && (
          <button className="navbar-menu-btn" onClick={onMenuClick}>
            <Menu size={24} />
          </button>
        )}
      </div>
      <div className="navbar-user" ref={dropdownRef}>
        <div 
          className="user-profile-btn" 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role?.replace('_', ' ')}</span>
          </div>
          <div className="user-avatar">
            {getInitials(user?.name || '')}
          </div>
        </div>

        {isDropdownOpen && (
          <div className="user-dropdown-menu">
            <button className="dropdown-item" onClick={toggleTheme}>
              {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
              <span>{isLightMode ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item text-danger" onClick={handleLogoutClick}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal-content">
            <div className="logout-modal-header">
              <h2>Confirm Logout</h2>
              <button className="logout-close-btn" onClick={() => setShowLogoutModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="logout-modal-body">
              <p>Are you sure you want to log out of TransitOps?</p>
            </div>
            <div className="logout-modal-footer">
              <button className="btn-secondary" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn-primary danger-btn" onClick={handleConfirmLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
