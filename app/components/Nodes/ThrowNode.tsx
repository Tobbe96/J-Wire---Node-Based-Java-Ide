import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, Node, useNodeConnections } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, inlineInputStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { ThrowNodeData } from '../../utils/nodeTypes';

const ACCENT = '#e74c3c';
const STRING_COLOR = getTypeColor('String');

const ThrowNode = ({ id, data, selected }: NodeProps<Node<ThrowNodeData>>) => {
  const dataInConnections = useNodeConnections({ handleType: 'target', handleId: 'data-in' });
  const isConnected = dataInConnections.length > 0;

  const onInlineChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const update = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;
    if (update) update(id, { inlineValue: e.target.value });
  }, [id, data.updateNodeData]);

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '150px' }}>
      <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>
        THROW
      </div>

      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Exec</span>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Handle type="target" position={Position.Left} id="data-in" style={{ background: STRING_COLOR, width: '10px', height: '10px', borderRadius: '50%', left: '-16px' }} />
          {isConnected ? (
            <span style={{ fontSize: '11px', color: '#ccc' }}>Message</span>
          ) : (
            <input
              className="nodrag"
              value={(data.inlineValue as string) ?? ''}
              onChange={onInlineChange}
              placeholder="Error message..."
              style={{ ...inlineInputStyle, color: STRING_COLOR }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ThrowNode);
