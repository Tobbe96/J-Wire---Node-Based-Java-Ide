import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { getTypeColor, isNumericType } from '../../utils/theme';
import {
  nodeContainer,
  nodeHeaderGradient,
  sectionBox,
  sectionHeader,
  paramHandleStyle,
  execHandleStyle,
  smallButton,
  pinRow,
  typeDot,
} from '../../utils/nodeStyles';
import type { Parameter, LocalVariable } from '../../utils/nodeTypes';

const ACCENT = '#e67e22';
const LOCAL_ACCENT = '#27ae60';

interface ConstructorNodeData extends Record<string, unknown> {
  label: string;
  parameters?: Parameter[];
  localVariables?: LocalVariable[];
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

const ConstructorNode = ({ id, data, selected }: NodeProps<Node<ConstructorNodeData>>) => {
  const parameters: Parameter[] = data.parameters || [];
  const localVariables: LocalVariable[] = data.localVariables || [];

  const updateParamField = (index: number, field: string, value: string) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    data.updateNodeData?.(id, { parameters: updated });
  };

  const addParameter = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newParam: Parameter = {
      id: `param-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `param${parameters.length + 1}`,
      type: 'int',
      defaultValue: '0',
    };
    data.updateNodeData?.(id, { parameters: [...parameters, newParam] });
  };

  const removeParameter = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    data.updateNodeData?.(id, { parameters: parameters.filter((_, i) => i !== index) });
  };

  const addLocalVariable = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newLocal: LocalVariable = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `localVar${localVariables.length + 1}`,
      type: 'int',
      value: '0',
    };
    data.updateNodeData?.(id, { localVariables: [...localVariables, newLocal] });
  };

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '240px' }}>
      <div className="jwire-header-shimmer" style={nodeHeaderGradient(ACCENT)}>
        <span>CONSTRUCTOR</span>
        <span style={{ color: ACCENT, fontSize: '10px' }}>new</span>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Access Modifier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ fontSize: '10px', color: '#888' }}>Access Modifier</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['public', 'private', 'protected'] as const).map((mod) => {
              const active = (data.modifier || 'public') === mod;
              return (
                <button
                  key={mod}
                  className="nodrag"
                  onClick={(e) => {
                    e.stopPropagation();
                    data.updateNodeData?.(id, { modifier: mod });
                  }}
                  style={{
                    flex: 1,
                    padding: '4px 4px',
                    fontSize: '9px',
                    fontWeight: active ? 'bold' : 'normal',
                    background: active ? `${ACCENT}cc` : 'rgba(0,0,0,0.4)',
                    border: active ? `1px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.08)',
                    color: active ? '#fff' : '#888',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}
                >
                  {mod}
                </button>
              );
            })}
          </div>
        </div>

        {/* Parameters */}
        <div style={sectionBox}>
          <div style={sectionHeader(ACCENT)}>
            <span>PARAMETERS</span>
            <button className="nodrag" onClick={addParameter} style={smallButton(ACCENT)}>+ ADD</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {parameters.map((param, index) => {
              const color = getTypeColor(param.type);
              return (
                <div key={param.id || index} style={{ ...pinRow, gap: '4px' }}>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`param-out-${index}`}
                    style={paramHandleStyle(color, 'right')}
                  />
                  <div style={typeDot(color)} />
                  <input
                    className="nodrag"
                    value={param.name}
                    onChange={(e) => { e.stopPropagation(); updateParamField(index, 'name', e.target.value); }}
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#ccc',
                      padding: '2px 5px',
                      fontSize: '10px',
                      outline: 'none',
                      borderRadius: '3px',
                      width: '55px',
                    }}
                  />
                  <select
                    className="nodrag"
                    value={param.type}
                    onChange={(e) => { e.stopPropagation(); updateParamField(index, 'type', e.target.value); }}
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color,
                      padding: '2px 4px',
                      fontSize: '10px',
                      outline: 'none',
                      cursor: 'pointer',
                      borderRadius: '3px',
                    }}
                  >
                    {['int','double','float','long','String','boolean','char'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {isNumericType(param.type) && (
                    <input
                      className="nodrag"
                      type="number"
                      value={param.defaultValue ?? '0'}
                      onChange={(e) => updateParamField(index, 'defaultValue', e.target.value)}
                      style={{
                        background: '#000',
                        border: `1px solid ${color}44`,
                        color,
                        padding: '2px 4px',
                        fontSize: '10px',
                        width: '40px',
                        outline: 'none',
                        borderRadius: '2px',
                        textAlign: 'right',
                      }}
                    />
                  )}
                  <button
                    className="nodrag"
                    onClick={(e) => removeParameter(e, index)}
                    style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '12px', padding: '0 2px', lineHeight: 1 }}
                  >×</button>
                </div>
              );
            })}
            {parameters.length === 0 && (
              <span style={{ fontSize: '10px', color: '#555', fontStyle: 'italic' }}>No parameters</span>
            )}
          </div>
        </div>

        {/* Local Variables */}
        <div style={sectionBox}>
          <div style={sectionHeader(LOCAL_ACCENT)}>
            <span>LOCAL VARIABLES</span>
            <button className="nodrag" onClick={addLocalVariable} style={smallButton(LOCAL_ACCENT)}>+ ADD</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {localVariables.map((local, index) => {
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
            {localVariables.length === 0 && (
              <span style={{ fontSize: '10px', color: '#555', fontStyle: 'italic' }}>No local variables</span>
            )}
          </div>
        </div>
      </div>

      {/* Execution Out */}
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #333' }}>
        <span style={{ fontSize: '10px', color: '#fff', opacity: 0.5, marginRight: '10px' }}>BODY START</span>
        <Handle type="source" position={Position.Right} id="exec-out" style={execHandleStyle('right')} />
      </div>
    </div>
  );
};

export default memo(ConstructorNode);
