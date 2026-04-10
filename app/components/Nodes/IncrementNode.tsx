import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, nodeSelectStyle } from '../../utils/nodeStyles';
import type { EnrichedData, IncrementNodeData } from '../../utils/nodeTypes';

const modeLabels: Record<IncrementNodeData['mode'], string> = {
  'post-increment': 'INCREMENT ++',
  'post-decrement': 'DECREMENT --',
  'pre-increment': 'INCREMENT ++',
  'pre-decrement': 'DECREMENT --',
};

const IncrementNode = ({ data, selected, id }: { data: EnrichedData<IncrementNodeData>; selected: boolean; id: string }) => {
  const borderColor = '#e67e22';

  return (
    <div style={nodeContainer(borderColor, selected)}>
      <div className="jflow-header-shimmer" style={nodeHeaderSolid(borderColor)}>
        {modeLabels[data.mode] ?? 'INCREMENT ++'}
      </div>

      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative' }}>
            <Handle type="target" position={Position.Left} id="exec-in" style={execHandleStyle('left')} />
            <span style={{ fontSize: '10px' }}>In</span>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: '10px' }}>Out</span>
            <Handle type="source" position={Position.Right} id="exec-out" style={execHandleStyle('right')} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '9px', color: '#888' }}>Variable Name:</span>
          <input
            value={data.variableName || ''}
            onChange={(e) => data.updateNodeData?.(id, { variableName: e.target.value })}
            style={{ background: '#000', border: '1px solid #444', color: '#e67e22', padding: '4px', fontSize: '11px', outline: 'none', borderRadius: '3px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '9px', color: '#888' }}>Mode:</span>
          <select
            value={data.mode || 'post-increment'}
            onChange={(e) => data.updateNodeData?.(id, { mode: e.target.value })}
            style={nodeSelectStyle}
          >
            <option value="post-increment">var++</option>
            <option value="post-decrement">var--</option>
            <option value="pre-increment">++var</option>
            <option value="pre-decrement">--var</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default memo(IncrementNode);
