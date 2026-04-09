import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node, IsValidConnection } from '@xyflow/react';
import { getTypeColor } from '../../utils/theme';
import type { GetterNodeData } from '../../utils/nodeTypes';

const VariableGetterNode = ({ data }: NodeProps<Node<GetterNodeData>>) => {
  const typeColor = getTypeColor(data.type);

  return (
    <div style={{
      background: '#1e1e1e',
      border: `1px solid ${typeColor}`,
      borderRadius: '4px',
      padding: '4px 8px',
      minWidth: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
    }}>
      <span style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', marginRight: '8px' }}>
        {data.label}
      </span>
      <Handle
        type="source"
        position={Position.Right}
        id="data-out"
        isValidConnection={data.isValidConnection as IsValidConnection | undefined}
        style={{ background: typeColor, width: '8px', height: '8px', borderRadius: '2px', right: '-4px' }}
      />
    </div>
  );
};

export default memo(VariableGetterNode);