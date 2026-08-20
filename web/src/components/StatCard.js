import React from 'react';

export default function StatCard({ title, value, unit, icon: Icon, color = '#00d4ff', trend, delay = 0 }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      animation: `fadeIn 0.5s ease ${delay}s both`,
      transition: 'border-color 0.3s, transform 0.2s',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-glow)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Bg glow blob */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '100px', height: '100px',
        background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{title}</div>
        {Icon && (
          <div style={{
            width: '34px', height: '34px',
            background: `${color}18`,
            border: `1px solid ${color}30`,
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={16} color={color} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '36px',
          fontWeight: '700',
          color,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          textShadow: `0 0 20px ${color}40`,
        }}>{value}</span>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{unit}</span>
      </div>

      {trend && (
        <div style={{ marginTop: '12px', fontSize: '11px', color: trend.positive ? 'var(--accent-green)' : '#ff6b6b', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>{trend.positive ? '▲' : '▼'}</span>
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
