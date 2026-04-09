import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, nodeSelectStyle } from '../../utils/nodeStyles';
import { getTypeColor, JAVA_TYPES } from '../../utils/theme';
import type { LiteralNodeData } from '../../utils/nodeTypes';

const ACCENT = '#2980b9';

const inputStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  fontSize: '11px',
  padding: '4px 8px',
  width: '100px',
  outline: 'none',
  borderRadius: '4px',
};

const LiteralNode = ({ id, data, selected }: NodeProps<Node<LiteralNodeData>>) => {
  const literalType = (data.literalType as string) || 'String';
  const outputColor = getTypeColor(literalType);

  const onTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const update = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;
    if (update) update(id, { literalType: e.target.value });
  }, [id, data.updateNodeData]);

  const onValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const update = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;
    if (update) update(id, { value: e.target.value });
  }, [id, data.updateNodeData]);

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '160px' }}>
      <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>
        📌 LITERAL
      </div>

      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <select value={literalType} onChange={onTypeChange} style={{ ...nodeSelectStyle, color: outputColor }}>
          {JAVA_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <input
            className="nodrag"
            value={(data.value as string) || ''}
            onChange={onValueChange}
            placeholder={literalType === 'String' ? 'text...' : '0'}
            style={{ ...inputStyle, color: outputColor }}
          />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: outputColor, fontWeight: 'bold', marginRight: '4px' }}>{literalType}</span>
            <Handle type="source" position={Position.Right} id="data-out" title={`Output (${literalType})`} style={{ background: outputColor, width: '10px', height: '10px', right: '-16px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(LiteralNode);
