import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, Node, useNodeConnections } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, nodeSelectStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { BranchNodeData } from '../../utils/nodeTypes';

const ACCENT = '#e67e22';
const CONDITION_COLOR = getTypeColor('int');

const BranchNode = ({ id, data, selected }: NodeProps<Node<BranchNodeData>>) => {
  const dataInConnections = useNodeConnections({ handleType: 'target', handleId: 'data-in' });
  const isConnected = dataInConnections.length > 0;

  const onInlineChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const update = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;
    if (update) update(id, { inlineValue: e.target.value });
  }, [id, data.updateNodeData]);

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '160px' }}>
      <div className="jwire-header-shimmer" style={nodeHeaderSolid(ACCENT)}>
        BRANCH (If / Else)
      </div>

      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
            <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Exec</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Handle type="target" position={Position.Left} id="data-in" style={{ background: CONDITION_COLOR, width: '10px', height: '10px', borderRadius: '50%', left: '-16px' }} />
            {isConnected ? (
              <span style={{ fontSize: '11px', color: '#ccc' }}>Condition</span>
            ) : (
              <select
                className="nodrag"
                value={(data.inlineValue as string) ?? 'true'}
                onChange={onInlineChange}
                style={{ ...nodeSelectStyle, fontSize: '10px', padding: '2px 4px', color: getTypeColor('boolean') }}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'flex-end' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#2ecc71', fontWeight: 'bold', marginRight: '5px' }}>True</span>
            <Handle type="source" position={Position.Right} id="exec-out-true" style={{ ...execHandleStyle('right'), right: '-16px' }} />
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#e74c3c', fontWeight: 'bold', marginRight: '5px' }}>False</span>
            <Handle type="source" position={Position.Right} id="exec-out-false" style={{ ...execHandleStyle('right'), right: '-16px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(BranchNode);