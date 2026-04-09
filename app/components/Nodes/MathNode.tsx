import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { MathNodeData } from '../../utils/nodeTypes';

const ACCENT = '#3498db';
const INPUT_COLOR = getTypeColor('int');

const MathNode = ({ data, selected }: NodeProps<Node<MathNodeData>>) => (
  <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '150px' }}>
    <div style={nodeHeaderSolid('#2980b9')}>
      {data.label} ( {data.symbol} )
    </div>

    <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="data-in-a" style={{ background: INPUT_COLOR, width: '10px', height: '10px', left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#ccc' }}>A</span>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="data-in-b" style={{ background: INPUT_COLOR, width: '10px', height: '10px', left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#ccc' }}>B</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Result</span>
        <Handle type="source" position={Position.Right} id="data-out" style={{ background: INPUT_COLOR, width: '10px', height: '10px', right: '-16px' }} />
      </div>
    </div>
  </div>
);

export default memo(MathNode);