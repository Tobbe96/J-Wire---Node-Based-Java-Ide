import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, nodeInputStyle, smallButton } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { EnrichedData, StringFormatNodeData } from '../../utils/nodeTypes';

const ACCENT = '#ff00d4';
const STRING_COLOR = getTypeColor('String');

const handleStyle = (side: 'left' | 'right'): React.CSSProperties => ({
  background: STRING_COLOR,
  width: '10px',
  height: '10px',
  ...(side === 'left' ? { left: '-16px' } : { right: '-16px' }),
});

const StringFormatNode = ({ data, selected, id }: { data: EnrichedData<StringFormatNodeData>; selected: boolean; id: string }) => {
  const argCount = data.argCount ?? 0;

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '180px' }}>
      {/* HEADER */}
      <div className="devflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>
        String.format()
      </div>

      {/* BODY */}
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Format string input */}
        <input
          className="nodrag"
          value={data.formatString ?? ''}
          onChange={(e) => data.updateNodeData?.(id, { formatString: e.target.value })}
          placeholder='"%s = %d"'
          style={{ ...nodeInputStyle, width: '100%' }}
        />

        {/* Add / Remove arg buttons */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <button
            className="nodrag"
            style={smallButton(ACCENT)}
            onClick={() => {
              if (argCount < 4) data.updateNodeData?.(id, { argCount: argCount + 1 });
            }}
          >
            +
          </button>
          <button
            className="nodrag"
            style={smallButton(ACCENT)}
            onClick={() => {
              if (argCount > 0) data.updateNodeData?.(id, { argCount: argCount - 1 });
            }}
          >
            −
          </button>
        </div>

        {/* Arg handles + Result handle area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* LEFT: Arg inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {Array.from({ length: argCount }, (_, i) => (
              <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`data-in-arg-${i}`}
                  style={handleStyle('left')}
                />
                <span style={{ fontSize: '11px', color: '#ccc' }}>Arg {i}</span>
              </div>
            ))}
          </div>

          {/* RIGHT: Result output */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Result</span>
            <Handle
              type="source"
              position={Position.Right}
              id="data-out"
              style={handleStyle('right')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(StringFormatNode);
