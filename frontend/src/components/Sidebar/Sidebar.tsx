import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/TransitOpsLOGO.webp';
import './Sidebar.css';

const Sidebar: React.FC = () => {

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logo} alt="TransitOps Logo" className="sidebar-logo" />
        <span>Transit<span className="brand-ops">Ops</span></span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Dashboard
        </NavLink>
        <NavLink to="/fleet" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Fleet
        </NavLink>
        <NavLink to="/drivers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Drivers
        </NavLink>
        <NavLink to="/trips" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Trips
        </NavLink>
        <NavLink to="/maintenance" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Maintenance
        </NavLink>
        <NavLink to="/fuel" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Fuel & Expenses
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Analytics
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          Settings
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
