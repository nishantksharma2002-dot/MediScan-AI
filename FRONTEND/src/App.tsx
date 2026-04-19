import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, Sun, Moon, Pill, Home as HomeIcon, FileSearch } from 'lucide-react';
import Home from './Home';
import PharmacyDashboard from './PharmacyDashboard';
import AIScannerPro from './AIScannerPro';
import NearbyHospitals from './NearbyHospitals';
import CustomCursor from './CustomCursor';
import BottomNav from './BottomNav';
import BackgroundEffects from './BackgroundEffects';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Auth from './Auth';
import './index.css';

function Navbar({ theme, toggleTheme }: { theme: string, toggleTheme: (e: React.MouseEvent) => void }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="navbar desktop-only">
      <Link to="/" className="nav-brand" style={{ textDecoration: 'none', position: 'relative', overflow: 'visible' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ 
            position: 'absolute', 
            fontSize: '1.5rem', 
            opacity: 0.1, 
            fontWeight: 900, 
            letterSpacing: '0.1em',
            left: '-10px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}>
            MEDISCAN
          </span>
          <Activity size={28} strokeWidth={2.5} style={{ position: 'relative', zIndex: 1 }} />
        </div>
        <span style={{ position: 'relative', zIndex: 1 }}>MediScan AI</span>
      </Link>
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Home
        </Link>
        <Link to="/pro-scan" className={location.pathname === '/pro-scan' ? 'active' : ''}>
          AI Scanner Pro
        </Link>
        <Link to="/pharmacy" className={location.pathname === '/pharmacy' ? 'active' : ''}>
          Pharmacy Hub
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: '2rem' }}>
          {user ? (
            <button 
              onClick={logout}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-purple)', fontWeight: 700, cursor: 'pointer' }}
            >
              Sign Out
            </button>
          ) : (
            <Link to="/auth" style={{ textDecoration: 'none', color: 'var(--accent-blue)', fontWeight: 700 }}>
              Sign In
            </Link>
          )}

          <button
            onClick={(e) => toggleTheme(e)}
            className="theme-toggle"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = (event?: React.MouseEvent) => {
    const isAppearanceTransition =
      // @ts-ignore
      document.startViewTransition &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isAppearanceTransition || !event) {
      setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // @ts-ignore
    const transition = document.startViewTransition(async () => {
      setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: theme === 'dark' ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: theme === 'dark' ? '::view-transition-old(root)' : '::view-transition-new(root)',
        }
      );
    });
  };

  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <BackgroundEffects />
          <CustomCursor />
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          <div className="container">
            <Routes>
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/pro-scan" 
                element={
                  <ProtectedRoute>
                    <AIScannerPro />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pharmacy" 
                element={
                  <ProtectedRoute>
                    <PharmacyDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hospitals" 
                element={
                  <ProtectedRoute>
                    <NearbyHospitals />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
          <BottomNav theme={theme} />
        </div>
      </Router>
    </AuthProvider>
  );
}
