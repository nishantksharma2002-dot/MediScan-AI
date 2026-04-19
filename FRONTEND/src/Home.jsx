import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Camera,
  Truck,
  Activity,
  Clock,
  Stethoscope,
  ChevronRight,
  Pill,
  Heart,
  ShieldAlert,
  Zap,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Star,
  BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const [liveCount, setLiveCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    // Search disabled
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };


  useEffect(() => {
    const t1 = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 3));
    }, 4000);
    const t2 = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const stats = [
    { label: 'Prescriptions Scanned', value: '0', icon: Camera, color: '#22d3ee' },
    { label: 'Active Pharmacies', value: '0', icon: Pill, color: '#a78bfa' },
    { label: 'Avg Response Time', value: '--', icon: Zap, color: '#fbbf24' },
  ];

  return (
    <div className="home-container">

      {/* ===== HERO ===== */}
      <section style={{ textAlign: 'center', padding: '4rem 0 2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >


          <h1 style={{
            fontSize: 'clamp(4rem, 12vw, 7rem)', 
            fontWeight: 900, 
            lineHeight: 1.05, 
            margin: '0 0 1.5rem',
            background: 'linear-gradient(to right, var(--text-primary) 20%, var(--accent-blue) 80%)',
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(0, 229, 255, 0.3))'
          }}>
            Medi<span style={{ color: 'var(--accent-blue)', WebkitTextFillColor: 'initial' }}>Scan</span>
          </h1>

          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.25rem', 
            maxWidth: '600px', 
            margin: '0 auto 3rem', 
            lineHeight: 1.6 
          }}>
            Scan prescriptions with military-grade precision. <br />
            Verified by AI, delivered to your doorstep.
          </p>

          <div className="search-container" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <Search className="search-icon" size={24} />
            <input
              type="text"
              className="search-input"
              placeholder="Search for medicines, records or doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ paddingRight: '12rem' }}
            />
            <button type="button" className="search-button" onClick={handleSearch}>
              Search
            </button>
          </div>
        </motion.div>
      </section>

      {/* ===== QUICK ACTIONS ===== */}
      <section className="services-hub">
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
        </div>

        <div className="services-grid">
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex"
          >
            <Link to="/pro-scan" className="service-card flex-1" data-cursor-icon="Camera">
              <div className="service-icon-wrapper">
                <Camera size={28} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Upload</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Instant Analysis</p>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex"
          >
            <div className="service-card flex-1" data-cursor-icon="Heart">
              <div className="service-icon-wrapper" style={{ color: 'var(--accent-purple)' }}>
                <Heart size={28} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Refill</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>One-Tap Reorder</p>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex"
          >
            <div className="service-card flex-1" data-cursor-icon="Steth">
              <div className="service-icon-wrapper" style={{ color: 'var(--priority-regular)' }}>
                <Stethoscope size={28} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Consult</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Chat with Doctor</p>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex"
          >
            <div className="service-card flex-1" data-cursor-icon="Pill">
              <div className="service-icon-wrapper" style={{ color: '#14b8a6' }}>
                <Pill size={28} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Medicines</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Browse Catalog</p>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </motion.div>
        </div>
      </section>










      {/* ===== EMERGENCY ===== */}
      <section style={{ marginTop: '4rem' }}>
        <div className="glass-panel" style={{
          background: 'linear-gradient(135deg, rgba(255, 77, 77, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)',
          border: '1px solid rgba(255, 77, 77, 0.3)',
          padding: '2rem 3rem',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '2rem',
          transform: 'none', // Remove anti-gravity
          boxShadow: 'none'  // Grounded feel
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, minWidth: '300px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'rgba(255, 77, 77, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4d4d',
              boxShadow: '0 0 30px rgba(255, 77, 77, 0.2)'
            }}>
              <ShieldAlert size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Emergency Support</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                For immediate life-threatening situations, please contact emergency services.
              </p>
            </div>
          </div>

          <div className="shimmer-btn" style={{
            background: '#ff4d4d', color: 'white', border: 'none',
            padding: '1.25rem 2.5rem', fontSize: '1.5rem', fontWeight: 900,
            boxShadow: '0 10px 40px rgba(255, 77, 77, 0.5)', borderRadius: '16px',
            display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none',
            cursor: 'default'
          }}>
            <Activity size={28} /> CALL 911
          </div>
        </div>
      </section>


      {/* ===== FOOTER — NEW ===== */}
      <footer style={{
        marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid var(--glass-border)',
        textAlign: 'center', paddingBottom: '6rem'
      }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
          <span style={{ 
            position: 'absolute', 
            fontSize: '3rem', 
            opacity: 0.05, 
            fontWeight: 900, 
            letterSpacing: '0.2em',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}>
            MEDISCAN
          </span>
          <p style={{
            position: 'relative',
            fontSize: '1.5rem', fontWeight: 900, margin: 0,
            background: 'linear-gradient(90deg, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            zIndex: 1
          }}>
            Medi<span style={{ WebkitTextFillColor: '#22d3ee' }}>Scan</span> AI
          </p>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0 auto', maxWidth: 400 }}>
          Neural-powered prescription intelligence. Built for patients, pharmacies, and healthcare providers.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '1.5rem' }}>
          © {new Date().getFullYear()} MediScan AI — All rights reserved
        </p>
      </footer>


    </div>
  );
}
