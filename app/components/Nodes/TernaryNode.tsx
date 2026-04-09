import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';

interface TernaryNodeData extends Record<string, unknown> {
  label: string;
}

const ACCENT = '#e67e22';
const BOOL_COLOR = getTypeColor('boolean');

const TernaryNode = ({ selected }: NodeProps<Node<TernaryNodeData>>) => (
  <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '170px' }}>
    <div style={nodeHeaderSolid(ACCENT)}>
      TERNARY ( ? : )
    </div>

    <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="data-in-condition" style={{ background: BOOL_COLOR, width: '10px', height: '10px', left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#ccc' }}>Condition</span>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="data-in-true" style={{ background: '#888', width: '10px', height: '10px', left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#2ecc71' }}>True</span>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="data-in-false" style={{ background: '#888', width: '10px', height: '10px', left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#e74c3c' }}>False</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Result</span>
        <Handle type="source" position={Position.Right} id="data-out" style={{ background: '#888', width: '10px', height: '10px', right: '-16px' }} />
      </div>
    </div>
  </div>
);

export default memo(TernaryNode);
