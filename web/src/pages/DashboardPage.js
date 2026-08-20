import React, { useState } from 'react';
import { Droplets, Calendar, TrendingUp, RefreshCw, Wifi, AlertCircle, Camera } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import MeterDisplay from '../components/MeterDisplay';
import { API_BASE, api } from '../api/client';

export default function DashboardPage({ data, meterDigits }) {
  const [isError, setIsError] = useState(false);

  const latestImage = data?.latest_image

  const [imageUrl, setImageUrl] = useState(
    data?.latest_image
      ? `${API_BASE}/${data.latest_image}?t=${Date.now()}`
      : null
  );

  const refreshImage = async () => {
    try {
      const r = await api.getLatest();

      if (r.latest_image) {
        setImageUrl(
          `${API_BASE}/${r.latest_image}?t=${Date.now()}`
        );

        setIsError(false);
      }
    } catch {
      setIsError(true);
    }
  };

  // Menggunakan data aktual dari backend
  const chartDataToUse = data?.weeklyData || [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px', animation: 'fadeIn 0.5s ease' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
          Panel Pemantauan
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '0.03em', lineHeight: 1.2 }}>
          Dashboard Meteran Air
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '500px', lineHeight: 1.5 }}>
          Rancang bangun sistem pemantauan meteran air menggunakan kamera berbasis AI
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <StatCard title="Pemakaian Hari Ini" value={Number(data?.dailyUsage ?? 0).toLocaleString('id-ID', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})} unit="m³" icon={Droplets} color="var(--accent-cyan)" delay={0} trend={{ positive: false, label: '2.1 m³ dari kemarin' }} />
        <StatCard title="Pemakaian Bulanan" value={Number(data?.monthlyUsage ?? 0).toLocaleString('id-ID', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})} unit="m³" icon={Calendar} color="var(--accent-blue)" delay={0.08} trend={{ positive: true, label: 'Dalam batas normal' }} />
        <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', animation: 'fadeIn 0.5s ease 0.16s both' }}>
          <MeterDisplay reading={meterDigits} label="Meteran Saat Ini" />
        </div>
      </div>

      {/* WRAPPER GRID UTAMA (Ini yang sebelumnya hilang) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        
        {/* Chart */}
        <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', animation: 'fadeIn 0.5s ease 0.24s both' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>Tren Pemakaian 7 Hari</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Grafik konsumsi air mingguan</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,212,255,0.06)', borderRadius: '6px', padding: '4px 10px' }}>
              <TrendingUp size={11} color="var(--accent-blue)" />
              <span style={{ fontSize: '10px', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>m³</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartDataToUse} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
             <Tooltip
  formatter={(value) => [
    `${Number(value).toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} m³`,
    'Pemakaian'
  ]}
  contentStyle={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border-glow)',
    borderRadius: '8px',
    fontFamily: 'Space Mono',
    fontSize: 12
  }}
/>   <Area type="monotone" dataKey="usage" stroke="var(--accent-blue)" strokeWidth={2.5} fill="url(#grad2)" dot={{ fill: 'var(--accent-blue)', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Kamera ESP32-CAM */}
        <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', animation: 'fadeIn 0.5s ease 0.32s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={14} color="var(--accent-cyan)" />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)' }}>Hasil Foto Meteran</div>
                <div style={{ fontSize: '10px', color: isError ? "#ff4444" : "#00ff88", marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                </div>
              </div>
            
          </div>
            <button onClick={refreshImage} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={10} /> Refresh
            </button>
          </div>

          <div style={{ background: '#000', borderRadius: '12px', minHeight: '250px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {isError ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '12px' }}>
                <AlertCircle size={24} style={{ marginBottom: '8px' }} /><br/> Gagal memuat gambar
              </div>
            ) : (
              <img src={imageUrl} alt="ESP32 Camera" onError={() => setIsError(true)} style={{ width: '100%', maxHeight: '350px', objectFit: 'contain', borderRadius: '12px' }} />
            )}
          </div>
        </div>

      </div> {/* PENUTUP WRAPPER GRID UTAMA */}
    </div>
  );
}
