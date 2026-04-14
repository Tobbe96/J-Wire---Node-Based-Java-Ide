import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, Node, useNodeConnections } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, dataHandleStyle, inlineInputStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import type { PrintNodeData } from '../../utils/nodeTypes';

const ACCENT = '#3498db';
const DATA_COLOR = getTypeColor('String');

const PrintNode = ({ id, data, selected }: NodeProps<Node<PrintNodeData>>) => {
  const dataInConnections = useNodeConnections({ handleType: 'target', handleId: 'data-in' });
  const isConnected = dataInConnections.length > 0;

  const onInlineChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const update = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;
    if (update) update(id, { inlineValue: e.target.value });
  }, [id, data.updateNodeData]);

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '160px' }}>
      <div className="jwire-header-shimmer" style={{ ...nodeHeaderSolid(ACCENT), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
          <Handle type="target" position={Position.Left} id="exec-in" title="Execution in" style={execHandleStyle('left')} />
          <span>PRINT</span>
        </div>
        <div style={{ position: 'relative' }}>
          <Handle type="source" position={Position.Right} id="exec-out" title="Execution out" style={execHandleStyle('right')} />
        </div>
      </div>

      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Handle type="target" position={Position.Left} id="data-in" title="Value to print" style={{ ...dataHandleStyle(DATA_COLOR, 'left'), left: '-16px' }} />
          {isConnected ? (
            <span style={{ fontSize: '10px', color: DATA_COLOR }}>Input</span>
          ) : (
            <input
              className="nodrag"
              value={(data.inlineValue as string) ?? ''}
              onChange={onInlineChange}
              placeholder="text..."
              style={{ ...inlineInputStyle, color: DATA_COLOR }}
            />
          )}
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#888' }}>Pass</span>
          <Handle type="source" position={Position.Right} id="data-out" title="Pass-through value" style={{ ...dataHandleStyle(DATA_COLOR, 'right'), right: '-16px' }} />
        </div>
      </div>
    </div>
  );
};

export default memo(PrintNode);