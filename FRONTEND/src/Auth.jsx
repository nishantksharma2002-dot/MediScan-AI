import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Github, Chrome, Activity } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel" 
        style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '60px', height: '60px', background: 'var(--accent-blue)', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', margin: '0 auto 1.5rem',
            boxShadow: '0 0 30px rgba(0, 229, 255, 0.3)'
          }}>
            <Activity color="white" size={32} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? 'Enter your credentials to access MediScan' : 'Join the future of neural pharmacy'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLogin && (
            <div className="input-group">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Full Name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="search-input"
                style={{ width: '100%', paddingLeft: '3rem' }}
              />
            </div>
          )}
          
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              placeholder="Email Address" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="search-input"
              style={{ width: '100%', paddingLeft: '3rem' }}
            />
          </div>

          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="search-input"
              style={{ width: '100%', paddingLeft: '3rem' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="glass-panel" style={{ flex: 1, padding: '0.75rem', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
            <Chrome size={20} />
          </button>
          <button className="glass-panel" style={{ flex: 1, padding: '0.75rem', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
            <Github size={20} />
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"} {' '}
          <span 
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 600 }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </span>
        </p>
      </motion.div>
    </div>
  );
}
