import React from 'react';
import { Stethoscope, Clock, ShieldCheck } from 'lucide-react';

export default function Consult() {
  return (
    <div className="consult-page animate-in fade-in duration-700 p-8">
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '2.5rem' }}>
          <Stethoscope size={32} color="var(--accent-purple)" />
          Consult a <span style={{ color: 'var(--accent-purple)' }}>Doctor</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Direct consultations are currently being restructured for a better experience.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', border: '2px dashed var(--glass-border)', borderRadius: '24px' }}>
        <Clock size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', display: 'block' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Service Temporarily Unavailable</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
          We are upgrading our consultation platform to provide faster, more secure connections with licensed clinicians.
        </p>
      </div>

      <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <ShieldCheck size={24} color="var(--accent-blue)" style={{ marginBottom: '1rem' }} />
          <h4 style={{ margin: '0 0 0.5rem' }}>Verified Clinicians</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>All doctors on our platform go through a rigorous verification process.</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <Clock size={24} color="var(--accent-purple)" style={{ marginBottom: '1rem' }} />
          <h4 style={{ margin: '0 0 0.5rem' }}>24/7 Availability</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Once back online, you'll have access to medical advice around the clock.</p>
        </div>
      </div>
    </div>
  );
}
