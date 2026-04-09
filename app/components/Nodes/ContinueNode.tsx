import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle } from '../../utils/nodeStyles';

const ContinueNode = ({ selected }: NodeProps<Node<Record<string, unknown>>>) => (
  <div style={{ ...nodeContainer('#f39c12', !!selected), minWidth: '130px' }}>
    <div style={nodeHeaderSolid('#f39c12')}>
      CONTINUE
    </div>
    <div style={{ padding: '10px' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
        <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Exec</span>
      </div>
    </div>
  </div>
);

export default memo(ContinueNode);
