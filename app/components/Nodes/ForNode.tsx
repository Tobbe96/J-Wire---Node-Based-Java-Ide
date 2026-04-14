import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';

const ACCENT = '#e67e22';
const INT_COLOR = getTypeColor('int');

const COMPARISONS = ['<', '<=', '>', '>='] as const;
type Comparison = typeof COMPARISONS[number];

interface ForNodeData extends Record<string, unknown> {
  label: string;
  loopLabel?: string;
  comparison?: Comparison;
  step?: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

const inputStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #555',
  color: '#f1c40f',
  fontSize: '10px',
  outline: 'none',
  padding: '1px 2px',
};

const selectStyle: React.CSSProperties = {
  background: '#1a1a1a',
  border: '1px solid #555',
  borderRadius: 3,
  color: '#e67e22',
  fontSize: '10px',
  outline: 'none',
  padding: '1px 3px',
  cursor: 'pointer',
};

const ForNode = ({ id, data, selected }: NodeProps<Node<ForNodeData>>) => {
  const loopLabel = (data.loopLabel as string) || '';
  const comparison = (data.comparison as Comparison) || '<';
  const step = (data.step as string) || '1';
  const updateNodeData = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;

  const onLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData?.(id, { loopLabel: e.target.value });
  }, [id, updateNodeData]);

  const onComparisonChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData?.(id, { comparison: e.target.value as Comparison });
  }, [id, updateNodeData]);

  const onStepChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData?.(id, { step: e.target.value });
  }, [id, updateNodeData]);

  return (
  <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '200px' }}>
    <div className="jwire-header-shimmer" style={nodeHeaderSolid(ACCENT)}>
      FOR (Loop)
    </div>

    {/* Config row */}
    <div style={{ padding: '4px 10px 2px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span style={{ fontSize: '10px', color: '#888' }}>label:</span>
      <input
        value={loopLabel}
        onChange={onLabelChange}
        placeholder="optional"
        style={{ ...inputStyle, width: '60px' }}
        className="nodrag"
      />
      <select value={comparison} onChange={onComparisonChange} style={selectStyle} className="nodrag">
        {COMPARISONS.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <span style={{ fontSize: '10px', color: '#888' }}>step:</span>
      <input
        value={step}
        onChange={onStepChange}
        placeholder="1"
        style={{ ...inputStyle, width: '32px' }}
        className="nodrag"
      />
    </div>

    <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Exec</span>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="data-start" style={{ background: INT_COLOR, width: '10px', height: '10px', borderRadius: '50%', left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#ccc' }}>Start</span>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="data-end" style={{ background: INT_COLOR, width: '10px', height: '10px', borderRadius: '50%', left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#ccc' }}>End</span>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="data-step" style={{ background: INT_COLOR, width: '10px', height: '10px', borderRadius: '50%', left: '-16px' }} />
          <span style={{ fontSize: '11px', color: '#ccc' }}>Step</span>
        </div>
      </div>

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
          <span style={{ fontSize: '11px', color: INT_COLOR, marginRight: '5px' }}>Index</span>
          <Handle type="source" position={Position.Right} id="data-index" style={{ background: INT_COLOR, width: '10px', height: '10px', right: '-16px' }} />
        </div>
      </div>
    </div>
  </div>
  );
};

export default memo(ForNode);
