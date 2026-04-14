import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { AssertNodeData } from '../../utils/nodeTypes';

const ACCENT = '#f39c12';
const BOOL_COLOR = getTypeColor('boolean');
const STRING_COLOR = getTypeColor('String');

const handleStyle = (color: string, side: 'left' | 'right') => ({
  background: color,
  width: '10px',
  height: '10px',
  ...(side === 'left' ? { left: '-16px' } : { right: '-16px' }),
});

const AssertNode = ({ selected }: NodeProps<Node<AssertNodeData>>) => {
  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '170px' }}>
      <div className="devflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>
        ASSERT
      </div>
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
            <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Exec</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Handle type="target" position={Position.Left} id="data-in-condition" style={handleStyle(BOOL_COLOR, 'left')} />
            <span style={{ fontSize: '11px', color: '#ccc' }}>Condition</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Handle type="target" position={Position.Left} id="data-in-message" style={handleStyle(STRING_COLOR, 'left')} />
            <span style={{ fontSize: '11px', color: '#ccc' }}>Message</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold', marginRight: '5px' }}>Out</span>
            <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-16px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(AssertNode);
