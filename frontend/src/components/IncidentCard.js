import React from 'react';
import { useNavigate } from 'react-router-dom';

const severityColors = {
  P0: { bg: '#2d1b1b', border: '#fc8181', text: '#fc8181' },
  P1: { bg: '#2d2110', border: '#f6ad55', text: '#f6ad55' },
  P2: { bg: '#1a2744', border: '#63b3ed', text: '#63b3ed' },
  P3: { bg: '#1a2d1a', border: '#68d391', text: '#68d391' },
};

const statusColors = {
  OPEN: '#fc8181',
  INVESTIGATING: '#f6ad55',
  RESOLVED: '#63b3ed',
  CLOSED: '#68d391',
};

export default function IncidentCard({ workitem }) {
  const navigate = useNavigate();
  const sev = severityColors[workitem.severity] || severityColors.P3;

  return (
    <div onClick={() => navigate(`/incident/${workitem.id}`)} style={{
      background: sev.bg,
      border: `1px solid ${sev.border}`,
      borderRadius: '12px',
      padding: '20px',
      cursor: 'pointer',
      transition: 'transform 0.1s',
      marginBottom: '12px',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{
            background: sev.border,
            color: '#000',
            fontWeight: 700,
            fontSize: '12px',
            padding: '2px 10px',
            borderRadius: '6px',
            marginRight: '10px',
          }}>{workitem.severity}</span>
          <span style={{ fontWeight: 600, fontSize: '16px' }}>{workitem.component_id}</span>
        </div>
        <span style={{
          color: statusColors[workitem.status],
          fontSize: '13px',
          fontWeight: 600,
          background: '#0f1117',
          padding: '4px 12px',
          borderRadius: '20px',
        }}>● {workitem.status}</span>
      </div>
      <div style={{ marginTop: '12px', color: '#a0aec0', fontSize: '13px' }}>
        <span>🕐 {new Date(workitem.created_at).toLocaleString()}</span>
        <span style={{ marginLeft: '16px' }}>
          📡 {Array.isArray(workitem.signal_ids) ? workitem.signal_ids.length : 0} signals
        </span>
      </div>
    </div>
  );
}