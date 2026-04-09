import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { execHandleStyle, dataHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { PrintNodeData } from '../../utils/nodeTypes';

const PRINT_COLOR = getTypeColor('String');

const PrintNode = (_props: NodeProps<Node<PrintNodeData>>) => (
  <div style={{
    background: '#1a1a1a',
    color: '#fff',
    borderRadius: '4px',
    border: '1px solid #000',
    minWidth: '160px',
    boxShadow: '0 10px 15px rgba(0,0,0,0.5)',
  }}>
    <Handle type="target" position={Position.Top} id="exec-in" style={execHandleStyle('top')} />

    <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Handle type="target" position={Position.Left} id="data-in" style={{ ...dataHandleStyle(PRINT_COLOR, 'left'), left: '-16px' }} />
        <span style={{ fontSize: '10px', color: PRINT_COLOR }}>Print</span>
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: PRINT_COLOR }}>Value</span>
        <Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(PRINT_COLOR, 'right'), right: '-16px' }} />
      </div>
    </div>

    <Handle type="source" position={Position.Bottom} id="exec-out" style={execHandleStyle('bottom')} />
  </div>
);

export default memo(PrintNode);