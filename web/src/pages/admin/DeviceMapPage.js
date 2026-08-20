import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Wifi, WifiOff } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Data dummy: 5 device di area Kota Semarang (3 aktif, 2 offline)
const DUMMY_DEVICES = [
  {
    id: 1, device_id: '0016181111000001', name: 'ESP32-CAM-Meter-01',
    location: 'Jl. Pandanaran, Semarang Tengah', latitude: -6.9899, longitude: 110.4203,
    is_active: true, owner_name: 'Budi Santoso', owner_username: 'budi123',
    last_reading: 1284, last_reading_at: '2026-08-11 06:15:00',
  },
  {
    id: 2, device_id: '0016181111000002', name: 'ESP32-CAM-Meter-02',
    location: 'Jl. Pahlawan, Semarang Selatan', latitude: -6.9932, longitude: 110.4181,
    is_active: true, owner_name: 'Siti Aminah', owner_username: 'siti_a',
    last_reading: 987, last_reading_at: '2026-08-11 06:02:00',
  },
  {
    id: 3, device_id: '0016181111000003', name: 'ESP32-CAM-Meter-03',
    location: 'Jl. MT Haryono, Semarang Timur', latitude: -6.9835, longitude: 110.4315,
    is_active: true, owner_name: 'Ahmad Fauzi', owner_username: 'ahmad_f',
    last_reading: 2103, last_reading_at: '2026-08-11 05:48:00',
  },
  {
    id: 4, device_id: '0016181111000004', name: 'ESP32-CAM-Meter-04',
    location: 'Jl. Kelud Raya, Semarang Barat', latitude: -6.9781, longitude: 110.3987,
    is_active: false, owner_name: 'Dewi Lestari', owner_username: 'dewi_l',
    last_reading: 654, last_reading_at: '2026-08-08 14:22:00',
  },
  {
    id: 5, device_id: '0016181111000005', name: 'ESP32-CAM-Meter-05',
    location: 'Jl. Sriwijaya, Candisari', latitude: -7.0021, longitude: 110.4402,
    is_active: false, owner_name: 'Rudi Hartono', owner_username: 'rudi_h',
    last_reading: 1509, last_reading_at: '2026-08-09 09:10:00',
  },
];

export default function DeviceMapPage() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [devices] = useState(DUMMY_DEVICES);
  const [selected, setSelected] = useState(null);

  // Init leaflet map once
  useEffect(() => {
    if (!window.L || !mapRef.current || mapInstance.current) return;
    const L = window.L;

    mapInstance.current = L.map(mapRef.current, {
      center: [-6.9899, 110.4203], // Kota Semarang
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update markers when devices change
  useEffect(() => {
    if (!window.L || !mapInstance.current) return;
    const L = window.L;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (devices.length === 0) return;

    const bounds = [];

    devices.forEach((d) => {
      const color = d.is_active ? '#00ff88' : '#ff4444';
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid rgba(255,255,255,0.85);box-shadow:0 0 10px ${color};"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([d.latitude, d.longitude], { icon }).addTo(mapInstance.current);

      const popupHtml = `
        <div style="font-family: sans-serif; min-width:180px;">
          <div style="font-weight:700; font-size:13px; margin-bottom:4px;">${d.name}</div>
          <div style="font-size:11px; color:#555; margin-bottom:2px;">Pelanggan: ${d.owner_name}</div>
          <div style="font-size:11px; color:#555; margin-bottom:2px;">Status: <b style="color:${color}">${d.is_active ? 'Aktif' : 'Offline'}</b></div>
          <div style="font-size:11px; color:#555; margin-bottom:2px;">Pembacaan terakhir: ${d.last_reading ?? '-'}</div>
          <div style="font-size:11px; color:#555;">Update: ${d.last_reading_at ? new Date(d.last_reading_at).toLocaleString('id-ID') : '-'}</div>
        </div>
      `;
      marker.bindPopup(popupHtml);
      marker.on('click', () => setSelected(d));

      markersRef.current.push(marker);
      bounds.push([d.latitude, d.longitude]);
    });

    if (bounds.length) {
      mapInstance.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [devices]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px', animation: 'fadeIn 0.5s ease' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
          Panel Admin
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
          Peta Persebaran Alat
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
          Lokasi seluruh device terpasang (data contoh — Kota Semarang). <span style={{ color: 'var(--accent-green)' }}>🟢 Aktif</span> · <span style={{ color: '#ff6b6b' }}>🔴 Offline</span>
        </p>
      </div>

      {(
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(240px, 1fr)', gap: '16px', alignItems: 'start' }}>
          {/* Map */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px',
            overflow: 'hidden', animation: 'fadeIn 0.5s ease 0.1s both',
          }}>
            <div ref={mapRef} style={{ width: '100%', height: '520px' }} />
          </div>

          {/* Device list / selected info */}
          <div style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', animation: 'fadeIn 0.5s ease 0.15s both', maxHeight: '520px', overflowY: 'auto' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Daftar Device ({devices.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {devices.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    setSelected(d);
                    if (mapInstance.current) {
                      mapInstance.current.flyTo([d.latitude, d.longitude], 16, { duration: 0.6 });
                      const idx = devices.findIndex((x) => x.id === d.id);
                      if (markersRef.current[idx]) markersRef.current[idx].openPopup();
                    }
                  }}
                  style={{
                    padding: '10px', borderRadius: '10px', cursor: 'pointer',
                    background: selected?.id === d.id ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selected?.id === d.id ? 'var(--border-glow)' : 'var(--border)'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)' }}>{d.name}</div>
                    {d.is_active
                      ? <Wifi size={12} color="var(--accent-green)" />
                      : <WifiOff size={12} color="#ff6b6b" />}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>{d.owner_name}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={9} /> {d.location || 'Lokasi tidak diketahui'}
                  </div>
                  {d.last_reading_at && (
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      Update: {format(new Date(d.last_reading_at), 'dd MMM, HH:mm', { locale: id })}
                    </div>
                  )}
                </div>
              ))}
              {devices.length === 0 && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                  Belum ada device dengan koordinat.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
