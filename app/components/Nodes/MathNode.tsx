import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, Node, useNodeConnections } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, inlineInputStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { MathNodeData } from '../../utils/nodeTypes';

const ACCENT = '#3498db';
const INPUT_COLOR = getTypeColor('int');

const MathNode = ({ id, data, selected }: NodeProps<Node<MathNodeData>>) => {
  const aConnections = useNodeConnections({ handleType: 'target', handleId: 'data-in-a' });
  const bConnections = useNodeConnections({ handleType: 'target', handleId: 'data-in-b' });
  const isAConnected = aConnections.length > 0;
  const isBConnected = bConnections.length > 0;

  const onInlineAChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const update = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;
    if (update) update(id, { inlineA: e.target.value });
  }, [id, data.updateNodeData]);

  const onInlineBChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const update = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;
    if (update) update(id, { inlineB: e.target.value });
  }, [id, data.updateNodeData]);

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '150px' }}>
      <div className="jflow-header-shimmer" style={nodeHeaderSolid('#2980b9')}>
        {data.label} ( {data.symbol} )
      </div>

      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Handle type="target" position={Position.Left} id="data-in-a" style={{ background: INPUT_COLOR, width: '10px', height: '10px', left: '-16px' }} />
            {isAConnected ? (
              <span style={{ fontSize: '11px', color: '#ccc' }}>A</span>
            ) : (
              <input
                className="nodrag"
                value={(data.inlineA as string) ?? ''}
                onChange={onInlineAChange}
                placeholder="A"
                style={{ ...inlineInputStyle, width: '50px', color: INPUT_COLOR }}
              />
            )}
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Handle type="target" position={Position.Left} id="data-in-b" style={{ background: INPUT_COLOR, width: '10px', height: '10px', left: '-16px' }} />
            {isBConnected ? (
              <span style={{ fontSize: '11px', color: '#ccc' }}>B</span>
            ) : (
              <input
                className="nodrag"
                value={(data.inlineB as string) ?? ''}
                onChange={onInlineBChange}
                placeholder="B"
                style={{ ...inlineInputStyle, width: '50px', color: INPUT_COLOR }}
              />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Result</span>
          <Handle type="source" position={Position.Right} id="data-out" style={{ background: INPUT_COLOR, width: '10px', height: '10px', right: '-16px' }} />
        </div>
      </div>
    </div>
  );
};

export default memo(MathNode);