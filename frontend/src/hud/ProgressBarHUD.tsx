// import React from 'react';

export default function ProgressBarHUD({ label, value }: { label: string; value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="hud-panel p-3">
      <div className="hud-label mb-1">{label}</div>
      <div className="hud-bar">
        <div className="hud-bar-fill" style={{ width: v + '%' }} />
      </div>
      <div className="hud-number mt-1">{v}%</div>
    </div>
  );
}

