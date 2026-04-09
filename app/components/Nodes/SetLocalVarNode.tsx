import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { getTypeColor } from '../../utils/theme';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, dataHandleStyle, nodeSelectStyle, execFooter, execFooterLabel } from '../../utils/nodeStyles';
import type { SetLocalVarNodeData, LocalVariable } from '../../utils/nodeTypes';

const ACCENT = '#e67e22';

const SetLocalVarNode = ({ id, data, selected }: NodeProps<Node<SetLocalVarNodeData>>) => {
  const methodNodes = data.methodNodes || [];
  const selectedMethod = methodNodes.find((m: Node) => m.data.label === data.methodName);
  const localVars = (selectedMethod?.data?.localVariables as LocalVariable[]) || [];
  const selectedLocal = localVars.find((l) => l.name === data.localVarName);
  const varColor = selectedLocal ? getTypeColor(selectedLocal.type) : ACCENT;

  return (
    <div style={nodeContainer(ACCENT, !!selected)}>
      <div className="jflow-header-shimmer" style={{ ...nodeHeaderSolid(ACCENT), color: '#000' }}>SET LOCAL VARIABLE</div>

      <Handle type="target" position={Position.Left} id="exec-in" style={execHandleStyle('left')} />

      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '9px', color: '#888' }}>Method:</span>
          <select
            className="nodrag"
            value={data.methodName || ''}
            onChange={(e) => data.updateNodeData?.(id, { methodName: e.target.value, localVarName: '' })}
            style={{ ...nodeSelectStyle, color: ACCENT }}
          >
            <option value="">-- select --</option>
            {methodNodes.map((m: Node) => (
              <option key={m.id} value={m.data.label as string}>{m.data.label as string}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '9px', color: '#888' }}>Variable:</span>
          <select
            className="nodrag"
            value={data.localVarName || ''}
            onChange={(e) => data.updateNodeData?.(id, { localVarName: e.target.value })}
            style={{ ...nodeSelectStyle, color: varColor }}
          >
            <option value="">-- select --</option>
            {localVars.map((l) => (
              <option key={l.id} value={l.name}>{l.name} ({l.type})</option>
            ))}
          </select>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Handle type="target" position={Position.Left} id="data-in" style={{ ...dataHandleStyle(varColor, 'left'), left: '-16px' }} />
          <span style={{ fontSize: '10px', color: '#ccc' }}>New Value</span>
        </div>
      </div>

      <div style={execFooter}>
        <span style={execFooterLabel}>Next</span>
        <Handle type="source" position={Position.Right} id="exec-out" style={execHandleStyle('right')} />
      </div>
    </div>
  );
};

export default memo(SetLocalVarNode);