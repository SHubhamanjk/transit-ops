import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type Role } from '../../context/AuthContext';
import { X } from 'lucide-react';
import logo from '../../assets/TransitOpsLOGO.webp';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [showError, setShowError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && role) {
      login(email, role as Role);
      navigate('/dashboard');
    } else {
      setShowError(true);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-branding">
          <img src={logo} alt="TransitOps Logo" className="login-logo" />
          <h1 className="login-title">Transit<span className="brand-ops">Ops</span></h1>
          <p className="login-subtitle">Smart Transport Operations Platform</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          {showError && (
            <div className="error-state">
              <div className="error-state-title">
                <X size={16} /> Error state
              </div>
              <p>Invalid credentials.</p>
              <p>Account locked after 5 failed attempts.</p>
            </div>
          )}

          <div className="login-form-header">
            <h2>Sign in to your account</h2>
            <p>Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                className="form-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex.driver@transitops.in"
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your secure password"
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role (RBAC)</label>
              <select 
                id="role" 
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                required
              >
                <option value="" disabled hidden>Select your role...</option>
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
              </select>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="btn-primary">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
