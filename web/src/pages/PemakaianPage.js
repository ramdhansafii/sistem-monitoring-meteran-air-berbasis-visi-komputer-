import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const MONTHLY_LIMIT = 400;

export default function PemakaianPage({ data }) {
  const progress = (data.monthlyUsage / MONTHLY_LIMIT) * 100;
  const isWarning = progress > 75;

  return (
    <div>
      <div style={{ marginBottom: '28px', animation: 'fadeIn 0.5s ease' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>Analisis</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>Pemakaian Air</h1>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Pantau dan analisis konsumsi air Anda secara real-time</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Monthly gauge */}
        <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', animation: 'fadeIn 0.5s ease 0.1s both' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)', marginBottom: '20px' }}>Kuota Bulanan</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke={isWarning ? '#ff6b6b' : 'var(--accent-cyan)'}
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${isWarning ? '#ff6b6b' : 'var(--accent-cyan)'})` }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: isWarning ? '#ff6b6b' : 'var(--accent-cyan)' }}>{progress.toFixed(0)}%</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TERPAKAI</div>
              </div>
            </div>
            <div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>TERPAKAI</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--accent-cyan)' }}>{data.monthlyUsage} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>m³</span></div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>SISA KUOTA</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--accent-green)' }}>{MONTHLY_LIMIT - data.monthlyUsage} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>m³</span></div>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isWarning ? <AlertTriangle size={12} color="var(--accent-warn)" /> : <CheckCircle size={12} color="var(--accent-green)" />}
                <span style={{ fontSize: '11px', color: isWarning ? 'var(--accent-warn)' : 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                  {isWarning ? 'Mendekati batas' : 'Konsumsi normal'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily breakdown */}
        <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', animation: 'fadeIn 0.5s ease 0.18s both' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)', marginBottom: '16px' }}>Distribusi Pemakaian Hari Ini</div>
          {[
            { label: 'Pagi (06:00–12:00)', pct: 35, color: 'var(--accent-cyan)' },
            { label: 'Siang (12:00–18:00)', pct: 45, color: 'var(--accent-blue)' },
            { label: 'Malam (18:00–24:00)', pct: 20, color: 'var(--accent-teal)' },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: item.color }}>{(data.dailyUsage * item.pct / 100).toFixed(1)} m³</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(0,212,255,0.06)', borderRadius: '3px' }}>
                <div style={{ height: '100%', width: `${item.pct}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`, borderRadius: '3px', boxShadow: `0 0 8px ${item.color}40`, transition: 'width 1s ease', animation: `fadeIn 0.8s ease ${0.3 + i * 0.1}s both` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly chart */}
      <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', animation: 'fadeIn 0.5s ease 0.26s both' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)', marginBottom: '20px' }}>Tren Pemakaian 7 Hari</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.weeklyData}>
            <defs>
              <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: '8px', fontFamily: 'Space Mono', fontSize: 12 }} />
            <Area type="monotone" dataKey="usage" stroke="var(--accent-blue)" strokeWidth={2.5} fill="url(#grad2)" dot={{ fill: 'var(--accent-blue)', r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
