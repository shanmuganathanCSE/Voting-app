import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Politics', 'Technology', 'Sports', 'Entertainment', 'Education', 'Other'];

export default function CreatePollPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Other',
    options: ['', ''],
    endDate: '',
    isPublic: true,
  });
  const [loading, setLoading] = useState(false);

  const addOption = () => {
    if (form.options.length >= 8) { toast.error('Maximum 8 options allowed'); return; }
    setForm({ ...form, options: [...form.options, ''] });
  };

  const removeOption = (index) => {
    if (form.options.length <= 2) { toast.error('Minimum 2 options required'); return; }
    setForm({ ...form, options: form.options.filter((_, i) => i !== index) });
  };

  const updateOption = (index, value) => {
    const opts = [...form.options];
    opts[index] = value;
    setForm({ ...form, options: opts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validOptions = form.options.filter(o => o.trim());
    if (validOptions.length < 2) { toast.error('At least 2 non-empty options required'); return; }
    if (!form.endDate) { toast.error('End date is required'); return; }
    if (new Date(form.endDate) <= new Date()) { toast.error('End date must be in the future'); return; }

    setLoading(true);
    try {
      const res = await axios.post('/api/polls', { ...form, options: validOptions });
      toast.success('Poll created successfully!');
      navigate(`/polls/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create poll');
    } finally { setLoading(false); }
  };

  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() + 5);
  const minDateStr = minDate.toISOString().slice(0, 16);

  return (
    <div style={{ padding: '40px', position: 'relative', zIndex: 1, maxWidth: '800px' }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{
          fontFamily: "'Orbitron', monospace", fontSize: '1.8rem', fontWeight: 800,
          background: 'linear-gradient(135deg, white, #00d4ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>CREATE ELECTION</h1>
        <div style={{ width: '50px', height: '2px', background: 'linear-gradient(90deg, #00d4ff, transparent)', marginTop: '8px' }} />
        <p style={{ color: '#7a9bb5', marginTop: '8px', fontSize: '14px' }}>Configure a new voting poll</p>
      </div>

      <div className="glass-card" style={{ padding: '40px', position: 'relative' }}>
        <div className="corner-decor tl" /><div className="corner-decor tr" />
        <div className="corner-decor bl" /><div className="corner-decor br" />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Poll Title *</label>
            <input className="form-input" type="text" placeholder="Enter a clear, concise question..."
              value={form.title} onChange={e => setForm({...form, title: e.target.value})} required maxLength={200} />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Provide context or details about this poll..."
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} maxLength={1000} />
          </div>

          <div className="grid-2" style={{ gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" style={{ background: '#080f18', color: '#e8f4f8' }}
                value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">End Date & Time *</label>
              <input className="form-input" type="datetime-local" min={minDateStr}
                value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}
                style={{ colorScheme: 'dark' }} required />
            </div>
          </div>

          {/* Options */}
          <div className="form-group">
            <label className="form-label">Voting Options ({form.options.length}/8)</label>
            {form.options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <div style={{
                  width: '28px', height: '28px', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(0,102,255,0.3), rgba(0,212,255,0.3))',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Orbitron'", fontSize: '10px', fontWeight: 700, color: '#00d4ff',
                }}>
                  {String.fromCharCode(65 + i)}
                </div>
                <input
                  className="form-input"
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => removeOption(i)}
                  style={{
                    background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.2)',
                    borderRadius: '6px', color: '#ff2d55', cursor: 'pointer',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0, transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,45,85,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,45,85,0.1)'}
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={addOption} className="btn btn-outline btn-sm" style={{ marginTop: '6px' }}>
              ⊕ ADD OPTION
            </button>
          </div>

          {/* Visibility */}
          <div className="form-group">
            <label className="form-label">Visibility</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[{ val: true, label: '◉ PUBLIC', desc: 'Anyone can see and vote' }, { val: false, label: '◈ PRIVATE', desc: 'Only invited users' }].map(v => (
                <div
                  key={String(v.val)}
                  onClick={() => setForm({...form, isPublic: v.val})}
                  style={{
                    flex: 1, padding: '14px 18px',
                    border: '1px solid',
                    borderColor: form.isPublic === v.val ? '#00d4ff' : 'rgba(0,212,255,0.1)',
                    borderRadius: '6px',
                    background: form.isPublic === v.val ? 'rgba(0,212,255,0.08)' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontFamily: "'Orbitron'", fontSize: '10px', color: form.isPublic === v.val ? '#00d4ff' : '#7a9bb5', letterSpacing: '0.1em' }}>{v.label}</div>
                  <div style={{ fontSize: '12px', color: '#3d5a6e', marginTop: '4px' }}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <hr className="divider" />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/polls')}>
              CANCEL
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> CREATING...</> : '⊕ LAUNCH ELECTION'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}