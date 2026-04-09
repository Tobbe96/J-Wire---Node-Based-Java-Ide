import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderGradient, execHandleStyle, dataHandleStyle } from '../../utils/nodeStyles';
import type { ReturnNodeData } from '../../utils/nodeTypes';

const ACCENT = '#9b59b6';

const ReturnNode = ({ selected }: NodeProps<Node<ReturnNodeData>>) => (
  <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '140px' }}>
    <Handle type="target" position={Position.Top} id="exec-in" style={execHandleStyle('top')} />

    <div style={nodeHeaderGradient(ACCENT)}>
      <span>RETURN</span>
      <span style={{ color: ACCENT }}>⮐</span>
    </div>

    <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '10px', color: '#888' }}>Value</span>
    </div>

    <Handle type="target" position={Position.Left} id="data-in" style={dataHandleStyle(ACCENT, 'left')} />
  </div>
);

export default memo(ReturnNode);