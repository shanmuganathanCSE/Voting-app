import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TabBtn = ({ label, active, onClick, count }) => (
  <button onClick={onClick} style={{
    padding: '10px 20px', border: 'none',
    borderBottom: active ? '2px solid #00d4ff' : '2px solid transparent',
    background: 'transparent',
    color: active ? '#00d4ff' : '#7a9bb5',
    fontFamily: "'Orbitron', monospace", fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px',
  }}>
    {label}
    {count !== undefined && (
      <span style={{ background: active ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)', padding: '1px 7px', borderRadius: '10px', fontSize: '10px' }}>
        {count}
      </span>
    )}
  </button>
);

export default function AdminPage() {
  const [tab, setTab] = useState('polls');
  const [polls, setPolls] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pollsRes, usersRes, statsRes] = await Promise.all([
        axios.get('/api/admin/polls'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/stats'),
      ]);
      setPolls(pollsRes.data);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    // eslint-disable-next-line no-unused-vars
    } catch (err) { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  const updatePollStatus = async (pollId, status) => {
    try {
      await axios.put(`/api/admin/polls/${pollId}/status`, { status });
      setPolls(polls.map(p => p._id === pollId ? { ...p, status } : p));
      toast.success(`Poll ${status}`);
    } catch { toast.error('Failed to update poll'); }
  };

  const deletePoll = async (pollId) => {
    if (!window.confirm('Permanently delete this poll?')) return;
    try {
      await axios.delete(`/api/admin/polls/${pollId}`);
      setPolls(polls.filter(p => p._id !== pollId));
      toast.success('Poll deleted');
    } catch { toast.error('Failed to delete poll'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ padding: '40px', position: 'relative', zIndex: 1 }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{
          fontFamily: "'Orbitron', monospace", fontSize: '1.8rem', fontWeight: 800,
          background: 'linear-gradient(135deg, white, #7c3aed)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>ADMIN CONTROL</h1>
        <div style={{ width: '50px', height: '2px', background: 'linear-gradient(90deg, #7c3aed, transparent)', marginTop: '8px' }} />
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '36px' }}>
          {[
            { label: 'TOTAL USERS', value: stats.totalUsers, color: '#00d4ff' },
            { label: 'TOTAL POLLS', value: stats.totalPolls, color: '#7c3aed' },
            { label: 'ACTIVE POLLS', value: stats.activePolls, color: '#00ff88' },
            { label: 'TOTAL VOTES', value: stats.totalVotes, color: '#ff6b35' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ padding: '20px', textAlign: 'center', borderColor: `${s.color}22` }}>
              <div style={{ fontFamily: "'Orbitron'", fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '9px', color: '#3d5a6e', marginTop: '4px', letterSpacing: '0.12em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid rgba(0,212,255,0.08)', display: 'flex', gap: '4px', marginBottom: '28px' }}>
        <TabBtn label="Polls" active={tab === 'polls'} onClick={() => setTab('polls')} count={polls.length} />
        <TabBtn label="Users" active={tab === 'users'} onClick={() => setTab('users')} count={users.length} />
      </div>

      {/* Polls Table */}
      {tab === 'polls' && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                  {['Title', 'Category', 'Status', 'Votes', 'Created By', 'End Date', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontFamily: "'Orbitron'", fontSize: '9px', color: '#3d5a6e', letterSpacing: '0.12em', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {polls.map((poll, idx) => (
                  <tr key={poll._id}
                    style={{ borderBottom: '1px solid rgba(0,212,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(0,212,255,0.01)', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(0,212,255,0.01)'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#e8f4f8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {poll.title}
                    </td>
                    <td style={{ padding: '12px 16px' }}><span className="tag">{poll.category}</span></td>
                    <td style={{ padding: '12px 16px' }}><span className={`badge badge-${poll.status}`}>{poll.status}</span></td>
                    <td style={{ padding: '12px 16px', fontFamily: "'Share Tech Mono'", fontSize: '12px', color: '#00d4ff' }}>{poll.totalVotes}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#7a9bb5' }}>{poll.createdBy?.name || 'N/A'}</td>
                    <td style={{ padding: '12px 16px', fontFamily: "'Share Tech Mono'", fontSize: '11px', color: '#3d5a6e', whiteSpace: 'nowrap' }}>
                      {new Date(poll.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                        {poll.status === 'active' && (
                          <button className="btn btn-outline btn-sm" onClick={() => updatePollStatus(poll._id, 'closed')}>
                            CLOSE
                          </button>
                        )}
                        {poll.status === 'closed' && (
                          <button className="btn btn-success btn-sm" onClick={() => updatePollStatus(poll._id, 'active')}>
                            REOPEN
                          </button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => deletePoll(poll._id)}>
                          DEL
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Table */}
      {tab === 'users' && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
                  {['Name', 'Email', 'Role', 'Joined', 'Polls Voted'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontFamily: "'Orbitron'", fontSize: '9px', color: '#3d5a6e', letterSpacing: '0.12em', fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((usr, idx) => (
                  <tr key={usr._id}
                    style={{ borderBottom: '1px solid rgba(0,212,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(0,212,255,0.01)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(0,212,255,0.01)'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '28px', height: '28px',
                          background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
                          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: "'Orbitron'", fontSize: '10px', fontWeight: 700, color: 'white', flexShrink: 0,
                        }}>
                          {usr.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', color: '#e8f4f8' }}>{usr.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#7a9bb5' }}>{usr.email}</td>
                    <td style={{ padding: '12px 16px' }}><span className={`badge badge-${usr.role}`}>{usr.role}</span></td>
                    <td style={{ padding: '12px 16px', fontFamily: "'Share Tech Mono'", fontSize: '11px', color: '#3d5a6e' }}>
                      {new Date(usr.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: "'Share Tech Mono'", fontSize: '12px', color: '#00d4ff' }}>
                      {usr.votedPolls?.length || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}