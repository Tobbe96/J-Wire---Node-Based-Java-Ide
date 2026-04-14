import React, { memo, useCallback } from 'react';
import { Handle, Position, useNodeConnections } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, inlineInputStyle } from '../../utils/nodeStyles';
import type { EnrichedData, SetVarNodeData } from '../../utils/nodeTypes';

const SetVariableNode = ({ data, selected, id }: { data: EnrichedData<SetVarNodeData>; selected: boolean; id: string }) => {
  const borderColor = '#f1c40f';
  const { updateNodeData } = data;
  const dataInConnections = useNodeConnections({ handleType: 'target', handleId: 'data-in' });
  const isConnected = dataInConnections.length > 0;

  const onInlineChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData?.(id, { inlineValue: e.target.value });
  }, [id, updateNodeData]);

  return (
    <div style={nodeContainer(borderColor, selected)}>
      <div className="jwire-header-shimmer" style={nodeHeaderSolid(borderColor)}>SET VARIABLE ( = )</div>

      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative' }}>
            <Handle type="target" position={Position.Left} id="exec-in" style={execHandleStyle('left')} />
            <span style={{ fontSize: '10px' }}>In</span>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: '10px' }}>Out</span>
            <Handle type="source" position={Position.Right} id="exec-out" style={execHandleStyle('right')} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '9px', color: '#888' }}>Target Variable Name:</span>
          <input
            value={data.variableName || 'myVar'}
            onChange={(e) => updateNodeData?.(id, { variableName: e.target.value })}
            style={{ background: '#000', border: '1px solid #444', color: '#f1c40f', padding: '4px', fontSize: '11px', outline: 'none', borderRadius: '3px' }}
          />
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Handle type="target" position={Position.Left} id="data-in" style={{ background: '#00eeff', width: '10px', height: '10px', left: '-16px', position: 'absolute' }} />
          {isConnected ? (
            <span style={{ fontSize: '10px', color: '#ccc', marginLeft: '4px' }}>New Value</span>
          ) : (
            <input
              className="nodrag"
              value={(data.inlineValue as string) ?? ''}
              onChange={onInlineChange}
              placeholder="value..."
              style={{ ...inlineInputStyle, color: '#00eeff', marginLeft: '4px' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(SetVariableNode);
