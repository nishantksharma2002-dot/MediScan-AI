import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from './lib/api';

export default function Refill() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refilling, setRefilling] = useState(null);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError('');
    try {
      const json = await api.getPrescriptions();
      // Filter for prescriptions that have been processed to show in refill history
      const refillablePrescriptions = json.data || [];
      setPrescriptions(refillablePrescriptions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefill = async (prescription) => {
    setRefilling(prescription.id);
    try {
      // Create a new prescription based on the existing one
      const refillData = {
        user_id: prescription.user_id,
        medicine_name: prescription.medicine_name,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        extracted_text: `Refill of: ${prescription.extracted_text}`,
        priority_level: 'Regular'
      };

      const data = await api.savePrescription(refillData);

      if (data.id) {
        // Refresh the list to show the new refill request
        await fetchPrescriptions();
        alert('Refill request submitted successfully!');
      } else {
        throw new Error('Failed to submit refill');
      }
    } catch (err) {
      alert('Failed to submit refill request. Please try again.');
      console.error(err);
    } finally {
      setRefilling(null);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  return (
    <div className="refill-page animate-in fade-in duration-700">
      <section style={{ padding: '2.5rem 0' }}>
        <div className="section-header">
          <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <RefreshCw size={28} color="var(--accent-blue)" /> Refill Medications
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '1.05rem' }}>
            One-tap reorder of your previous prescriptions. Quick and convenient refills at your fingertips.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Previous Orders</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                {prescriptions.length} refillable prescription{prescriptions.length !== 1 ? 's' : ''}
              </p>
            </div>
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
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: 'rgba(255, 77, 77, 0.1)', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '1.25rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <AlertCircle size={24} />
              <div>
                <p style={{ fontWeight: 800 }}>Error Loading Prescriptions</p>
                <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{error}</p>
              </div>
            </motion.div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <div className="spinner" style={{ margin: '0 auto', width: '60px', height: '60px', borderWidth: '3px' }}></div>
              <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Loading your prescriptions...</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.01)', border: '2px dashed var(--glass-border)', borderRadius: '24px' }}>
              <RefreshCw size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', display: 'block' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Refillable Prescriptions</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Complete your first prescription to enable one-tap refills</p>
              <Link to="/pro-scan" className="button-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                Upload Prescription <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <AnimatePresence>
                {prescriptions.map((rx, index) => (
                  <motion.div
                    key={rx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-panel"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderColor: rx.priority_level === 'Critical' ? 'rgba(255, 77, 77, 0.3)' : 'var(--glass-border)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'var(--bg-navbar)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-blue)'
                      }}>
                        <RefreshCw size={24} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{rx.medicine_name}</h3>
                        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {rx.dosage} • {rx.frequency} • {rx.duration}
                        </p>
                        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={14} />
                          Last ordered: {new Date(rx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          background: rx.priority_level === 'Critical' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(34, 211, 238, 0.1)',
                          color: rx.priority_level === 'Critical' ? '#ff4d4d' : '#22d3ee',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          {rx.priority_level}
                        </span>
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          Status: {rx.delivery_status}
                        </p>
                      </div>

                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--glass-border)',
                          padding: '0.75rem 1.25rem',
                          borderRadius: '8px',
                          fontWeight: 700,
                          cursor: 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <CheckCircle size={18} />
                        Refill Now
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <div className="section-header">
          <h2 className="section-title">How Refills Work</h2>
        </div>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {[
            { title: 'One-Tap Reorder', text: 'Click refill on any previous prescription to instantly reorder the same medication.', icon: RefreshCw },
            { title: 'Automatic Verification', text: 'Our system verifies your prescription history and processes the refill request.', icon: CheckCircle },
            { title: 'Quick Delivery', text: 'Refills are prioritized and delivered through our trusted pharmacy network.', icon: Clock },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 * index }}
              className="glass-panel"
              style={{ padding: '1.5rem', borderRadius: '24px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                <item.icon size={26} color="var(--accent-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{item.title}</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}