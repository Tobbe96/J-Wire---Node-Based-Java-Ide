import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { getTypeColor } from '../../utils/theme';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, paramHandleStyle, sectionBox, nodeInputStyle, execFooter, execFooterLabel, typeDot } from '../../utils/nodeStyles';
import type { CallMethodNodeData, Parameter } from '../../utils/nodeTypes';

const ACCENT = '#8e44ad';

const CallMethodNode = ({ id, data, selected }: NodeProps<Node<CallMethodNodeData>>) => {
  const methodNodes = data.methodNodes || [];
  const targetMethod = methodNodes.find((m: Node) => m.data.label === data.methodName);
  const targetParams = (targetMethod?.data?.parameters as Parameter[]) || [];

  return (
    <div style={nodeContainer(ACCENT, !!selected)}>
      <div style={nodeHeaderSolid('#e74c3c')}>CALL METHOD</div>

      <Handle type="target" position={Position.Left} id="exec-in" style={execHandleStyle('left')} />

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '10px', color: '#888' }}>Method Name to Run:</span>
        <input
          className="nodrag"
          defaultValue={data.methodName || 'newMethod'}
          onChange={(e) => data.updateNodeData?.(id, { methodName: e.target.value })}
          style={{ ...nodeInputStyle, color: '#9b59b6' }}
        />

        {targetParams.length > 0 && (
          <div style={{ ...sectionBox, marginTop: '4px' }}>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#9b59b6', marginBottom: '6px', display: 'block' }}>ARGUMENTS</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {targetParams.map((param: Parameter, index: number) => {
                const color = getTypeColor(param.type);
                return (
                  <div key={param.id || index} style={{ display: 'flex', alignItems: 'center', gap: '5px', position: 'relative' }}>
                    <Handle type="target" position={Position.Left} id={`arg-in-${index}`} style={paramHandleStyle(color, 'left')} />
                    <div style={typeDot(color)} />
                    <span style={{ fontSize: '11px' }}>{param.name}</span>
                    <span style={{ fontSize: '9px', color: '#666' }}>({param.type})</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={execFooter}>
        <span style={execFooterLabel}>Next</span>
        <Handle type="source" position={Position.Right} id="exec-out" style={execHandleStyle('right')} />
      </div>
    </div>
  );
};

export default memo(CallMethodNode);