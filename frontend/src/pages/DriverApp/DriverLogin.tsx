import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initiateLogin, confirmLogin } from '../../api/auth';
import { setTokens } from '../../api/client';
import logo from '../../assets/TransitOpsLOGO.webp';
import './DriverLogin.css';

const DriverLogin: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { refreshSession } = useAuth();
  const navigate = useNavigate();

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await initiateLogin(email, password);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const data = await confirmLogin(email, otp);
      setTokens(data.access_token, data.refresh_token);
      await refreshSession();
      // Even if they are an admin, redirecting to driver dashboard is fine 
      // if they purposefully used the driver portal login.
      navigate('/driver/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="driver-login-container">
      <div className="driver-login-header">
        <img src={logo} alt="TransitOps Logo" className="driver-logo" />
        <h1 className="driver-title">Driver Portal</h1>
        <p className="driver-subtitle">Welcome back to TransitOps</p>
      </div>

      <div className="driver-card">
        {error && <div className="driver-alert driver-alert-error">{error}</div>}
        
        {step === 'email' ? (
          <form onSubmit={handleNext}>
            <div className="driver-input-group">
              <label className="driver-label">Email Address</label>
              <input 
                type="email" 
                className="driver-input" 
                placeholder="driver@transitops.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="driver-input-group">
              <label className="driver-label">Password</label>
              <input 
                type="password" 
                className="driver-input" 
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="driver-btn driver-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Loading...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="driver-input-group">
              <label className="driver-label" style={{textAlign: 'center', marginBottom: '16px'}}>
                Enter the 6-digit code sent to your email
              </label>
              <input 
                type="text" 
                className="driver-input" 
                placeholder="000000"
                maxLength={6}
                style={{textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold'}}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="driver-btn driver-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Sign In'}
            </button>
            <button 
              type="button" 
              className="driver-btn" 
              style={{marginTop: '16px', backgroundColor: 'transparent', color: '#64748b'}}
              onClick={() => setStep('email')}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DriverLogin;
