import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderGradient, execHandleStyle, execFooter, execFooterLabel } from '../../utils/nodeStyles';
import type { MainNodeData } from '../../utils/nodeTypes';

const ACCENT = '#2ecc71';

const MainNode = ({ selected }: NodeProps<Node<MainNodeData>>) => (
  <div style={nodeContainer(ACCENT, !!selected)}>
    <div className="devflow-header-shimmer" style={{ ...nodeHeaderGradient(ACCENT), padding: '10px', fontSize: '13px' }}>
      ▶ ENTRY POINT: Main()
    </div>

    <div style={{ padding: '15px', fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
      Execution begins here.
    </div>

    <div style={execFooter}>
      <span style={execFooterLabel}>Start</span>
      <Handle type="source" position={Position.Right} id="exec-out" style={execHandleStyle('right')} />
    </div>
  </div>
);

export default memo(MainNode);