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

const HashMapOpNode = ({ data, selected, id }: Props) => {
  const op = data.operation as string;
  const keyType = (data.keyType as string) || 'String';
  const valueType = (data.valueType as string) || 'String';
  const variableName = (data.variableName as string) || 'map';

  const keyColor = getTypeColor(keyType);
  const valueColor = getTypeColor(valueType);

  const headerLabel = `HashMap: ${op}`;
  const varLabel = `map: ${variableName}`;

  const getOutputColor = () => {
    switch (op) {
      case 'get': return valueColor;
      case 'containsKey': return BOOL_COLOR;
      case 'size': return INT_COLOR;
      case 'keySet': return STRING_COLOR;
      default: return ACCENT;
    }
  };

  const getOutputLabel = () => {
    switch (op) {
      case 'get': return valueType;
      case 'containsKey': return 'boolean';
      case 'size': return 'int';
      case 'keySet': return `Set<${keyType}>`;
      default: return '';
    }
  };

  // --- create: exec-in, exec-out only ---
  if (op === 'create') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '170px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#aaa' }}>{varLabel}</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      </div>
    );
  }

  // --- put: exec-in, exec-out + data-in-key + data-in-value ---
  if (op === 'put') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '170px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#aaa' }}>{varLabel}</span>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
      </div>
    );
  }

  // --- remove: exec-in, exec-out + data-in-key ---
  if (op === 'remove') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '170px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#aaa' }}>{varLabel}</span>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
      </div>
    );
  }

  // --- get: data-in-key → data-out (valueType color) ---
  if (op === 'get') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '150px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#aaa' }}>{varLabel}</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      </div>
    );
  }

  // --- containsKey: data-in-key → data-out (boolean color) ---
  if (op === 'containsKey') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '150px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#aaa' }}>{varLabel}</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      </div>
    );
  }

  // --- size: data-out only (int color) ---
  if (op === 'size') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '150px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#aaa' }}>{varLabel}</span>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
            <span style={boldLabelStyle}>{getOutputLabel()}</span>
            <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(getOutputColor(), 'right')} />
          </div>
        </div>
      </div>
    );
  }

  // --- keySet: data-out only (String color) ---
  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '150px' }}>
      <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '11px', color: '#aaa' }}>{varLabel}</span>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
          <span style={boldLabelStyle}>{getOutputLabel()}</span>
          <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(getOutputColor(), 'right')} />
        </div>
      </div>
    </div>
  );
};

export default memo(HashMapOpNode);
