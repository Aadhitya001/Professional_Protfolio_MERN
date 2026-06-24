import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Lock } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
          <div className="login-logo">Admin Access</div>
          <p style={{ color: 'var(--text-secondary)' }}>Login to manage your portfolio</p>
        </div>

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

          {error && (
            <div className="form-alert form-alert-error">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'} <Lock size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
