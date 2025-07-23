import React, { useState, useEffect } from 'react';
import './App.css';
import './index.css';
import AuthForm from './AuthForm';
import NotesApp from './NotesApp';
import { getAuthToken, setAuthToken } from './api';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [tokenChecked, setTokenChecked] = useState(false);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // On mount, check saved token for login
  useEffect(() => {
    (async () => {
      const jwt = getAuthToken();
      if (!jwt) {
        setTokenChecked(true);
        return;
      }
      // Optionally: validate token with API (skipped for brevity)
      // We assume backend provides /me for user info (TODO: could enhance)
      try {
        const res = await fetch('http://localhost:3001/api/me', {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (!res.ok) throw new Error('Invalid token');
        const userObj = await res.json();
        setUser(userObj);
      } catch {
        setAuthToken(null);
      }
      setTokenChecked(true);
    })();
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleLogin = ({ user, token }) => {
    setUser(user);
    setAuthToken(token);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
  };

  if (!tokenChecked) return <div className="center-message">Loading…</div>;

  return (
    <div className="App" style={{ minHeight: '100vh' }}>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      {!user ? (
        <div className="app-centered">
          <AuthForm onLogin={handleLogin} />
        </div>
      ) : (
        <NotesApp user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
