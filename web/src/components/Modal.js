import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, width = '480px' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: width,
          maxHeight: '90vh', overflowY: 'auto',
          background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))',
          border: '1px solid var(--border-glow)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {title}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '6px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{
        display: 'block', fontSize: '10px', color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase',
        marginBottom: '6px',
      }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: 'rgba(0,0,0,0.15)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '13px',
  fontFamily: 'var(--font-body)',
  outline: 'none',
};

export function TextInput(props) {
  return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
}

export function SelectInput({ children, ...props }) {
  return <select {...props} style={{ ...inputStyle, ...(props.style || {}), cursor: 'pointer' }}>{children}</select>;
}

export function TextAreaInput(props) {
  return <textarea {...props} style={{ ...inputStyle, resize: 'vertical', minHeight: '70px', ...(props.style || {}) }} />;
}

export function PrimaryButton({ children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        padding: '10px 18px',
        background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
        border: 'none',
        borderRadius: '8px',
        color: '#0a0f1e',
        fontWeight: '700',
        fontSize: '12px',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        padding: '10px 18px',
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        color: 'var(--text-secondary)',
        fontWeight: '600',
        fontSize: '12px',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
