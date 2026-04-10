import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { EnrichedData, ArrayListOpNodeData } from '../../utils/nodeTypes';

const ACCENT = '#1abc9c';
const INT_COLOR = getTypeColor('int');
const BOOL_COLOR = getTypeColor('boolean');

const handleStyle = (color: string, side: 'left' | 'right') => ({
  background: color,
  width: '10px',
  height: '10px',
  ...(side === 'left' ? { left: '-16px' } : { right: '-16px' }),
});

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#ccc',
};

const boldLabel: React.CSSProperties = {
  fontSize: '11px',
  color: '#fff',
  fontWeight: 'bold',
};

const bodyStyle: React.CSSProperties = {
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const rowStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const ArrayListOpNode = ({
  data,
  selected,
  id,
}: {
  data: EnrichedData<ArrayListOpNodeData>;
  selected: boolean;
  id: string;
}) => {
  const op = data.operation;
  const elementType = data.elementType || 'Object';
  const variableName = data.variableName || 'list';
  const elementColor = getTypeColor(elementType);

  const headerLabel = `ArrayList: ${op}`;
  const varLabel = `list: ${variableName}`;

  const isExecOp = op === 'create' || op === 'add' || op === 'set' || op === 'remove' || op === 'clear';

  const renderExecIn = () => (
    <div style={rowStyle}>
      <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
      <span style={boldLabel}>Exec</span>
    </div>
  );

  const renderExecOut = () => (
    <div style={{ ...rowStyle, justifyContent: 'flex-end' }}>
      <span style={{ ...boldLabel, marginRight: '5px' }}>Out</span>
      <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-16px' }} />
    </div>
  );

  // ─── create ─────────────────────────────────────────────
  if (op === 'create') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '180px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        <div style={{ padding: '4px 12px 0', fontSize: '10px', color: '#aaa' }}>{varLabel}</div>
        <div style={bodyStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {renderExecIn()}
            {renderExecOut()}
          </div>
        </div>
      </div>
    );
  }

  // ─── add ────────────────────────────────────────────────
  if (op === 'add') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '180px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        <div style={{ padding: '4px 12px 0', fontSize: '10px', color: '#aaa' }}>{varLabel}</div>
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {renderExecIn()}
            <div style={rowStyle}>
              <Handle type="target" position={Position.Left} id="data-in-value" style={handleStyle(elementColor, 'left')} />
              <span style={labelStyle}>Value</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end' }}>
            {renderExecOut()}
          </div>
        </div>
      </div>
    );
  }

  // ─── get (data-only) ────────────────────────────────────
  if (op === 'get') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '160px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        <div style={{ padding: '4px 12px 0', fontSize: '10px', color: '#aaa' }}>{varLabel}</div>
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={rowStyle}>
              <Handle type="target" position={Position.Left} id="data-in-index" style={handleStyle(INT_COLOR, 'left')} />
              <span style={labelStyle}>Index</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', ...rowStyle }}>
            <span style={boldLabel}>Result</span>
            <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(elementColor, 'right')} />
          </div>
        </div>
      </div>
    );
  }

  // ─── set ────────────────────────────────────────────────
  if (op === 'set') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '180px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        <div style={{ padding: '4px 12px 0', fontSize: '10px', color: '#aaa' }}>{varLabel}</div>
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {renderExecIn()}
            <div style={rowStyle}>
              <Handle type="target" position={Position.Left} id="data-in-index" style={handleStyle(INT_COLOR, 'left')} />
              <span style={labelStyle}>Index</span>
            </div>
            <div style={rowStyle}>
              <Handle type="target" position={Position.Left} id="data-in-value" style={handleStyle(elementColor, 'left')} />
              <span style={labelStyle}>Value</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end' }}>
            {renderExecOut()}
          </div>
        </div>
      </div>
    );
  }

  // ─── remove ─────────────────────────────────────────────
  if (op === 'remove') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '180px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        <div style={{ padding: '4px 12px 0', fontSize: '10px', color: '#aaa' }}>{varLabel}</div>
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {renderExecIn()}
            <div style={rowStyle}>
              <Handle type="target" position={Position.Left} id="data-in-index" style={handleStyle(INT_COLOR, 'left')} />
              <span style={labelStyle}>Index</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end' }}>
            {renderExecOut()}
          </div>
        </div>
      </div>
    );
  }

  // ─── size (data-only) ───────────────────────────────────
  if (op === 'size') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '150px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        <div style={{ padding: '4px 12px 0', fontSize: '10px', color: '#aaa' }}>{varLabel}</div>
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', ...rowStyle }}>
            <span style={boldLabel}>int</span>
            <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(INT_COLOR, 'right')} />
          </div>
        </div>
      </div>
    );
  }

  // ─── contains (data-only) ──────────────────────────────
  if (op === 'contains') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '170px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        <div style={{ padding: '4px 12px 0', fontSize: '10px', color: '#aaa' }}>{varLabel}</div>
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={rowStyle}>
              <Handle type="target" position={Position.Left} id="data-in-value" style={handleStyle(elementColor, 'left')} />
              <span style={labelStyle}>Value</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', ...rowStyle }}>
            <span style={boldLabel}>boolean</span>
            <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(BOOL_COLOR, 'right')} />
          </div>
        </div>
      </div>
    );
  }

  // ─── clear ──────────────────────────────────────────────
  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '180px' }}>
      <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
      <div style={{ padding: '4px 12px 0', fontSize: '10px', color: '#aaa' }}>{varLabel}</div>
      <div style={bodyStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {renderExecIn()}
          {renderExecOut()}
        </div>
      </div>
    </div>
  );
};

export default memo(ArrayListOpNode);
