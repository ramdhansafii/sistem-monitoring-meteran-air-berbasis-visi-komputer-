import React, { useState, useEffect } from 'react';
import { Receipt, Droplets, TrendingUp, Calculator, Calendar, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { api } from '../api/client';
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import MeterDisplay from '../components/MeterDisplay';

const TARIF_PER_M3 = 5000; // Rp per m3
// Variabel ABONEMEN telah dihapus

export default function TagihanPage({ data, meterDigits }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const r = await api.getHistory(60);
      setHistory(r.readings || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Hitung pemakaian bulan ini
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = today;
  const prevMonthEnd = subMonths(monthEnd, 1);
  const prevMonthStart = startOfMonth(prevMonthEnd);

  function usageBetween(start, end) {
    const inRange = history.filter(r => {
      const t = new Date(r.reading_date);
      return t >= start && t <= end;
    }).sort((a, b) => new Date(a.reading_date) - new Date(b.reading_date));
    if (inRange.length < 2) return 0;
    const first = parseFloat(inRange[0].reading) || 0;
    const last = parseFloat(inRange[inRange.length - 1].reading) || 0;
    return Math.max(0, last - first);
  }

  const currentMonthUsage = Number(data?.monthlyUsage ?? 0);
  const prevMonthUsage = Number(data?.previousMonthUsage ?? 0);

// Estimasi tagihan = pemakaian bulan ini × tarif per m³
  const estimatedCost = currentMonthUsage * TARIF_PER_M3;

  // Breakdown harian bulan ini
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dailyBreakdown = daysInMonth.map(d => {
    const dayReadings = history.filter(r => {
      const t = new Date(r.reading_date);
      return t.toDateString() === d.toDateString();
    }).sort((a, b) => new Date(a.reading_date) - new Date(b.reading_date));
    let usage = 0;
    if (dayReadings.length >= 2) {
      usage = (parseFloat(dayReadings[dayReadings.length - 1].reading) || 0) - (parseFloat(dayReadings[0].reading) || 0);
    }
    return { date: d, usage: Math.max(0, usage) };
  });

  const maxDaily = Math.max(...dailyBreakdown.map(d => d.usage), 1);

  // // Estimasi akhir bulan tanpa abonemen
  // const daysPassed = today.getDate();
  // const daysInMonthTotal = daysInMonth.length;
  // const projectedUsage = daysPassed > 0 ? (currentMonthUsage / daysPassed) * daysInMonthTotal : 0;
  // const projectedCost = projectedUsage * TARIF_PER_M3;

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Receipt size={28} color="var(--accent-cyan)" />
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text-primary)' }}>
              Estimasi Tagihan
            </h1>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {format(today, 'MMMM yyyy', { locale: id }).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={errorBox}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Current reading + estimate */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={card}>
          <div style={cardHeader}>
            <div style={cardTitle}><Droplets size={14} color="var(--accent-cyan)" /> PEMBACAAN SAAT INI</div>
          </div>
          <MeterDisplay reading={meterDigits} label="Meter" />
        </div>

        <div style={{ ...card, background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(26,111,255,0.04))' }}>
          <div style={cardHeader}>
            <div style={cardTitle}><Calculator size={14} color="var(--accent-cyan)" /> ESTIMASI TAGIHAN BULAN INI</div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '700', color: 'var(--accent-cyan)', marginTop: '8px' }}>
            Rp {(estimatedCost ?? 0).toLocaleString("id-ID")}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {currentMonthUsage.toFixed(2)} m³ × Rp {TARIF_PER_M3.toLocaleString("id-ID")}
          </div>
          <div style={divider} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Pemakaian</span>
            <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{currentMonthUsage.toFixed(2)} m³</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tarif / m³</span>
            <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Rp {TARIF_PER_M3.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <StatBox label="Pemakaian Bulan Ini" value={`${currentMonthUsage.toFixed(2)} m³`} icon={Droplets} />
        <StatBox label="Pemakaian Bulan Lalu" value={`${prevMonthUsage.toFixed(2)} m³`} icon={Calendar} />
      </div>

      {/* Daily breakdown */}
      <div style={card}>
        <div style={cardHeader}>
          <div style={cardTitle}><FileText size={14} color="var(--accent-cyan)" /> PEMAKAIAN HARIAN BULAN INI</div>
        </div>
        <div style={{ marginTop: '12px' }}>
          {dailyBreakdown.slice().reverse().map((d, i) => {
            const w = (d.usage / maxDaily) * 100;
            const isToday = d.date.toDateString() === today.toDateString();
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '11px' }}>
                <div style={{ width: '60px', color: isToday ? 'var(--accent-cyan)' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {format(d.date, 'dd MMM', { locale: id })}
                </div>
                <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: '4px', height: '18px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    width: `${w}%`, height: '100%',
                    background: isToday
                      ? 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))'
                      : 'linear-gradient(90deg, rgba(0,212,255,0.4), rgba(26,111,255,0.3))',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <div style={{ width: '60px', textAlign: 'right', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {d.usage.toFixed(2)} m³
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const card = {
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: '12px', padding: '18px',
};
const cardHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' };
const cardTitle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' };
const divider = { height: '1px', background: 'var(--border)', margin: '12px 0' };
const refreshBtn = {
  display: 'flex', alignItems: 'center', gap: '6px',
  padding: '8px 14px', background: 'var(--bg-card)',
  border: '1px solid var(--border)', borderRadius: '8px',
  color: 'var(--accent-cyan)', fontSize: '11px', fontFamily: 'var(--font-mono)',
  cursor: 'pointer', letterSpacing: '0.1em',
};
const errorBox = {
  display: 'flex', alignItems: 'center', gap: '8px',
  padding: '10px', background: 'rgba(255,107,107,0.1)',
  border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px',
  color: '#ff6b6b', fontSize: '12px', marginBottom: '16px',
};

function StatBox({ label, value, icon: Icon, accent }) {
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <Icon size={12} color="var(--accent-cyan)" />
        <div style={{ ...cardTitle }}>{label.toUpperCase()}</div>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700',
        color: accent ? 'var(--accent-cyan)' : 'var(--text-primary)',
      }}>
        {value}
      </div>
    </div>
  );
}