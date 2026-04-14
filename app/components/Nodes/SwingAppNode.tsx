import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle } from '../../utils/nodeStyles';

export const SWING_COLOR = '#0ea5e9';

type Props = { id: string; data: Record<string, unknown>; selected?: boolean };

const SwingAppNode = ({ selected }: Props) => (
  <div style={{ ...nodeContainer(SWING_COLOR, !!selected), minWidth: '210px' }}>
    <div className="jflow-header-shimmer" style={nodeHeaderSolid(SWING_COLOR)}>☕ Swing Application</div>
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold', marginRight: '5px' }}>constructor</span>
        <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-6px' }} />
      </div>
    </div>
  </div>
);

export default memo(SwingAppNode);
