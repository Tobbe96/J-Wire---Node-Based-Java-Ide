import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { getTypeColor } from '../../utils/theme';
import {
  nodeContainer,
  nodeHeaderGradient,
  sectionBox,
  sectionHeader,
  smallButton,
  paramHandleStyle,
  execHandleStyle,
  nodeInputStyle,
  pinRow,
  typeDot,
} from '../../utils/nodeStyles';

const ACCENT = '#1abc9c';

const JAVA_TYPES = ['int', 'double', 'float', 'long', 'String', 'boolean', 'char'] as const;

interface CustomCodeInput {
  id: string;
  name: string;
  type: string;
}

interface CustomCodeNodeData extends Record<string, unknown> {
  label: string;
  code: string;
  mode: 'statement' | 'expression';
  inputs: CustomCodeInput[];
  outputType: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

const CustomCodeNode = ({
  data,
  selected,
  id,
}: {
  data: CustomCodeNodeData & { updateNodeData?: (id: string, data: Record<string, unknown>) => void };
  selected: boolean;
  id: string;
}) => {
  const mode = data.mode ?? 'statement';
  const inputs: CustomCodeInput[] = data.inputs ?? [];
  const code = data.code ?? '';
  const outputType = data.outputType ?? 'int';

  const addInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newInput: CustomCodeInput = {
      id: `cin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `input${inputs.length}`,
      type: 'int',
    };
    data.updateNodeData?.(id, { inputs: [...inputs, newInput] });
  };

  const removeInput = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = inputs.filter((_, i) => i !== index);
    data.updateNodeData?.(id, { inputs: updated });
  };

  const updateInputField = (index: number, field: keyof CustomCodeInput, value: string) => {
    const updated = [...inputs];
    updated[index] = { ...updated[index], [field]: value };
    data.updateNodeData?.(id, { inputs: updated });
  };

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '260px' }}>
      {/* Header */}
      <div className="devflow-header-shimmer" style={nodeHeaderGradient(ACCENT)}>
        <span>CUSTOM CODE</span>
        <span style={{ color: ACCENT, fontSize: '10px' }}>{mode}</span>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Mode Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '9px', color: '#888', letterSpacing: '0.5px' }}>MODE</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['statement', 'expression'] as const).map((m) => (
              <button
                key={m}
                className="nodrag"
                onClick={(e) => {
                  e.stopPropagation();
                  data.updateNodeData?.(id, { mode: m });
                }}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  fontSize: '10px',
                  fontWeight: mode === m ? 'bold' : 'normal',
                  background: mode === m ? `${ACCENT}cc` : 'rgba(0,0,0,0.4)',
                  border: mode === m ? `1px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.08)',
                  color: mode === m ? '#fff' : '#888',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Code Textarea */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '9px', color: '#888', letterSpacing: '0.5px' }}>CODE</span>
          <textarea
            className="nodrag"
            value={code}
            onChange={(e) => {
              e.stopPropagation();
              data.updateNodeData?.(id, { code: e.target.value });
            }}
            placeholder={mode === 'expression' ? 'x + y * 2' : 'System.out.println(x);'}
            rows={4}
            style={{
              background: '#0a0a0f',
              border: `1px solid ${ACCENT}44`,
              color: '#e0e0e0',
              padding: '8px',
              fontSize: '11px',
              fontFamily: "'Consolas', 'Fira Code', 'Courier New', monospace",
              outline: 'none',
              borderRadius: '4px',
              resize: 'vertical',
              lineHeight: '1.5',
              minHeight: '60px',
            }}
          />
        </div>

        {/* Output Type (expression mode only) */}
        {mode === 'expression' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '9px', color: '#888', letterSpacing: '0.5px' }}>OUTPUT TYPE</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
              <div style={typeDot(getTypeColor(outputType))} />
              <select
                className="nodrag"
                value={outputType}
                onChange={(e) => {
                  e.stopPropagation();
                  data.updateNodeData?.(id, { outputType: e.target.value });
                }}
                style={{ ...nodeInputStyle, flex: 1, cursor: 'pointer', color: getTypeColor(outputType) }}
              >
                {JAVA_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <Handle
                type="source"
                position={Position.Right}
                id="data-out"
                style={paramHandleStyle(getTypeColor(outputType), 'right')}
              />
            </div>
          </div>
        )}

        {/* Inputs Section */}
        <div style={sectionBox}>
          <div style={sectionHeader(ACCENT)}>
            <span>INPUTS</span>
            <button className="nodrag" onClick={addInput} style={smallButton(ACCENT)}>+ ADD INPUT</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {inputs.map((input, index) => {
              const color = getTypeColor(input.type);
              return (
                <div key={input.id} style={pinRow}>
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={`custom-in-${index}`}
                    style={paramHandleStyle(color, 'left')}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                    <div style={typeDot(color)} />
                    <input
                      className="nodrag"
                      value={input.name}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateInputField(index, 'name', e.target.value);
                      }}
                      style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#ccc',
                        padding: '2px 5px',
                        fontSize: '10px',
                        outline: 'none',
                        borderRadius: '3px',
                        width: '60px',
                      }}
                    />
                    <select
                      className="nodrag"
                      value={input.type}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateInputField(index, 'type', e.target.value);
                      }}
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
                      {JAVA_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <button
                      className="nodrag"
                      onClick={(e) => removeInput(e, index)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ff4444',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '0 2px',
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Exec handles (statement mode only) */}
      {mode === 'statement' && (
        <div style={{
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Handle
              type="target"
              position={Position.Left}
              id="exec-in"
              style={execHandleStyle('left')}
            />
            <span style={{ fontSize: '9px', color: '#fff', opacity: 0.4 }}>EXEC</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '9px', color: '#fff', opacity: 0.4 }}>EXEC</span>
            <Handle
              type="source"
              position={Position.Right}
              id="exec-out"
              style={execHandleStyle('right')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(CustomCodeNode);
