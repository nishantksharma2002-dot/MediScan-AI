import React from 'react';
import { Pill, Search } from 'lucide-react';

export default function MedicinesBrowser() {
  return (
    <div className="animate-in fade-in duration-700 p-8">
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 className="section-title" style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Pill size={32} color="var(--accent-blue)" />
            Medicine <span style={{ color: 'var(--accent-blue)' }}>Catalog</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
            Our comprehensive medicine database is being updated.
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', border: '2px dashed var(--glass-border)', borderRadius: '24px' }}>
        <Search size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', display: 'block' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Catalog Currently Offline</h3>
        <p style={{ color: 'var(--text-secondary)' }}>We are transitioning to a new frontend-only architecture. Check back soon for the full catalog.</p>
      </div>
    </div>
  );
}
