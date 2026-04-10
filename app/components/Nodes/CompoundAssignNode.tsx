import React, { memo, useCallback } from 'react';
import { Handle, Position, useNodeConnections } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, nodeSelectStyle, inlineInputStyle } from '../../utils/nodeStyles';
import type { EnrichedData, CompoundAssignNodeData } from '../../utils/nodeTypes';

const CompoundAssignNode = ({ data, selected, id }: { data: EnrichedData<CompoundAssignNodeData>; selected: boolean; id: string }) => {
  const borderColor = '#e67e22';
  const dataInConnections = useNodeConnections({ handleType: 'target', handleId: 'data-in' });
  const isConnected = dataInConnections.length > 0;

  const onInlineChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    data.updateNodeData?.(id, { inlineValue: e.target.value });
  }, [id, data.updateNodeData]);

  const onOperatorChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    data.updateNodeData?.(id, { operator: e.target.value });
  }, [id, data.updateNodeData]);

  return (
    <div style={nodeContainer(borderColor, selected)}>
      <div className="jflow-header-shimmer" style={nodeHeaderSolid(borderColor)}>COMPOUND ASSIGN ({data.operator || '+='})</div>

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
          <span style={{ fontSize: '9px', color: '#888' }}>Variable Name:</span>
          <input
            value={data.variableName || ''}
            onChange={(e) => data.updateNodeData?.(id, { variableName: e.target.value })}
            style={{ background: '#000', border: '1px solid #444', color: '#e67e22', padding: '4px', fontSize: '11px', outline: 'none', borderRadius: '3px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '9px', color: '#888' }}>Operator:</span>
          <select value={data.operator || '+='} onChange={onOperatorChange} style={nodeSelectStyle}>
            <option value="+=">+=</option>
            <option value="-=">-=</option>
            <option value="*=">*=</option>
            <option value="/=">/=</option>
            <option value="%=">%=</option>
          </select>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Handle type="target" position={Position.Left} id="data-in" style={{ background: '#00eeff', width: '10px', height: '10px', left: '-16px', position: 'absolute' }} />
          {isConnected ? (
            <span style={{ fontSize: '10px', color: '#ccc', marginLeft: '4px' }}>Value</span>
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

export default memo(CompoundAssignNode);
