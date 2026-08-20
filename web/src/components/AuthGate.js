import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api, isAuthenticated } from '../api/client';
import LoginPage from '../pages/LoginPage';

export default function AuthGate({ children }) {
  const [state, setState] = useState('checking');

  useEffect(() => {
    let mounted = true;
    if (!isAuthenticated()) {
      setState('guest');
      return;
    }
    api.me()
      .then(() => { if (mounted) setState('authed'); })
      .catch(() => { if (mounted) setState('guest'); });
    return () => { mounted = false; };
  }, []);

  if (state === 'checking') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)', color: 'var(--text-secondary)',
        flexDirection: 'column', gap: '12px',
      }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-cyan)' }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.15em' }}>
          MEMVERIFIKASI SESI...
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (state === 'guest') {
    return <LoginPage />;
  }

  return children;
}
