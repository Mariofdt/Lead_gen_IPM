// import React from 'react';

type Props = {
  size?: number;
  value: number; // 0-100
  label?: string;
};

export default function CircularGauge({ size = 220, value, label }: Props) {
  const stroke = 8;
  const r = (size / 2) - stroke * 2;
  const c = Math.PI * 2 * r;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * c;

  return (
    <div className="hud-panel" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00B8D4" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,217,255,0.15)" strokeWidth={stroke} />
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          fill="none"
          stroke="url(#glow)"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c-dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          className="hud-rotate-slow"
        />
        {/* tick marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * Math.PI * 2;
          const x1 = size/2 + Math.cos(a) * (r + 6);
          const y1 = size/2 + Math.sin(a) * (r + 6);
          const x2 = size/2 + Math.cos(a) * (r + 14);
          const y2 = size/2 + Math.sin(a) * (r + 14);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,217,255,0.25)" strokeWidth={i%5===0?1.5:1} />
        })}
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="hud-number">
          {Math.round(clamped)}%
        </text>
        {label && (
          <text x="50%" y={size-12} textAnchor="middle" className="hud-label">{label}</text>
        )}
      </svg>
    </div>
  );
}

