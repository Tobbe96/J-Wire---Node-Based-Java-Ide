import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderGradient, execHandleStyle, dataHandleStyle } from '../../utils/nodeStyles';
import type { ReturnNodeData } from '../../utils/nodeTypes';

const ACCENT = '#9b59b6';

const ReturnNode = ({ selected }: NodeProps<Node<ReturnNodeData>>) => (
  <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '140px' }}>
    <div className="devflow-header-shimmer" style={nodeHeaderGradient(ACCENT)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
        <Handle type="target" position={Position.Left} id="exec-in" style={execHandleStyle('left')} />
        <span>RETURN</span>
      </div>
      <span style={{ color: ACCENT }}>⮐</span>
    </div>

    <div style={{ padding: '10px', display: 'flex', alignItems: 'center', position: 'relative' }}>
      <Handle type="target" position={Position.Left} id="data-in" style={{ ...dataHandleStyle(ACCENT, 'left'), left: '-16px' }} />
      <span style={{ fontSize: '10px', color: '#888' }}>Value</span>
    </div>
  </div>
);

export default memo(ReturnNode);