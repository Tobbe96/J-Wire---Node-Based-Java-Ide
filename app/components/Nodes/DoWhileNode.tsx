import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';

const ACCENT = '#e67e22';
const CONDITION_COLOR = getTypeColor('int');

interface DoWhileNodeData extends Record<string, unknown> {
  label: string;
}

const DoWhileNode = ({ selected }: NodeProps<Node<DoWhileNodeData>>) => (
  <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '180px' }}>
    <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>
      DO-WHILE (Loop)
    </div>

    <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Exec</span>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="data-in" style={{ background: CONDITION_COLOR, width: '10px', height: '10px', borderRadius: '50%', left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#ccc' }}>Condition</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'flex-end', marginLeft: '20px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#f1c40f', fontWeight: 'bold', marginRight: '5px' }}>Loop Body</span>
          <Handle type="source" position={Position.Right} id="exec-body" style={{ ...execHandleStyle('right'), right: '-16px' }} />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#ccc', fontWeight: 'bold', marginRight: '5px' }}>Completed</span>
          <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-16px' }} />
        </div>
      </div>
    </div>
  </div>
);

export default memo(DoWhileNode);
