import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, smallButton } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';

const ACCENT = '#e67e22';
const INT_COLOR = getTypeColor('int');

interface SwitchNodeData extends Record<string, unknown> {
  label: string;
  caseCount: number;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

const SwitchNode = ({ id, data, selected }: NodeProps<Node<SwitchNodeData>>) => {
  const caseCount = (data.caseCount as number) || 2;

  const addCase = useCallback(() => {
    const update = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;
    if (update) update(id, { caseCount: caseCount + 1 });
  }, [id, data.updateNodeData, caseCount]);

  const removeCase = useCallback(() => {
    if (caseCount <= 1) return;
    const update = data.updateNodeData as ((id: string, d: Record<string, unknown>) => void) | undefined;
    if (update) update(id, { caseCount: caseCount - 1 });
  }, [id, data.updateNodeData, caseCount]);

  return (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '200px' }}>
      <div style={{ ...nodeHeaderSolid(ACCENT), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>SWITCH</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={removeCase} style={smallButton('#c0392b')}>−</button>
          <button onClick={addCase} style={smallButton('#27ae60')}>+</button>
        </div>
      </div>

      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-16px' }} />
            <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>Exec</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Handle type="target" position={Position.Left} id="data-in" style={{ background: INT_COLOR, width: '10px', height: '10px', borderRadius: '50%', left: '-16px' }} />
            <span style={{ fontSize: '11px', color: '#ccc' }}>Value</span>
          </div>
          {Array.from({ length: caseCount }, (_, i) => (
            <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Handle type="target" position={Position.Left} id={`data-case-${i}`} style={{ background: INT_COLOR, width: '10px', height: '10px', borderRadius: '50%', left: '-16px' }} />
              <span style={{ fontSize: '11px', color: '#ccc' }}>Case {i}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'flex-end', marginLeft: '20px' }}>
          {Array.from({ length: caseCount }, (_, i) => (
            <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#f1c40f', fontWeight: 'bold', marginRight: '5px' }}>Case {i}</span>
              <Handle type="source" position={Position.Right} id={`exec-case-${i}`} style={{ ...execHandleStyle('right'), right: '-16px' }} />
            </div>
          ))}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#e74c3c', fontWeight: 'bold', marginRight: '5px' }}>Default</span>
            <Handle type="source" position={Position.Right} id="exec-default" style={{ ...execHandleStyle('right'), right: '-16px' }} />
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#ccc', fontWeight: 'bold', marginRight: '5px' }}>Completed</span>
            <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-16px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(SwitchNode);
