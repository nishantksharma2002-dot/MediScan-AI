import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Pill,
  Clock,
  RefreshCw,
  AlertTriangle,
  Activity,
  ShieldCheck,
  ChevronRight,
  ClipboardList,
  User,
  CheckCircle2,
  XCircle,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from './lib/api';

export default function PharmacyDashboard() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError('');
    try {
      const json = await api.getPrescriptions();
      setPrescriptions(json.data.filter(rx => rx.delivery_status === 'Pending'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, statusValue) => {
    try {
      const res = await api.updatePrescriptionStatus(id, statusValue);
      setPrescriptions(prev => prev.filter(rx => rx.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = () => {
    if (prescriptions.length === 0) {
      alert("Note: The queue is already empty.");
      return;
    }

    setLoading(true);
    api.clearAllPrescriptions()
      .then(res => {
        setPrescriptions([]);
        alert("Queue cleared successfully.");
      })
      .catch(err => {
        console.error(err);
        alert("Error: Could not clear queue.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="section-header" style={{ marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 className="section-title" style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            Pharmacy <span style={{ color: 'var(--accent-blue)' }}>Hub</span>
            <Activity className="animate-pulse" size={32} color="var(--accent-blue)" />
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
            Verified Neural Prescriptions Queue
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderColor: 'var(--priority-regular)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--priority-regular)', boxShadow: '0 0 10px var(--priority-regular)' }}></div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{prescriptions.length} PENDING</span>
          </div>

          <Link
            to="/medicines"
            className="btn-primary"
            style={{ padding: '0.85rem 1.5rem', background: 'var(--accent-blue)', color: '#fff', textDecoration: 'none' }}
          >
            Browse Pharmacy Catalog
          </Link>

          <button
            className="btn-primary"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              padding: '0 1.5rem'
            }}
            onClick={fetchPrescriptions}
          >
            Sync Queue
          </button>

          <button
            className="btn-primary"
            style={{
              background: 'rgba(255, 77, 77, 0.1)',
              border: '1px solid rgba(255, 77, 77, 0.3)',
              color: '#ff4d4d',
              padding: '0 1.5rem',
              opacity: prescriptions.length === 0 ? 0.5 : 1
            }}
            onClick={handleClearAll}
          >
            <Trash2 size={18} />
            Clear All
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(255, 77, 77, 0.1)', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '1.25rem', borderRadius: '16px', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <AlertTriangle size={24} />
          <div>
            <p style={{ fontWeight: 800 }}>Network Error</p>
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{error}</p>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '10rem 0' }}>
          <div className="spinner" style={{ margin: '0 auto', width: '80px', height: '80px', borderWidth: '4px' }}></div>
          <p style={{ marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '1.2rem', letterSpacing: '0.05em' }}>
            ACCESSING ENCRYPTED DATABASE...
          </p>
        </div>
      ) : (
        <div className="dashboard-grid">
          <AnimatePresence>
            {prescriptions.map((rx, index) => (
              <motion.div
                key={rx.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                className="glass-panel"
                style={{
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderColor:
                    rx.priority_level === 'Critical' ? 'rgba(255, 77, 77, 0.4)' :
                      rx.priority_level === 'High Priority' ? 'rgba(251, 191, 36, 0.4)' :
                        rx.priority_level === 'Urgent' ? 'rgba(168, 85, 247, 0.4)' :
                          'var(--glass-border)'
                }}
              >
                {/* Status Bar */}
                <div style={{
                  background:
                    rx.priority_level === 'Critical' ? 'linear-gradient(90deg, #ff4d4d, transparent)' :
                      rx.priority_level === 'High Priority' ? 'linear-gradient(90deg, #fbbf24, transparent)' :
                        rx.priority_level === 'Urgent' ? 'linear-gradient(90deg, #a855f7, transparent)' :
                          'rgba(255,255,255,0.02)',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--glass-border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShieldCheck size={16} color={['Critical', 'High Priority', 'Urgent'].includes(rx.priority_level) ? 'white' : 'var(--accent-blue)'} />
                    <span
                      className={`badge badge-${rx.priority_level.replace(' ', '')}`}
                      style={{
                        fontSize: '0.65rem',
                        border: 'none',
                        background: ['Critical', 'High Priority', 'Urgent'].includes(rx.priority_level) ? 'white' : '',
                        color:
                          rx.priority_level === 'Critical' ? '#ff4d4d' :
                            rx.priority_level === 'High Priority' ? '#fbbf24' :
                              rx.priority_level === 'Urgent' ? '#a855f7' : ''
                      }}
                    >
                      {rx.priority_level}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>
                    #{rx.id}—X-99
                  </span>
                </div>

                <div style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'var(--bg-navbar)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-blue)',
                      flexShrink: 0
                    }}>
                      <Pill size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{rx.medicine_name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <User size={14} /> Patient Verified
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '2rem',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '1rem',
                    borderRadius: '16px',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dosage</span>
                      <p style={{ fontWeight: 700, fontSize: '1rem' }}>{rx.dosage}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supply</span>
                      <p style={{ fontWeight: 700, fontSize: '1rem' }}>{rx.duration}</p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Frequency</span>
                      <p style={{ fontWeight: 700, fontSize: '1rem' }}>{rx.frequency}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      <Clock size={16} />
                      {new Date(rx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => updateStatus(rx.id, 'Rejected')}
                        style={{
                          padding: '0.6rem 1rem',
                          fontSize: '0.85rem',
                          background: 'rgba(255, 77, 77, 0.1)',
                          color: '#ff4d4d',
                          border: '1px solid rgba(255, 77, 77, 0.3)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontWeight: 700
                        }}
                      >
                        <XCircle size={16} /> REJECT
                      </button>
                      <button
                        onClick={() => updateStatus(rx.id, 'Accepted')}
                        className="btn-primary"
                        style={{
                          padding: '0.6rem 1.25rem',
                          fontSize: '0.85rem',
                          background:
                            rx.priority_level === 'Critical' ? '#ff4d4d' :
                              rx.priority_level === 'High Priority' ? '#fbbf24' :
                                rx.priority_level === 'Urgent' ? '#a855f7' :
                                  'var(--accent-blue)',
                          color: rx.priority_level === 'High Priority' ? 'black' : 'white',
                          boxShadow:
                            rx.priority_level === 'Critical' ? '0 10px 20px rgba(255, 77, 77, 0.3)' :
                              rx.priority_level === 'High Priority' ? '0 10px 20px rgba(251, 191, 36, 0.3)' :
                                '0 10px 20px rgba(56, 189, 248, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <CheckCircle2 size={16} /> ACCEPT
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="hover-glow" style={{
                  position: 'absolute',
                  bottom: -20,
                  right: -20,
                  width: '100px',
                  height: '100px',
                  background:
                    rx.priority_level === 'Critical' ? 'rgba(255, 77, 77, 0.1)' :
                      rx.priority_level === 'High Priority' ? 'rgba(251, 191, 36, 0.1)' :
                        'rgba(56, 189, 248, 0.1)',
                  filter: 'blur(30px)',
                  opacity: 0
                }}></div>
              </motion.div>
            ))}
          </AnimatePresence>

          {prescriptions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '8rem 2rem', border: '2px dashed var(--glass-border)', borderRadius: '32px', background: 'rgba(255,255,255,0.01)' }}
            >
              <div className="service-icon-wrapper" style={{ margin: '0 auto 1.5rem', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--priority-regular)' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Queue Clear</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Outstanding prescriptions have been fulfilled.</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
