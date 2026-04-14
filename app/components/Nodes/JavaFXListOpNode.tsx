import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, dataHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import { FX_COLOR } from './JavaFXAppNode';

const STR_COLOR = getTypeColor('String');
const LIST_COLOR = '#2dd4bf';

const lbl: React.CSSProperties = { fontSize: '11px', color: '#ccc' };
const bold: React.CSSProperties = { fontSize: '11px', color: '#fff', fontWeight: 'bold' };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', position: 'relative' };
const between: React.CSSProperties = { display: 'flex', justifyContent: 'space-between' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px' };
const varInp: React.CSSProperties = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#ccc', padding: '2px 5px', fontSize: '10px', outline: 'none', borderRadius: '3px', width: '90px' };
const opSel: React.CSSProperties = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: FX_COLOR, padding: '2px 3px', fontSize: '10px', outline: 'none', cursor: 'pointer', borderRadius: '3px' };

const OP_LABELS: Record<string, string> = {
  create: 'Create', setItems: 'Set Items', addItem: 'Add Item',
  removeItem: 'Remove Item', getSelectedItem: 'Get Selected',
  setOrientation: 'Set Orientation', setCellFactory: 'Cell Factory',
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

const JavaFXListOpNode = ({ data, selected, id }: Props) => {
  const op = (data.operation as string) || 'create';
  const varName = (data.variableName as string) || 'listView';
  const update = data.updateNodeData as ((i: string, d: Record<string, unknown>) => void) | undefined;

  const sub = (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
      <input className="nodrag" value={varName} onChange={e => update?.(id, { variableName: e.target.value })} style={varInp} placeholder="listName" />
      <select className="nodrag" value={op} onChange={e => update?.(id, { operation: e.target.value })} style={opSel}>
        {OPS.map(o => <option key={o} value={o}>{OP_LABELS[o]}</option>)}
      </select>
    </div>
  );

  const wrap = (children: React.ReactNode) => (
    <div style={{ ...nodeContainer(FX_COLOR, !!selected), minWidth: '230px' }}>
      <div className="jflow-header-shimmer" style={nodeHeaderSolid(FX_COLOR)}>📜 ListView: {OP_LABELS[op] ?? op}</div>
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>{sub}{children}</div>
    </div>
  );

  if (op === 'create') return wrap(
    <div style={between}>
      <div style={row}>{EXEC_IN}</div>
      <div style={col}>
        <div style={row}>{EXEC_OUT}</div>
        <div style={row}><span style={{ ...lbl, marginRight: '5px' }}>ref</span><Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(FX_COLOR, 'right'), right: '-6px' }} /></div>
      </div>
    </div>
  );

  if (op === 'setItems') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{EXEC_IN}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-list" style={{ ...dataHandleStyle(LIST_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>items: ObservableList</span></div>
      </div>
      <div style={row}>{EXEC_OUT}</div>
    </div>
  );

  if (op === 'addItem' || op === 'removeItem' || op === 'setOrientation') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{EXEC_IN}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-item" style={{ ...dataHandleStyle(STR_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>item: String</span></div>
      </div>
      <div style={row}>{EXEC_OUT}</div>
    </div>
  );

  if (op === 'getSelectedItem') return wrap(
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={row}><span style={{ ...lbl, marginRight: '5px' }}>String</span><Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(STR_COLOR, 'right'), right: '-6px' }} /></div>
    </div>
  );

  return wrap(<div style={between}><div style={row}>{EXEC_IN}</div><div style={row}>{EXEC_OUT}</div></div>);
};

export default memo(JavaFXListOpNode);
