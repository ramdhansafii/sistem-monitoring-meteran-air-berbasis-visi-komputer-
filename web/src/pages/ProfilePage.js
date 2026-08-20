import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, LogOut, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

export default function ProfilePage({ user, onUserUpdate, onLogout }) {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.getProfile().then((r) => {
      if (r?.user) {
        setFullName(r.user.full_name || '');
        setEmail(r.user.email || '');
        onUserUpdate?.(r.user);
      }
    }).catch(() => {});
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
    try {
      const payload = { full_name: fullName, email };
      if (password) payload.password = password;
      const r = await api.updateProfile(payload);
      setSuccess(r.message || 'Profil berhasil disimpan');
      setPassword('');
      if (r?.user) onUserUpdate?.(r.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-fade" style={{ maxWidth: '560px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <User size={28} color="var(--accent-cyan)" />
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text-primary)' }}>
            Profil Saya
          </h1>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            KELOLA INFORMASI AKUN
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '20px', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: '700', color: '#0a0f1e', fontFamily: 'var(--font-display)',
          }}>
            {(user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>
              {user?.full_name || user?.username}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={12} /> @{user?.username}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Username" value={user?.username || ''} disabled />
          <Field label="Nama Lengkap" value={fullName} onChange={setFullName} icon={<User size={14} />} />
          <Field label="Email" type="email" value={email} onChange={setEmail} icon={<Mail size={14} />} />
          <Field label="Password Baru (opsional)" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', color: '#ff6b6b', fontSize: '12px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '8px', color: '#00ff88', fontSize: '12px' }}>
              <CheckCircle2 size={14} /> {success}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px', background: saving ? 'var(--bg-card-hover)' : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              color: saving ? 'var(--text-secondary)' : '#0a0f1e', border: 'none', borderRadius: '8px',
              fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em',
              cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
          </button>
        </form>
      </div>

      <button
        onClick={onLogout}
        style={{
          width: '100%', padding: '12px',
          background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)',
          color: '#ff6b6b', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        <LogOut size={16} /> LOGOUT
      </button>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: '10px', color: 'var(--text-secondary)',
  marginBottom: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase',
};

const inputStyle = {
  width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)',
  border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)',
  fontSize: '13px', outline: 'none',
};

function Field({ label, type = 'text', value, onChange, icon, placeholder, disabled }) {
  const [show, setShow] = React.useState(false);
  const actualType = type === 'password' && show ? 'text' : type;
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
            {icon}
          </div>
        )}
        <input
          type={actualType}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={{ ...inputStyle, paddingLeft: icon ? '32px' : '12px', opacity: disabled ? 0.6 : 1 }}
        />
        {type === 'password' && value && (
          <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '10px' }}>
            {show ? '🙈' : '👁'}
          </button>
        )}
      </div>
    </div>
  );
}
