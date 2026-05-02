import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkItem, transitionWorkItem } from '../api';
import SignalList from '../components/SignalList';

const statusColors = { OPEN: '#fc8181', INVESTIGATING: '#f6ad55', RESOLVED: '#63b3ed', CLOSED: '#68d391' };

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wi, setWi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const res = await getWorkItem(id);
      setWi(res.data);
    } catch (e) {
      setError('Failed to load incident');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleTransition = async () => {
    setTransitioning(true);
    setError('');
    try {
      await transitionWorkItem(id);
      await fetchData();
    } catch (e) {
      setError(e.response?.data?.detail || 'Transition failed');
    } finally {
      setTransitioning(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#4a5568' }}>Loading...</div>;
  if (!wi) return <div style={{ padding: '40px', textAlign: 'center', color: '#fc8181' }}>Incident not found</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#63b3ed', cursor: 'pointer', fontSize: '14px', marginBottom: '20px' }}>
        ← Back to Dashboard
      </button>

      <div style={{ background: '#1a1d27', border: '1px solid #2d3748', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{wi.component_id}</h2>
            <p style={{ color: '#4a5568', fontSize: '13px', marginTop: '4px' }}>ID: {wi.id}</p>
          </div>
          <span style={{ color: statusColors[wi.status], fontWeight: 700, fontSize: '16px' }}>● {wi.status}</span>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '14px', color: '#a0aec0' }}>
          <span>🚨 {wi.severity}</span>
          <span>🕐 {new Date(wi.created_at).toLocaleString()}</span>
          <span>📡 {wi.signals?.length || 0} signals</span>
        </div>

        {error && <div style={{ background: '#2d1b1b', border: '1px solid #fc8181', borderRadius: '8px', padding: '10px', marginTop: '16px', color: '#fc8181', fontSize: '14px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          {wi.status !== 'CLOSED' && (
            <button onClick={handleTransition} disabled={transitioning} style={{
              background: '#3182ce', color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
            }}>
              {transitioning ? '⏳ Processing...' : '➡️ Advance Status'}
            </button>
          )}
          {wi.status === 'INVESTIGATING' || wi.status === 'OPEN' ? (
            <button onClick={() => navigate(`/incident/${id}/rca`)} style={{
              background: '#2f855a', color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
            }}>📝 Submit RCA</button>
          ) : null}
        </div>
      </div>

      {/* RCA Display */}
      {wi.rca && (
        <div style={{ background: '#1a2d1a', border: '1px solid #2f855a', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ color: '#68d391', marginBottom: '16px' }}>✅ Root Cause Analysis</h3>
          <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
            <div><span style={{ color: '#4a5568' }}>Category: </span><span>{wi.rca.root_cause_category}</span></div>
            <div><span style={{ color: '#4a5568' }}>MTTR: </span><span style={{ color: '#68d391', fontWeight: 700 }}>{wi.rca.mttr_minutes} minutes</span></div>
            <div><span style={{ color: '#4a5568' }}>Fix Applied: </span><span>{wi.rca.fix_applied}</span></div>
            <div><span style={{ color: '#4a5568' }}>Prevention: </span><span>{wi.rca.prevention_steps}</span></div>
          </div>
        </div>
      )}

      {/* Signals */}
      <div style={{ background: '#1a1d27', border: '1px solid #2d3748', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>📡 Raw Signals</h3>
        <SignalList signals={wi.signals} />
      </div>
    </div>
  );
}