import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, dataHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { TryCatchFinallyNodeData } from '../../utils/nodeTypes';

const ACCENT = '#9b59b6';

const TryCatchFinallyNode = ({ selected }: NodeProps<Node<TryCatchFinallyNodeData>>) => (
  <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '200px' }}>
    <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>
      TRY / CATCH / FINALLY
    </div>

    <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
      {/* Left: Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Exec</span>
        </div>
      </div>

      {/* Right: Outputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'flex-end' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#2ecc71', fontWeight: 'bold', marginRight: '5px' }}>Try</span>
          <Handle type="source" position={Position.Right} id="exec-try" style={{ ...execHandleStyle('right'), right: '-16px' }} />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#e74c3c', fontWeight: 'bold', marginRight: '5px' }}>Catch</span>
          <Handle type="source" position={Position.Right} id="exec-catch" style={{ ...execHandleStyle('right'), right: '-16px' }} />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#f39c12', fontWeight: 'bold', marginRight: '5px' }}>Finally</span>
          <Handle type="source" position={Position.Right} id="exec-finally" style={{ ...execHandleStyle('right'), right: '-16px' }} />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#ccc', fontWeight: 'bold', marginRight: '5px' }}>Done</span>
          <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-16px' }} />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: getTypeColor('String'), marginRight: '5px' }}>Exception</span>
          <Handle type="source" position={Position.Right} id="data-out-exception" style={{ ...dataHandleStyle(getTypeColor('String'), 'right'), right: '-16px' }} />
        </div>
      </div>
    </div>
  </div>
);

export default memo(TryCatchFinallyNode);
