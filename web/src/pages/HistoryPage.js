import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Filter, Download, Calendar } from 'lucide-react';

const STATUS_COLOR = { Tinggi: '#ff6b6b', Normal: 'var(--accent-cyan)', Rendah: 'var(--accent-green)' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: '8px', padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '18px', color: 'var(--accent-cyan)', fontWeight: '700' }}>{payload[0].value} m³</div>
      </div>
    );
  }
  return null;
};

export default function HistoryPage({ data }) {
  const [filter, setFilter] = useState('semua');
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState('desc');

  const avg = useMemo(() => (data.reduce((a, b) => a + b.usage, 0) / data.length).toFixed(1), [data]);
  const max = useMemo(() => Math.max(...data.map(d => d.usage)), [data]);
  const min = useMemo(() => Math.min(...data.map(d => d.usage)), [data]);

  const filtered = useMemo(() => {
    let d = [...data];
    if (filter !== 'semua') d = d.filter(x => x.status.toLowerCase() === filter);
    if (search) d = d.filter(x => x.date.includes(search));
    if (sortDir === 'asc') d.sort((a, b) => a.usage - b.usage);
    else if (sortDir === 'desc') d.sort((a, b) => b.usage - a.usage);
    return d;
  }, [data, filter, search, sortDir]);

  const chartData = data.slice(-14).map(d => ({ ...d, label: d.shortDate }));

  const downloadCSV = () => {
    const header = 'Tanggal,Hari,Pemakaian (m³),Kumulatif (m³),Status\n';
    const rows = data.map(d => `${d.date},${d.day},${d.usage},${d.cumulative},${d.status}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'history-pemakaian.csv'; a.click();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px', animation: 'fadeIn 0.5s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>Rekam Jejak</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>History Pemakaian</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Data pemakaian harian — 30 hari terakhir</p>
        </div>
        <button onClick={downloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'rgba(0,212,255,0.08)', border: '1px solid var(--border-glow)', borderRadius: '8px', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-body)' }}>
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Rata-rata Harian', value: avg, unit: 'm³', color: 'var(--accent-cyan)' },
          { label: 'Tertinggi', value: max, unit: 'm³', color: '#ff6b6b', icon: TrendingUp },
          { label: 'Terendah', value: min, unit: 'm³', color: 'var(--accent-green)', icon: TrendingDown },
          { label: 'Total Bulan', value: data.reduce((a, b) => a + b.usage, 0), unit: 'm³', color: 'var(--accent-teal)' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))',
            border: '1px solid var(--border)',
            borderRadius: '12px', padding: '16px',
            animation: `fadeIn 0.5s ease ${i * 0.06}s both`,
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: s.color }}>
              {s.value}
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '4px', fontFamily: 'var(--font-mono)' }}>{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '20px', animation: 'fadeIn 0.5s ease 0.25s both' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
          Grafik Pemakaian — 14 Hari Terakhir
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 0, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={parseFloat(avg)} stroke="rgba(255,170,0,0.4)" strokeDasharray="4 4" label={{ value: 'Avg', fill: 'var(--accent-warn)', fontSize: 9 }} />
            <Bar dataKey="usage" fill="url(#barGrad)" radius={[4, 4, 0, 0]}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-cyan)" />
                  <stop offset="100%" stopColor="var(--accent-blue)" />
                </linearGradient>
              </defs>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
          <Filter size={12} />
          <span style={{ fontFamily: 'var(--font-mono)' }}>Filter:</span>
        </div>
        {['semua', 'tinggi', 'normal', 'rendah'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontFamily: 'var(--font-body)', cursor: 'pointer',
            background: filter === f ? 'rgba(0,212,255,0.12)' : 'transparent',
            border: filter === f ? '1px solid var(--border-glow)' : '1px solid var(--border)',
            color: filter === f ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            transition: 'all 0.2s',
            textTransform: 'capitalize',
          }}>{f}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px' }}>
          <Calendar size={11} color="var(--text-secondary)" />
          <input
            placeholder="Cari tanggal..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '11px', fontFamily: 'var(--font-mono)', width: '120px' }}
          />
        </div>
        <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')} style={{ padding: '6px 12px', background: 'rgba(122,111,255,0.08)', border: '1px solid rgba(122,111,255,0.2)', borderRadius: '8px', color: 'var(--accent-teal)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
          {sortDir === 'desc' ? '↓ Terbanyak' : '↑ Tersedikit'}
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', animation: 'fadeIn 0.5s ease 0.35s both' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Tanggal', 'Hari', 'Pemakaian', 'Kumulatif', 'Status', 'Visualisasi'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '400' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} style={{
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.2s',
                animation: `fadeIn 0.3s ease ${i * 0.02}s both`,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '11px 16px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{row.date}</td>
                <td style={{ padding: '11px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{row.day}</td>
                <td style={{ padding: '11px 16px', fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--accent-cyan)' }}>{row.usage} <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>m³</span></td>
                <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{row.cumulative} m³</td>
                <td style={{ padding: '11px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontFamily: 'var(--font-mono)',
                    background: `${STATUS_COLOR[row.status] || '#ff6b6b'}18`,
                    border: `1px solid ${STATUS_COLOR[row.status] || '#ff6b6b'}40`,
                    color: STATUS_COLOR[row.status] || '#ff6b6b',
                  }}>{row.status}</span>
                </td>
                <td style={{ padding: '11px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(0,212,255,0.08)', borderRadius: '2px', maxWidth: '80px' }}>
                      <div style={{ height: '100%', width: `${(row.usage / max) * 100}%`, background: `linear-gradient(90deg, var(--accent-blue), var(--accent-cyan))`, borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', width: '30px' }}>{((row.usage / max) * 100).toFixed(0)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Menampilkan {filtered.length} dari {data.length} entri
        </div>
      </div>
    </div>
  );
}
