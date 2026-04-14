'use client';

import React, { memo } from 'react';
import { BaseEdge, getSmoothStepPath, type EdgeProps, type Edge } from '@xyflow/react';

function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps<Edge>) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const stroke = (style.stroke as string) || '#6366f1';
  const strokeWidth = (style.strokeWidth as number) || 2;
  const isExec = stroke === '#fff' || stroke === '#ffffff';
  const filterId = `glow-${id}`;

  return (
    <>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Glow layer */}
      <path
        d={edgePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth + 4}
        strokeOpacity={0.15}
        filter={`url(#${filterId})`}
        className="react-flow__edge-path"
      />
      {/* Animated flowing dashes */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke,
          strokeWidth,
          strokeDasharray: isExec ? '8 4' : '6 4',
          animation: `vfx-edge-flow ${isExec ? '0.6s' : '1s'} linear infinite`,
        }}
      />
    </>
  );
}

export default memo(AnimatedEdge);
