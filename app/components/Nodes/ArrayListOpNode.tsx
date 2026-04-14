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

const ELEM_TYPES = ['int', 'double', 'float', 'long', 'String', 'boolean', 'char', 'Object'];

const varInpStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#ccc',
  padding: '2px 5px',
  fontSize: '10px',
  outline: 'none',
  borderRadius: '3px',
  width: '78px',
};

const typeSelStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '2px 3px',
  fontSize: '10px',
  outline: 'none',
  cursor: 'pointer',
  borderRadius: '3px',
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
  const elementType = data.elementType || 'int';
  const variableName = data.variableName || 'list';
  const elementColor = getTypeColor(elementType);
  const { updateNodeData } = data;

  const headerLabel = `ArrayList: ${op}`;

  const renderVarEdit = () => (
    <div style={{ padding: '4px 10px 2px', display: 'flex', gap: '5px', alignItems: 'center' }}>
      <input
        className="nodrag"
        value={variableName}
        onChange={(e) => updateNodeData?.(id, { variableName: e.target.value })}
        style={varInpStyle}
        placeholder="varName"
      />
      {op === 'create' && (
        <select
          className="nodrag"
          value={elementType}
          onChange={(e) => updateNodeData?.(id, { elementType: e.target.value })}
          style={{ ...typeSelStyle, color: ACCENT }}
        >
          {ELEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      )}
    </div>
  );

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
    const initialValues = (data.initialValues as string) || '';
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '190px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
        <div style={bodyStyle}>
          <div style={{ padding: '0 2px' }}>
            <span style={{ fontSize: '10px', color: '#888' }}>Initial values (comma-sep):</span>
            <input
              className="nodrag"
              value={initialValues}
              onChange={(e) => updateNodeData?.(id, { initialValues: e.target.value })}
              style={{ ...varInpStyle, width: '100%', marginTop: '3px' }}
              placeholder="e.g. 1, 5, 3, 8"
            />
          </div>
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
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '190px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
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
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '170px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
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
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '190px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
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
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '190px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
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
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '160px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
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
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '180px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
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

  // ─── sort ──────────────────────────────────────────────
  if (op === 'sort') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '190px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
        <div style={bodyStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {renderExecIn()}
            {renderExecOut()}
          </div>
        </div>
      </div>
    );
  }

  // ─── reverse ─────────────────────────────────────────────
  if (op === 'reverse') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '190px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
        <div style={bodyStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {renderExecIn()}
            {renderExecOut()}
          </div>
        </div>
      </div>
    );
  }

  // ─── indexOf ─────────────────────────────────────────────
  if (op === 'indexOf' || op === 'lastIndexOf') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '180px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={rowStyle}>
              <Handle type="target" position={Position.Left} id="data-in-value" style={handleStyle(elementColor, 'left')} />
              <span style={labelStyle}>Value</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', ...rowStyle }}>
            <span style={boldLabel}>int</span>
            <Handle type="source" position={Position.Right} id="data-out" style={handleStyle(INT_COLOR, 'right')} />
          </div>
        </div>
      </div>
    );
  }

  // ─── shuffle ────────────────────────────────────────────────
  if (op === 'shuffle') {
    return (
      <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '190px' }}>
        <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
        {renderVarEdit()}
        <div style={bodyStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {renderExecIn()}
            {renderExecOut()}
          </div>
        </div>
      </div>
    );
  }

  // ─── clear ──────────────────────────────────────────────
  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '190px' }}>
      <div className="jflow-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{headerLabel}</div>
      {renderVarEdit()}
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
