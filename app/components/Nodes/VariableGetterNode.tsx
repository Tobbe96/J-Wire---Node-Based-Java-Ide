import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node, IsValidConnection } from '@xyflow/react';
import { getTypeColor } from '../../utils/theme';
import type { GetterNodeData } from '../../utils/nodeTypes';

const VariableGetterNode = ({ data }: NodeProps<Node<GetterNodeData>>) => {
  const typeColor = getTypeColor(data.type);

  return (
    <div style={{
      background: 'linear-gradient(180deg, #1c1c2e 0%, #151521 100%)',
      border: `1px solid ${typeColor}44`,
      borderRadius: '6px',
      padding: '6px 10px',
      minWidth: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: `inset 0 1px 0 ${typeColor}22, 0 4px 16px rgba(0,0,0,0.4), 0 0 12px ${typeColor}15`,
      transition: 'box-shadow 0.2s ease',
    }}>
      <span style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', marginRight: '8px' }}>
        {data.label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <span style={{ fontSize: '9px', color: typeColor, marginRight: '4px' }}>{data.type}</span>
        <Handle
          type="source"
          position={Position.Right}
          id="data-out"
          title={`Outputs ${data.type} value of ${data.label}`}
          isValidConnection={data.isValidConnection as IsValidConnection | undefined}
          style={{ background: typeColor, width: '8px', height: '8px', borderRadius: '2px', right: '-4px', border: `1px solid ${typeColor}66`, boxShadow: `0 0 6px ${typeColor}55` }}
        />
      </div>
    </div>
  );
};

export default memo(VariableGetterNode);