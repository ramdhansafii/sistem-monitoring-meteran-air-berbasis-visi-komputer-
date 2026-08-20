import React, { useEffect, useState } from 'react';
import { Users, Cpu, Wifi, WifiOff, Camera, Wallet, Activity, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import StatCard from '../../components/StatCard';
import { adminApi } from '../../api/client';

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);
}

const ACTION_LABEL = {
  login_success: 'Login berhasil',
  login_failed: 'Login gagal',
  admin_create_user: 'Menambahkan pengguna',
  admin_update_user: 'Mengubah pengguna',
  admin_delete_user: 'Menghapus pengguna',
  admin_create_device: 'Menambahkan device',
  admin_update_device: 'Mengubah device',
  admin_delete_device: 'Menghapus device',
  correct_reading: 'Koreksi pembacaan',
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dash, setDash] = useState(null);

  useEffect(() => {
    setLoading(true);
    adminApi.getDashboard()
      .then((r) => setDash(r))
      .catch((e) => setError(e.message || 'Gagal memuat data'))
      .finally(() => setLoading(false));
  }, []);

  const chartData = (dash?.usage_chart || []).map((d) => ({
    day: format(new Date(d.date), 'dd MMM', { locale: id }),
    usage: d.usage,
  }));

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px', animation: 'fadeIn 0.5s ease' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
          Panel Admin
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
          Dashboard Admin
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '520px', lineHeight: 1.5 }}>
          Ringkasan seluruh sistem: pelanggan, device, aktivitas capture, dan estimasi pendapatan
        </p>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', padding: '40px 0', justifyContent: 'center' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Memuat data dashboard...
        </div>
      )}

      {error && !loading && (
        <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '12px', padding: '16px', color: '#ff6b6b', fontSize: '12px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {!loading && dash && (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <StatCard title="Total Pelanggan" value={dash.total_pelanggan} unit="" icon={Users} color="var(--accent-cyan)" delay={0} />
            <StatCard title="Total Device" value={dash.total_device} unit="" icon={Cpu} color="var(--accent-blue)" delay={0.05} />
            <StatCard title="Device Aktif" value={dash.device_aktif} unit="" icon={Wifi} color="var(--accent-green)" delay={0.1} />
            <StatCard title="Device Offline" value={dash.device_offline} unit="" icon={WifiOff} color="#ff6b6b" delay={0.15} />
            <StatCard title="Capture Hari Ini" value={dash.total_capture_hari_ini} unit="" icon={Camera} color="var(--accent-teal)" delay={0.2} />
            <StatCard
              title="Estimasi Pendapatan"
              value={formatRupiah(dash.total_estimasi_pendapatan).replace('Rp', '').trim()}
              unit="Rp"
              icon={Wallet}
              color="var(--accent-warn)"
              delay={0.25}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '16px' }}>
            {/* Chart */}
            <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', animation: 'fadeIn 0.5s ease 0.3s both', minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>
                Grafik Penggunaan Seluruh Pelanggan
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '16px' }}>Total konsumsi air 7 hari terakhir (m³)</div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: '8px', fontFamily: 'Space Mono', fontSize: 12 }} />
                  <Area type="monotone" dataKey="usage" stroke="var(--accent-blue)" strokeWidth={2.5} fill="url(#gradAdmin)" dot={{ fill: 'var(--accent-blue)', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Recent activity */}
            <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', animation: 'fadeIn 0.5s ease 0.35s both', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Activity size={14} color="var(--accent-cyan)" />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>Aktivitas Terbaru</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto' }}>
                {(dash.recent_activity || []).length === 0 && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Belum ada aktivitas.</div>
                )}
                {(dash.recent_activity || []).map((a) => (
                  <div key={a.id} style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: '600' }}>
                      {ACTION_LABEL[a.action] || a.action}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {a.full_name || a.username || 'System'} — {a.details}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {format(new Date(a.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
