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

const ACCENT = '#16a085';

interface ProjectConstructorInfo {
  index: number;
  parameters: Parameter[];
}

interface ProjectClassInfo {
  id: string;
  className: string;
  constructors: ProjectConstructorInfo[];
}

interface NewObjectNodeData extends Record<string, unknown> {
  label: string;
  targetClass: string;
  constructorIndex: number;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
  projectFiles?: ProjectClassInfo[];
}

const NewObjectNode = ({ id, data, selected }: NodeProps<Node<NewObjectNodeData>>) => {
  const projectFiles: ProjectClassInfo[] = (data.projectFiles as ProjectClassInfo[]) || [];
  const targetFile = projectFiles.find((f) => f.className === data.targetClass);
  const constructors = targetFile?.constructors || [];

  // If no constructors defined, treat class as having one default no-arg constructor
  const effectiveConstructors = constructors.length > 0
    ? constructors
    : [{ index: 0, parameters: [] }];

  const selectedCtor = effectiveConstructors[data.constructorIndex || 0] || effectiveConstructors[0];
  const targetParams: Parameter[] = selectedCtor?.parameters || [];

  return (
    <div style={nodeContainer(ACCENT, !!selected)}>
      <div className="jwire-header-shimmer" style={nodeHeaderSolid(ACCENT)}>NEW OBJECT</div>

      <Handle type="target" position={Position.Left} id="exec-in" style={execHandleStyle('left')} />

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Target class dropdown */}
        <span style={{ fontSize: '10px', color: '#888' }}>Class:</span>
        <select
          className="nodrag"
          value={data.targetClass || ''}
          onChange={(e) => {
            e.stopPropagation();
            data.updateNodeData?.(id, { targetClass: e.target.value, constructorIndex: 0 });
          }}
          style={{ ...nodeSelectStyle, color: ACCENT }}
        >
          <option value="">— select class —</option>
          {projectFiles.map((f) => (
            <option key={f.id} value={f.className}>{f.className}</option>
          ))}
        </select>

        {/* Constructor overload selector (if multiple) */}
        {data.targetClass && effectiveConstructors.length > 1 && (
          <>
            <span style={{ fontSize: '10px', color: '#888' }}>Constructor:</span>
            <select
              className="nodrag"
              value={data.constructorIndex || 0}
              onChange={(e) => {
                e.stopPropagation();
                data.updateNodeData?.(id, { constructorIndex: Number(e.target.value) });
              }}
              style={{ ...nodeSelectStyle, color: ACCENT }}
            >
              {effectiveConstructors.map((ctor, i) => (
                <option key={i} value={i}>
                  {`#${i + 1}(${ctor.parameters.map(p => p.type).join(', ')})`}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Argument handles */}
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

        {/* Object output handle */}
        {data.targetClass && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', position: 'relative', marginTop: '4px' }}>
            <span style={{ fontSize: '9px', color: '#888' }}>{data.targetClass as string}</span>
            <span style={{ fontSize: '11px', color: ACCENT }}>obj</span>
            <div style={typeDot(ACCENT)} />
            <Handle
              type="source"
              position={Position.Right}
              id="data-out"
              style={dataHandleStyle(ACCENT, 'right')}
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

export default memo(NewObjectNode);
