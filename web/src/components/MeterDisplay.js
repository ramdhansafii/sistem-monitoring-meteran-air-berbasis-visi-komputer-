import React, { useEffect, useState } from 'react';

function DigitCell({ digit, index, highlight }) {
  const [displayed, setDisplayed] = useState(digit);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (displayed !== digit) {
      setFlipping(true);

      const t = setTimeout(() => {
        setDisplayed(digit);
        setFlipping(false);
      }, 150);

      return () => clearTimeout(t);
    }
  }, [digit, displayed]);

  return (
    <div
      style={{
        width: '42px',
        height: '56px',
        background: highlight
          ? 'linear-gradient(180deg, #001a2e, #00121e)'
          : 'linear-gradient(180deg, #0c1a2e, #091422)',
        border: highlight
          ? '1px solid rgba(0,212,255,0.5)'
          : '1px solid rgba(0,212,255,0.15)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontSize: '24px',
        fontWeight: '700',
        color: highlight ? '#00d4ff' : '#e8f4fd',
        boxShadow: highlight
          ? '0 0 16px rgba(0,212,255,0.25), inset 0 1px 0 rgba(255,255,255,0.05)'
          : 'inset 0 1px 0 rgba(255,255,255,0.03)',
        transform: flipping ? 'rotateX(90deg)' : 'rotateX(0deg)',
        transition: 'transform 0.15s ease',
        perspective: '200px',
        position: 'relative',
        overflow: 'hidden',
        animation: `fadeIn 0.4s ease ${index * 0.05}s both`,
      }}
    >
      {/* Scanline effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
          pointerEvents: 'none',
        }}
      />

      <span
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {displayed}
      </span>
    </div>
  );
}

export default function MeterDisplay({
  reading = '342578.00000',
  label = 'Pembacaan Meter',
}) {
  const readingString = String(reading)

  const [integerPart, decimalPart = ''] =
    readingString.split('.');

  const integerDigits = integerPart.split('');
  const decimalDigits = decimalPart.split('');

  // Highlight hanya bagian integer,
  // mulai dari angka pertama yang bukan 0.
  const firstNonZero = integerDigits.findIndex(
    (d) => Number(d) !== 0
  );

  const highlightStart =
    firstNonZero === -1
      ? integerDigits.length
      : firstNonZero;

  return (
    <div
      style={{
        fontSize: '11px',
        color: 'var(--text-secondary)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: '10px',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {label}

      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginTop: '10px',
          alignItems: 'center',
        }}
      >
        {/* INTEGER PART */}
        {integerDigits.map((d, i) => (
          <DigitCell
            key={`integer-${i}`}
            digit={d}
            index={i}
            highlight={i >= highlightStart}
          />
        ))}

        {/* DECIMAL DIVIDER */}
        {decimalDigits.length > 0 && (
          <div
            style={{
              width: '1px',
              height: '42px',
              margin: '0 6px',
              background: 'rgba(0, 212, 255, 0.45)',
              boxShadow: '0 0 6px rgba(0, 212, 255, 0.15)',
              borderRadius: '1px',
              flexShrink: 0,
            }}
          />
        )}

        {/* DECIMAL PART */}
        {decimalDigits.map((d, i) => (
          <DigitCell
            key={`decimal-${i}`}
            digit={d}
            index={integerDigits.length + i}
            highlight={false}
          />
        ))}

        {/* UNIT */}
        <div
          style={{
            marginLeft: '8px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            alignSelf: 'flex-end',
            paddingBottom: '8px',
          }}
        >
          m³
        </div>
      </div>

      {/* STATUS */}
      <div
        style={{
          marginTop: '8px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#00ff88',
            boxShadow: '0 0 8px #00ff88',
            animation: 'blink 1.5s ease infinite',
          }}
        />

        <span
          style={{
            fontSize: '11px',
            color: '#00ff88',
            fontFamily: 'var(--font-mono)',
          }}
        >
          LIVE READING
        </span>

        <span
          style={{
            marginLeft: 'auto',
            fontSize: '10px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          TFLite OCR
        </span>
      </div>
    </div>
  );
}