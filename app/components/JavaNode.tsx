import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { getTypeColor } from '../utils/theme';
import { nodeContainer, nodeHeaderGradient, execHandleStyle, dataHandleStyle } from '../utils/nodeStyles';

const inputStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  fontSize: '11px',
  padding: '4px 8px',
  width: '90px',
  outline: 'none',
  borderRadius: '4px',
};

const sanitizeJavaIdentifier = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9_$]/g, '');
};

const JavaNode = ({ id, data, selected }: { id: string; data: Record<string, unknown>; selected?: boolean }) => {
  const { updateNodeData } = useReactFlow();
  const color = getTypeColor(data.type as string);
  const typeName = (data.type as string)?.toUpperCase() || 'VAR';

  return (
    <div style={nodeContainer(color, !!selected)}>
      <div className="jflow-header-shimmer" style={nodeHeaderGradient(color)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
          <Handle type="target" position={Position.Left} id="exec-in" title="Execution in" style={execHandleStyle('left')} />
          <span>SET {typeName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
          <span style={{ color }}>◆</span>
          <Handle type="source" position={Position.Right} id="exec-out" title="Execution out" style={execHandleStyle('right')} />
        </div>
      </div>

      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#666' }}>Name</span>
          <input className="nodrag" value={(data.label as string) || ''} onChange={(e) => updateNodeData(id, { label: sanitizeJavaIdentifier(e.target.value) })} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#666' }}>Value</span>
          <input className="nodrag" value={(data.value as string) || ''} onChange={(e) => updateNodeData(id, { value: e.target.value })} style={inputStyle} />
        </div>
      </div>

      <div style={{ padding: '0 10px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="data-in" title={`Set ${data.type as string} value`} style={{ ...dataHandleStyle(color, 'left'), left: '-16px' }} />
          <span style={{ fontSize: '10px', color: '#888' }}>Set</span>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color, fontWeight: 'bold' }}>{data.type as string}</span>
          <Handle type="source" position={Position.Right} id="data-out" title={`Output ${data.type as string}`} style={{ ...dataHandleStyle(color, 'right'), right: '-16px' }} />
        </div>
      </div>
    </div>
  );
};

export default memo(JavaNode);