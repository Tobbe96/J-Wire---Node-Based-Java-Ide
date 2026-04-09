import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { ArrayNodeData } from '../../utils/nodeTypes';

const ACCENT = '#1abc9c';
const INT_COLOR = getTypeColor('int');
const STRING_COLOR = getTypeColor('String');

const handleStyle = (color: string, side: 'left' | 'right') => ({
  background: color,
  width: '10px',
  height: '10px',
  ...(side === 'left' ? { left: '-16px' } : { right: '-16px' }),
});

const inputStyle: React.CSSProperties = {
  background: '#000',
  border: '1px solid #444',
  color: '#fff',
  padding: '4px 6px',
  fontSize: '11px',
  outline: 'none',
  width: '100%',
};

const selectStyle: React.CSSProperties = {
  background: '#000',
  border: '1px solid #444',
  color: ACCENT,
  padding: '4px',
  fontSize: '11px',
  outline: 'none',
  cursor: 'pointer',
};

const ArrayOpNode = ({ id, data, selected }: NodeProps<Node<ArrayNodeData>>) => {
  const op = data.operation as string;
  const updateNodeData = data.updateNodeData as ((id: string, data: Record<string, unknown>) => void) | undefined;

  const onValuesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData?.(id, { values: e.target.value });
  }, [id, updateNodeData]);

  const onTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData?.(id, { arrayType: e.target.value });
  }, [id, updateNodeData]);

  const headerLabel = `ARRAY: ${op.charAt(0).toUpperCase() + op.slice(1)}`;

  if (op === 'literal') {
    const arrayType = (data.arrayType as string) || 'int';
    const outputColor = arrayType === 'String' ? STRING_COLOR : INT_COLOR;

    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '180px' }}>
        <div style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: '#aaa', whiteSpace: 'nowrap' }}>Type</span>
            <select value={arrayType} onChange={onTypeChange} style={selectStyle}>
              <option value="int">int</option>
              <option value="String">String</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: '#aaa', whiteSpace: 'nowrap' }}>Values</span>
            <input
              value={(data.values as string) ?? ''}
              onChange={onValuesChange}
              placeholder="1,2,3"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
            <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>{arrayType}[]</span>
            <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(outputColor, 'right')} />
          </div>
        </div>
      </div>
    );
  }

  if (op === 'access') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '150px' }}>
        <div style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-array" style={handleStyle(ACCENT, 'left')} />
              <span style={{ fontSize: '11px', color: '#ccc' }}>Array</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-index" style={handleStyle(INT_COLOR, 'left')} />
              <span style={{ fontSize: '11px', color: '#ccc' }}>Index</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Result</span>
            <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(ACCENT, 'right')} />
          </div>
        </div>
      </div>
    );
  }

  // length
  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '150px' }}>
      <div style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Handle type="target" position={Position.Left} id="data-in" style={handleStyle(ACCENT, 'left')} />
            <span style={{ fontSize: '11px', color: '#ccc' }}>Array</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>int</span>
          <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(INT_COLOR, 'right')} />
        </div>
      </div>
    </div>
  );
};

export default memo(ArrayOpNode);
