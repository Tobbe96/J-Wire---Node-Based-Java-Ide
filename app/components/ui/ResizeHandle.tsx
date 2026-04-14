'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ResizeHandleProps {
  direction: 'vertical' | 'horizontal';
  onResize: (delta: number) => void;
}

export default function ResizeHandle({ direction, onResize }: ResizeHandleProps) {
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const lastPos = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    lastPos.current = direction === 'vertical' ? e.clientX : e.clientY;
    setDragging(true);
  }, [direction]);

  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const current = direction === 'vertical' ? e.clientX : e.clientY;
      const delta = current - lastPos.current;
      if (delta !== 0) {
        onResize(delta);
        lastPos.current = current;
      }
    };

    const onMouseUp = () => setDragging(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, direction, onResize]);

  const isVertical = direction === 'vertical';
  const active = dragging || hovered;

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...(isVertical
          ? { width: 6, cursor: 'col-resize', flexShrink: 0 }
          : { height: 6, cursor: 'row-resize', flexShrink: 0 }),
        background: active ? '#3b82f6' : 'transparent',
        transition: dragging ? 'none' : 'background 0.15s',
        position: 'relative',
        zIndex: 30,
      }}
    >
      {/* Center indicator line */}
      <div style={{
        position: 'absolute',
        ...(isVertical
          ? { top: 0, bottom: 0, left: 2, width: 2 }
          : { left: 0, right: 0, top: 2, height: 2 }),
        background: active ? '#3b82f6' : '#333',
        borderRadius: 1,
        transition: dragging ? 'none' : 'background 0.15s',
      }} />
    </div>
  );
}
