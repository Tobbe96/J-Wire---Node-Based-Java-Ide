import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { StringOpNodeData } from '../../utils/nodeTypes';

const ACCENT = '#e67e22';
const STRING_COLOR = getTypeColor('String');
const INT_COLOR = getTypeColor('int');

const handleStyle = (color: string, side: 'left' | 'right') => ({
  background: color,
  width: '10px',
  height: '10px',
  ...(side === 'left' ? { left: '-16px' } : { right: '-16px' }),
});

const StringOpNode = ({ data, selected }: NodeProps<Node<StringOpNodeData>>) => {
  const op = data.operation as string;

  const renderInputs = () => {
    switch (op) {
      case 'concat':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-a" style={handleStyle(STRING_COLOR, 'left')} />
              <span style={{ fontSize: '11px', color: '#ccc' }}>A</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-b" style={handleStyle(STRING_COLOR, 'left')} />
              <span style={{ fontSize: '11px', color: '#ccc' }}>B</span>
            </div>
          </div>
        );
      case 'length':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in" style={handleStyle(STRING_COLOR, 'left')} />
              <span style={{ fontSize: '11px', color: '#ccc' }}>String</span>
            </div>
          </div>
        );
      case 'substring':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in" style={handleStyle(STRING_COLOR, 'left')} />
              <span style={{ fontSize: '11px', color: '#ccc' }}>String</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-start" style={handleStyle(INT_COLOR, 'left')} />
              <span style={{ fontSize: '11px', color: '#ccc' }}>Start</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-end" style={handleStyle(INT_COLOR, 'left')} />
              <span style={{ fontSize: '11px', color: '#ccc' }}>End</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const outputColor = op === 'length' ? INT_COLOR : STRING_COLOR;
  const headerLabel = `STRING: ${op.charAt(0).toUpperCase() + op.slice(1)}`;

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '150px' }}>
      <div style={nodeHeaderSolid(ACCENT)}>
        {headerLabel}
      </div>

      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        {renderInputs()}

        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Result</span>
          <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(outputColor, 'right')} />
        </div>
      </div>
    </div>
  );
};

export default memo(StringOpNode);
