import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { getTypeColor, isNumericType } from '../../utils/theme';
import { nodeContainer, nodeHeaderGradient, sectionBox, sectionHeader, paramHandleStyle, execHandleStyle, nodeInputStyle, smallButton, pinRow, typeDot } from '../../utils/nodeStyles';
import type { MethodNodeData, Parameter, LocalVariable } from '../../utils/nodeTypes';

const ACCENT = '#9b59b6';
const LOCAL_ACCENT = '#e67e22';

const MethodNode = ({ id, data, selected }: NodeProps<Node<MethodNodeData>>) => {
  const updateParamField = (index: number, field: string, value: string) => {
    if (!data.updateNodeData) return;
    const params = [...(data.parameters || [])];
    params[index] = { ...params[index], [field]: value };
    data.updateNodeData(id, { parameters: params });
  };

  const addParameter = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const currentParams = data.parameters || [];
    const newParam: Parameter = {
      id: `param-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `param${currentParams.length + 1}`,
      type: 'int',
      defaultValue: '0',
    };
    data.updateNodeData?.(id, { parameters: [...currentParams, newParam] });
  };

  const addLocalVariable = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const currentLocals = data.localVariables || [];
    const newLocal: LocalVariable = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `localVar${currentLocals.length + 1}`,
      type: 'int',
      value: '0',
    };
    data.updateNodeData?.(id, { localVariables: [...currentLocals, newLocal] });
  };

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '240px' }}>
      <div className="jflow-header-shimmer" style={nodeHeaderGradient(ACCENT)}>
        <span>METHOD DEFINITION</span>
        <span style={{ color: ACCENT }}>{data.returnType || 'void'}</span>
      </div>

      <div style={{ padding: '12px' }}>
        {/* Method Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
          <span style={{ fontSize: '10px', color: '#888' }}>Method Name</span>
          <input
            className="nodrag"
            defaultValue={data.label || 'myNewMethod'}
            onChange={(e) => {
              e.stopPropagation();
              data.updateNodeData?.(id, { label: e.target.value });
            }}
            style={nodeInputStyle}
          />
        </div>

        {/* Return Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
          <span style={{ fontSize: '10px', color: '#888' }}>Return Type</span>
          <select
            className="nodrag"
            value={data.returnType || 'void'}
            onChange={(e) => {
              e.stopPropagation();
              data.updateNodeData?.(id, { returnType: e.target.value });
            }}
            style={{ ...nodeInputStyle, cursor: 'pointer' }}
          >
            <option value="void">void</option>
            <option value="int">int</option>
            <option value="double">double</option>
            <option value="boolean">boolean</option>
            <option value="String">String</option>
            <option value="char">char</option>
          </select>
        </div>

        {/* Parameters */}
        <div style={{ ...sectionBox, marginBottom: '10px' }}>
          <div style={sectionHeader(ACCENT)}>
            <span>INPUT PARAMETERS</span>
            <button className="nodrag" onClick={addParameter} style={smallButton(ACCENT)}>+ ADD</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(data.parameters || []).map((param: Parameter, index: number) => {
              const color = getTypeColor(param.type);
              return (
                <div key={param.id || index} style={pinRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={typeDot(color)} />
                    <span style={{ fontSize: '11px' }}>{param.name}</span>
                  </div>
                  {isNumericType(param.type) && (
                    <input
                      className="nodrag"
                      type="number"
                      value={param.defaultValue ?? '0'}
                      onChange={(e) => updateParamField(index, 'defaultValue', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: '#000',
                        border: `1px solid ${color}44`,
                        color,
                        padding: '2px 4px',
                        fontSize: '10px',
                        width: '50px',
                        outline: 'none',
                        borderRadius: '2px',
                        textAlign: 'right',
                        marginRight: '4px',
                      }}
                    />
                  )}
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`param-out-${index}`}
                    style={paramHandleStyle(color, 'right')}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Local Variables */}
        <div style={sectionBox}>
          <div style={sectionHeader(LOCAL_ACCENT)}>
            <span>LOCAL VARIABLES</span>
            <button className="nodrag" onClick={addLocalVariable} style={smallButton(LOCAL_ACCENT)}>+ ADD</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(data.localVariables || []).map((local: LocalVariable, index: number) => {
              const color = getTypeColor(local.type);
              return (
                <div key={local.id || index} style={pinRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={typeDot(color)} />
                    <span style={{ fontSize: '11px' }}>{local.name}</span>
                    <span style={{ fontSize: '9px', color: '#666' }}>= {local.value}</span>
                  </div>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`local-out-${index}`}
                    style={{ ...paramHandleStyle(color, 'right'), border: `2px solid ${LOCAL_ACCENT}` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Execution Out */}
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #333' }}>
        <span style={{ fontSize: '10px', color: '#fff', opacity: 0.5, marginRight: '10px' }}>BODY START</span>
        <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), top: '75%' }} />
      </div>
    </div>
  );
};

export default memo(MethodNode);