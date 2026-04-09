import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { getTypeColor } from '../utils/theme';
import { nodeHeaderGradient, execHandleStyle, dataHandleStyle } from '../utils/nodeStyles';

const inputStyle = {
  background: '#000',
  border: '1px solid #444',
  color: '#fff',
  fontSize: '10px',
  padding: '4px',
  width: '90px',
  outline: 'none',
};

const JavaNode = ({ id, data }: { id: string; data: Record<string, unknown> }) => {
  const { updateNodeData } = useReactFlow();
  const color = getTypeColor(data.type as string);

  return (
    <div style={{
      background: '#1a1a1a',
      color: '#fff',
      borderRadius: '4px',
      border: '1px solid #000',
      minWidth: '200px',
      boxShadow: '0 10px 15px rgba(0,0,0,0.5)',
      fontFamily: 'Segoe UI, Tahoma, sans-serif',
    }}>
      <div style={{ position: 'relative', height: '10px' }}>
        <Handle type="target" position={Position.Top} id="exec-in" style={execHandleStyle('top')} />
      </div>

      <div style={nodeHeaderGradient(color)}>
        <span>SET {(data.type as string)?.toUpperCase()}</span>
        <span style={{ color }}>◆</span>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#888' }}>Variable Name</span>
          <input value={(data.label as string) || ''} onChange={(e) => updateNodeData(id, { label: e.target.value })} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#888' }}>Value</span>
          <input value={(data.value as string) || ''} onChange={(e) => updateNodeData(id, { value: e.target.value })} style={inputStyle} />
        </div>
      </div>

      <Handle type="target" position={Position.Left} id="data-in" style={dataHandleStyle(color, 'left')} />
      <Handle type="source" position={Position.Right} id="data-out" style={dataHandleStyle(color, 'right')} />

      <div style={{ position: 'relative', height: '10px' }}>
        <Handle type="source" position={Position.Bottom} id="exec-out" style={{ ...execHandleStyle('bottom'), width: '100px' }} />
      </div>
    </div>
  );
};

export default memo(JavaNode);