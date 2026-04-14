import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { InstanceOfNodeData } from '../../utils/nodeTypes';
import type { EnrichedData } from '../../utils/nodeTypes';

const ACCENT = '#e74c3c';
const BOOL_COLOR = getTypeColor('boolean');
const ANY_COLOR = '#888888';

const handleStyle = (color: string, side: 'left' | 'right') => ({
  background: color,
  width: '10px',
  height: '10px',
  ...(side === 'left' ? { left: '-16px' } : { right: '-16px' }),
});

const inputStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#ccc',
  padding: '2px 5px',
  fontSize: '10px',
  outline: 'none',
  borderRadius: '3px',
  width: '90px',
};

const InstanceOfNode = ({ data, selected, id }: NodeProps<Node<InstanceOfNodeData>>) => {
  const typeName = (data.typeName as string) || 'String';
  const updateNodeData = (data as EnrichedData<InstanceOfNodeData>).updateNodeData;

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '170px' }}>
      <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>
        INSTANCEOF
      </div>
      <div style={{ padding: '4px 10px 2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '10px', color: '#888' }}>Type:</span>
        <input
          className="nodrag"
          value={typeName}
          onChange={(e) => updateNodeData?.(id, { typeName: e.target.value })}
          style={inputStyle}
          placeholder="String"
        />
      </div>
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="data-in" style={handleStyle(ANY_COLOR, 'left')} />
          <span style={{ fontSize: '11px', color: '#ccc' }}>Object</span>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>boolean</span>
          <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(BOOL_COLOR, 'right')} />
        </div>
      </div>
    </div>
  );
};

export default memo(InstanceOfNode);
