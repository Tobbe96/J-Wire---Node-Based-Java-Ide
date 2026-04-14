import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, dataHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import { FX_COLOR } from './JavaFXAppNode';

const STR_COLOR = getTypeColor('String');
const BOOL_COLOR = getTypeColor('boolean');

const lbl: React.CSSProperties = { fontSize: '11px', color: '#ccc' };
const bold: React.CSSProperties = { fontSize: '11px', color: '#fff', fontWeight: 'bold' };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', position: 'relative' };
const between: React.CSSProperties = { display: 'flex', justifyContent: 'space-between' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px' };
const opSel: React.CSSProperties = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: FX_COLOR, padding: '2px 3px', fontSize: '10px', outline: 'none', cursor: 'pointer', borderRadius: '3px' };

const OP_LABELS: Record<string, string> = {
  alertInfo: 'Alert Info', alertWarning: 'Alert Warning', alertError: 'Alert Error',
  alertConfirm: 'Confirm Dialog', textInputDialog: 'Text Input Dialog', choiceDialog: 'Choice Dialog',
};
const OPS = Object.keys(OP_LABELS);
const BOOL_OUT_OPS = new Set(['alertConfirm']);
const STR_OUT_OPS = new Set(['textInputDialog', 'choiceDialog']);

const EXEC_OUT = (
  <><span style={{ ...bold, marginRight: '5px' }}>Out</span>
  <Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-6px' }} /></>
);
const EXEC_IN = (
  <><Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-6px' }} />
  <span style={bold}>Exec</span></>
);

type Props = { id: string; data: Record<string, unknown>; selected?: boolean };

const JavaFXDialogOpNode = ({ data, selected, id }: Props) => {
  const op = (data.operation as string) || 'alertInfo';
  const update = data.updateNodeData as ((i: string, d: Record<string, unknown>) => void) | undefined;

  const sub = (
    <select className="nodrag" value={op} onChange={e => update?.(id, { operation: e.target.value })} style={opSel}>
      {OPS.map(o => <option key={o} value={o}>{OP_LABELS[o]}</option>)}
    </select>
  );

  const wrap = (children: React.ReactNode) => (
    <div style={{ ...nodeContainer(FX_COLOR, !!selected), minWidth: '230px' }}>
      <div className="devflow-header-shimmer" style={nodeHeaderSolid(FX_COLOR)}>💬 {OP_LABELS[op] ?? op}</div>
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>{sub}{children}</div>
    </div>
  );

  const titleAndMsg = (
    <>
      <div style={row}><Handle type="target" position={Position.Left} id="data-in-title" style={{ ...dataHandleStyle(STR_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>title: String</span></div>
      <div style={row}><Handle type="target" position={Position.Left} id="data-in-msg" style={{ ...dataHandleStyle(STR_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>message: String</span></div>
    </>
  );

  if (op === 'alertInfo' || op === 'alertWarning' || op === 'alertError') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{EXEC_IN}</div>
        {titleAndMsg}
      </div>
      <div style={row}>{EXEC_OUT}</div>
    </div>
  );

  if (BOOL_OUT_OPS.has(op)) return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{EXEC_IN}</div>
        {titleAndMsg}
      </div>
      <div style={col}>
        <div style={row}>{EXEC_OUT}</div>
        <div style={row}><span style={{ ...bold, marginRight: '5px' }}>bool</span><Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(BOOL_COLOR, 'right'), right: '-6px' }} /></div>
      </div>
    </div>
  );

  if (STR_OUT_OPS.has(op)) return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{EXEC_IN}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-title" style={{ ...dataHandleStyle(STR_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>title: String</span></div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-prompt" style={{ ...dataHandleStyle(STR_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>prompt: String</span></div>
      </div>
      <div style={col}>
        <div style={row}>{EXEC_OUT}</div>
        <div style={row}><span style={{ ...lbl, marginRight: '5px' }}>String</span><Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(STR_COLOR, 'right'), right: '-6px' }} /></div>
      </div>
    </div>
  );

  return wrap(<div style={between}><div style={row}>{EXEC_IN}</div><div style={row}>{EXEC_OUT}</div></div>);
};

export default memo(JavaFXDialogOpNode);
