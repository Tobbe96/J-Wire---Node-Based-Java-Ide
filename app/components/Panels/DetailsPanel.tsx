import React, { memo } from 'react';
import type { Node } from '@xyflow/react';
import { isNumericType, JAVA_TYPES } from '../../utils/theme';
import type { Parameter, LocalVariable } from '../../utils/nodeTypes';

interface DetailsPanelProps {
  selectedNode: Node | null;
  updateNodeModifier: (id: string, modifier: string) => void;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
}

const DetailsPanel = ({ selectedNode, updateNodeModifier, updateNodeData }: DetailsPanelProps) => {
  if (!selectedNode) {
    return (
      <div style={panelStyle}>
        <div style={emptyStyle}>SELECT A NODE TO EDIT PROPERTIES</div>
      </div>
    );
  }

  const { data, id, type: nodeType } = selectedNode;

  const updateParam = (index: number, field: string, value: string) => {
    const params = [...((data.parameters as Parameter[]) || [])];
    params[index] = { ...params[index], [field]: value };
    updateNodeData(id, { parameters: params });
  };

  const removeParam = (index: number) => {
    const params = (data.parameters as Parameter[]).filter((_: Parameter, i: number) => i !== index);
    updateNodeData(id, { parameters: params });
  };

  const updateLocal = (index: number, field: string, value: string) => {
    const locals = [...((data.localVariables as LocalVariable[]) || [])];
    locals[index] = { ...locals[index], [field]: value };
    updateNodeData(id, { localVariables: locals });
  };

  const removeLocal = (index: number) => {
    const locals = (data.localVariables as LocalVariable[]).filter((_: LocalVariable, i: number) => i !== index);
    updateNodeData(id, { localVariables: locals });
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        PROPERTIES: <span style={{ color: '#fff' }}>{nodeType?.toUpperCase()}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', flex: 1 }}>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>NAME</label>
          <input style={inputStyle} value={(data.label as string) || ''} onChange={(e) => updateNodeData(id, { label: e.target.value })} />
        </div>

        {nodeType === 'java' && (
          <>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>INITIAL VALUE</label>
              <input style={inputStyle} value={(data.value as string) || ''} onChange={(e) => updateNodeData(id, { value: e.target.value })} />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>ACCESS MODIFIER</label>
              <select style={selectStyle} value={(data.modifier as string) || 'public'} onChange={(e) => updateNodeModifier(id, e.target.value)}>
                <option value="public">public</option>
                <option value="private">private</option>
                <option value="protected">protected</option>
                <option value="public final">public final</option>
                <option value="private final">private final</option>
                <option value="protected final">protected final</option>
              </select>
            </div>
          </>
        )}

        {nodeType === 'method' && (
          <>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>ACCESS MODIFIER</label>
              <select style={selectStyle} value={(data.modifier as string) || 'public'} onChange={(e) => updateNodeModifier(id, e.target.value)}>
                <option value="public">public</option>
                <option value="private">private</option>
                <option value="protected">protected</option>
                <option value="public final">public final</option>
                <option value="private final">private final</option>
                <option value="protected final">protected final</option>
              </select>
            </div>
            <div style={{ marginTop: '5px' }}>
              <label style={{ ...labelStyle, color: '#9b59b6' }}>PARAMETERS</label>
              <div style={scrollAreaStyle}>
                {((data.parameters as Parameter[]) || []).map((p: Parameter, index: number) => (
                  <div key={p.id || `param-${index}`} style={paramRowStyle}>
                    <input style={{ ...inputStyle, flex: 2 }} value={p.name} onChange={(e) => updateParam(index, 'name', e.target.value)} placeholder="name" />
                    <select style={{ ...selectStyle, flex: 1 }} value={p.type} onChange={(e) => updateParam(index, 'type', e.target.value)}>
                      {JAVA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {isNumericType(p.type) && (
                      <input style={{ ...inputStyle, flex: 1, maxWidth: '40px' }} type="number" value={p.defaultValue ?? '0'} onChange={(e) => updateParam(index, 'defaultValue', e.target.value)} placeholder="def" />
                    )}
                    <button onClick={() => removeParam(index)} style={deleteBtnStyle}>×</button>
                  </div>
                ))}
                {(!(data.parameters as Parameter[]) || (data.parameters as Parameter[]).length === 0) && (
                  <div style={{ fontSize: '10px', color: '#444', fontStyle: 'italic' }}>No parameters added</div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '5px' }}>
              <label style={{ ...labelStyle, color: '#e67e22' }}>LOCAL VARIABLES</label>
              <div style={scrollAreaStyle}>
                {((data.localVariables as LocalVariable[]) || []).map((l: LocalVariable, index: number) => (
                  <div key={l.id || `local-${index}`} style={paramRowStyle}>
                    <input style={{ ...inputStyle, flex: 2 }} value={l.name} onChange={(e) => updateLocal(index, 'name', e.target.value)} placeholder="name" />
                    <select style={{ ...selectStyle, flex: 1 }} value={l.type} onChange={(e) => updateLocal(index, 'type', e.target.value)}>
                      {JAVA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input style={{ ...inputStyle, flex: 1, maxWidth: '40px' }} value={l.value} onChange={(e) => updateLocal(index, 'value', e.target.value)} placeholder="val" />
                    <button onClick={() => removeLocal(index)} style={deleteBtnStyle}>×</button>
                  </div>
                ))}
                {(!(data.localVariables as LocalVariable[]) || (data.localVariables as LocalVariable[]).length === 0) && (
                  <div style={{ fontSize: '10px', color: '#444', fontStyle: 'italic' }}>No local variables added</div>
                )}
              </div>
            </div>
          </>
        )}

        {nodeType === 'constructor' && (
          <div style={inputGroupStyle}>
            <label style={labelStyle}>ACCESS MODIFIER</label>
            <select style={selectStyle} value={(data.modifier as string) || 'public'} onChange={(e) => updateNodeModifier(id, e.target.value)}>
              <option value="public">public</option>
              <option value="private">private</option>
              <option value="protected">protected</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(DetailsPanel);

// ─── Styles ────────────────────────────────────────────────────

const panelStyle: React.CSSProperties = { padding: '15px', background: '#0a0a0a', borderTop: '2px solid #222', height: '320px', display: 'flex', flexDirection: 'column' };
const headerStyle: React.CSSProperties = { fontSize: '10px', color: '#555', marginBottom: '15px', fontWeight: 'bold', letterSpacing: '1px' };
const emptyStyle: React.CSSProperties = { textAlign: 'center', color: '#333', marginTop: '40px', fontSize: '11px', fontWeight: 'bold' };
const inputGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle: React.CSSProperties = { fontSize: '9px', color: '#666', fontWeight: 'bold' };
const inputStyle: React.CSSProperties = { background: '#111', border: '1px solid #333', color: '#fff', padding: '6px', fontSize: '11px', borderRadius: '3px', outline: 'none' };
const selectStyle: React.CSSProperties = { background: '#111', border: '1px solid #333', color: '#9b59b6', padding: '5px', fontSize: '11px', borderRadius: '3px', cursor: 'pointer' };
const scrollAreaStyle: React.CSSProperties = { maxHeight: '140px', overflowY: 'auto', marginTop: '8px', paddingRight: '5px' };
const paramRowStyle: React.CSSProperties = { display: 'flex', gap: '5px', marginBottom: '6px', alignItems: 'center' };
const deleteBtnStyle: React.CSSProperties = { background: 'transparent', border: 'none', color: '#ff4444', fontSize: '16px', cursor: 'pointer', padding: '0 5px' };