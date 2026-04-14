'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useVfxStore } from '../../store/vfxStore';

interface Spark {
  id: number;
  x: number;
  y: number;
  color: string;
}

let sparkId = 0;

export default function ConnectionSpark() {
  const vfxEnabled = useVfxStore((s) => s.vfxEnabled);
  const [sparks, setSparks] = useState<Spark[]>([]);

  const addSpark = useCallback((x: number, y: number, color: string) => {
    if (!vfxEnabled) return;
    const id = ++sparkId;
    setSparks((prev) => [...prev, { id, x, y, color }]);
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.id !== id));
    }, 600);
  }, [vfxEnabled]);

  // Expose to window so the store can trigger it
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__devflowSpark = addSpark;
    return () => {
      delete (window as unknown as Record<string, unknown>).__devflowSpark;
    };
  }, [addSpark]);

  if (!vfxEnabled || sparks.length === 0) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}>
      {sparks.map((spark) => (
        <div key={spark.id} className="vfx-spark-burst" style={{ left: spark.x, top: spark.y, position: 'absolute' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="vfx-spark-particle"
              style={{
                '--angle': `${i * 45}deg`,
                '--color': spark.color,
              } as React.CSSProperties}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Trigger a connection spark from anywhere */
export function triggerConnectionSpark(x: number, y: number, color: string) {
  const fn = (window as unknown as Record<string, unknown>).__devflowSpark as
    | ((x: number, y: number, color: string) => void)
    | undefined;
  fn?.(x, y, color);
}
