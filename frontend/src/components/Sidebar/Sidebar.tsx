import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import logo from '../../assets/TransitOpsLOGO.webp';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {

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
          Fleet
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
    </aside>
  );
};

export default Sidebar;
