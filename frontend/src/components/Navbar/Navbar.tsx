import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="navbar-search">
        <Search size={16} className="search-icon" />
        <input type="text" placeholder="Search..." className="search-input" />
      </div>
      <div className="navbar-user">
        <span className="user-name">{user?.name || 'User'}</span>
        <div className="user-role-badge">
          {user?.role} <span className="user-initials">{getInitials(user?.name || '')}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
