'use client';

import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { SuperConstructorCallNodeData } from '../../utils/nodeTypes';

function SuperConstructorCallNode({ id, data }: NodeProps) {
  const nodeData = data as SuperConstructorCallNodeData;
  const { updateNodeData, projectFiles } = nodeData;

  // Determine parent class name from the current file's extendsClass
  const currentFileId = (nodeData as Record<string, unknown>).__fileId as string | undefined;
  const currentFile = projectFiles?.find(f => f.id === currentFileId);
  const parentClassName = currentFile?.extendsClass || 'super';

  // Find parent class constructor info
  const parentFile = projectFiles?.find(f => f.className === parentClassName);
  const parentConstructor = parentFile?.constructors?.[0];
  const argCount = parentConstructor ? parentConstructor.parameters.length : (nodeData.argCount || 0);
  const parentParams = parentConstructor?.parameters || [];

  const addArg = useCallback(() => {
    if (updateNodeData) updateNodeData(id, { argCount: (nodeData.argCount || 0) + 1 });
  }, [id, nodeData.argCount, updateNodeData]);

  const removeArg = useCallback(() => {
    if (updateNodeData && (nodeData.argCount || 0) > 0) {
      updateNodeData(id, { argCount: (nodeData.argCount || 0) - 1 });
    }
  }, [id, nodeData.argCount, updateNodeData]);

  const displayArgCount = parentConstructor ? argCount : (nodeData.argCount || 0);

  return (
    <div style={{
      background: '#2c1a0e',
      border: '1.5px solid #d35400',
      borderRadius: 8,
      padding: '10px 14px',
      minWidth: 180,
      color: '#fff',
      fontSize: 13,
      position: 'relative',
    }}>
      {/* exec-in */}
      <Handle
        type="target"
        position={Position.Left}
        id="exec-in"
        style={{ top: '50%', background: '#d35400', width: 10, height: 10, borderRadius: 2 }}
      />

      <div style={{ fontWeight: 700, color: '#e67e22', marginBottom: 6, fontSize: 12 }}>
        ⬆ super({parentClassName !== 'super' ? parentClassName : ''})
      </div>

      {Array.from({ length: displayArgCount }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, position: 'relative' }}>
          <span style={{ fontSize: 11, color: '#aaa', marginRight: 6, minWidth: 60 }}>
            {parentParams[i] ? `${parentParams[i].type} ${parentParams[i].name}` : `arg ${i}`}
          </span>
          <Handle
            type="target"
            position={Position.Left}
            id={`arg-in-${i}`}
            style={{ left: -10, top: '50%', background: '#e67e22', width: 8, height: 8 }}
          />
        </div>
      ))}

      {!parentConstructor && (
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          <button
            onClick={addArg}
            style={{ flex: 1, background: '#3d1f0a', border: '1px solid #d35400', color: '#e67e22', borderRadius: 4, cursor: 'pointer', padding: '2px 0', fontSize: 12 }}
          >+ arg</button>
          {displayArgCount > 0 && (
            <button
              onClick={removeArg}
              style={{ flex: 1, background: '#3d1f0a', border: '1px solid #666', color: '#aaa', borderRadius: 4, cursor: 'pointer', padding: '2px 0', fontSize: 12 }}
            >- arg</button>
          )}
        </div>
      )}

      {/* exec-out */}
      <Handle
        type="source"
        position={Position.Right}
        id="exec-out"
        style={{ top: '50%', background: '#d35400', width: 10, height: 10, borderRadius: 2 }}
      />
    </div>
  );
}

export default memo(SuperConstructorCallNode);
