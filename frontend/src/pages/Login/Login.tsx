import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { X, ArrowLeft } from 'lucide-react';
import logo from '../../assets/TransitOpsLOGO.webp';
import { initiateLogin, confirmLogin, forgotPassword, resetPassword } from '../../api/auth';
import { setTokens } from '../../api/client';
import './Login.css';

type AuthMode = 'login' | 'otp' | 'forgot' | 'reset';

const Login: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { refreshSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('logout') === 'success') {
      setSuccessMsg('You have successfully logged out.');
      // Clean up URL
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  const handleLoginInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await initiateLogin(email, password);
      setMode('otp');
      setSuccessMsg('OTP sent to your email.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const data = await confirmLogin(email, otp);
      setTokens(data.access_token, data.refresh_token);
      await refreshSession();
      if (data.user.role === 'DRIVER') {
        navigate('/driver/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setMode('reset');
      setSuccessMsg('If email exists, an OTP has been sent.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error requesting reset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await resetPassword(email, otp, newPassword);
      setMode('login');
      setSuccessMsg('Password reset successful. Please login.');
      setPassword('');
      setOtp('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP or error resetting password');
    } finally {
      setIsSubmitting(false);
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
          {errorMsg && (
            <div className="error-state">
              <div className="error-state-title">
                <X size={16} /> Error
              </div>
              <p>{errorMsg}</p>
            </div>
          )}
          {successMsg && !errorMsg && (
             <div className="success-state" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(34, 197, 94, 0.2)'}}>
               <p>{successMsg}</p>
             </div>
          )}

          <div className="login-form-header">
            {mode === 'login' && (
              <>
                <h2>Sign in to your account</h2>
                <p>Enter your credentials to continue</p>
              </>
            )}
            {mode === 'otp' && (
              <>
                <h2>Two-Factor Authentication</h2>
                <p>Enter the 6-digit code sent to {email}</p>
              </>
            )}
            {mode === 'forgot' && (
              <>
                <h2>Forgot Password</h2>
                <p>Enter your email to receive a reset code</p>
              </>
            )}
            {mode === 'reset' && (
              <>
                <h2>Reset Password</h2>
                <p>Enter the code sent to {email} and your new password</p>
              </>
            )}
          </div>

          {mode === 'login' && (
            <form onSubmit={handleLoginInitiate}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="form-options" style={{justifyContent: 'flex-end'}}>
                <button type="button" className="text-button" onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}>Forgot password?</button>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign In'}</button>
            </form>
          )}

          {mode === 'otp' && (
            <form onSubmit={handleLoginConfirm}>
              <div className="form-group">
                <label htmlFor="otp">One-Time Password (OTP)</label>
                <input type="text" id="otp" className="form-input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" maxLength={6} required />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Verifying...' : 'Verify & Login'}</button>
              <button type="button" className="btn-secondary" onClick={() => setMode('login')} style={{marginTop: '12px', width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer'}}>
                <ArrowLeft size={16} style={{display: 'inline', marginRight: '8px', verticalAlign: 'middle'}}/> Back to Login
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Reset Code'}</button>
              <button type="button" className="btn-secondary" onClick={() => setMode('login')} style={{marginTop: '12px', width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer'}}>
                <ArrowLeft size={16} style={{display: 'inline', marginRight: '8px', verticalAlign: 'middle'}}/> Back to Login
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label htmlFor="otp">Reset Code (OTP)</label>
                <input type="text" id="otp" className="form-input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" maxLength={6} required />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input type="password" id="newPassword" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Resetting...' : 'Reset Password'}</button>
              <button type="button" className="btn-secondary" onClick={() => setMode('login')} style={{marginTop: '12px', width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer'}}>
                <ArrowLeft size={16} style={{display: 'inline', marginRight: '8px', verticalAlign: 'middle'}}/> Back to Login
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
