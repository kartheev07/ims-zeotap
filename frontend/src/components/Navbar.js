import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  nav: {
    background: '#1a1d27',
    borderBottom: '1px solid #2d3748',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    color: '#63b3ed',
    fontWeight: 700,
    fontSize: '20px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  badge: {
    background: '#2d3748',
    color: '#a0aec0',
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '12px',
  }
};

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        🛡️ IMS <span style={styles.badge}>v1.0.0</span>
      </Link>
      <span style={{ color: '#68d391', fontSize: '13px' }}>● Live</span>
    </nav>
  );
}