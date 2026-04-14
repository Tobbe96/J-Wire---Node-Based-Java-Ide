import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle } from '../../utils/nodeStyles';

export const FX_COLOR = '#ff6b00';

type Props = { id: string; data: Record<string, unknown>; selected?: boolean };

const JavaFXAppNode = ({ selected }: Props) => (
  <div style={{ ...nodeContainer(FX_COLOR, !!selected), minWidth: '210px' }}>
    <div className="jflow-header-shimmer" style={nodeHeaderSolid(FX_COLOR)}>🖥️ JavaFX Application</div>
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold', marginRight: '5px' }}>start(Stage)</span>
        <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-6px' }} />
      </div>
    </div>
  </div>
);

export default memo(JavaFXAppNode);
