import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor, ALL_NUMERIC } from '../../utils/theme';

const ACCENT = '#e67e22';
const ALL_ELEMENT_TYPES = [...ALL_NUMERIC, 'String', 'boolean'];

interface ForEachNodeData extends Record<string, unknown> {
  label: string;
  elementType?: string;
  loopLabel?: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

const dataHandle = (color: string, side: 'left' | 'right') => ({
  background: color,
  width: '10px',
  height: '10px',
  ...(side === 'left' ? { left: '-16px' } : { right: '-16px' }),
});

const selectStyle: React.CSSProperties = {
  background: '#000',
  border: '1px solid #444',
  color: ACCENT,
  padding: '4px',
  fontSize: '11px',
  outline: 'none',
  cursor: 'pointer',
};

const ForEachNode = ({ id, data, selected }: NodeProps<Node<ForEachNodeData>>) => {
  const elementType = (data.elementType as string) || 'int';
  const elemColor = getTypeColor(elementType);
  const loopLabel = (data.loopLabel as string) || '';
  const updateNodeData = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;

  const onTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData?.(id, { elementType: e.target.value });
  }, [id, updateNodeData]);

  const onLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData?.(id, { loopLabel: e.target.value });
  }, [id, updateNodeData]);

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '200px' }}>
      <div className="jwire-header-shimmer" style={nodeHeaderSolid(ACCENT)}>FOR-EACH (Loop)</div>

      <div style={{ padding: '4px 10px 2px', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: '10px', color: '#888' }}>label:</span>
        <input
          value={loopLabel}
          onChange={onLabelChange}
          placeholder="optional"
          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #555', color: '#f1c40f', fontSize: '10px', width: '80px', outline: 'none', padding: '1px 2px' }}
          className="nodrag"
        />
      </div>

      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        {/* Left: inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
            <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Exec</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Handle type="target" position={Position.Left} id="data-in-array" style={dataHandle('#1abc9c', 'left')} />
            <span style={{ fontSize: '11px', color: '#ccc' }}>Array</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: '#aaa' }}>Type</span>
            <select value={elementType} onChange={onTypeChange} style={selectStyle}>
              {ALL_ELEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Right: outputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'flex-end', marginLeft: '20px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#f1c40f', fontWeight: 'bold', marginRight: '5px' }}>Loop Body</span>
            <Handle type="source" position={Position.Right} id="exec-body" style={{ ...execHandleStyle('right'), right: '-16px' }} />
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#ccc', fontWeight: 'bold', marginRight: '5px' }}>Completed</span>
            <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-16px' }} />
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: elemColor, marginRight: '5px' }}>Element</span>
            <Handle type="source" position={Position.Right} id="data-out-element" style={dataHandle(elemColor, 'right')} />
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: getTypeColor('int'), marginRight: '5px' }}>Index</span>
            <Handle type="source" position={Position.Right} id="data-out-index" style={dataHandle(getTypeColor('int'), 'right')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ForEachNode);
