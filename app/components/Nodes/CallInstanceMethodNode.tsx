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
import type { Parameter } from '../../utils/nodeTypes';

const ACCENT = '#8e44ad';

interface ProjectMethodInfo {
  name: string;
  returnType: string;
  parameters: Parameter[];
  isStatic?: boolean;
}

interface ProjectClassInfo {
  id: string;
  className: string;
  methods: ProjectMethodInfo[];
}

interface CallInstanceMethodNodeData extends Record<string, unknown> {
  label: string;
  methodName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
  projectFiles?: ProjectClassInfo[];
}

const CallInstanceMethodNode = ({ id, data, selected }: NodeProps<Node<CallInstanceMethodNodeData>>) => {
  const projectFiles: ProjectClassInfo[] = (data.projectFiles as ProjectClassInfo[]) || [];

  // Gather all instance methods from all classes (non-static)
  const allInstanceMethods: Array<{ className: string; method: ProjectMethodInfo }> = [];
  projectFiles.forEach(f => {
    f.methods
      .filter(m => m.isStatic === false)
      .forEach(m => allInstanceMethods.push({ className: f.className, method: m }));
  });

  const selectedEntry = allInstanceMethods.find(
    e => `${e.className}.${e.method.name}` === data.methodName
  );
  const targetParams = selectedEntry?.method.parameters || [];
  const returnType = selectedEntry?.method.returnType || 'void';
  const hasReturn = returnType !== 'void';
  const selectedClass = selectedEntry?.className || '';

  return (
    <div style={nodeContainer(ACCENT, !!selected)}>
      <div className="jwire-header-shimmer" style={nodeHeaderSolid(ACCENT)}>CALL INSTANCE METHOD</div>

      <Handle type="target" position={Position.Left} id="exec-in" style={execHandleStyle('left')} />

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Object reference input */}
        <span style={{ fontSize: '10px', color: '#888' }}>Object:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', position: 'relative' }}>
          <Handle
            type="target"
            position={Position.Left}
            id="obj-in"
            style={paramHandleStyle(ACCENT, 'left')}
          />
          <div style={typeDot(ACCENT)} />
          <span style={{ fontSize: '11px', color: '#aaa' }}>{selectedClass || 'object ref'}</span>
        </div>

        {/* Method dropdown — filtered to instance methods */}
        <span style={{ fontSize: '10px', color: '#888' }}>Method:</span>
        <select
          className="nodrag"
          value={data.methodName || ''}
          onChange={(e) => {
            e.stopPropagation();
            data.updateNodeData?.(id, { methodName: e.target.value });
          }}
          style={{ ...nodeSelectStyle, color: ACCENT }}
        >
          <option value="">— select method —</option>
          {allInstanceMethods.map(({ className, method }) => (
            <option key={`${className}.${method.name}`} value={`${className}.${method.name}`}>
              {className}.{method.name}()
            </option>
          ))}
        </select>

        {/* Dynamic argument handles */}
        {targetParams.length > 0 && (
          <div style={{ ...sectionBox, marginTop: '4px' }}>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: ACCENT, marginBottom: '6px', display: 'block' }}>ARGUMENTS</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {targetParams.map((param: Parameter, index: number) => {
                const color = getTypeColor(param.type);
                return (
                  <div key={param.id || index} style={{ display: 'flex', alignItems: 'center', gap: '5px', position: 'relative' }}>
                    <Handle
                      type="target"
                      position={Position.Left}
                      id={`arg-in-${index}`}
                      style={paramHandleStyle(color, 'left')}
                    />
                    <div style={typeDot(color)} />
                    <span style={{ fontSize: '11px' }}>{param.name}</span>
                    <span style={{ fontSize: '9px', color: '#666' }}>({param.type})</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Return value data-out */}
        {hasReturn && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', position: 'relative', marginTop: '4px' }}>
            <span style={{ fontSize: '9px', color: '#666' }}>({returnType})</span>
            <span style={{ fontSize: '11px' }}>result</span>
            <div style={typeDot(getTypeColor(returnType))} />
            <Handle
              type="source"
              position={Position.Right}
              id="data-out"
              style={dataHandleStyle(getTypeColor(returnType), 'right')}
            />
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

export default memo(CallInstanceMethodNode);
