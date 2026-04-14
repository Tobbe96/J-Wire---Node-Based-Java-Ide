import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { ArraysUtilNodeData } from '../../utils/nodeTypes';
import type { EnrichedData } from '../../utils/nodeTypes';

const ACCENT = '#3498db';
const INT_COLOR = getTypeColor('int');
const BOOL_COLOR = getTypeColor('boolean');
const STRING_COLOR = getTypeColor('String');
const ARRAY_COLOR = getTypeColor('int');

const handleStyle = (color: string, side: 'left' | 'right') => ({
  background: color,
  width: '10px',
  height: '10px',
  ...(side === 'left' ? { left: '-16px' } : { right: '-16px' }),
});

const OPERATIONS = ['sort', 'fill', 'copyOf', 'equals', 'toString'];

const labelStyle: React.CSSProperties = { fontSize: '11px', color: '#ccc' };
const boldLabel: React.CSSProperties = { fontSize: '11px', color: '#fff', fontWeight: 'bold' };
const selectStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: ACCENT,
  padding: '2px 5px',
  fontSize: '10px',
  outline: 'none',
  borderRadius: '3px',
};

const ArraysUtilNode = ({ data, selected, id }: NodeProps<Node<ArraysUtilNodeData>>) => {
  const op = data.operation || 'sort';
  const updateNodeData = (data as EnrichedData<ArraysUtilNodeData>).updateNodeData;

  const isExecOp = op === 'sort' || op === 'fill';

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '170px' }}>
      <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>
        ARRAYS: {op.toUpperCase()}
      </div>
      <div style={{ padding: '4px 10px 2px' }}>
        <select
          className="nodrag"
          value={op}
          onChange={(e) => updateNodeData?.(id, { operation: e.target.value })}
          style={selectStyle}
        >
          {OPERATIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {isExecOp && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
              <span style={boldLabel}>Exec</span>
            </div>
          )}
          {(op === 'sort' || op === 'fill' || op === 'copyOf') && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-array" style={handleStyle(ARRAY_COLOR, 'left')} />
              <span style={labelStyle}>Array</span>
            </div>
          )}
          {op === 'fill' && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-value" style={handleStyle(INT_COLOR, 'left')} />
              <span style={labelStyle}>Value</span>
            </div>
          )}
          {op === 'copyOf' && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-length" style={handleStyle(INT_COLOR, 'left')} />
              <span style={labelStyle}>Length</span>
            </div>
          )}
          {op === 'equals' && (<>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-a" style={handleStyle(ARRAY_COLOR, 'left')} />
              <span style={labelStyle}>Array A</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-b" style={handleStyle(ARRAY_COLOR, 'left')} />
              <span style={labelStyle}>Array B</span>
            </div>
          </>)}
          {op === 'toString' && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in" style={handleStyle(ARRAY_COLOR, 'left')} />
              <span style={labelStyle}>Array</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end', gap: '15px' }}>
          {isExecOp && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ ...boldLabel, marginRight: '5px' }}>Out</span>
              <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-16px' }} />
            </div>
          )}
          {!isExecOp && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ ...boldLabel, marginRight: '5px' }}>
                {op === 'equals' ? 'boolean' : op === 'toString' ? 'String' : 'array'}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id="data-out"
                style={handleStyle(op === 'equals' ? BOOL_COLOR : op === 'toString' ? STRING_COLOR : ARRAY_COLOR, 'right')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ArraysUtilNode);
