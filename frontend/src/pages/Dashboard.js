import React, { useEffect, useState } from 'react';
import { getWorkItems, ingestSignal } from '../api';
import IncidentCard from '../components/IncidentCard';

export default function Dashboard() {
  const [workitems, setWorkitems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [simulating, setSimulating] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchData = async () => {
    try {
      const res = await getWorkItems();
      setWorkitems(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const simulateFailure = async () => {
    setSimulating(true);
    setMsg('');
    const components = [
      { component_id: 'RDBMS_PRIMARY_01', message: 'Connection pool exhausted' },
      { component_id: 'CACHE_CLUSTER_01', message: 'Cache miss rate exceeded threshold' },
      { component_id: 'API_GATEWAY_01', message: 'Latency spike detected' },
      { component_id: 'QUEUE_KAFKA_01', message: 'Consumer lag increasing' },
    ];
    const picked = components[Math.floor(Math.random() * components.length)];
    try {
      await ingestSignal({ ...picked, severity: 'P1' });
      setMsg(`✅ Signal sent for ${picked.component_id}`);
      setTimeout(fetchData, 1000);
    } catch (e) {
      setMsg('❌ Failed to send signal');
    } finally {
      setSimulating(false);
    }
  };

  const statuses = ['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'];
  const filtered = filter === 'ALL' ? workitems : workitems.filter(w => w.status === filter);
  const counts = { OPEN: 0, INVESTIGATING: 0, RESOLVED: 0, CLOSED: 0 };
  workitems.forEach(w => { if (counts[w.status] !== undefined) counts[w.status]++; });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Incident Dashboard</h1>
          <p style={{ color: '#4a5568', fontSize: '14px', marginTop: '4px' }}>
            Auto-refreshes every 10 seconds
          </p>
        </div>
        <button onClick={simulateFailure} disabled={simulating} style={{
          background: simulating ? '#2d3748' : '#e53e3e',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: simulating ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '14px',
        }}>
          {simulating ? '⏳ Sending...' : '🔴 Simulate Failure'}
        </button>
      </div>

      {msg && <div style={{ background: '#1a2744', border: '1px solid #63b3ed', borderRadius: '8px', padding: '10px 16px', marginBottom: '16px', fontSize: '14px' }}>{msg}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} style={{ background: '#1a1d27', border: '1px solid #2d3748', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>{count}</div>
            <div style={{ color: '#4a5568', fontSize: '12px', marginTop: '4px' }}>{status}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            background: filter === s ? '#63b3ed' : '#1a1d27',
            color: filter === s ? '#000' : '#a0aec0',
            border: '1px solid #2d3748',
            padding: '6px 14px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}>{s}</button>
        ))}
      </div>

      {/* Incidents */}
      {loading ? (
        <p style={{ color: '#4a5568', textAlign: 'center' }}>Loading incidents...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#4a5568' }}>
          <div style={{ fontSize: '48px' }}>✅</div>
          <p style={{ marginTop: '12px' }}>No incidents found</p>
          <p style={{ fontSize: '13px', marginTop: '6px' }}>Click "Simulate Failure" to create one</p>
        </div>
      ) : (
        filtered.map(wi => <IncidentCard key={wi.id} workitem={wi} />)
      )}
    </div>
  );
}