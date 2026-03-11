import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/Authcontext';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user } = useAuth();
  const [myPolls, setMyPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/api/polls/user/mypolls');
        setMyPolls(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const totalVotes = myPolls.reduce((s, p) => s + (p.totalVotes || 0), 0);
  const activePolls = myPolls.filter(p => p.status === 'active').length;

  return (
    <div style={{ padding: '40px', position: 'relative', zIndex: 1 }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{
          fontFamily: "'Orbitron', monospace", fontSize: '1.8rem', fontWeight: 800,
          background: 'linear-gradient(135deg, white, #00d4ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>AGENT PROFILE</h1>
        <div style={{ width: '50px', height: '2px', background: 'linear-gradient(90deg, #00d4ff, transparent)', marginTop: '8px' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px' }}>
        {/* Profile card */}
        <div>
          <div className="glass-card" style={{ padding: '32px', position: 'relative', textAlign: 'center', marginBottom: '20px' }}>
            <div className="corner-decor tl" /><div className="corner-decor tr" />
            <div style={{
              width: '80px', height: '80px',
              background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              fontFamily: "'Orbitron'", fontSize: '28px', fontWeight: 900, color: 'white',
              boxShadow: '0 0 30px rgba(0,102,255,0.4)',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <h2 style={{ fontFamily: "'Orbitron'", fontSize: '16px', fontWeight: 700, color: '#e8f4f8', marginBottom: '6px' }}>
              {user?.name?.toUpperCase()}
            </h2>
            <div style={{ marginBottom: '16px' }}>
              <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            </div>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '11px', color: '#3d5a6e', wordBreak: 'break-all' }}>
              {user?.email}
            </div>

            <hr className="divider" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'center' }}>
              {[
                { label: 'POLLS CREATED', value: myPolls.length },
                { label: 'ACTIVE POLLS', value: activePolls },
                { label: 'TOTAL VOTES', value: totalVotes },
                { label: 'ACCESS LEVEL', value: user?.role?.toUpperCase() },
              ].map(s => (
                <div key={s.label} style={{ padding: '10px', background: 'rgba(0,212,255,0.04)', borderRadius: '6px' }}>
                  <div style={{ fontFamily: "'Orbitron'", fontSize: '1.1rem', fontWeight: 700, color: '#00d4ff' }}>{s.value}</div>
                  <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '9px', color: '#3d5a6e', marginTop: '2px', letterSpacing: '0.08em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <Link to="/create-poll" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
            ⊕ CREATE NEW POLL
          </Link>
        </div>

        {/* My polls */}
        <div>
          <div style={{ fontFamily: "'Orbitron'", fontSize: '13px', fontWeight: 700, color: '#e8f4f8', letterSpacing: '0.1em', marginBottom: '20px' }}>
            MY ELECTIONS ({myPolls.length})
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <div className="spinner" />
            </div>
          ) : myPolls.length === 0 ? (
            <div className="empty-state glass-card" style={{ padding: '60px' }}>
              <div className="empty-icon">◈</div>
              <div style={{ fontFamily: "'Orbitron'", fontSize: '13px', color: '#3d5a6e', letterSpacing: '0.1em' }}>NO POLLS CREATED</div>
              <p style={{ marginTop: '8px', fontSize: '14px' }}>Launch your first election above.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {myPolls.map(poll => (
                <Link key={poll._id} to={`/polls/${poll._id}`} style={{ textDecoration: 'none' }}>
                  <div className="glass-card" style={{ padding: '20px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#e8f4f8', flex: 1, marginRight: '12px' }}>{poll.title}</h3>
                      <span className={`badge badge-${poll.status}`} style={{ flexShrink: 0 }}>{poll.status}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '11px', color: '#3d5a6e' }}>
                        ◈ {poll.totalVotes} VOTES
                      </div>
                      <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '11px', color: '#3d5a6e' }}>
                        ⬡ {poll.options.length} OPTIONS
                      </div>
                      <span className="tag">{poll.category}</span>
                      <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '11px', color: '#3d5a6e' }}>
                        ENDS {new Date(poll.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}