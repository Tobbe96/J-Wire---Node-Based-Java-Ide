import React, { memo, useCallback } from 'react';
import { NodeProps, Node, NodeResizer } from '@xyflow/react';

interface GroupNodeData extends Record<string, unknown> {
  label?: string;
  color?: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

const GroupNode = ({ id, data, selected }: NodeProps<Node<GroupNodeData>>) => {
  const label = (data.label as string) || 'Group';
  const color = (data.color as string) || '#6366f1';
  const updateNodeData = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;

  const onLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData?.(id, { label: e.target.value });
  }, [id, updateNodeData]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: `linear-gradient(180deg, ${color}08 0%, ${color}04 100%)`,
      border: `1px dashed ${selected ? '#fff' : `${color}66`}`,
      borderRadius: '10px',
      position: 'relative',
      boxShadow: selected ? `0 0 20px ${color}33` : `0 0 10px ${color}11`,
      transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
    }}>
      <NodeResizer
        color={color}
        isVisible={!!selected}
        minWidth={200}
        minHeight={150}
      />
      <div style={{
        position: 'absolute',
        top: '-28px',
        left: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 8px ${color}88`,
        }} />
        <input
          value={label}
          onChange={onLabelChange}
          style={{
            background: 'transparent',
            border: 'none',
            color,
            fontSize: '12px',
            fontWeight: 'bold',
            outline: 'none',
            padding: '2px 4px',
            textShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
};

export default memo(GroupNode);
