import React, { useState } from 'react';
import { Droplets, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { api, isAuthenticated } from '../api/client';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
  return null;
}
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    setLoading(true);
    try {
      const data = await api.login(username, password);
      if (data.token) {
  try {
    localStorage.setItem('meteran-token', data.token);
    localStorage.setItem(
      'meteran-user',
      JSON.stringify(data.user || { username })
    );

    console.log('Token:', localStorage.getItem('meteran-token'));
    console.log('Response:', data);

  } catch (err) {
    console.error(err);
  }

  if (typeof window !== 'undefined') {
    window.location.replace('/');
  }

      } else {
        setError(data.error || 'Login gagal');
      }
    } catch (err) {
      setError(err.message || 'Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(0,100,200,0.08) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 80%, rgba(0,212,255,0.06) 0%, transparent 60%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '420px',
        padding: '24px',
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '32px',
          boxShadow: 'var(--shadow-glow)',
        }}>
          <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                <img
                  src="/airkuya.png"
                  alt="MiSReD"
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />

                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    letterSpacing: '0.06em',
                  }}
                >
                  MiSReD
                </div>
              </div>

          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Selamat Datang
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Login untuk mengakses dashboard meteran
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field
              label="Username"
              value={username}
              onChange={setUsername}
              placeholder="username"
              required
              autoFocus
            />
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ ...inputStyle, paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-secondary)', padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 12px', borderRadius: '8px',
                background: 'rgba(255,107,107,0.1)',
                border: '1px solid rgba(255,107,107,0.3)',
                color: '#ff6b6b', fontSize: '12px',
              }}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '6px',
                padding: '12px',
                background: loading ? 'var(--bg-card-hover)' : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                color: loading ? 'var(--text-secondary)' : '#0a0f1e',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : '0 0 16px rgba(0,212,255,0.3)',
                transition: 'all 0.2s',
              }}
            >
              {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'MEMPROSES...' : 'LOGIN'}
            </button>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '10px',
  color: 'var(--text-secondary)',
  marginBottom: '6px',
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '13px',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  transition: 'border 0.2s',
};

function Field({ label, type = 'text', value, onChange, placeholder, required, autoFocus }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        style={inputStyle}
      />
    </div>
  );
}
