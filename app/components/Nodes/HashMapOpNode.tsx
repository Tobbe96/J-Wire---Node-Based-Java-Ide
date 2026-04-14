import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { EnrichedData, HashMapOpNodeData } from '../../utils/nodeTypes';

const ACCENT = '#8e44ad';
const BOOL_COLOR = getTypeColor('boolean');
const INT_COLOR = getTypeColor('int');
const STRING_COLOR = getTypeColor('String');

const handleStyle = (color: string, side: 'left' | 'right') => ({
  background: color,
  width: '10px',
  height: '10px',
  ...(side === 'left' ? { left: '-16px' } : { right: '-16px' }),
});

const labelStyle: React.CSSProperties = { fontSize: '11px', color: '#ccc' };
const boldLabelStyle: React.CSSProperties = { fontSize: '11px', color: '#fff', fontWeight: 'bold' };

type Props = {
  id: string;
  data: EnrichedData<HashMapOpNodeData>;
  selected?: boolean;
};

const MAP_TYPES = ['String', 'int', 'double', 'float', 'long', 'boolean', 'char', 'Object'];

const mapVarInp: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#ccc',
  padding: '2px 5px',
  fontSize: '10px',
  outline: 'none',
  borderRadius: '3px',
  width: '70px',
};

const mapTypeSel: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '2px 3px',
  fontSize: '10px',
  outline: 'none',
  cursor: 'pointer',
  borderRadius: '3px',
};

const HashMapOpNode = ({ data, selected, id }: Props) => {
  const op = data.operation as string;
  const keyType = (data.keyType as string) || 'String';
  const valueType = (data.valueType as string) || 'String';
  const variableName = (data.variableName as string) || 'map';
  const { updateNodeData } = data as { updateNodeData?: (id: string, d: Record<string, unknown>) => void };

  const keyColor = getTypeColor(keyType);
  const valueColor = getTypeColor(valueType);

  const headerLabel = `HashMap: ${op}`;

  const renderVarEdit = () => (
    <div style={{ padding: '4px 10px 2px', display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
      <input
        className="nodrag"
        value={variableName}
        onChange={(e) => updateNodeData?.(id, { variableName: e.target.value })}
        style={mapVarInp}
        placeholder="varName"
      />
      {op === 'create' && (<>
        <select className="nodrag" value={keyType} onChange={(e) => updateNodeData?.(id, { keyType: e.target.value })} style={{ ...mapTypeSel, color: keyColor }}>
          {MAP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="nodrag" value={valueType} onChange={(e) => updateNodeData?.(id, { valueType: e.target.value })} style={{ ...mapTypeSel, color: valueColor }}>
          {MAP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </>)}
    </div>
  );

  const getOutputColor = () => {
    switch (op) {
      case 'get': return valueColor;
      case 'containsKey': return BOOL_COLOR;
      case 'size': return INT_COLOR;
      case 'keySet': return STRING_COLOR;
      case 'getOrDefault': return valueColor;
      case 'values': case 'entrySet': return STRING_COLOR;
      default: return ACCENT;
    }
  };

  const getOutputLabel = () => {
    switch (op) {
      case 'get': return valueType;
      case 'containsKey': return 'boolean';
      case 'size': return 'int';
      case 'keySet': return `Set<${keyType}>`;
      case 'getOrDefault': return valueType;
      case 'values': return `Collection<${valueType}>`;
      case 'entrySet': return 'Set<Entry>';
      default: return '';
    }
  };

  // --- create: exec-in, exec-out only ---
  if (op === 'create') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '190px' }}>
        <div className="devflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
            <span style={boldLabelStyle}>Exec</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ ...boldLabelStyle, marginRight: '5px' }}>Out</span>
            <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-16px' }} />
          </div>
        </div>
      </div>
    );
  }

  // --- put: exec-in, exec-out + data-in-key + data-in-value ---
  if (op === 'put') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '190px' }}>
        <div className="devflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
              <span style={boldLabelStyle}>Exec</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-key" style={handleStyle(keyColor, 'left')} />
              <span style={labelStyle}>Key</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-value" style={handleStyle(valueColor, 'left')} />
              <span style={labelStyle}>Value</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ ...boldLabelStyle, marginRight: '5px' }}>Out</span>
              <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-16px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- remove: exec-in, exec-out + data-in-key ---
  if (op === 'remove') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '190px' }}>
        <div className="devflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
              <span style={boldLabelStyle}>Exec</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-key" style={handleStyle(keyColor, 'left')} />
              <span style={labelStyle}>Key</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ ...boldLabelStyle, marginRight: '5px' }}>Out</span>
              <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-16px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- get: data-in-key → data-out (valueType color) ---
  if (op === 'get') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '170px' }}>
        <div className="devflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Handle type="target" position={Position.Left} id="data-in-key" style={handleStyle(keyColor, 'left')} />
            <span style={labelStyle}>Key</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={boldLabelStyle}>Result</span>
            <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(getOutputColor(), 'right')} />
          </div>
        </div>
      </div>
    );
  }

  // --- containsKey: data-in-key → data-out (boolean color) ---
  if (op === 'containsKey') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '170px' }}>
        <div className="devflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Handle type="target" position={Position.Left} id="data-in-key" style={handleStyle(keyColor, 'left')} />
            <span style={labelStyle}>Key</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={boldLabelStyle}>Result</span>
            <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(getOutputColor(), 'right')} />
          </div>
        </div>
      </div>
    );
  }

  // --- size: data-out only (int color) ---
  if (op === 'size') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '160px' }}>
        <div className="devflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
          <span style={boldLabelStyle}>{getOutputLabel()}</span>
          <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(getOutputColor(), 'right')} />
        </div>
      </div>
    );
  }

  // --- getOrDefault: data-in-key + data-in-default → data-out (valueType color) ---
  if (op === 'getOrDefault') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '170px' }}>
        <div className="devflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-key" style={handleStyle(keyColor, 'left')} />
              <span style={labelStyle}>Key</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id="data-in-default" style={handleStyle(valueColor, 'left')} />
              <span style={labelStyle}>Default</span>
            </div>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={boldLabelStyle}>Result</span>
            <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(valueColor, 'right')} />
          </div>
        </div>
      </div>
    );
  }

  // --- values / entrySet: data-out only ---
  if (op === 'values' || op === 'entrySet') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '160px' }}>
        <div className="devflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
          <span style={boldLabelStyle}>{op === 'values' ? `Collection<${valueType}>` : `Set<Entry>`}</span>
          <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(STRING_COLOR, 'right')} />
        </div>
      </div>
    );
  }

  // --- keySet: data-out only (String color) ---
  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '160px' }}>
      <div className="devflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
      {renderVarEdit()}
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
        <span style={boldLabelStyle}>{getOutputLabel()}</span>
        <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(getOutputColor(), 'right')} />
      </div>
    </div>
  );
};

export default memo(HashMapOpNode);
