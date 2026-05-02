import React from 'react';

const severityColor = { P0: '#fc8181', P1: '#f6ad55', P2: '#63b3ed', P3: '#68d391' };

export default function SignalList({ signals }) {
  if (!signals || signals.length === 0) {
    return <p style={{ color: '#4a5568', textAlign: 'center', padding: '20px' }}>No signals found</p>;
  }

  return (
    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
      {signals.map((s, i) => (
        <div key={i} style={{
          background: '#1a1d27',
          border: '1px solid #2d3748',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <span style={{
              color: severityColor[s.severity] || '#a0aec0',
              fontWeight: 700,
              fontSize: '12px',
              marginRight: '10px',
            }}>{s.severity}</span>
            <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{s.message}</span>
          </div>
          <span style={{ fontSize: '11px', color: '#4a5568' }}>
            {new Date(s.timestamp).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
}