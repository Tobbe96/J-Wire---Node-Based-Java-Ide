import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, dataHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import { SWING_COLOR } from './SwingAppNode';

const STR_COLOR = getTypeColor('String');
const BOOL_COLOR = getTypeColor('boolean');
const INT_COLOR = getTypeColor('int');

const bold: React.CSSProperties = { fontSize: '11px', color: '#fff', fontWeight: 'bold' };
const lbl: React.CSSProperties = { fontSize: '11px', color: '#ccc' };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', position: 'relative' };
const between: React.CSSProperties = { display: 'flex', justifyContent: 'space-between' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px' };
const varInp: React.CSSProperties = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#ccc', padding: '2px 5px', fontSize: '10px', outline: 'none', borderRadius: '3px', width: '75px' };
const opSel: React.CSSProperties = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc', padding: '2px 3px', fontSize: '10px', outline: 'none', cursor: 'pointer', borderRadius: '3px', marginTop: '3px' };

const OP_LABELS: Record<string, string> = {
  setTitle: 'Set Title', setSize: 'Set Size', setDefaultCloseOperation: 'Default Close Op',
  setVisible: 'Set Visible', setResizable: 'Set Resizable', pack: 'Pack', setLocationRelativeTo: 'Center Window',
};
const OPS = Object.keys(OP_LABELS);

const EXEC_OUT = (
  <><span style={{ ...bold, marginRight: '5px' }}>Out</span>
  <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-6px' }} /></>
);
const EXEC_IN = (
  <><Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-6px' }} />
  <span style={bold}>Exec</span></>
);

type Props = { id: string; data: Record<string, unknown>; selected?: boolean };

const SwingFrameOpNode = ({ data, selected, id }: Props) => {
  const op = (data.operation as string) || 'setTitle';
  const varName = (data.variableName as string) || 'frame';
  const update = data.updateNodeData as ((i: string, d: Record<string, unknown>) => void) | undefined;

  const sub = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <input className="nodrag" value={varName} onChange={e => update?.(id, { variableName: e.target.value })} style={varInp} placeholder="name" />
      <select className="nodrag" value={op} onChange={e => update?.(id, { operation: e.target.value })} style={opSel}>
        {OPS.map(o => <option key={o} value={o}>{OP_LABELS[o]}</option>)}
      </select>
    </div>
  );

  const wrap = (children: React.ReactNode) => (
    <div style={{ ...nodeContainer(SWING_COLOR, !!selected), minWidth: '230px' }}>
      <div className="jwire-header-shimmer" style={nodeHeaderSolid(SWING_COLOR)}>🪟 JFrame: {OP_LABELS[op] ?? op}</div>
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>{sub}{children}</div>
    </div>
  );

  if (op === 'setTitle') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{EXEC_IN}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-text" style={{ ...dataHandleStyle(STR_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>text: String</span></div>
      </div>
      <div style={row}>{EXEC_OUT}</div>
    </div>
  );

  if (op === 'setSize') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{EXEC_IN}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-w" style={{ ...dataHandleStyle(INT_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>w: int</span></div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-h" style={{ ...dataHandleStyle(INT_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>h: int</span></div>
      </div>
      <div style={row}>{EXEC_OUT}</div>
    </div>
  );

  if (op === 'setDefaultCloseOperation') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{EXEC_IN}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-value" style={{ ...dataHandleStyle(INT_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>value: int</span></div>
      </div>
      <div style={row}>{EXEC_OUT}</div>
    </div>
  );

  if (op === 'setVisible' || op === 'setResizable') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{EXEC_IN}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-value" style={{ ...dataHandleStyle(BOOL_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>value: boolean</span></div>
      </div>
      <div style={row}>{EXEC_OUT}</div>
    </div>
  );

  // pack, setLocationRelativeTo — exec only, no data handles
  return wrap(
    <div style={between}><div style={row}>{EXEC_IN}</div><div style={row}>{EXEC_OUT}</div></div>
  );
};

export default memo(SwingFrameOpNode);
