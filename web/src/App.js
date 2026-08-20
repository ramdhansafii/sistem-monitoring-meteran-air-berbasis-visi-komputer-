import React, { useState, useCallback, useEffect } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import RiwayatPage from './pages/RiwayatPage';
import KameraPage from './pages/KameraPage';
import TagihanPage from './pages/TagihanPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManagementPage from './pages/admin/ManagementPage';
import DeviceMapPage from './pages/admin/DeviceMapPage';
import AdminHistoryPage from './pages/admin/AdminHistoryPage';
import { ThemeProvider } from './utils/ThemeContext';
import AuthGate from './components/AuthGate';
import { api, getUser } from './api/client';

function AppShell() {
  const initialUser = getUser();
  const [page, setPage] = useState(initialUser?.role === 'admin' ? 'admin-dashboard' : 'dashboard');
  const [meterReading, setMeterReading] = useState('342578.00000');

  const [data, setData] = useState({
    dailyUsage: 0,
    monthlyUsage: 0,
    meterReading: '342578.00000',
    weeklyData: [],
    historyData: [],
  });
  const [user, setUser] = useState(getUser());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    api.getLatest()
      .then((r) => {
        if (!r?.readings?.length) return;

        const latest = r.readings[0];

        const readingValue = Number(
          r.current_reading ?? latest.reading ?? 0
        );

        const formattedReading = readingValue.toFixed(5);

        setMeterReading(formattedReading);

        const daysOfWeek = [
          'Min',
          'Sen',
          'Sel',
          'Rab',
          'Kam',
          'Jum',
          'Sab'
        ];

        setData(d => ({
          ...d,
          meterReading: formattedReading,
          dailyUsage: r.daily_usage ?? 0,
          monthlyUsage: r.monthly_usage ?? 0,
          previousMonthUsage: r.previous_month_usage ?? 0,
          latest_image: r.latest_image ?? null,
          billAmount: r.bill_amount ?? 0,

          weeklyData: (r.usage ?? []).map(item => ({
            day: daysOfWeek[new Date(item.date).getDay()],
            usage: item.water_usage
          })),

          historyData: r.readings
        }));
      })
      .catch(err => console.error(err));
  }, [page]);

  const handleReading = useCallback((result) => {
    if (result?.reading !== undefined) {
      const formattedReading = Number(result.reading).toFixed(5);

      setMeterReading(formattedReading);

      setData(d => ({
        ...d,
        meterReading: formattedReading,
      }));
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try { await api.logout(); } catch {}
    try { localStorage.removeItem('meteran-token'); localStorage.removeItem('meteran-user'); } catch {}
    if (typeof window !== 'undefined') window.location.reload();
  }, []);

  const isAdmin = user?.role === 'admin';

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage data={data} meterDigits={meterReading} onReading={handleReading} />;
      case 'riwayat': return <RiwayatPage data={data} />;
      case 'kamera': return <KameraPage data={data} meterDigits={meterReading} onReading={handleReading} />;
      case 'tagihan': return <TagihanPage data={data} meterDigits={meterReading} />;
      case 'profile': return <ProfilePage user={user} onUserUpdate={setUser} onLogout={handleLogout} />;
      // ==== Admin only ====
      case 'admin-dashboard': return isAdmin ? <AdminDashboardPage /> : null;
      case 'admin-management': return isAdmin ? <ManagementPage /> : null;
      case 'admin-map': return isAdmin ? <DeviceMapPage /> : null;
      case 'admin-history': return isAdmin ? <AdminHistoryPage /> : null;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Ambient background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(0,100,200,0.06) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 80%, rgba(0,212,255,0.04) 0%, transparent 60%)',
      }} />

      <Sidebar activePage={page} onNavigate={setPage} isMobile={isMobile} user={user} onLogout={handleLogout} />

      <main style={{
        marginLeft: isMobile ? '0' : '220px',
        marginTop: isMobile ? '57px' : '0',
        flex: 1,
        padding: isMobile ? '16px' : '32px 32px 32px 36px',
        position: 'relative', zIndex: 1,
        maxWidth: isMobile ? '100vw' : 'calc(100vw - 220px)',
        minHeight: '100vh',
      }}>
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthGate>
        <AppShell />
      </AuthGate>
    </ThemeProvider>
  );
}
