'use client';

import { useVfxStore } from '../store/vfxStore';

export default function VfxToggle() {
  const { vfxEnabled, toggleVfx } = useVfxStore();

  return (
    <button
      onClick={toggleVfx}
      title={vfxEnabled ? 'Disable VFX' : 'Enable VFX'}
      style={{
        position: 'absolute',
        top: 10,
        right: 130,
        zIndex: 20,
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: vfxEnabled ? '2px solid #a855f7' : '2px solid #555',
        cursor: 'pointer',
        fontSize: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: vfxEnabled ? '#1e1e2e' : '#1e1e1e',
        color: vfxEnabled ? '#a855f7' : '#666',
        boxShadow: vfxEnabled ? '0 0 12px #a855f766' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      ✦
    </button>
  );
}
