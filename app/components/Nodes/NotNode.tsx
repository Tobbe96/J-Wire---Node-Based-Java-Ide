import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';

const ACCENT = '#3498db';
const BOOL_COLOR = getTypeColor('boolean');

interface NotNodeData extends Record<string, unknown> {
  label: string;
  type: string;
}

const NotNode = ({ selected }: NodeProps<Node<NotNodeData>>) => (
  <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '120px' }}>
    <div style={nodeHeaderSolid('#2980b9')}>
      NOT ( ! )
    </div>

    <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Handle type="target" position={Position.Left} id="data-in" style={{ background: BOOL_COLOR, width: '10px', height: '10px', left: '-16px' }} />
        <span style={{ fontSize: '11px', color: '#ccc' }}>Input</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Result</span>
        <Handle type="source" position={Position.Right} id="data-out" style={{ background: BOOL_COLOR, width: '10px', height: '10px', right: '-16px' }} />
      </div>
    </div>
  </div>
);

export default memo(NotNode);
