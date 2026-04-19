import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Camera, LayoutDashboard, ShieldAlert, Pill, MapPin } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();



  return (
    <nav className="bottom-nav">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
        <Home size={24} />
        <span>Home</span>
      </Link>
      <Link to="/pro-scan" className={location.pathname === '/pro-scan' ? 'active' : ''}>
        <Camera size={24} />
        <span>Scan</span>
      </Link>
      <Link to="/pharmacy" className={location.pathname === '/pharmacy' ? 'active' : ''}>
        <LayoutDashboard size={24} />
        <span>Pharmacy</span>
      </Link>

    </nav>
  );
};

export default BottomNav;
