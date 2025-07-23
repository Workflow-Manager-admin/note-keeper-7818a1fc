import React, { useState } from 'react';
import { login, register } from './api';

// PUBLIC_INTERFACE
export default function AuthForm({ onLogin }) {
  /**
   * Login/register form for user authentication.
   */
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await login(username, password);
      } else {
        result = await register(username, password);
      }
      onLogin(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-form-container minimal-box">
      <h2 style={{ color: '#3f51b5', marginBottom: 18 }}>
        {mode === 'login' ? 'Sign In' : 'Register'}
      </h2>
      <form className="minimal-form" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          autoComplete="username"
          required
          minLength={3}
          maxLength={32}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          minLength={6}
          maxLength={64}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading} style={{ background: '#3f51b5', color: '#fff', marginTop: 8 }}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Register'}
        </button>
        {error && <div className="error-message">{error}</div>}
      </form>
      <div className="toggle-mode">
        {mode === 'login' ? (
          <>
            <span>No account? </span>
            <button type="button" onClick={() => setMode('register')}>
              Register
            </button>
          </>
        ) : (
          <>
            <span>Already registered? </span>
            <button type="button" onClick={() => setMode('login')}>
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
