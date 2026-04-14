import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, dataHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import { FX_COLOR } from './JavaFXAppNode';

const NUM_COLOR = getTypeColor('double');
const bold: React.CSSProperties = { fontSize: '11px', color: '#fff', fontWeight: 'bold' };
const lbl: React.CSSProperties = { fontSize: '11px', color: '#ccc' };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', position: 'relative' };
const between: React.CSSProperties = { display: 'flex', justifyContent: 'space-between' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px' };
const varInp: React.CSSProperties = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#ccc', padding: '2px 5px', fontSize: '10px', outline: 'none', borderRadius: '3px', width: '100px' };

type Props = { id: string; data: Record<string, unknown>; selected?: boolean };

const JavaFXSceneOpNode = ({ data, selected, id }: Props) => {
  const varName = (data.variableName as string) || 'scene';
  const update = data.updateNodeData as ((i: string, d: Record<string, unknown>) => void) | undefined;

  return (
    <div style={{ ...nodeContainer(FX_COLOR, !!selected), minWidth: '220px' }}>
      <div className="devflow-header-shimmer" style={nodeHeaderSolid(FX_COLOR)}>🎭 Scene: Create</div>
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input className="nodrag" value={varName} onChange={e => update?.(id, { variableName: e.target.value })} style={varInp} placeholder="sceneName" />
        <div style={between}>
          <div style={col}>
            <div style={row}>
              <Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-6px' }} />
              <span style={bold}>Exec</span>
            </div>
            <div style={row}><Handle type="target" position={Position.Left} id="data-in-root" style={{ ...dataHandleStyle(FX_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>root: Pane</span></div>
            <div style={row}><Handle type="target" position={Position.Left} id="data-in-width" style={{ ...dataHandleStyle(NUM_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>width</span></div>
            <div style={row}><Handle type="target" position={Position.Left} id="data-in-height" style={{ ...dataHandleStyle(NUM_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>height</span></div>
          </div>
          <div style={col}>
            <div style={row}><span style={{ ...bold, marginRight: '5px' }}>Out</span><Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-6px' }} /></div>
            <div style={row}><span style={{ ...lbl, marginRight: '5px' }}>ref</span><Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(FX_COLOR, 'right'), right: '-6px' }} /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(JavaFXSceneOpNode);
