import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitRCA } from '../api';

const categories = ['Hardware Failure', 'Software Bug', 'Configuration Error', 'Network Issue', 'Human Error', 'Capacity Issue', 'Third Party Failure', 'Unknown'];

const inputStyle = {
  width: '100%', background: '#0f1117', border: '1px solid #2d3748',
  borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

function toLocalDatetimeValue(date) {
  const d = new Date(date);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function RCAForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [form, setForm] = useState({
    start_time: toLocalDatetimeValue(oneHourAgo),
    end_time: toLocalDatetimeValue(now),
    root_cause_category: categories[0],
    fix_applied: '',
    prevention_steps: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.start_time || !form.end_time || !form.fix_applied || !form.prevention_steps) {
      setError('All fields are required');
      return;
    }
    if (new Date(form.end_time) <= new Date(form.start_time)) {
      setError('End time must be after start time');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitRCA(id, {
        ...form,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
      });
      navigate(`/incident/${id}`);
    } catch (e) {
      setError(e.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <button onClick={() => navigate(`/incident/${id}`)} style={{ background: 'none', border: 'none', color: '#63b3ed', cursor: 'pointer', fontSize: '14px', marginBottom: '20px' }}>
        ← Back to Incident
      </button>

      <div style={{ background: '#1a1d27', border: '1px solid #2d3748', borderRadius: '12px', padding: '28px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>📝 Root Cause Analysis</h2>
        <p style={{ color: '#4a5568', fontSize: '13px', marginBottom: '24px' }}>Complete all fields to close this incident</p>

        {error && (
          <div style={{ background: '#2d1b1b', border: '1px solid #fc8181', borderRadius: '8px', padding: '10px', marginBottom: '16px', color: '#fc8181', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#a0aec0', marginBottom: '6px' }}>Incident Start Time</label>
            <input
              type="datetime-local"
              style={inputStyle}
              value={form.start_time}
              onChange={e => setForm({ ...form, start_time: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#a0aec0', marginBottom: '6px' }}>Incident End Time</label>
            <input
              type="datetime-local"
              style={inputStyle}
              value={form.end_time}
              onChange={e => setForm({ ...form, end_time: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#a0aec0', marginBottom: '6px' }}>Root Cause Category</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.root_cause_category}
              onChange={e => setForm({ ...form, root_cause_category: e.target.value })}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#a0aec0', marginBottom: '6px' }}>Fix Applied</label>
            <textarea
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              value={form.fix_applied}
              placeholder="Describe what was done to fix the issue..."
              onChange={e => setForm({ ...form, fix_applied: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#a0aec0', marginBottom: '6px' }}>Prevention Steps</label>
            <textarea
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              value={form.prevention_steps}
              placeholder="What will be done to prevent this in future..."
              onChange={e => setForm({ ...form, prevention_steps: e.target.value })}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: submitting ? '#2d3748' : '#2f855a',
              color: '#fff', border: 'none', padding: '12px',
              borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: '15px', marginTop: '8px',
            }}
          >
            {submitting ? '⏳ Submitting...' : '✅ Submit RCA'}
          </button>
        </div>
      </div>
    </div>
  );
}