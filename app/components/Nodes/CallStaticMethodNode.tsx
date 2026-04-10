import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { getTypeColor } from '../../utils/theme';
import {
  nodeContainer,
  nodeHeaderSolid,
  execHandleStyle,
  paramHandleStyle,
  nodeSelectStyle,
  sectionBox,
  typeDot,
  execFooter,
  execFooterLabel,
  dataHandleStyle,
} from '../../utils/nodeStyles';
import type { CallStaticMethodNodeData, Parameter } from '../../utils/nodeTypes';

const ACCENT = '#e74c3c';

const CallStaticMethodNode = ({ id, data, selected }: NodeProps<Node<CallStaticMethodNodeData>>) => {
  const projectFiles = data.projectFiles || [];
  const targetFile = projectFiles.find((f) => f.className === data.targetClass);
  const methods = targetFile?.methods || [];
  const selectedMethod = methods.find((m) => m.name === data.methodName);
  const targetParams = selectedMethod?.parameters || [];
  const returnType = selectedMethod?.returnType || 'void';
  const hasReturn = returnType !== 'void';

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    data.updateNodeData?.(id, { targetClass: e.target.value, methodName: '' });
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    data.updateNodeData?.(id, { methodName: e.target.value });
  };

  return (
    <div style={nodeContainer(ACCENT, !!selected)}>
      <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>CALL STATIC METHOD</div>

      <Handle type="target" position={Position.Left} id="exec-in" style={execHandleStyle('left')} />

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Target class dropdown */}
        <span style={{ fontSize: '10px', color: '#888' }}>Target Class:</span>
        <select
          className="nodrag"
          value={data.targetClass || ''}
          onChange={handleClassChange}
          style={{ ...nodeSelectStyle, color: ACCENT }}
        >
          <option value="">— select class —</option>
          {projectFiles.map((f) => (
            <option key={f.id} value={f.className}>{f.className}</option>
          ))}
        </select>

        {/* Method dropdown */}
        {data.targetClass && (
          <>
            <span style={{ fontSize: '10px', color: '#888' }}>Method:</span>
            <select
              className="nodrag"
              value={data.methodName || ''}
              onChange={handleMethodChange}
              style={{ ...nodeSelectStyle, color: ACCENT }}
            >
              <option value="">— select method —</option>
              {methods.map((m) => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
          </>
        )}

        {/* Dynamic argument handles */}
        {targetParams.length > 0 && (
          <div style={{ ...sectionBox, marginTop: '4px' }}>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: ACCENT, marginBottom: '6px', display: 'block' }}>ARGUMENTS</span>
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

        {/* Return type data-out handle */}
        {hasReturn && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', position: 'relative', marginTop: '4px' }}>
            <span style={{ fontSize: '9px', color: '#666' }}>({returnType})</span>
            <span style={{ fontSize: '11px' }}>result</span>
            <div style={typeDot(getTypeColor(returnType))} />
            <Handle type="source" position={Position.Right} id="data-out" style={dataHandleStyle(getTypeColor(returnType), 'right')} />
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

export default memo(CallStaticMethodNode);
