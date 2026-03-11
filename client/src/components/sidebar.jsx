import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';
import toast from 'react-hot-toast';

const NavItem = ({ to, icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 20px',
      margin: '2px 12px',
      borderRadius: '6px',
      color: isActive ? '#00d4ff' : '#7a9bb5',
      background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
      borderLeft: isActive ? '2px solid #00d4ff' : '2px solid transparent',
      fontFamily: "'Orbitron', monospace",
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      transition: 'all 0.2s',
      textDecoration: 'none',
    })}
  >
    <span style={{ fontSize: '16px' }}>{icon}</span>
    {label}
  </NavLink>
);

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: 900, letterSpacing: '0.15em' }}>
          <span style={{ background: 'linear-gradient(135deg, #00d4ff, #0066ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            NEXUS
          </span>
          <span style={{ color: '#7a9bb5' }}>VOTE</span>
        </div>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: '#3d5a6e', marginTop: '4px', letterSpacing: '0.1em' }}>
          DECENTRALIZED DEMOCRACY
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
          <div style={{ width: '6px', height: '6px', background: '#00ff88', borderRadius: '50%', boxShadow: '0 0 6px #00ff88' }} />
          <span style={{ fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#00cc6e' }}>SYSTEM ONLINE</span>
        </div>
      </div>

      {/* User info */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,212,255,0.08)', margin: '0 0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Orbitron'", fontWeight: 700, fontSize: '12px', color: 'white'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e8f4f8' }}>{user?.name}</div>
            <div style={{ display: 'inline-flex', marginTop: '2px' }}>
              <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        <div style={{ padding: '6px 20px 4px', fontFamily: "'Share Tech Mono'", fontSize: '9px', color: '#3d5a6e', letterSpacing: '0.12em' }}>
          NAVIGATION
        </div>
        <NavItem to="/dashboard" icon="⬡" label="Dashboard" end />
        <NavItem to="/polls" icon="◈" label="Live Polls" />
        <NavItem to="/create-poll" icon="⊕" label="Create Poll" />
        <NavItem to="/profile" icon="◉" label="Profile" />

        {isAdmin && (
          <>
            <div style={{ padding: '16px 20px 4px', fontFamily: "'Share Tech Mono'", fontSize: '9px', color: '#3d5a6e', letterSpacing: '0.12em', marginTop: '8px' }}>
              ADMIN CONTROL
            </div>
            <NavItem to="/admin" icon="⬢" label="Admin Panel" />
          </>
        )}
      </nav>

      {/* Bottom actions */}
      <div style={{ padding: '16px 12px 24px', borderTop: '1px solid rgba(0,212,255,0.08)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%', padding: '10px 20px',
            background: 'rgba(255,45,85,0.06)',
            border: '1px solid rgba(255,45,85,0.15)',
            borderRadius: '6px',
            color: '#ff6b8a', cursor: 'pointer',
            fontFamily: "'Orbitron', monospace",
            fontSize: '9px', fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,45,85,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,45,85,0.06)'}
        >
          <span>⏻</span> DISCONNECT
        </button>
      </div>
    </aside>
  );
}