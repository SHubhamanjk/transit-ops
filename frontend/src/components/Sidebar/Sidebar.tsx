import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/TransitOpsLOGO.webp';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo-container">
          <img src={logo} alt="TransitOps Logo" className="sidebar-logo" />
          <span>Transit<span className="brand-ops">Ops</span></span>
        </div>
        {onClose && (
          <button className="sidebar-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        )}
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" onClick={onClose} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Dashboard
        </NavLink>
        <NavLink to="/fleet" onClick={onClose} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Vehicle
        </NavLink>
        <NavLink to="/drivers" onClick={onClose} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Drivers
        </NavLink>
        <NavLink to="/trips" onClick={onClose} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Trips
        </NavLink>
        <NavLink to="/maintenance" onClick={onClose} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Maintenance
        </NavLink>

      </nav>
      <div style={{ marginTop: 'auto', padding: '1rem 0', borderTop: '1px solid var(--border-color)' }}>
        <button 
          className="nav-item" 
          onClick={handleLogout}
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '3px solid transparent' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
