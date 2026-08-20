import React, { useState, useEffect } from 'react';
import { API_BASE, api } from '../api/client';
import { Camera, RefreshCw, Wifi, AlertCircle } from 'lucide-react';

export default function KameraPage({ data }) {
  const [isError, setIsError] = useState(false);
  const latestImage = data?.latest_image;

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

  console.log(data.latest_image)

  useEffect(() => {
    if (data?.latest_image) {
      setImageUrl(
        `${API_BASE}/${data.latest_image}?t=${Date.now()}`
      );
      setIsError(false);
    }
  }, [data]);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: "6px" }}>
          AI Vision
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "0.03em" }}>
          Hsil Foto Meteran
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
          Menampilkan hasil tangkapan kamera meteran air
        </p>
      </div>

      {/* Card Kamera */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))',
        border: "1px solid var(--border)",
        borderRadius: "16px",
        overflow: "hidden",
      }}>
        {/* Status */}
        <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Camera size={14} color={isError ? "#ff4444" : "#00ff88"} />
            <span style={{ color: isError ? "#ff4444" : "#00ff88", fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: "700" }}>
              {isError ? "ESP32 OFFLINE" : "ESP32 ONLINE"}
            </span>
          </div>
          <button onClick={refreshImage} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Gambar */}
        <div
          style={{
            background: "#000",
            minHeight: "300px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px",
          }}
        >
          {isError ? (
            <div
              style={{
                color: "var(--text-muted)",
                textAlign: "center",
                fontSize: "12px",
              }}
            >
              <AlertCircle size={32} />
              <br />
              Gagal memuat gambar
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Meter"
              onError={() => setIsError(true)}
              style={{
                width: "100%",
                maxHeight: "500px",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          ) : (
            <div
              style={{
                color: "var(--text-muted)",
                textAlign: "center",
                fontSize: "12px",
              }}
            >
              Belum ada gambar
            </div>
          )}
        </div>
      </div>

      {/* Informasi */}
      <div style={{ marginTop: "16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <Camera size={14} color="var(--accent-cyan)" />
          <span style={{ fontWeight: "700", fontSize: "11px", fontFamily: "var(--font-mono)" }}>INFORMASI KAMERA</span>
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: "11px", lineHeight: 1.6 }}>
          • Pastikan ESP32 terhubung ke jaringan yang sama dengan perangkat ini.<br />
          • Pastikan endpoint <code>/capture</code> aktif pada alamat IP yang terdaftar.
        </div>
      </div>
    </div>
  );
}