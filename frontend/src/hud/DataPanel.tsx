import React from 'react';

export default function DataPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="hud-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="hud-label">{title}</div>
        <div className="w-2 h-2 rounded-full" style={{ boxShadow: '0 0 10px rgba(0,217,255,0.8)', background: '#00D9FF' }} />
      </div>
      <div className="text-cyan-200 text-xs" style={{ textShadow: '0 0 10px rgba(0,217,255,0.8)' }}>
        {children}
      </div>
    </div>
  );
}



