import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000/api';

const Auth = ({ onLoginSuccess }) => {
  const [authStep, setAuthStep] = useState('login'); // 'login' or 'signup'
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess(data.user);
        navigate('/');
      } else {
        setAuthError(data.error || 'Login failed');
      }
    } catch (err) {
      setAuthError('Connection error to server');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess(data.user);
        navigate('/');
      } else {
        setAuthError(data.error || 'Signup failed');
      }
    } catch (err) {
      setAuthError('Connection error to server');
    }
  };

  return (
    <div className="fade-in section">
      <div className="glass-panel form-container">
        <div className="auth-toggle">
          <button 
            className={`auth-toggle-btn ${authStep === 'login' ? 'active' : ''}`}
            onClick={() => { setAuthStep('login'); setAuthError(''); }}
          >
            Login
          </button>
          <button 
            className={`auth-toggle-btn ${authStep === 'signup' ? 'active' : ''}`}
            onClick={() => { setAuthStep('signup'); setAuthError(''); }}
          >
            Create Account
          </button>
        </div>

        {authStep === 'login' ? (
          <>
            <h2 style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>Welcome Back</h2>
            <p style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>Login to manage your pickups and track device statuses.</p>

            {authError && <div className="auth-error">{authError}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="Enter your email" required 
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••" required 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                />
              </div>
              <button type="submit" className="btn" style={{width: '100%', marginTop: '1rem'}}>Start Session</button>
            </form>
          </>
        ) : (
          <>
            <h2 style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>Join the Trade</h2>
            <p style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>One account for all your device evaluations and sales.</p>

            {authError && <div className="auth-error">{authError}</div>}

            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. John Doe" required 
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="you@example.com" required 
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Choose a password" required 
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                />
              </div>
              <button type="submit" className="btn" style={{width: '100%', marginTop: '1rem'}}>Create Account</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
