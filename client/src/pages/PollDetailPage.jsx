import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/Authcontext';
import toast from 'react-hot-toast';
import { RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#00d4ff', '#0066ff', '#7c3aed', '#00ff88', '#ff6b35', '#ff2d55', '#ffd43b', '#51cf66'];

export default function PollDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    fetchPoll();
  }, [id]);

  const fetchPoll = async () => {
    try {
      const res = await axios.get(`/api/polls/${id}`);
      setPoll(res.data);
      // Check if user has voted
      const voted = res.data.options.some(opt => opt.voters.includes(user?._id));
      setHasVoted(voted);
      if (voted) setShowChart(true);
    } catch (err) {
      toast.error('Poll not found');
      navigate('/polls');
    } finally { setLoading(false); }
  };

  const handleVote = async () => {
    if (selectedOption === null) { toast.error('Please select an option'); return; }
    setVoting(true);
    try {
      const res = await axios.post(`/api/polls/${id}/vote`, { optionIndex: selectedOption });
      setPoll(res.data.poll);
      setHasVoted(true);
      setShowChart(true);
      toast.success('🗳️ Vote cast successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to vote');
    } finally { setVoting(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  if (!poll) return null;

  const total = poll.totalVotes || 0;
  const isActive = poll.status === 'active' && new Date(poll.endDate) > new Date();
  const winningOption = poll.options.reduce((a, b) => a.votes > b.votes ? a : b, poll.options[0]);
  const chartData = poll.options.map((opt, i) => ({
    name: opt.text.length > 20 ? opt.text.slice(0, 20) + '...' : opt.text,
    votes: opt.votes,
    pct: total > 0 ? Math.round((opt.votes / total) * 100) : 0,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: '#080f18', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '6px', padding: '10px 14px' }}>
          <p style={{ fontFamily: "'Share Tech Mono'", fontSize: '12px', color: '#e8f4f8' }}>
            {payload[0].value} votes ({Math.round((payload[0].value / total) * 100)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '40px', position: 'relative', zIndex: 1 }}>
      {/* Back */}
      <button onClick={() => navigate('/polls')}
        style={{ background: 'none', border: 'none', color: '#7a9bb5', cursor: 'pointer', fontFamily: "'Orbitron'", fontSize: '10px', letterSpacing: '0.1em', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        ← BACK TO POLLS
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Left - Poll info & voting */}
        <div>
          <div className="glass-card" style={{ padding: '32px', position: 'relative', marginBottom: '24px' }}>
            <div className="corner-decor tl" /><div className="corner-decor tr" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <span className={`badge badge-${poll.status}`}>{poll.status}</span>
              <span className="tag">{poll.category}</span>
            </div>

            <h1 style={{
              fontFamily: "'Orbitron'", fontSize: '1.2rem', fontWeight: 700,
              color: '#e8f4f8', marginBottom: '12px', lineHeight: 1.4
            }}>{poll.title}</h1>

            {poll.description && (
              <p style={{ color: '#7a9bb5', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
                {poll.description}
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '28px' }}>
              {[
                { label: 'TOTAL VOTES', value: total },
                { label: 'OPTIONS', value: poll.options.length },
                { label: 'ENDS', value: new Date(poll.endDate).toLocaleDateString() },
              ].map(s => (
                <div key={s.label} style={{ padding: '12px', background: 'rgba(0,212,255,0.04)', borderRadius: '6px', border: '1px solid rgba(0,212,255,0.08)', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Orbitron'", fontSize: '1.1rem', fontWeight: 700, color: '#00d4ff' }}>{s.value}</div>
                  <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '9px', color: '#3d5a6e', marginTop: '2px', letterSpacing: '0.1em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Voting options */}
            {!hasVoted && isActive ? (
              <div>
                <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#3d5a6e', letterSpacing: '0.15em', marginBottom: '14px' }}>
                  SELECT YOUR CHOICE:
                </div>
                {poll.options.map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedOption(i)}
                    style={{
                      padding: '14px 18px',
                      marginBottom: '10px',
                      border: '1px solid',
                      borderColor: selectedOption === i ? '#00d4ff' : 'rgba(0,212,255,0.1)',
                      borderRadius: '6px',
                      background: selectedOption === i ? 'rgba(0,212,255,0.1)' : 'rgba(0,212,255,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                    }}
                    onMouseEnter={e => { if (selectedOption !== i) e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'; }}
                    onMouseLeave={e => { if (selectedOption !== i) e.currentTarget.style.borderColor = 'rgba(0,212,255,0.1)'; }}
                  >
                    <div style={{
                      width: '18px', height: '18px',
                      border: `2px solid ${selectedOption === i ? '#00d4ff' : '#3d5a6e'}`,
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {selectedOption === i && <div style={{ width: '8px', height: '8px', background: '#00d4ff', borderRadius: '50%' }} />}
                    </div>
                    <span style={{ fontSize: '14px', color: selectedOption === i ? '#e8f4f8' : '#7a9bb5' }}>{opt.text}</span>
                  </div>
                ))}

                <button
                  className="btn btn-primary"
                  onClick={handleVote}
                  disabled={voting || selectedOption === null}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '14px' }}
                >
                  {voting ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> SUBMITTING...</> : '⊕ CAST VOTE'}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#3d5a6e', letterSpacing: '0.15em', marginBottom: '14px' }}>
                  {hasVoted ? '✓ VOTE RECORDED — RESULTS:' : 'ELECTION RESULTS:'}
                </div>
                {poll.options.map((opt, i) => {
                  const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                  const isWinner = opt.votes === winningOption.votes && total > 0;
                  return (
                    <div key={i} style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: isWinner ? '#e8f4f8' : '#7a9bb5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isWinner && <span style={{ color: '#00ff88', fontSize: '12px' }}>◆</span>}
                          {opt.text}
                        </span>
                        <span style={{ fontFamily: "'Share Tech Mono'", fontSize: '12px', color: COLORS[i % COLORS.length], fontWeight: 700 }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}88, ${COLORS[i % COLORS.length]})`,
                          borderRadius: '3px', transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                        }} />
                      </div>
                      <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#3d5a6e', marginTop: '3px' }}>
                        {opt.votes} VOTE{opt.votes !== 1 ? 'S' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Meta info */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#3d5a6e', letterSpacing: '0.12em', marginBottom: '12px' }}>
              POLL METADATA
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Created by', value: poll.createdBy?.name || 'Unknown' },
                { label: 'Start date', value: new Date(poll.startDate).toLocaleString() },
                { label: 'End date', value: new Date(poll.endDate).toLocaleString() },
                { label: 'Visibility', value: poll.isPublic ? 'Public' : 'Private' },
              ].map(m => (
                <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(0,212,255,0.05)' }}>
                  <span style={{ fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#3d5a6e' }}>{m.label.toUpperCase()}</span>
                  <span style={{ fontSize: '13px', color: '#7a9bb5' }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Charts */}
        <div>
          <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#3d5a6e', letterSpacing: '0.15em', marginBottom: '24px' }}>
              VOTE DISTRIBUTION
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
                <XAxis dataKey="name" tick={{ fill: '#7a9bb5', fontSize: 10, fontFamily: "'Share Tech Mono'" }}
                  angle={-30} textAnchor="end" />
                <YAxis tick={{ fill: '#3d5a6e', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Winner box */}
          {total > 0 && (
            <div className="glass-card" style={{
              padding: '28px',
              border: '1px solid rgba(0,255,136,0.2)',
              background: 'rgba(0,255,136,0.04)',
            }}>
              <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '10px', color: '#00cc6e', letterSpacing: '0.15em', marginBottom: '12px' }}>
                ◆ LEADING CANDIDATE
              </div>
              <div style={{ fontFamily: "'Orbitron'", fontSize: '1.1rem', fontWeight: 700, color: '#e8f4f8', marginBottom: '6px' }}>
                {winningOption.text}
              </div>
              <div style={{ fontFamily: "'Share Tech Mono'", fontSize: '13px', color: '#00ff88' }}>
                {total > 0 ? Math.round((winningOption.votes / total) * 100) : 0}% · {winningOption.votes} VOTES
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}