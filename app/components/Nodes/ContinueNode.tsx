import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle } from '../../utils/nodeStyles';

interface ContinueNodeData extends Record<string, unknown> {
  targetLabel?: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

const ContinueNode = ({ id, data, selected }: NodeProps<Node<ContinueNodeData>>) => {
  const targetLabel = (data.targetLabel as string) || '';
  const updateNodeData = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData?.(id, { targetLabel: e.target.value });
  }, [id, updateNodeData]);

  return (
  <div style={{ ...nodeContainer('#f39c12', !!selected), minWidth: '140px' }}>
    <div className="jwire-header-shimmer" style={nodeHeaderSolid('#f39c12')}>
      CONTINUE
    </div>
    <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
        <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Exec</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: '10px', color: '#888' }}>label:</span>
        <input
          value={targetLabel}
          onChange={onChange}
          placeholder="optional"
          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #555', color: '#f1c40f', fontSize: '10px', width: '70px', outline: 'none', padding: '1px 2px' }}
          className="nodrag"
        />
      </div>
    </div>
  </div>
  );
};

export default memo(ContinueNode);
