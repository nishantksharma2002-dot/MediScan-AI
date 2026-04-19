import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Phone, Clock, Star, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function NearbyHospitals() {
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Mock hospital data (in a real app, this would come from Google Places API)
  const mockHospitals = [];

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        // In a real app, you'd call Google Places API here
        setHospitals(mockHospitals);
        initializeMap(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your location. Please enable location services.');
        // Fallback to mock data
        setHospitals(mockHospitals);
        initializeMap(40.7128, -74.0060); // Default to NYC
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const initializeMap = (lat, lng) => {
    // In a real implementation, you would load Google Maps API
    // For now, we'll create a simple map placeholder
    if (mapRef.current && !mapInstanceRef.current) {
      // Mock map initialization
      mapInstanceRef.current = {
        center: { lat, lng },
        zoom: 13
      };
    }
  };

  const getDirections = (hospital) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${hospital.lat},${hospital.lng}`;
      window.open(url, '_blank');
    }
  };

  const callHospital = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return (
      <div className="animate-in fade-in duration-700" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto', width: '60px', height: '60px', borderWidth: '3px' }}></div>
        <p style={{ marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Finding nearby hospitals...
        </p>
      </div>
    );
  }

  return (
    <div className="nearby-hospitals animate-in fade-in duration-700">
      <section style={{ padding: '2.5rem 0' }}>
        <div className="section-header">
          <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin size={28} color="var(--accent-blue)" /> Nearby Hospitals
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '1.05rem' }}>
            Find emergency care and medical facilities near you with real-time directions.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid #ffc107', color: '#ffc107', padding: '1.25rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <AlertCircle size={24} />
            <div>
              <p style={{ fontWeight: 800 }}>Location Access</p>
              <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{error}</p>
            </div>
          </motion.div>
        )}

        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 400px', alignItems: 'start' }}>
          {/* Map Section */}
          <div className="glass-panel" style={{ padding: '1.5rem', height: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Navigation size={20} color="var(--accent-blue)" />
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Live Map</h3>
            </div>

            {/* Map Container */}
            <div
              ref={mapRef}
              style={{
                width: '100%',
                height: '500px',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderRadius: '16px',
                border: '2px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Mock Map Background */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(56, 189, 248, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
                opacity: 0.5
              }} />

              {/* Map Markers */}
              {hospitals.map((hospital, index) => (
                <motion.div
                  key={hospital.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    position: 'absolute',
                    left: `${20 + index * 15}%`,
                    top: `${30 + index * 20}%`,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: hospital.emergency ? '#ef4444' : '#22d3ee',
                    border: '3px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => setSelectedHospital(hospital)}
                >
                  <MapPin size={12} color="white" />
                </motion.div>
              ))}

              {/* User Location Marker */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#10b981',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                transform: 'translate(-50%, -50%)'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: '#10b981',
                  animation: 'pulse 2s infinite'
                }} />
              </div>

              <div style={{ textAlign: 'center', zIndex: 10 }}>
                <MapPin size={32} color="var(--accent-blue)" />
                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Interactive Map View
                </p>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Click markers for details
                </p>
              </div>
            </div>
          </div>

          {/* Hospitals List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--accent-blue)" />
              Nearest Facilities
            </h3>

            {hospitals.map((hospital, index) => (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-panel ${selectedHospital?.id === hospital.id ? 'selected' : ''}`}
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  borderColor: selectedHospital?.id === hospital.id ? 'var(--accent-blue)' : undefined,
                  borderWidth: selectedHospital?.id === hospital.id ? '2px' : undefined
                }}
                onClick={() => setSelectedHospital(hospital)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{hospital.name}</h4>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {hospital.address}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                      <Star size={14} color="#fbbf24" fill="#fbbf24" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{hospital.rating}</span>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: hospital.emergency ? '#ef4444' : '#22d3ee',
                      fontWeight: 700,
                      background: hospital.emergency ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 211, 238, 0.1)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '999px'
                    }}>
                      {hospital.emergency ? 'Emergency' : 'Clinic'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <MapPin size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{hospital.distance}</span>
                  <Clock size={14} color={hospital.openNow ? '#10b981' : '#ef4444'} />
                  <span style={{
                    fontSize: '0.85rem',
                    color: hospital.openNow ? '#10b981' : '#ef4444',
                    fontWeight: 600
                  }}>
                    {hospital.openNow ? 'Open' : 'Closed'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {hospital.specialties.slice(0, 2).map((specialty, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.7rem',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'var(--text-secondary)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px'
                    }}>
                      {specialty}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); getDirections(hospital); }}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      background: 'var(--accent-blue)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Navigation size={16} />
                    Directions
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); callHospital(hospital.phone); }}
                    style={{
                      padding: '0.6rem',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Phone size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}