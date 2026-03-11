import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
    }}>
      {/* Background effects */}
      <div style={{
        position: 'absolute',
        top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(0,102,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '28px', fontWeight: 900,
            background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            NEXUSVOTE
          </div>
          <div style={{ color: '#3d5a6e', fontFamily: "'Share Tech Mono'", fontSize: '11px', marginTop: '6px', letterSpacing: '0.2em' }}>
            SECURE ∙ TRANSPARENT ∙ INSTANT
          </div>
          <div style={{
            width: '80px', height: '2px',
            background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
            margin: '16px auto 0',
          }} />
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '40px', position: 'relative' }}>
          <div className="corner-decor tl" /><div className="corner-decor tr" />
          <div className="corner-decor bl" /><div className="corner-decor br" />

          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>ACCESS TERMINAL</h2>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '11px', color: '#3d5a6e', letterSpacing: '0.1em' }}>
              ENTER CREDENTIALS TO AUTHENTICATE
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="agent@nexusvote.io"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Security Key</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
              />
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '14px' }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> AUTHENTICATING...</>
              ) : (
                '⟶ INITIATE ACCESS'
              )}
            </button>
          </form>

          <div style={{
            textAlign: 'center', marginTop: '24px',
            fontFamily: "'Share Tech Mono'", fontSize: '11px', color: '#3d5a6e'
          }}>
            NEW AGENT?{' '}
            <Link to="/register" style={{ color: '#00d4ff', letterSpacing: '0.05em' }}>
              REQUEST ACCESS →
            </Link>
          </div>

          {/* Demo credentials hint */}
          <div style={{
            marginTop: '24px', padding: '12px',
            background: 'rgba(0,212,255,0.04)',
            border: '1px dashed rgba(0,212,255,0.15)',
            borderRadius: '6px',
          }}>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#3d5a6e', letterSpacing: '0.1em', marginBottom: '6px' }}>
              DEMO CREDENTIALS
            </div>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '11px', color: '#7a9bb5' }}>
              <div>Admin: admin@nexus.io / admin123</div>
              <div>Voter: voter@nexus.io / voter123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}