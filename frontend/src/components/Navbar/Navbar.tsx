import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  
  const getInitials = (email: string) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split(/(?=[A-Z])/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getUsername = (email: string) => {
    if (!email) return 'User';
    return email.split('@')[0].replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <header className="navbar">
      <div className="navbar-search">
        <Search size={16} className="search-icon" />
        <input type="text" placeholder="Search..." className="search-input" />
      </div>
      <div className="navbar-user">
        <span className="user-name">{getUsername(user?.email || '')}</span>
        <div className="user-role-badge">
          {user?.role} <span className="user-initials">{getInitials(user?.email || '')}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
