import React, { useState, useEffect } from 'react';
import { LayoutDashboard, History, Droplets, Menu, X, Sun, Moon, Camera, Receipt, User, LogOut, ShieldCheck, Users, Map } from 'lucide-react';
import { useTheme } from '../utils/ThemeContext';

const userNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'riwayat', label: 'Riwayat Pemakaian', icon: History },
  { id: 'kamera', label: 'Hasil Foto Meteran', icon: Camera },
  { id: 'tagihan', label: 'Estimasi Tagihan', icon: Receipt },
  { id: 'profile', label: 'Profil Saya', icon: User },
];

const adminNavItems = [
  { id: 'admin-dashboard', label: 'Dashboard Admin', icon: ShieldCheck },
  { id: 'admin-management', label: 'Manajemen Device & Pengguna', icon: Users },
  { id: 'admin-map', label: 'Peta Persebaran Alat', icon: Map },
  { id: 'admin-history', label: 'Riwayat Seluruh Pengguna', icon: History },
];

export default function Sidebar({ activePage, onNavigate, user, onLogout }) {
  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNav = (id) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile header */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 101,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Droplets size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)' }}>MiSReD</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {isOpen ? <X size={18} color="var(--accent-cyan)" /> : <Menu size={18} color="var(--accent-cyan)" />}
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isMobile && isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 99,
            background: 'rgba(0,0,0,0.6)',
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: isMobile ? '260px' : '220px',
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: isMobile ? (isOpen ? '0' : '-260px') : '0',
        top: isMobile ? '57px' : '0',
        bottom: 0,
        zIndex: 100,
        transition: 'left 0.3s ease',
      }}>
        {/* Logo */}
              {!isMobile && (
                <div
                  style={{
                    padding: '22px 20px 22px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                    }}
                  >
                    <img
                      src="/airkuya.png"
                      alt="MiSReD"
                      style={{
                        width: '72px',
                        height: '72px',
                        objectFit: 'contain',
                        display: 'block',
                        flexShrink: 0,
                      }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '18px',
                          fontWeight: '700',
                          color: 'var(--text-primary)',
                          letterSpacing: '0.06em',
                          lineHeight: '1',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        MiSReD
                      </div>
                    </div>
                  </div>
                </div>
              )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  width: '100%', padding: '12px 14px',
                  background: active ? 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(26,111,255,0.08))' : 'transparent',
                  border: active ? '1px solid var(--border-glow)' : '1px solid transparent',
                  borderRadius: '10px',
                  color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13.5px',
                  fontWeight: active ? '600' : '400',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  animation: `slideIn 0.4s ease ${i * 0.06}s both`,
                  boxShadow: active ? '0 0 20px rgba(0,212,255,0.06)' : 'none',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
              >
                <Icon size={16} />
                {item.label}
                {active && <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-cyan)', boxShadow: '0 0 6px var(--accent-cyan)' }} />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 0', marginBottom: '10px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '700', color: '#0a0f1e',
              }}>
                {(user.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.full_name || user.username}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>@{user.username}</div>
              </div>
            </div>
          )}
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '10px 14px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: '400',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              marginBottom: '6px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            title={theme === 'dark' ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', padding: '10px 14px',
                background: 'transparent',
                border: '1px solid rgba(255,107,107,0.2)',
                borderRadius: '10px',
                color: '#ff6b6b',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: '400',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={14} />
              Logout
            </button>
          )}
          {!isMobile && (
            <div style={{ padding: '12px 0 0', fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>v1.0.0 — TFLite OCR</div>
              <div>Sistem Pemantauan AI</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
