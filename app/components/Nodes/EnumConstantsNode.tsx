'use client';

import React, { memo, useCallback } from 'react';
import { NodeProps } from '@xyflow/react';
import { EnumConstantsNodeData } from '../../utils/nodeTypes';

function EnumConstantsNode({ id, data }: NodeProps) {
  const nodeData = data as EnumConstantsNodeData;
  const { updateNodeData } = nodeData;
  const constants: string[] = nodeData.constants || [];

  const addConstant = useCallback(() => {
    const name = `CONSTANT_${constants.length + 1}`;
    if (updateNodeData) updateNodeData(id, { constants: [...constants, name] });
  }, [id, constants, updateNodeData]);

  const removeConstant = useCallback((index: number) => {
    const updated = constants.filter((_, i) => i !== index);
    if (updateNodeData) updateNodeData(id, { constants: updated });
  }, [id, constants, updateNodeData]);

  const renameConstant = useCallback((index: number, value: string) => {
    const updated = constants.map((c, i) => i === index ? value.toUpperCase().replace(/\s+/g, '_') : c);
    if (updateNodeData) updateNodeData(id, { constants: updated });
  }, [id, constants, updateNodeData]);

  return (
    <div style={{
      background: '#0e2a1a',
      border: '1.5px solid #27ae60',
      borderRadius: 8,
      padding: '10px 14px',
      minWidth: 200,
      color: '#fff',
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 700, color: '#2ecc71', marginBottom: 8, fontSize: 12 }}>
        📋 Enum Constants
      </div>

      {constants.length === 0 && (
        <div style={{ color: '#666', fontSize: 11, marginBottom: 6 }}>No constants yet</div>
      )}

      {constants.map((c, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <input
            value={c}
            onChange={e => renameConstant(i, e.target.value)}
            style={{
              flex: 1,
              background: '#1a3d2a',
              border: '1px solid #27ae60',
              color: '#2ecc71',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 12,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
            }}
          />
          <button
            onClick={() => removeConstant(i)}
            style={{ background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 14, padding: '0 2px' }}
          >×</button>
        </div>
      ))}

      <button
        onClick={addConstant}
        style={{
          width: '100%',
          background: '#1a3d2a',
          border: '1px solid #27ae60',
          color: '#2ecc71',
          borderRadius: 4,
          cursor: 'pointer',
          padding: '3px 0',
          fontSize: 12,
          marginTop: 2,
        }}
      >+ Add Constant</button>
    </div>
  );
}

export default memo(EnumConstantsNode);
