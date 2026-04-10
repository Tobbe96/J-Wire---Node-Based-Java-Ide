'use client';

import { useVfxStore } from '../store/vfxStore';

export default function VfxToggle() {
  const { vfxEnabled, toggleVfx } = useVfxStore();

  return (
    <button
      onClick={toggleVfx}
      title={vfxEnabled ? 'Disable VFX' : 'Enable VFX'}
      style={{
        height: 28,
        borderRadius: 5,
        border: vfxEnabled ? '1px solid #7c3aed' : '1px solid #333',
        cursor: 'pointer',
        fontSize: 11,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '0 8px',
        backgroundColor: '#1e1e1e',
        color: vfxEnabled ? '#a855f7' : '#666',
        transition: 'background 0.15s ease, border-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#2a2a2a';
        e.currentTarget.style.borderColor = vfxEnabled ? '#a855f7' : '#555';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#1e1e1e';
        e.currentTarget.style.borderColor = vfxEnabled ? '#7c3aed' : '#333';
      }}
    >
      ✦
    </button>
  );
}
