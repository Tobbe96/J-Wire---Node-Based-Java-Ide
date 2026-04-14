import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, dataHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';

const ACCENT = '#2980b9';
const BOOL_COLOR = getTypeColor('boolean');
const INT_COLOR = getTypeColor('int');

const lbl: React.CSSProperties = { fontSize: '11px', color: '#ccc' };
const bold: React.CSSProperties = { fontSize: '11px', color: '#fff', fontWeight: 'bold' };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', position: 'relative' };
const between: React.CSSProperties = { display: 'flex', justifyContent: 'space-between' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '14px' };

const varInp: React.CSSProperties = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#ccc', padding: '2px 5px', fontSize: '10px', outline: 'none', borderRadius: '3px', width: '78px' };
const typeSel: React.CSSProperties = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 3px', fontSize: '10px', outline: 'none', cursor: 'pointer', borderRadius: '3px' };
const ELEM_TYPES = ['int', 'double', 'float', 'long', 'String', 'boolean', 'char', 'Object'];

type Props = { id: string; data: Record<string, unknown>; selected?: boolean };

const DequeOpNode = ({ data, selected, id }: Props) => {
  const op = (data.operation as string) || 'create';
  const elemType = (data.elementType as string) || 'int';
  const varName = (data.variableName as string) || 'deque';
  const elemColor = getTypeColor(elemType);
  const header = `Deque: ${op}`;
  const update = data.updateNodeData as ((i: string, d: Record<string, unknown>) => void) | undefined;
  const sub = (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
      <input className="nodrag" value={varName} onChange={(e) => update?.(id, { variableName: e.target.value })} style={varInp} placeholder="name" />
      {op === 'create' && (
        <select className="nodrag" value={elemType} onChange={(e) => update?.(id, { elementType: e.target.value })} style={{ ...typeSel, color: ACCENT }}>
          {ELEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      )}
    </div>
  );

  const execL = <><Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-6px' }} /><span style={bold}>Exec</span></>;
  const execR = <><span style={{ ...bold, marginRight: '5px' }}>Out</span><Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-6px' }} /></>;

  const wrap = (children: React.ReactNode) => (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '185px' }}>
      <div className="jwire-header-shimmer" style={nodeHeaderSolid(ACCENT)}>{header}</div>
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>{sub}{children}</div>
    </div>
  );

  if (op === 'create') return wrap(
    <div style={between}><div style={row}>{execL}</div><div style={row}>{execR}</div></div>
  );

  if (op === 'offerFirst' || op === 'offerLast') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{execL}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in" style={{ ...dataHandleStyle(elemColor, 'left'), left: '-6px' }} /><span style={lbl}>Value</span></div>
      </div>
      <div style={row}>{execR}</div>
    </div>
  );

  if (op === 'pollFirst' || op === 'pollLast') return wrap(
    <div style={between}>
      <div style={row}>{execL}</div>
      <div style={col}>
        <div style={row}>{execR}</div>
        <div style={row}><span style={{ ...lbl, marginRight: '5px' }}>{elemType}</span><Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(elemColor, 'right'), right: '-6px' }} /></div>
      </div>
    </div>
  );

  if (op === 'peekFirst' || op === 'peekLast') return wrap(
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={row}><span style={{ ...lbl, marginRight: '5px' }}>{elemType}</span><Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(elemColor, 'right'), right: '-6px' }} /></div>
    </div>
  );

  if (op === 'isEmpty') return wrap(
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={row}><span style={{ ...bold, marginRight: '5px' }}>boolean</span><Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(BOOL_COLOR, 'right'), right: '-6px' }} /></div>
    </div>
  );

  // size
  return wrap(
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={row}><span style={{ ...bold, marginRight: '5px' }}>int</span><Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(INT_COLOR, 'right'), right: '-6px' }} /></div>
    </div>
  );
};

export default memo(DequeOpNode);
