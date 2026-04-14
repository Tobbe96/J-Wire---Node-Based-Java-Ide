import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, nodeSelectStyle } from '../../utils/nodeStyles';
import { getTypeColor, JAVA_TYPES } from '../../utils/theme';

interface CastNodeData extends Record<string, unknown> {
  label: string;
  targetType: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

const ACCENT = '#8e44ad';

const CastNode = ({ id, data, selected }: NodeProps<Node<CastNodeData>>) => {
  const targetType = (data.targetType as string) || 'String';
  const outputColor = getTypeColor(targetType);

  const onTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const update = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;
    if (update) update(id, { targetType: e.target.value });
  }, [id, data.updateNodeData]);

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '160px' }}>
      <div className="jwire-header-shimmer" style={nodeHeaderSolid(ACCENT)}>
        CAST (Type Convert)
      </div>

      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Handle type="target" position={Position.Left} id="data-in" style={{ background: '#888', width: '10px', height: '10px', left: '-16px' }} />
            <span style={{ fontSize: '11px', color: '#ccc' }}>Input</span>
          </div>
          <select value={targetType} onChange={onTypeChange} style={{ ...nodeSelectStyle, color: outputColor }}>
            {JAVA_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Result</span>
          <Handle type="source" position={Position.Right} id="data-out" style={{ background: outputColor, width: '10px', height: '10px', right: '-16px' }} />
        </div>
      </div>
    </div>
  );
};

export default memo(CastNode);
