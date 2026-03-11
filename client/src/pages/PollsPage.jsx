import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CATEGORIES = ['All', 'Politics', 'Technology', 'Sports', 'Entertainment', 'Education', 'Other'];

export default function PollsPage() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    fetchPolls();
  }, [category, status]);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      let url = `/api/polls?status=${status}`;
      if (category !== 'All') url += `&category=${category}`;
      const res = await axios.get(url);
      setPolls(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = polls.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const timeLeft = (endDate) => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return 'ENDED';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return days > 0 ? `${days}d ${hours}h` : `${hours}h ${Math.floor((diff % 3600000) / 60000)}m`;
  };

  return (
    <div style={{ padding: '40px', position: 'relative', zIndex: 1 }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{
          fontFamily: "'Orbitron', monospace", fontSize: '1.8rem', fontWeight: 800,
          background: 'linear-gradient(135deg, white, #00d4ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>LIVE ELECTIONS</h1>
        <div style={{ width: '50px', height: '2px', background: 'linear-gradient(90deg, #00d4ff, transparent)', marginTop: '8px' }} />
        <p style={{ color: '#7a9bb5', marginTop: '8px', fontSize: '14px' }}>
          Browse and participate in active voting polls
        </p>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '28px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3d5a6e' }}>⌕</span>
          <input
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search elections..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" style={{ background: '#080f18', color: '#e8f4f8', width: 'auto' }}
          value={status} onChange={e => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
        <Link to="/create-poll" className="btn btn-primary">⊕ CREATE POLL</Link>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '6px 16px',
              border: '1px solid',
              borderColor: category === cat ? '#00d4ff' : 'rgba(0,212,255,0.1)',
              borderRadius: '4px',
              background: category === cat ? 'rgba(0,212,255,0.1)' : 'transparent',
              color: category === cat ? '#00d4ff' : '#7a9bb5',
              fontFamily: "'Orbitron', monospace",
              fontSize: '9px', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >{cat}</button>
        ))}
      </div>

      {/* Results count */}
      <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '11px', color: '#3d5a6e', marginBottom: '20px' }}>
        DISPLAYING {filtered.length} RESULT{filtered.length !== 1 ? 'S' : ''}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <div style={{ fontFamily: "'Orbitron'", color: '#3d5a6e', letterSpacing: '0.1em' }}>NO ELECTIONS FOUND</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filtered.map(poll => {
            const total = poll.totalVotes || 0;

            return (
              <Link key={poll._id} to={`/polls/${poll._id}`} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{ padding: '24px', height: '100%', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <span className={`badge badge-${poll.status}`}>{poll.status}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#00ff88' }}>
                        {poll.status === 'active' ? timeLeft(poll.endDate) : 'CLOSED'}
                      </div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e8f4f8', marginBottom: '8px', lineHeight: 1.4 }}>
                    {poll.title}
                  </h3>

                  {poll.description && (
                    <p style={{ fontSize: '13px', color: '#7a9bb5', marginBottom: '14px', overflow: 'hidden',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {poll.description}
                    </p>
                  )}

                  {/* Options preview */}
                  <div style={{ marginBottom: '16px' }}>
                    {poll.options?.slice(0, 3).map((opt, i) => {
                      const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                      return (
                        <div key={i} style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span style={{ fontSize: '12px', color: '#7a9bb5', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '70%' }}>{opt.text}</span>
                            <span style={{ fontFamily: "'Share Tech Mono'", fontSize: '11px', color: '#00d4ff' }}>{pct}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {poll.options?.length > 3 && (
                      <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#3d5a6e', marginTop: '4px' }}>
                        +{poll.options.length - 3} MORE OPTIONS
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,212,255,0.06)', paddingTop: '12px' }}>
                    <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#3d5a6e' }}>
                      ◈ {total} VOTES
                    </div>
                    <span className="tag">{poll.category}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}