import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';

const ACCENT = '#e67e22';
const CONDITION_COLOR = getTypeColor('int');

const labelInputStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #555',
  color: '#f1c40f',
  fontSize: '10px',
  width: '80px',
  outline: 'none',
  padding: '1px 2px',
};

interface DoWhileNodeData extends Record<string, unknown> {
  label: string;
  loopLabel?: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

const DoWhileNode = ({ id, data, selected }: NodeProps<Node<DoWhileNodeData>>) => {
  const loopLabel = (data.loopLabel as string) || '';
  const updateNodeData = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;

  const onLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData?.(id, { loopLabel: e.target.value });
  }, [id, updateNodeData]);

  return (
  <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '180px' }}>
    <div className="jwire-header-shimmer" style={nodeHeaderSolid(ACCENT)}>
      DO-WHILE (Loop)
    </div>

    <div style={{ padding: '4px 10px 2px', display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: '10px', color: '#888' }}>label:</span>
      <input
        value={loopLabel}
        onChange={onLabelChange}
        placeholder="optional"
        style={labelInputStyle}
        className="nodrag"
      />
    </div>

    <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Exec</span>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="data-in" style={{ background: CONDITION_COLOR, width: '10px', height: '10px', borderRadius: '50%', left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#ccc' }}>Condition</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'flex-end', marginLeft: '20px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#f1c40f', fontWeight: 'bold', marginRight: '5px' }}>Loop Body</span>
          <Handle type="source" position={Position.Right} id="exec-body" style={{ ...execHandleStyle('right'), right: '-16px' }} />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#ccc', fontWeight: 'bold', marginRight: '5px' }}>Completed</span>
          <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-16px' }} />
        </div>
      </div>
    </div>
  </div>
  );
};

export default memo(DoWhileNode);
