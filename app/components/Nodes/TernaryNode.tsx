import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, Node, useNodeConnections } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';

interface TernaryNodeData extends Record<string, unknown> {
  label: string;
  inlineTrue?: string;
  inlineFalse?: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

const ACCENT = '#e67e22';
const BOOL_COLOR = getTypeColor('boolean');

const inlineInputStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #555',
  color: '#aaa',
  fontSize: '10px',
  width: '55px',
  outline: 'none',
  padding: '1px 2px',
  marginLeft: 4,
};

const TernaryNode = ({ id, data, selected }: NodeProps<Node<TernaryNodeData>>) => {
  const trueConnections = useNodeConnections({ handleType: 'target', handleId: 'data-in-true' });
  const falseConnections = useNodeConnections({ handleType: 'target', handleId: 'data-in-false' });
  const hasTrue = trueConnections.length > 0;
  const hasFalse = falseConnections.length > 0;
  const updateNodeData = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;

  const onTrueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData?.(id, { inlineTrue: e.target.value });
  }, [id, updateNodeData]);

  const onFalseChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData?.(id, { inlineFalse: e.target.value });
  }, [id, updateNodeData]);

  return (
  <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '170px' }}>
    <div className="jwire-header-shimmer" style={nodeHeaderSolid(ACCENT)}>
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
          {!hasTrue && (
            <input
              value={(data.inlineTrue as string) || ''}
              onChange={onTrueChange}
              placeholder="value"
              style={inlineInputStyle}
              className="nodrag"
            />
          )}
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="data-in-false" style={{ background: '#888', width: '10px', height: '10px', left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#e74c3c' }}>False</span>
          {!hasFalse && (
            <input
              value={(data.inlineFalse as string) || ''}
              onChange={onFalseChange}
              placeholder="value"
              style={inlineInputStyle}
              className="nodrag"
            />
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Result</span>
        <Handle type="source" position={Position.Right} id="data-out" style={{ background: '#888', width: '10px', height: '10px', right: '-16px' }} />
      </div>
    </div>
  </div>
  );
};

export default memo(TernaryNode);
