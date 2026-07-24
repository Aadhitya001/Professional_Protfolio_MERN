import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Lock } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password OTP states
  const [showForgot, setShowForgot] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        navigate('/admin');
      } else {
        setError(data.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setError('Connection to backend failed. Please verify API is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!username.trim()) return setError('Username is required');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        if (data.otpDebug) {
          setSuccessMsg(`${data.message} OTP is: ${data.otpDebug}`);
        } else {
          setSuccessMsg(data.message || 'OTP sent successfully!');
        }
      } else {
        setError(data.message || 'Failed to send OTP.');
      }
    } catch {
      setError('Connection to backend failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!otp || !newPassword) return setError('OTP and new password are required');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), otp: otp.trim(), newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'Password reset successful!');
        setOtpSent(false);
        setShowForgot(false);
        setPassword('');
        setOtp('');
        setNewPassword('');
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch {
      setError('Connection to backend failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="bg-glow-container">
        <div className="bg-glow-orb-1"></div>
        <div className="bg-glow-orb-2"></div>
      </div>

      <div className="login-card glass-card">
        <Link to="/" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to Portfolio
        </Link>
        
        <div className="login-header">
          <div className="login-logo">
            {showForgot ? (otpSent ? 'Reset Password' : 'Forgot Password') : 'Admin Access'}
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            {showForgot 
              ? (otpSent ? 'Enter the OTP and your new password' : 'Enter your username to request a reset OTP') 
              : 'Login to manage your portfolio'}
          </p>
        </div>

        {successMsg && (
          <div className="form-alert form-alert-success" style={{ marginBottom: '15px' }}>
            {successMsg}
          </div>
        )}

        {error && (
          <div className="form-alert form-alert-error" style={{ marginBottom: '15px' }}>
            {error}
          </div>
        )}

        {!showForgot ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="login-user">Username</label>
              <input 
                type="text" 
                id="login-user" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-pass">Password</label>
              <input 
                type="password" 
                id="login-pass" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Sign In'} <Lock size={16} />
            </button>
            
            <span 
              onClick={() => {
                setShowForgot(true);
                setError('');
                setSuccessMsg('');
              }} 
              style={{ color: 'var(--accent-primary)', cursor: 'pointer', textAlign: 'center', fontSize: '0.88rem', marginTop: '5px', fontWeight: '500' }}
            >
              Forgot Password?
            </span>
          </form>
        ) : !otpSent ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="forgot-user">Username</label>
              <input 
                type="text" 
                id="forgot-user" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Reset OTP'}
            </button>

            <span 
              onClick={() => {
                setShowForgot(false);
                setError('');
                setSuccessMsg('');
              }} 
              style={{ color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'center', fontSize: '0.88rem', marginTop: '5px' }}
            >
              Back to Login
            </span>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="reset-otp">One-Time Password (OTP)</label>
              <input 
                type="text" 
                id="reset-otp" 
                required 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP code"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reset-new-pass">New Password</label>
              <input 
                type="password" 
                id="reset-new-pass" 
                required 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.88rem' }}>
              <span 
                onClick={() => setOtpSent(false)} 
                style={{ color: 'var(--accent-primary)', cursor: 'pointer' }}
              >
                Back
              </span>
              <span 
                onClick={() => {
                  setShowForgot(false);
                  setOtpSent(false);
                  setError('');
                  setSuccessMsg('');
                }} 
                style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Back to Login
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
