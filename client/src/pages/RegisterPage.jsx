import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';
import toast from 'react-hot-toast';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FieldError = ({ msg }) => msg ? (
  <div style={{ marginTop: '5px', fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#ff6b8a', letterSpacing: '0.05em' }}>
    ⚠ {msg}
  </div>
) : null;

const inputStyle = (hasError) => ({
  borderColor: hasError ? 'rgba(255,45,85,0.5)' : undefined,
  background: hasError ? 'rgba(255,45,85,0.04)' : undefined,
});

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'voter' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';

    if (!form.email.trim()) e.email = 'Email is required';
    else if (!EMAIL_REGEX.test(form.email)) e.email = 'Enter a valid email address';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password))
      e.password = 'Password must contain letters and numbers';

    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';

    return e;
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    // Clear field error on change
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      const user = await register(form.name.trim(), form.email.trim().toLowerCase(), form.password, form.role);
      toast.success(`Welcome, ${user.name}! Account created.`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(msg);
      // Map server errors to specific fields
      if (msg.toLowerCase().includes('email')) setErrors(ev => ({ ...ev, email: msg }));
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'TOO SHORT', color: '#ff2d55', width: '20%' };
    if (p.length < 8 || !/[0-9]/.test(p)) return { label: 'WEAK', color: '#ff6b35', width: '45%' };
    if (p.length < 12) return { label: 'MODERATE', color: '#ffd43b', width: '70%' };
    return { label: 'STRONG', color: '#00ff88', width: '100%' };
  };

  const strength = passwordStrength();

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: '30%', right: '20%',
        width: '400px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontFamily: "'Orbitron', monospace", fontSize: '28px', fontWeight: 900,
            background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>NEXUSVOTE</div>
          <div style={{ color: '#3d5a6e', fontFamily: "'Share Tech Mono'", fontSize: '11px', marginTop: '6px', letterSpacing: '0.2em' }}>
            AGENT REGISTRATION PROTOCOL
          </div>
        </div>

        <div className="glass-card" style={{ padding: '40px', position: 'relative' }}>
          <div className="corner-decor tl" /><div className="corner-decor tr" />
          <div className="corner-decor bl" /><div className="corner-decor br" />

          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>CREATE ACCOUNT</h2>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '11px', color: '#3d5a6e', letterSpacing: '0.1em' }}>
              JOIN THE VOTING NETWORK
            </div>
          </div>

          {/* Server error banner */}
          {serverError && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              ⚠ {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="Agent Name"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                style={inputStyle(errors.name)}
                autoComplete="name"
              />
              <FieldError msg={errors.name} />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="agent@nexusvote.io"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                style={inputStyle(errors.email)}
                autoComplete="email"
              />
              <FieldError msg={errors.email} />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Security Key</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 chars with letters & numbers"
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  style={{ ...inputStyle(errors.password), paddingRight: '48px' }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#3d5a6e', cursor: 'pointer', fontSize: '14px',
                  }}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {/* Strength meter */}
              {strength && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ height: '3px', background: 'rgba(0,212,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '2px', transition: 'all 0.4s' }} />
                  </div>
                  <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '9px', color: strength.color, marginTop: '3px', letterSpacing: '0.1em' }}>
                    STRENGTH: {strength.label}
                  </div>
                </div>
              )}
              <FieldError msg={errors.password} />
            </div>

            {/* Confirm password */}
            <div className="form-group">
              <label className="form-label">Confirm Security Key</label>
              <input
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)}
                style={inputStyle(errors.confirmPassword)}
                autoComplete="new-password"
              />
              {form.confirmPassword && form.password === form.confirmPassword && !errors.confirmPassword && (
                <div style={{ marginTop: '5px', fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#00ff88' }}>
                  ✓ PASSWORDS MATCH
                </div>
              )}
              <FieldError msg={errors.confirmPassword} />
            </div>

            {/* Role */}
            <div className="form-group">
              <label className="form-label">Access Level</label>
              <select
                className="form-select"
                value={form.role}
                onChange={e => handleChange('role', e.target.value)}
                style={{ background: '#080f18', color: '#e8f4f8' }}
              >
                <option value="voter">Voter — Cast votes on polls</option>
                <option value="admin">Admin — Manage polls &amp; users</option>
              </select>
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '14px' }}
            >
              {loading
                ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> CREATING...</>
                : '⊕ INITIALIZE ACCOUNT'}
            </button>
          </form>

          <div style={{
            textAlign: 'center', marginTop: '24px',
            fontFamily: "'Share Tech Mono'", fontSize: '11px', color: '#3d5a6e',
          }}>
            ALREADY REGISTERED?{' '}
            <Link to="/login" style={{ color: '#00d4ff' }}>SIGN IN →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}