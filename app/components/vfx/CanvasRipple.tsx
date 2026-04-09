'use client';

import React, { useState, useCallback } from 'react';
import { useVfxStore } from '../../store/vfxStore';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

let rippleId = 0;

export default function CanvasRipple({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const vfxEnabled = useVfxStore((s) => s.vfxEnabled);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!vfxEnabled) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleId;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 700);
  }, [vfxEnabled, containerRef]);

  return (
    <div
      onClick={handleClick}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}
    >
      {ripples.map((r) => (
        <div
          key={r.id}
          className="vfx-ripple"
          style={{
            left: r.x,
            top: r.y,
            position: 'absolute',
          }}
        />
      ))}
    </div>
  );
}
