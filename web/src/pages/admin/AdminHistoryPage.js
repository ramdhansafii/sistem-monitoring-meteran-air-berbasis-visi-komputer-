import React, { useMemo, useState } from 'react';
import { Search, Calendar, ImageOff, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { id } from 'date-fns/locale';
import Modal from '../../components/Modal';

// Data dummy riwayat pembacaan seluruh pengguna (selaras dengan device dummy di Peta Persebaran Alat - Semarang)
const DUMMY_HISTORY = [
  { id: 1, customer_name: 'Budi Santoso', customer_username: 'budi123', device_id: '0016181111000001', device_name: 'ESP32-CAM-Meter-01', reading: 1284, confidence: 0.97, ocr_method: 'TFLite On-Device', manual_corrected: false, image_path: 'https://placehold.co/400x300/1a2332/00d4ff?text=Meter+1284', reading_date: '2026-08-11 06:15:00' },
  { id: 2, customer_name: 'Siti Aminah', customer_username: 'siti_a', device_id: '0016181111000002', device_name: 'ESP32-CAM-Meter-02', reading: 987, confidence: 0.94, ocr_method: 'TFLite On-Device', manual_corrected: false, image_path: 'https://placehold.co/400x300/1a2332/00d4ff?text=Meter+0987', reading_date: '2026-08-11 06:02:00' },
  { id: 3, customer_name: 'Ahmad Fauzi', customer_username: 'ahmad_f', device_id: '0016181111000003', device_name: 'ESP32-CAM-Meter-03', reading: 2103, confidence: 0.89, ocr_method: 'TFLite On-Device', manual_corrected: true, image_path: 'https://placehold.co/400x300/1a2332/00d4ff?text=Meter+2103', reading_date: '2026-08-11 05:48:00' },
  { id: 4, customer_name: 'Dewi Lestari', customer_username: 'dewi_l', device_id: '0016181111000004', device_name: 'ESP32-CAM-Meter-04', reading: 654, confidence: 0.91, ocr_method: 'TFLite On-Device', manual_corrected: false, image_path: 'https://placehold.co/400x300/1a2332/00d4ff?text=Meter+0654', reading_date: '2026-08-08 14:22:00' },
  { id: 5, customer_name: 'Rudi Hartono', customer_username: 'rudi_h', device_id: '0016181111000005', device_name: 'ESP32-CAM-Meter-05', reading: 1509, confidence: 0.86, ocr_method: 'TFLite On-Device', manual_corrected: false, image_path: 'https://placehold.co/400x300/1a2332/00d4ff?text=Meter+1509', reading_date: '2026-08-09 09:10:00' },
  { id: 6, customer_name: 'Budi Santoso', customer_username: 'budi123', device_id: '0016181111000001', device_name: 'ESP32-CAM-Meter-01', reading: 1279, confidence: 0.98, ocr_method: 'TFLite On-Device', manual_corrected: false, image_path: 'https://placehold.co/400x300/1a2332/00d4ff?text=Meter+1279', reading_date: '2026-08-10 06:10:00' },
  { id: 7, customer_name: 'Siti Aminah', customer_username: 'siti_a', device_id: '0016181111000002', device_name: 'ESP32-CAM-Meter-02', reading: 981, confidence: 0.95, ocr_method: 'TFLite On-Device', manual_corrected: false, image_path: 'https://placehold.co/400x300/1a2332/00d4ff?text=Meter+0981', reading_date: '2026-08-10 06:05:00' },
  { id: 8, customer_name: 'Ahmad Fauzi', customer_username: 'ahmad_f', device_id: '0016181111000003', device_name: 'ESP32-CAM-Meter-03', reading: 2095, confidence: 0.93, ocr_method: 'TFLite On-Device', manual_corrected: false, image_path: 'https://placehold.co/400x300/1a2332/00d4ff?text=Meter+2095', reading_date: '2026-08-10 05:50:00' },
  { id: 9, customer_name: 'Budi Santoso', customer_username: 'budi123', device_id: '0016181111000001', device_name: 'ESP32-CAM-Meter-01', reading: 1273, confidence: 0.96, ocr_method: 'TFLite On-Device', manual_corrected: false, image_path: 'https://placehold.co/400x300/1a2332/00d4ff?text=Meter+1273', reading_date: '2026-08-09 06:08:00' },
  { id: 10, customer_name: 'Dewi Lestari', customer_username: 'dewi_l', device_id: '0016181111000004', device_name: 'ESP32-CAM-Meter-04', reading: 648, confidence: 0.88, ocr_method: 'TFLite On-Device', manual_corrected: true, image_path: 'https://placehold.co/400x300/1a2332/00d4ff?text=Meter+0648', reading_date: '2026-08-07 14:15:00' },
  { id: 11, customer_name: 'Rudi Hartono', customer_username: 'rudi_h', device_id: '0016181111000005', device_name: 'ESP32-CAM-Meter-05', reading: 1502, confidence: 0.90, ocr_method: 'TFLite On-Device', manual_corrected: false, image_path: 'https://placehold.co/400x300/1a2332/00d4ff?text=Meter+1502', reading_date: '2026-08-08 09:05:00' },
  { id: 12, customer_name: 'Siti Aminah', customer_username: 'siti_a', device_id: '0016181111000002', device_name: 'ESP32-CAM-Meter-02', reading: 975, confidence: 0.97, ocr_method: 'TFLite On-Device', manual_corrected: false, image_path: 'https://placehold.co/400x300/1a2332/00d4ff?text=Meter+0975', reading_date: '2026-08-09 06:00:00' },
];

export default function AdminHistoryPage() {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [photoModal, setPhotoModal] = useState(null);
  const pageSize = 20;

  const filtered = useMemo(() => {
    return DUMMY_HISTORY.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        const match = r.customer_name.toLowerCase().includes(q)
          || r.customer_username.toLowerCase().includes(q)
          || r.device_id.toLowerCase().includes(q)
          || r.device_name.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (dateFrom || dateTo) {
        const d = parseISO(r.reading_date.replace(' ', 'T'));
        const from = dateFrom ? startOfDay(parseISO(dateFrom)) : new Date(0);
        const to = dateTo ? endOfDay(parseISO(dateTo)) : new Date(8640000000000000);
        if (!isWithinInterval(d, { start: from, end: to })) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.reading_date) - new Date(a.reading_date));
  }, [search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const imgUrl = (path) => path;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px', animation: 'fadeIn 0.5s ease' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
          Panel Admin
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
          Riwayat Seluruh Pengguna
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
          Riwayat pembacaan meter dari seluruh pelanggan dan device (data contoh)
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px' }}>
          <Search size={12} color="var(--text-secondary)" />
          <input
            placeholder="Cari nama pelanggan / device..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '11px', fontFamily: 'var(--font-mono)', width: '200px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px' }}>
          <Calendar size={12} color="var(--text-secondary)" />
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '11px', fontFamily: 'var(--font-mono)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>s/d</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '11px', fontFamily: 'var(--font-mono)' }} />
        </div>
        {(search || dateFrom || dateTo) && (
          <button onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setPage(1); }} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '10px' }}>
            Reset Filter
          </button>
        )}
      </div>

      <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', animation: 'fadeIn 0.5s ease 0.1s both' }}>
        {(
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Foto', 'Pelanggan', 'ID Device', 'Hasil OCR', 'Nilai Meter', 'Tanggal', 'Waktu'].map((h) => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((r) => {
                  const d = new Date(r.reading_date);
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '8px 12px' }}>
                        {r.image_path ? (
                          <div
                            onClick={() => setPhotoModal(r)}
                            style={{ width: '46px', height: '46px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: '1px solid var(--border)' }}
                          >
                            <img src={imgUrl(r.image_path)} alt="meter" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0 }}
                              onMouseEnter={e => e.currentTarget.style.opacity = 1}
                              onMouseLeave={e => e.currentTarget.style.opacity = 0}
                            >
                              <ZoomIn size={14} color="#fff" />
                            </div>
                          </div>
                        ) : (
                          <div style={{ width: '46px', height: '46px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <ImageOff size={16} />
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        {r.customer_name}
                        {r.customer_username && <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '400' }}>@{r.customer_username}</div>}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{r.device_id}<div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{r.device_name}</div></td>
                      <td style={{ padding: '10px 12px', fontSize: '10px', color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)' }}>
                        {r.ocr_method}{r.manual_corrected && <span style={{ marginLeft: '4px', color: 'var(--accent-warn)' }}>(dikoreksi)</span>}
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>conf: {(r.confidence * 100).toFixed(1)}%</div>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--accent-cyan)' }}>{r.reading}</td>
                      <td style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{format(d, 'dd MMM yyyy', { locale: id })}</td>
                      <td style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{format(d, 'HH:mm:ss')}</td>
                    </tr>
                  );
                })}
                {paged.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>Tidak ada riwayat ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Halaman {page} dari {totalPages} — Total {filtered.length} entri
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 10px', color: page <= 1 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: page <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={12} />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 10px', color: page >= totalPages ? 'var(--text-muted)' : 'var(--text-primary)', cursor: page >= totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Photo lightbox */}
      <Modal open={!!photoModal} onClose={() => setPhotoModal(null)} title={photoModal ? `Foto Meteran — ${photoModal.customer_name}` : ''} width="600px">
        {photoModal && (
          <div>
            <img src={imgUrl(photoModal.image_path)} alt="meter full" style={{ width: '100%', borderRadius: '10px', border: '1px solid var(--border)' }} />
            <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <div>Device: <span style={{ color: 'var(--text-primary)' }}>{photoModal.device_id}</span></div>
              <div>Nilai Meter: <span style={{ color: 'var(--accent-cyan)' }}>{photoModal.reading}</span></div>
              <div>Tanggal: <span style={{ color: 'var(--text-primary)' }}>{format(new Date(photoModal.reading_date), 'dd MMM yyyy, HH:mm:ss', { locale: id })}</span></div>
              <div>Confidence OCR: <span style={{ color: 'var(--text-primary)' }}>{(photoModal.confidence * 100).toFixed(1)}%</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
