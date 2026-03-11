import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/Authcontext';

const StatCard = ({ label, value, icon, color, sublabel }) => (
  <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', top: '-20px', right: '-20px',
      fontSize: '80px', opacity: 0.04, lineHeight: 1,
    }}>{icon}</div>
    <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#3d5a6e', letterSpacing: '0.15em', marginBottom: '8px' }}>
      {label}
    </div>
    <div style={{
      fontFamily: "'Orbitron', monospace", fontSize: '2rem', fontWeight: 800,
      background: `linear-gradient(135deg, ${color}, white)`,
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    }}>
      {value}
    </div>
    {sublabel && <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#3d5a6e', marginTop: '4px' }}>{sublabel}</div>}
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${color}40, transparent)` }} />
  </div>
);

const PollCard = ({ poll }) => {
  const totalVotes = poll.totalVotes || 0;
  const timeLeft = () => {
    const end = new Date(poll.endDate);
    const now = new Date();
    const diff = end - now;
    if (diff <= 0) return 'ENDED';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return days > 0 ? `${days}d ${hours}h LEFT` : `${hours}h LEFT`;
  };

  return (
    <Link to={`/polls/${poll._id}`} style={{ textDecoration: 'none' }}>
      <div className="glass-card" style={{ padding: '20px', cursor: 'pointer', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <span className={`badge badge-${poll.status}`}>{poll.status}</span>
          <span className="tag">{poll.category}</span>
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e8f4f8', marginBottom: '8px', lineHeight: 1.4 }}>{poll.title}</h3>
        {poll.description && (
          <p style={{ fontSize: '13px', color: '#7a9bb5', marginBottom: '12px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {poll.description}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '11px', color: '#3d5a6e' }}>
            ◈ {totalVotes} VOTES
          </div>
          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#00ff88' }}>{timeLeft()}</div>
        </div>
      </div>
    </Link>
  );
};

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [polls, setPolls] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const pollsRes = await axios.get('/api/polls?status=active');
        setPolls(pollsRes.data);
        if (isAdmin) {
          const statsRes = await axios.get('/api/admin/stats');
          setAdminStats(statsRes.data);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [isAdmin]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'MORNING' : now.getHours() < 17 ? 'AFTERNOON' : 'EVENING';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ padding: '40px', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '11px', color: '#3d5a6e', letterSpacing: '0.2em', marginBottom: '6px' }}>
          GOOD {greeting}, AGENT
        </div>
        <h1 style={{
          fontFamily: "'Orbitron', monospace", fontSize: '2rem', fontWeight: 800,
          background: 'linear-gradient(135deg, white, #00d4ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {user?.name?.toUpperCase()}
        </h1>
        <div style={{ color: '#3d5a6e', fontFamily: "'Share Tech Mono'", fontSize: '11px', marginTop: '4px' }}>
          UID:{user?._id?.slice(-8).toUpperCase() || 'XXXX0000'} · {user?.role?.toUpperCase()} ACCESS
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '40px' }}>
        {isAdmin && adminStats ? (
          <>
            <StatCard label="TOTAL USERS" value={adminStats.totalUsers} icon="◉" color="#00d4ff" />
            <StatCard label="ACTIVE POLLS" value={adminStats.activePolls} icon="◈" color="#00ff88" />
            <StatCard label="TOTAL POLLS" value={adminStats.totalPolls} icon="⬡" color="#0066ff" />
            <StatCard label="TOTAL VOTES" value={adminStats.totalVotes} icon="⊕" color="#7c3aed" />
          </>
        ) : (
          <>
            <StatCard label="LIVE POLLS" value={polls.length} icon="◈" color="#00d4ff" sublabel="CURRENTLY ACTIVE" />
            <StatCard label="VOTES CAST" value={polls.reduce((s, p) => s + (p.totalVotes || 0), 0)} icon="⊕" color="#00ff88" sublabel="TOTAL COUNT" />
            <StatCard label="CATEGORIES" value={[...new Set(polls.map(p => p.category))].length} icon="⬡" color="#0066ff" sublabel="UNIQUE TOPICS" />
            <StatCard label="NETWORK" value="99.9%" icon="◉" color="#00ff88" sublabel="UPTIME" />
          </>
        )}
      </div>

      {/* Recent polls */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: "'Orbitron'", fontSize: '14px', fontWeight: 700, color: '#e8f4f8', letterSpacing: '0.1em' }}>
            LIVE ELECTIONS
          </h2>
          <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, #00d4ff, transparent)', marginTop: '6px' }} />
        </div>
        <Link to="/polls" className="btn btn-outline btn-sm">VIEW ALL →</Link>
      </div>

      {polls.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: '60px' }}>
          <div className="empty-icon">◈</div>
          <div style={{ fontFamily: "'Orbitron'", fontSize: '14px', color: '#3d5a6e', letterSpacing: '0.1em' }}>NO ACTIVE POLLS</div>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>Create the first poll to get started.</p>
          <Link to="/create-poll" className="btn btn-primary" style={{ marginTop: '20px' }}>+ CREATE POLL</Link>
        </div>
      ) : (
        <div className="grid-3">
          {polls.slice(0, 6).map(poll => <PollCard key={poll._id} poll={poll} />)}
        </div>
      )}
    </div>
  );
}